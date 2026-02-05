import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';
import { ZodError } from 'zod';

interface Params {
  params: { id: string };
}

// GET /api/products/[id] - Get a single product
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
        category: true,
        videoAsset: true,
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if user can view unpublished
    if (product.status !== 'PUBLISHED') {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      
      const userCreatorProfile = await prisma.creatorProfile.findUnique({
        where: { userId: session.user.id },
      });
      
      if (userCreatorProfile?.id !== product.creatorId && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Get existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { creator: true },
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    const userCreatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });
    
    if (existingProduct.creatorId !== userCreatorProfile?.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to edit this product' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Handle status change separately
    if (body.status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(body.status)) {
      const product = await prisma.product.update({
        where: { id },
        data: { status: body.status },
        include: { creator: true, category: true },
      });
      return NextResponse.json(product);
    }
    
    const validated = productSchema.partial().parse(body);
    
    // Handle slug update if title changed
    let slug = existingProduct.slug;
    if (validated.title && validated.title !== existingProduct.title) {
      slug = slugify(validated.title);
      const existingSlug = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.title && { slug }),
        ...(validated.description && { 
          description: validated.description,
          shortDescription: validated.description.substring(0, 150),
        }),
        ...(validated.price !== undefined && { price: validated.price }),
        ...(validated.type && { type: validated.type }),
        ...(validated.level && { level: validated.level }),
        ...(validated.tags && { tags: validated.tags }),
        ...(validated.categoryId && { categoryId: validated.categoryId }),
        ...(validated.thumbnailUrl !== undefined && { thumbnailUrl: validated.thumbnailUrl }),
        ...(validated.previewUrl !== undefined && { previewUrl: validated.previewUrl }),
        ...(body.videoAssetId !== undefined && { videoAssetId: body.videoAssetId }),
        ...(body.totalDuration !== undefined && { totalDuration: body.totalDuration }),
        ...(body.lessonCount !== undefined && { lessonCount: body.lessonCount }),
      },
      include: {
        creator: true,
        category: true,
        videoAsset: true,
      },
    });
    
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Get existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    const userCreatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });
    
    if (existingProduct.creatorId !== userCreatorProfile?.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to delete this product' },
        { status: 403 }
      );
    }
    
    // Check if there are any purchases
    const purchases = await prisma.purchase.count({
      where: { productId: id },
    });
    
    if (purchases > 0) {
      // Archive instead of delete
      await prisma.product.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      });
      return NextResponse.json({ message: 'Product archived (has purchases)' });
    }
    
    // Delete the product
    await prisma.product.delete({ where: { id } });
    
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic'; 
