export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LibraryContent } from './library-content';

async function getPurchasedProducts(userId: string) {
  const purchases = await prisma.purchase.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
    include: {
      product: {
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
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return purchases.map((p: typeof purchases[number]) => ({
    ...p.product,
    purchasedAt: p.createdAt,
  }));
}

export const metadata = {
  title: 'My Library - BeatSchool',
  description: 'Access your purchased courses and lessons',
};

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/library');
  }
  
  const products = await getPurchasedProducts(session.user.id);
  
  return <LibraryContent products={products} />;
}
