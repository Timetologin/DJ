import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CourseDetail } from './course-detail';

interface Params {
  params: { slug: string };
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      creator: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          userId: true,
        },
      },
      category: true,
      videoAsset: true,
    },
  });
  
  return product;
}

async function checkPurchase(userId: string, productId: string) {
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      productId,
      status: 'COMPLETED',
    },
  });
  
  return !!purchase;
}

async function getRelatedProducts(categoryId: string, excludeId: string) {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      status: 'PUBLISHED',
      id: { not: excludeId },
    },
    include: {
      creator: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      category: true,
      videoAsset: {
        select: {
          duration: true,
        },
      },
    },
    take: 3,
  });
  
  return products;
}

export async function generateMetadata({ params }: Params) {
  const product = await getProduct(params.slug);
  
  if (!product) {
    return {
      title: 'Course Not Found',
    };
  }
  
  return {
    title: `${product.title} - BeatSchool`,
    description: product.shortDescription || product.description.substring(0, 160),
    openGraph: {
      title: product.title,
      description: product.shortDescription || product.description.substring(0, 160),
      images: product.thumbnailUrl ? [{ url: product.thumbnailUrl }] : [],
    },
  };
}

export default async function CoursePage({ params }: Params) {
  const product = await getProduct(params.slug);
  
  if (!product || product.status !== 'PUBLISHED') {
    notFound();
  }
  
  const session = await getServerSession(authOptions);
  const hasPurchased = session?.user
    ? await checkPurchase(session.user.id, product.id)
    : false;
  
  const relatedProducts = product.categoryId ? await getRelatedProducts(product.categoryId, product.id) : [];
  
  return (
    <CourseDetail
      product={product as any}
      hasPurchased={hasPurchased}
      relatedProducts={relatedProducts as any}
      isAuthenticated={!!session?.user}
    />
  );
}
