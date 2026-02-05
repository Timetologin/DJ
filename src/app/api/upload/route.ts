import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSignedUploadUrl } from '@/lib/storage';
import { uploadRequestSchema } from '@/lib/validations';
import { ZodError } from 'zod';

// POST /api/upload - Get a signed upload URL
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
    const validated = uploadRequestSchema.parse(body);
    
    // Generate signed upload URL
    const result = await getSignedUploadUrl({
      fileName: validated.fileName,
      fileType: validated.fileType,
      fileSize: validated.fileSize,
      uploadType: validated.uploadType,
      userId: session.user.id,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    console.error('Upload URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic'; 
