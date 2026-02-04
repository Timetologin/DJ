'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, TrendingUp, Users, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SalesStats {
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  revenueChange: number;
  salesChange: number;
}

interface Sale {
  id: string;
  amount: number;
  platformFee: number;
  creatorPayout: number;
  status: string;
  createdAt: string;
  product: {
    id: string;
    title: string;
    slug: string;
  };
  user: {
    email: string;
    name: string | null;
  };
}

interface TopProduct {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  _count: {
    purchases: number;
  };
  totalRevenue: number;
}

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

export default function DashboardSalesPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SalesStats>({
    totalRevenue: 0,
    totalSales: 0,
    averageOrderValue: 0,
    uniqueCustomers: 0,
    revenueChange: 0,
    salesChange: 0,
  });
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    fetchSalesData();
  }, [timeRange]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/sales?range=${timeRange}`);
      if (!res.ok) throw new Error('Failed to fetch sales data');

      const data = await res.json();
      setStats(data.stats);
      setRecentSales(data.recentSales);
      setTopProducts(data.topProducts);
    } catch (error) {
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = 'number' 
  }: { 
    title: string; 
    value: number; 
    change?: number; 
    icon: typeof DollarSign;
    format?: 'number' | 'currency';
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background-secondary border border-border rounded-lg p-6"
    >
      <div className="flex items-center justify-between">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {change >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white">
          {format === 'currency' ? formatPrice(value) : value.toLocaleString()}
        </p>
        <p className="text-sm text-text-secondary mt-1">{title}</p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-background-secondary rounded-lg p-6 animate-pulse">
              <div className="w-10 h-10 bg-background-tertiary rounded-lg" />
              <div className="mt-4 h-8 bg-background-tertiary rounded w-1/2" />
              <div className="mt-2 h-4 bg-background-tertiary rounded w-1/3" />
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
          <h1 className="text-2xl font-bold text-white">Sales Analytics</h1>
          <p className="text-text-secondary mt-1">
            Track your revenue and sales performance
          </p>
        </div>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          options={TIME_RANGES}
          className="w-40"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          change={stats.revenueChange}
          icon={DollarSign}
          format="currency"
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales}
          change={stats.salesChange}
          icon={ShoppingCart}
        />
        <StatCard
          title="Average Order Value"
          value={stats.averageOrderValue}
          icon={TrendingUp}
          format="currency"
        />
        <StatCard
          title="Unique Customers"
          value={stats.uniqueCustomers}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background-secondary border border-border rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Recent Sales</h2>
          
          {recentSales.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary">No sales yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">
                      {sale.product.title}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {sale.user.name || sale.user.email}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-medium text-white">
                      {formatPrice(sale.creatorPayout)}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {formatDate(sale.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background-secondary border border-border rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Top Products</h2>
          
          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary">No products yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 py-3 border-b border-border last:border-0"
                >
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {product.title}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {product._count.purchases} sales
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-white">
                      {formatPrice(product.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* All Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-background-secondary border border-border rounded-lg overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-white">All Transactions</h2>
        </div>
        
        {recentSales.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">No transactions in this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-background-tertiary">
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Product
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Amount
                  </th>
                  <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Your Payout
                  </th>
                  <th className="text-center text-xs font-medium text-text-secondary uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-background-tertiary/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{sale.product.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-text-secondary">{sale.user.name || sale.user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-text-secondary">{formatDate(sale.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-white">{formatPrice(sale.amount)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-green-500 font-medium">{formatPrice(sale.creatorPayout)}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={sale.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {sale.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
