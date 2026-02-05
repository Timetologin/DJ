import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    let startDate: Date;
    let previousStartDate: Date;
    const now = new Date();

    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      default: // 'all'
        startDate = new Date(0);
        previousStartDate = new Date(0);
    }

    // Get creator's products
    const products = await prisma.product.findMany({
      where: { creatorId: creatorProfile.id },
      select: { id: true },
    });

    const productIds = products.map((p: { id: string }) => p.id);

    // Get current period sales
    const currentSales = await prisma.purchase.findMany({
      where: {
        productId: { in: productIds },
        status: 'COMPLETED',
        createdAt: range === 'all' ? undefined : { gte: startDate },
      },
      include: {
        product: {
          select: { id: true, title: true, slug: true },
        },
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get previous period sales for comparison
    const previousSales = range !== 'all' ? await prisma.purchase.findMany({
      where: {
        productId: { in: productIds },
        status: 'COMPLETED',
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    }) : [];

    // Calculate stats
    const totalRevenue = currentSales.reduce((sum: number, s: { creatorPayout: number }) => sum + s.creatorPayout, 0);
    const totalSales = currentSales.length;
    const uniqueCustomers = new Set(currentSales.map((s: { userId: string }) => s.userId)).size;
    const averageOrderValue = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;

    // Previous period stats
    const prevRevenue = previousSales.reduce((sum: number, s: { creatorPayout: number }) => sum + s.creatorPayout, 0);
    const prevSales = previousSales.length;

    // Calculate percentage changes
    const revenueChange = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0;
    const salesChange = prevSales > 0 
      ? ((totalSales - prevSales) / prevSales) * 100 
      : totalSales > 0 ? 100 : 0;

    // Format recent sales
    type SaleItem = {
      id: string;
      amount: number;
      platformFee: number;
      creatorPayout: number;
      status: string;
      createdAt: Date;
      productId: string;
      product: { id: string; title: string; slug: string };
      user: { email: string; name: string | null };
    };
    
    const recentSales = currentSales.slice(0, 20).map((sale: SaleItem) => ({
      id: sale.id,
      amount: sale.amount,
      platformFee: sale.platformFee,
      creatorPayout: sale.creatorPayout,
      status: sale.status,
      createdAt: sale.createdAt.toISOString(),
      product: {
        id: sale.product.id,
        title: sale.product.title,
        slug: sale.product.slug,
      },
      user: {
        email: sale.user.email,
        name: sale.user.name,
      },
    }));

    // Get top products
    const productSales = new Map<string, { count: number; revenue: number }>();
    for (const sale of currentSales) {
      const existing = productSales.get(sale.productId) || { count: 0, revenue: 0 };
      productSales.set(sale.productId, {
        count: existing.count + 1,
        revenue: existing.revenue + sale.creatorPayout,
      });
    }

    const topProductsData = await prisma.product.findMany({
      where: { id: { in: Array.from(productSales.keys()) } },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnailUrl: true,
        _count: {
          select: { purchases: true },
        },
      },
    });

    type TopProductItem = {
      id: string;
      title: string;
      slug: string;
      thumbnailUrl: string | null;
      _count: { purchases: number };
    };
    
    const topProducts = topProductsData
      .map((p: TopProductItem) => ({
        ...p,
        totalRevenue: productSales.get(p.id)?.revenue || 0,
      }))
      .sort((a: { totalRevenue: number }, b: { totalRevenue: number }) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalSales,
        averageOrderValue,
        uniqueCustomers,
        revenueChange,
        salesChange,
      },
      recentSales,
      topProducts,
    });
  } catch (error) {
    console.error('Failed to fetch sales data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales data' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic'; 
