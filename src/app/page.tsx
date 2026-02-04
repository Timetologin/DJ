import { prisma } from '@/lib/prisma';
import {
  Hero,
  FeaturedCourses,
  Categories,
  Testimonials,
  CTA,
} from '@/components/home';

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      creator: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      videoAsset: {
        select: {
          duration: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
  
  return products;
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    take: 6,
  });
  
  return categories;
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);
  
  return (
    <>
      <Hero />
      <FeaturedCourses products={featuredProducts} />
      <Categories categories={categories} />
      <Testimonials />
      <CTA />
    </>
  );
}
