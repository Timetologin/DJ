'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import { Button, Input, Select, ProductCardSkeleton, EmptyState } from '@/components/ui';
import type { ProductWithRelations, Category } from '@/types';

interface Filters {
  category: string;
  level: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  search: string;
}

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
  });
  
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.level) params.set('level', filters.level);
      if (filters.type) params.set('type', filters.type);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.search) params.set('search', filters.search);
      
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  useEffect(() => {
    fetchProducts();
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const newUrl = params.toString() ? `?${params.toString()}` : '/browse';
    router.replace(newUrl, { scroll: false });
  }, [filters, fetchProducts, router]);
  
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      search: '',
    });
  };
  
  const hasActiveFilters = Object.values(filters).some((v) => v !== '');
  
  const levelOptions = [
    { value: '', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'ALL_LEVELS', label: 'All Skill Levels' },
  ];
  
  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'LESSON', label: 'Lessons' },
    { value: 'COURSE', label: 'Courses' },
  ];
  
  const priceOptions = [
    { value: '', label: 'Any Price' },
    { value: '0-1999', label: 'Under $20' },
    { value: '2000-4999', label: '$20 - $50' },
    { value: '5000-9999', label: '$50 - $100' },
    { value: '10000-99999', label: '$100+' },
  ];
  
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
            <h1 className="text-4xl font-bold mb-4">Browse Courses</h1>
            <p className="text-foreground-muted text-lg">
              Discover premium DJ education content from industry professionals
            </p>
          </motion.div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-subtle" />
            <Input
              type="text"
              placeholder="Search courses, topics, or instructors..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-12"
            />
          </div>
          
          {/* Filter Toggle (Mobile) */}
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="h-4 w-4" />}
          >
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-accent rounded-full text-xs">
                {Object.values(filters).filter((v) => v !== '').length}
              </span>
            )}
          </Button>
          
          {/* Desktop Filters */}
          <div className="hidden lg:flex gap-3">
            <Select
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map((c) => ({ value: c.slug, label: c.name })),
              ]}
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-40"
            />
            
            <Select
              options={levelOptions}
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-40"
            />
            
            <Select
              options={typeOptions}
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-32"
            />
            
            <Select
              options={priceOptions}
              value={
                filters.minPrice && filters.maxPrice
                  ? `${filters.minPrice}-${filters.maxPrice}`
                  : ''
              }
              onChange={(e) => {
                const [min, max] = e.target.value.split('-');
                handleFilterChange('minPrice', min || '');
                handleFilterChange('maxPrice', max || '');
              }}
              className="w-32"
            />
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                leftIcon={<X className="h-4 w-4" />}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden mb-8 p-4 bg-background-secondary rounded-xl border border-border"
          >
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map((c) => ({ value: c.slug, label: c.name })),
                ]}
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              />
              
              <Select
                label="Level"
                options={levelOptions}
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
              />
              
              <Select
                label="Type"
                options={typeOptions}
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              />
              
              <Select
                label="Price"
                options={priceOptions}
                value={
                  filters.minPrice && filters.maxPrice
                    ? `${filters.minPrice}-${filters.maxPrice}`
                    : ''
                }
                onChange={(e) => {
                  const [min, max] = e.target.value.split('-');
                  handleFilterChange('minPrice', min || '');
                  handleFilterChange('maxPrice', max || '');
                }}
              />
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-4 w-full"
                leftIcon={<X className="h-4 w-4" />}
              >
                Clear All Filters
              </Button>
            )}
          </motion.div>
        )}
        
        {/* Results Count */}
        {!loading && (
          <p className="text-foreground-muted mb-6">
            {products.length} {products.length === 1 ? 'course' : 'courses'} found
          </p>
        )}
        
        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No courses found"
            description="Try adjusting your filters or search terms"
            action={
              hasActiveFilters ? (
                <Button variant="primary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
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
            {products.map((product) => (
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
        )}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="bg-background-secondary border-b border-border">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl">
              <div className="h-10 w-64 bg-background-tertiary rounded animate-pulse mb-4" />
              <div className="h-6 w-96 bg-background-tertiary rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
