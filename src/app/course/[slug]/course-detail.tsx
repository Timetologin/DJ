'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Play,
  Clock,
  BookOpen,
  Tag,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Avatar, Badge, Card } from '@/components/ui';
import { VideoPlayer } from '@/components/product/video-player';
import { ProductCard } from '@/components/product/product-card';
import {
  formatPrice,
  formatDurationLong,
  getLevelLabel,
  getLevelColor,
} from '@/lib/utils';
import type { ProductWithRelations } from '@/types';

interface CourseDetailProps {
  product: ProductWithRelations & {
    creator: {
      id: string;
      displayName: string;
      avatarUrl: string | null;
      bio: string | null;
      userId: string;
    };
  };
  hasPurchased: boolean;
  relatedProducts: ProductWithRelations[];
  isAuthenticated: boolean;
}

export function CourseDetail({
  product,
  hasPurchased,
  relatedProducts,
  isAuthenticated,
}: CourseDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Handle success/canceled query params
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success) {
      toast.success('Purchase successful! You now have access to this course.');
      router.replace(`/course/${product.slug}`);
    }
    
    if (canceled) {
      toast.error('Purchase was canceled.');
      router.replace(`/course/${product.slug}`);
    }
  }, [searchParams, product.slug, router]);
  
  // Fetch secure video URL if purchased
  useEffect(() => {
    if (hasPurchased && product.videoAsset) {
      fetch(`/api/video/${product.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.url) setVideoUrl(data.url);
        })
        .catch(console.error);
    }
  }, [hasPurchased, product.id, product.videoAsset]);
  
  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/signin?callbackUrl=/course/${product.slug}`);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        toast.error(data.error);
        return;
      }
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error('Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-background-secondary border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Video/Thumbnail */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              {hasPurchased && videoUrl ? (
                <VideoPlayer
                  src={videoUrl}
                  poster={product.thumbnailUrl || undefined}
                  title={product.title}
                />
              ) : showPreview && product.previewUrl ? (
                <VideoPlayer
                  src={product.previewUrl}
                  poster={product.thumbnailUrl || undefined}
                  title={`${product.title} - Preview`}
                />
              ) : (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-background-tertiary">
                  {product.thumbnailUrl ? (
                    <Image
                      src={product.thumbnailUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-foreground-subtle" />
                    </div>
                  )}
                  
                  {/* Play Preview Button */}
                  {product.previewUrl && !hasPurchased && (
                    <button
                      onClick={() => setShowPreview(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors group"
                    >
                      <div className="w-20 h-20 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-10 w-10 text-white ml-1" />
                      </div>
                      <span className="absolute bottom-6 text-white font-medium">
                        Watch Preview
                      </span>
                    </button>
                  )}
                  
                  {/* Locked Overlay */}
                  {!hasPurchased && !product.previewUrl && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                      <Lock className="h-12 w-12 text-white mb-3" />
                      <span className="text-white font-medium">
                        Purchase to unlock
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
            
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Category & Level */}
              <div className="flex items-center gap-3 mb-4">
                {product.category && (
                  <Link href={`/browse?category=${product.category.slug}`}>
                    <Badge variant="outline">{product.category.name}</Badge>
                  </Link>
                )}
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getLevelColor(
                    product.level
                  )}`}
                >
                  {getLevelLabel(product.level)}
                </span>
                <Badge variant={product.type === 'COURSE' ? 'primary' : 'default'}>
                  {product.type === 'COURSE' ? 'Course' : 'Lesson'}
                </Badge>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                {product.title}
              </h1>
              
              <p className="text-foreground-muted text-lg mb-6">
                {product.shortDescription || product.description.substring(0, 200)}
              </p>
              
              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 mb-6 text-foreground-muted">
                {product.totalDuration && (
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {formatDurationLong(product.totalDuration)}
                  </span>
                )}
                {product.lessonCount > 1 && (
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {product.lessonCount} lessons
                  </span>
                )}
              </div>
              
              {/* Creator */}
              <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border">
                <Avatar
                  src={product.creator.avatarUrl}
                  name={product.creator.displayName}
                  size="lg"
                />
                <div>
                  <p className="text-sm text-foreground-muted">Instructor</p>
                  <p className="font-semibold">{product.creator.displayName}</p>
                </div>
              </div>
              
              {/* Price & CTA */}
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-foreground-muted mb-1">Price</p>
                  <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
                </div>
                
                {hasPurchased ? (
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-green-500 mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Purchased</span>
                    </div>
                    <p className="text-sm text-foreground-muted">
                      You have full access to this content
                    </p>
                  </div>
                ) : (
                  <Button
                    size="xl"
                    onClick={handlePurchase}
                    loading={isLoading}
                    className="flex-1"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    {isAuthenticated ? 'Purchase Now' : 'Sign In to Purchase'}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold mb-4">About This Course</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground-muted whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </section>
            
            {/* What You'll Learn */}
            <section>
              <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Professional-grade mixing techniques',
                  'Beat matching and phrase mixing',
                  'Reading and working a crowd',
                  'Building your track library',
                  'Equipment setup and optimization',
                  'Industry best practices',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground-muted">{item}</span>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Instructor */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Your Instructor</h2>
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar
                    src={product.creator.avatarUrl}
                    name={product.creator.displayName}
                    size="xl"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">
                      {product.creator.displayName}
                    </h3>
                    <p className="text-foreground-muted mb-4">
                      Professional DJ & Educator
                    </p>
                    {product.creator.bio && (
                      <p className="text-foreground-muted">
                        {product.creator.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </section>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-3">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/browse?search=${encodeURIComponent(tag)}`}
                    >
                      <Badge variant="outline" className="cursor-pointer hover:bg-background-tertiary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            
            {/* Related Courses */}
            {relatedProducts.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-4">Related Courses</h3>
                <div className="space-y-4">
                  {relatedProducts.map((relatedProduct) => (
                    <ProductCard
                      key={relatedProduct.id}
                      product={relatedProduct}
                      showCreator={false}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
