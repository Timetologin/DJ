import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSignedDownloadUrl } from '@/lib/storage';

interface Params {
  params: { id: string };
}

// GET /api/video/[id] - Get signed URL for video playback
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Get the product with video asset
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        videoAsset: true,
        creator: true,
      },
    });
    
    if (!product || !product.videoAsset) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the creator
    const isCreator = await prisma.creatorProfile.findFirst({
      where: {
        userId: session.user.id,
        id: product.creatorId,
      },
    });
    
    // Check if user is admin
    const isAdmin = session.user.role === 'ADMIN';
    
    // If not creator/admin, check for valid purchase
    if (!isCreator && !isAdmin) {
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: session.user.id,
          productId: product.id,
          status: 'COMPLETED',
        },
      });
      
      if (!purchase) {
        return NextResponse.json(
          { error: 'Purchase required to access this video' },
          { status: 403 }
        );
      }
    }
    
    // Generate signed URL (valid for 4 hours)
    const signedUrl = await getSignedDownloadUrl(
      product.videoAsset.storageKey,
      4 * 60 * 60
    );
    
    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Video access error:', error);
    return NextResponse.json(
      { error: 'Failed to get video URL' },
      { status: 500 }
    );
  }
}
