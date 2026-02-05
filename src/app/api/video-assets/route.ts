import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/video-assets - Create a video asset after upload
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
    });
    
    if (!user || (user.role !== 'CREATOR' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Creator account required' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { storageKey, fileName, fileSize, mimeType, duration, width, height, thumbnailKey, previewKey } = body;
    
    if (!storageKey || !fileName || !fileSize || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const videoAsset = await prisma.videoAsset.create({
      data: {
        storageKey,
        fileName,
        fileSize,
        mimeType,
        duration: duration || null,
        width: width || null,
        height: height || null,
        thumbnailKey: thumbnailKey || null,
        previewKey: previewKey || null,
        isProcessed: true,
      },
    });
    
    return NextResponse.json(videoAsset, { status: 201 });
  } catch (error) {
    console.error('Create video asset error:', error);
    return NextResponse.json(
      { error: 'Failed to create video asset' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic'; 
