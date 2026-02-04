'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductCard } from '@/components/product/product-card';
import { Input, EmptyState, Button } from '@/components/ui';
import Link from 'next/link';
import type { ProductWithRelations } from '@/types';

interface LibraryContentProps {
  products: (ProductWithRelations & { purchasedAt: Date })[];
}

export function LibraryContent({ products }: LibraryContentProps) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  
  // Show success toast if redirected from checkout
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Purchase successful! Enjoy your new course.');
    }
  }, [searchParams]);
  
  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.creator?.displayName.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-background-secondary border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl font-bold mb-4">My Library</h1>
            <p className="text-foreground-muted text-lg">
              Access all your purchased courses and lessons
            </p>
          </motion.div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {products.length > 0 ? (
          <>
            {/* Search */}
            <div className="mb-8 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-subtle" />
                <Input
                  type="text"
                  placeholder="Search your library..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            
            {/* Products Count */}
            <p className="text-foreground-muted mb-6">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'course' : 'courses'}
              {search && ` matching "${search}"`}
            </p>
            
            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState
                title="No matching courses"
                description="Try a different search term"
              />
            )}
          </>
        ) : (
          <EmptyState
            icon={<BookOpen className="h-16 w-16 text-foreground-subtle" />}
            title="Your library is empty"
            description="Purchase courses to start building your DJ skills"
            action={
              <Link href="/browse">
                <Button>Browse Courses</Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
