import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { constructWebhookEvent } from '@/lib/stripe';

const PLATFORM_FEE_PERCENT = parseInt(process.env.PLATFORM_FEE_PERCENT || '15', 10);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }
    
    let event: Stripe.Event;
    
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const productId = session.metadata?.productId;
        const userId = session.metadata?.userId;
        
        if (!productId || !userId) {
          console.error('Missing metadata in checkout session');
          break;
        }
        
        // Get product to calculate fees
        const product = await prisma.product.findUnique({
          where: { id: productId },
        });
        
        if (!product) {
          console.error('Product not found:', productId);
          break;
        }
        
        const amount = session.amount_total || product.price;
        const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100));
        const creatorPayout = amount - platformFee;
        
        // Create or update purchase record
        await prisma.purchase.upsert({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
          create: {
            userId,
            productId,
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
            amount,
            platformFee,
            creatorPayout,
            status: 'COMPLETED',
          },
          update: {
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
            amount,
            platformFee,
            creatorPayout,
            status: 'COMPLETED',
          },
        });
        
        console.log(`Purchase completed: User ${userId} bought Product ${productId}`);
        break;
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const productId = session.metadata?.productId;
        const userId = session.metadata?.userId;
        
        if (productId && userId) {
          // Update purchase status if it exists
          await prisma.purchase.updateMany({
            where: {
              userId,
              productId,
              stripeSessionId: session.id,
              status: 'PENDING',
            },
            data: { status: 'FAILED' },
          });
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update purchase status if it exists
        await prisma.purchase.updateMany({
          where: {
            stripePaymentIntentId: paymentIntent.id,
            status: 'PENDING',
          },
          data: { status: 'FAILED' },
        });
        break;
      }
      
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        // Update purchase status
        await prisma.purchase.updateMany({
          where: {
            stripePaymentIntentId: charge.payment_intent as string,
          },
          data: { status: 'REFUNDED' },
        });
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
