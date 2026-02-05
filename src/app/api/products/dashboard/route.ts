import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has a creator profile
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!creatorProfile) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 403 });
    }

    // Get product stats
    const products = await prisma.product.findMany({
      where: { creatorId: creatorProfile.id },
      select: { id: true, status: true },
    });

    const totalProducts = products.length;
    const publishedProducts = products.filter((p: { status: string }) => p.status === 'PUBLISHED').length;
    const draftProducts = products.filter((p: { status: string }) => p.status === 'DRAFT').length;

    // Get sales stats
    const productIds = products.map((p: { id: string }) => p.id);
    
    const purchases = await prisma.purchase.findMany({
      where: {
        productId: { in: productIds },
        status: 'COMPLETED',
      },
      include: {
        product: {
          select: { title: true },
        },
        user: {
          select: { email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSales = purchases.length;
    const totalRevenue = purchases.reduce((sum: number, p: { creatorPayout: number }) => sum + p.creatorPayout, 0);

    // Get recent sales (last 10)
    const recentSales = purchases.slice(0, 10).map((sale: { id: string; creatorPayout: number; createdAt: Date; product: { title: string }; user: { email: string; name: string | null } }) => ({
      id: sale.id,
      amount: sale.creatorPayout,
      createdAt: sale.createdAt.toISOString(),
      product: { title: sale.product.title },
      user: { email: sale.user.email, name: sale.user.name },
    }));

    return NextResponse.json({
      totalProducts,
      publishedProducts,
      draftProducts,
      totalRevenue,
      totalSales,
      recentSales,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic'; 
