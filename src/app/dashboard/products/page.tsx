export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, MoreVertical, Video, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDuration, formatPrice, getLevelColor, getLevelLabel } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  type: 'LESSON' | 'COURSE';
  level: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  thumbnailUrl: string | null;
  totalDuration: number | null;
  lessonCount: number;
  createdAt: string;
  _count: {
    purchases: number;
  };
  category: {
    name: string;
  } | null;
}

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/my');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (product: Product) => {
    const newStatus = product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) throw new Error('Failed to update product');
      
      setProducts(prev => 
        prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p)
      );
      toast.success(newStatus === 'PUBLISHED' ? 'Product published!' : 'Product unpublished');
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteModal.product.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete product');
      
      setProducts(prev => prev.filter(p => p.id !== deleteModal.product?.id));
      toast.success('Product deleted');
      setDeleteModal({ open: false, product: null });
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="success">Published</Badge>;
      case 'DRAFT':
        return <Badge variant="warning">Draft</Badge>;
      case 'ARCHIVED':
        return <Badge variant="default">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-background-secondary rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-32 h-20 bg-background-tertiary rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-background-tertiary rounded w-1/3" />
                <div className="h-4 bg-background-tertiary rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Products</h1>
          <p className="text-text-secondary mt-1">
            Manage your courses and lessons
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            New Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<Video className="w-12 h-12" />}
          title="No products yet"
          description="Create your first course or lesson to start selling"
          action={
            <Link href="/dashboard/products/new">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Create Product
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-background-secondary border border-border rounded-lg p-4 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-background-tertiary">
                  {product.thumbnailUrl ? (
                    <Image
                      src={product.thumbnailUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-text-tertiary" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white truncate">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                        <span>{product.category?.name || 'Uncategorized'}</span>
                        <span>·</span>
                        <Badge 
                          variant="outline" 
                          className={getLevelColor(product.level)}
                        >
                          {getLevelLabel(product.level)}
                        </Badge>
                      </div>
                    </div>
                    {getStatusBadge(product.status)}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-text-secondary">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatPrice(product.price)}</span>
                    </div>
                    {product.totalDuration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(product.totalDuration)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{product._count.purchases} sales</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePublish(product)}
                    title={product.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  >
                    {product.status === 'PUBLISHED' ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Link href={`/dashboard/products/${product.id}`}>
                    <Button variant="ghost" size="icon" title="Edit">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteModal({ open: true, product })}
                    title="Delete"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, product: null })}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      >
        <div className="space-y-4">
          {deleteModal.product && (
            <div className="bg-background-tertiary rounded-lg p-3">
              <p className="font-medium text-white">{deleteModal.product.title}</p>
              <p className="text-sm text-text-secondary mt-1">
                {deleteModal.product._count.purchases} purchases will be affected
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ open: false, product: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
