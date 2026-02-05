import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';
import { ZodError } from 'zod';

// GET /api/products - Get all published products or creator's products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const creatorId = searchParams.get('creatorId');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    
    // Build where clause
    const where: any = {};
    
    // Only show published unless requesting own products
    if (!includeUnpublished) {
      where.status = 'PUBLISHED';
    } else {
      // Verify user is requesting their own products
      const session = await getServerSession(authOptions);
      if (!session?.user || !creatorId) {
        where.status = 'PUBLISHED';
      } else {
        const creatorProfile = await prisma.creatorProfile.findUnique({
          where: { userId: session.user.id },
        });
        if (creatorProfile?.id !== creatorId) {
          where.status = 'PUBLISHED';
        }
      }
    }
    
    if (category) {
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category },
      });
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      }
    }
    
    if (level && ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'].includes(level)) {
      where.level = level;
    }
    
    if (type && ['LESSON', 'COURSE'].includes(type)) {
      where.type = type;
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }
    
    if (creatorId) {
      where.creatorId = creatorId;
    }
    
    const products = await prisma.product.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        videoAsset: {
          select: {
            duration: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product (creators only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is a creator
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { creatorProfile: true },
    });
    
    if (!user || (user.role !== 'CREATOR' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Creator account required' },
        { status: 403 }
      );
    }
    
    // Ensure creator profile exists
    let creatorProfile = user.creatorProfile;
    if (!creatorProfile) {
      creatorProfile = await prisma.creatorProfile.create({
        data: {
          userId: user.id,
          displayName: user.name || user.email.split('@')[0],
        },
      });
    }
    
    const body = await request.json();
    const validated = productSchema.parse(body);
    
    // Generate unique slug
    let slug = slugify(validated.title);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }
    
    const product = await prisma.product.create({
      data: {
        title: validated.title,
        slug,
        description: validated.description,
        shortDescription: validated.description.substring(0, 150),
        price: validated.price,
        type: validated.type,
        level: validated.level,
        tags: validated.tags || [],
        status: 'DRAFT',
        creatorId: creatorProfile.id,
        categoryId: validated.categoryId,
        thumbnailUrl: validated.thumbnailUrl,
        previewUrl: validated.previewUrl,
      },
      include: {
        creator: true,
        category: true,
      },
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic'; 
