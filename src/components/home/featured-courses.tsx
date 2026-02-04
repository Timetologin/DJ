'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { ProductCard } from '@/components/product/product-card';
import type { ProductWithRelations } from '@/types';

interface FeaturedCoursesProps {
  products: ProductWithRelations[];
}

export function FeaturedCourses({ products }: FeaturedCoursesProps) {
  return (
    <section id="featured" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Courses
          </h2>
          <p className="text-foreground-muted max-w-2xl mx-auto">
            Hand-picked courses from our top instructors. Start your journey to becoming a professional DJ.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/browse">
            <Button variant="outline" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              View All Courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
