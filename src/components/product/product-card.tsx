'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, BookOpen, User } from 'lucide-react';
import { Badge, Avatar } from '@/components/ui';
import { formatPrice, formatDurationLong, getLevelLabel, getLevelColor } from '@/lib/utils';
import type { ProductWithRelations } from '@/types';

interface ProductCardProps {
  product: ProductWithRelations;
  showCreator?: boolean;
}

export function ProductCard({ product, showCreator = true }: ProductCardProps) {
  const thumbnail = product.thumbnailUrl || '/placeholder-course.jpg';

  return (
    <Link href={`/course/${product.slug}`}>
      <motion.div
        className="group bg-background-secondary rounded-xl border border-border overflow-hidden cursor-pointer h-full flex flex-col"
        whileHover={{
          y: -4,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          borderColor: 'rgba(139, 92, 246, 0.3)',
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-background-tertiary">
          {product.thumbnailUrl ? (
            <Image
              src={thumbnail}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-accent" />
              </div>
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-lg text-sm font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="primary">
              {product.type === 'COURSE' ? 'Course' : 'Lesson'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-2">
            {product.title}
          </h3>

          {product.shortDescription && (
            <p className="text-sm text-foreground-muted line-clamp-2 mb-3 flex-1">
              {product.shortDescription}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-foreground-subtle mb-3">
            {product.totalDuration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDurationLong(product.totalDuration)}
              </span>
            )}
            {product.lessonCount > 1 && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {product.lessonCount} lessons
              </span>
            )}
          </div>

          {/* Level Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs px-2 py-1 rounded-full ${getLevelColor(
                product.level
              )}`}
            >
              {getLevelLabel(product.level)}
            </span>

            {/* Creator */}
            {showCreator && product.creator && (
              <div className="flex items-center gap-2">
                <Avatar
                  src={product.creator.avatarUrl}
                  name={product.creator.displayName}
                  size="sm"
                />
                <span className="text-xs text-foreground-muted">
                  {product.creator.displayName}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
