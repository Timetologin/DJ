'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Video, DollarSign, ShoppingCart, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalRevenue: number;
  totalSales: number;
  recentSales: Array<{
    id: string;
    amount: number;
    createdAt: string;
    product: { title: string };
    user: { email: string };
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/products/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    href,
    delay = 0,
  }: {
    title: string;
    value: string | number;
    icon: typeof Video;
    href?: string;
    delay?: number;
  }) => {
    const content = (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`bg-background-secondary border border-border rounded-lg p-6 ${
          href ? 'hover:border-accent/30 transition-colors cursor-pointer' : ''
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent/10 rounded-lg">
            <Icon className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-text-secondary">{title}</p>
          </div>
        </div>
      </motion.div>
    );

    if (href) {
      return <Link href={href}>{content}</Link>;
    }
    return content;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-background-secondary rounded-lg p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-background-tertiary rounded-lg" />
                <div className="space-y-2">
                  <div className="h-6 w-16 bg-background-tertiary rounded" />
                  <div className="h-4 w-24 bg-background-tertiary rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Overview of your creator account
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            New Product
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Video}
          href="/dashboard/products"
          delay={0}
        />
        <StatCard
          title="Published"
          value={stats?.publishedProducts || 0}
          icon={TrendingUp}
          href="/dashboard/products"
          delay={0.05}
        />
        <StatCard
          title="Total Sales"
          value={stats?.totalSales || 0}
          icon={ShoppingCart}
          href="/dashboard/sales"
          delay={0.1}
        />
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats?.totalRevenue || 0)}
          icon={DollarSign}
          href="/dashboard/sales"
          delay={0.15}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Link href="/dashboard/products/new">
          <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-lg p-6 hover:border-accent/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Create New Product</h3>
                <p className="text-text-secondary mt-1">
                  Upload a new lesson or course
                </p>
              </div>
              <div className="p-3 bg-accent/20 rounded-full group-hover:bg-accent/30 transition-colors">
                <Plus className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/sales">
          <div className="bg-background-secondary border border-border rounded-lg p-6 hover:border-accent/30 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">View Analytics</h3>
                <p className="text-text-secondary mt-1">
                  Track your sales and revenue
                </p>
              </div>
              <div className="p-3 bg-background-tertiary rounded-full group-hover:bg-accent/10 transition-colors">
                <TrendingUp className="w-6 h-6 text-text-secondary group-hover:text-accent transition-colors" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Recent Sales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-background-secondary border border-border rounded-lg"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-white">Recent Sales</h2>
          <Link href="/dashboard/sales" className="text-accent hover:text-accent/80 text-sm flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!stats?.recentSales?.length ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">No sales yet</p>
            <p className="text-sm text-text-tertiary mt-1">
              Sales will appear here once you start selling
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stats.recentSales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 hover:bg-background-tertiary/50 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{sale.product.title}</p>
                  <p className="text-sm text-text-secondary">{sale.user.email}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-medium text-green-500">{formatPrice(sale.amount)}</p>
                  <p className="text-xs text-text-tertiary">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
