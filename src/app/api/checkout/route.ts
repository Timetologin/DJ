import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCheckoutSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        creator: true,
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    if (product.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Product is not available for purchase' },
        { status: 400 }
      );
    }
    
    // Check if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        productId: product.id,
        status: 'COMPLETED',
      },
    });
    
    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You have already purchased this product' },
        { status: 400 }
      );
    }
    
    // Create Stripe checkout session
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const checkoutSession = await createCheckoutSession({
      productId: product.id,
      productTitle: product.title,
      productDescription: product.description || product.title,
      price: product.price,
      userId: session.user.id,
      userEmail: session.user.email || '',
      successUrl: `${origin}/library?success=true`,
      cancelUrl: `${origin}/course/${product.slug}?canceled=true`,
    });
    
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic'; 
