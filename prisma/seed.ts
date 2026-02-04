import { PrismaClient, Role, ProductStatus, ProductType, Level, PurchaseStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean existing data
  await prisma.purchase.deleteMany();
  await prisma.product.deleteMany();
  await prisma.videoAsset.deleteMany();
  await prisma.category.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaned existing data');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Mixing Fundamentals',
        slug: 'mixing-fundamentals',
        description: 'Master the basics of beatmatching, EQing, and smooth transitions',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Scratching & Turntablism',
        slug: 'scratching-turntablism',
        description: 'Learn scratch techniques from basic to advanced',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Music Production',
        slug: 'music-production',
        description: 'Create your own tracks, remixes, and edits',
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'DJ Software',
        slug: 'dj-software',
        description: 'Master Serato, Rekordbox, Traktor, and more',
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Business & Marketing',
        slug: 'business-marketing',
        description: 'Build your brand and grow your DJ career',
        sortOrder: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Genre Techniques',
        slug: 'genre-techniques',
        description: 'Genre-specific mixing and selection techniques',
        sortOrder: 6,
      },
    }),
  ]);

  console.log('Created categories');

  // Create users
  const passwordHash = await bcrypt.hash('password123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@beatschool.com',
      name: 'Admin User',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const creator1 = await prisma.user.create({
    data: {
      email: 'dj.pulse@example.com',
      name: 'DJ Pulse',
      passwordHash,
      role: Role.CREATOR,
      creatorProfile: {
        create: {
          displayName: 'DJ Pulse',
          bio: 'International DJ with 15+ years of experience. Resident at top clubs worldwide and dedicated to sharing knowledge with the next generation of DJs.',
          website: 'https://djpulse.com',
          socialLinks: {
            instagram: '@djpulse',
            soundcloud: 'djpulse',
            twitter: '@djpulse',
          },
        },
      },
    },
    include: { creatorProfile: true },
  });

  const creator2 = await prisma.user.create({
    data: {
      email: 'sarah.beats@example.com',
      name: 'Sarah Beats',
      passwordHash,
      role: Role.CREATOR,
      creatorProfile: {
        create: {
          displayName: 'Sarah Beats',
          bio: 'Award-winning scratch DJ and turntablist. DMC champion and passionate educator teaching the art of turntablism.',
          website: 'https://sarahbeats.com',
          socialLinks: {
            instagram: '@sarahbeats',
            youtube: 'sarahbeats',
          },
        },
      },
    },
    include: { creatorProfile: true },
  });

  const creator3 = await prisma.user.create({
    data: {
      email: 'techno.teacher@example.com',
      name: 'Marcus Wave',
      passwordHash,
      role: Role.CREATOR,
      creatorProfile: {
        create: {
          displayName: 'Marcus Wave',
          bio: 'Berlin-based techno producer and DJ. 10+ years producing and performing at festivals across Europe.',
          socialLinks: {
            instagram: '@marcuswave',
            soundcloud: 'marcuswave',
          },
        },
      },
    },
    include: { creatorProfile: true },
  });

  console.log('Created users and creator profiles');

  // Create regular user
  const regularUser = await prisma.user.create({
    data: {
      email: 'student@example.com',
      name: 'Student User',
      passwordHash,
      role: Role.USER,
    },
  });

  // Create video assets (simulated)
  const videoAssets = await Promise.all([
    prisma.videoAsset.create({
      data: {
        storageKey: 'videos/beatmatching-masterclass.mp4',
        fileName: 'beatmatching-masterclass.mp4',
        fileSize: 524288000,
        mimeType: 'video/mp4',
        duration: 3600,
        width: 1920,
        height: 1080,
        isProcessed: true,
      },
    }),
    prisma.videoAsset.create({
      data: {
        storageKey: 'videos/scratch-basics.mp4',
        fileName: 'scratch-basics.mp4',
        fileSize: 312000000,
        mimeType: 'video/mp4',
        duration: 2700,
        width: 1920,
        height: 1080,
        isProcessed: true,
      },
    }),
    prisma.videoAsset.create({
      data: {
        storageKey: 'videos/techno-production.mp4',
        fileName: 'techno-production.mp4',
        fileSize: 890000000,
        mimeType: 'video/mp4',
        duration: 5400,
        width: 1920,
        height: 1080,
        isProcessed: true,
      },
    }),
    prisma.videoAsset.create({
      data: {
        storageKey: 'videos/eq-mixing.mp4',
        fileName: 'eq-mixing.mp4',
        fileSize: 245000000,
        mimeType: 'video/mp4',
        duration: 1800,
        width: 1920,
        height: 1080,
        isProcessed: true,
      },
    }),
    prisma.videoAsset.create({
      data: {
        storageKey: 'videos/serato-complete.mp4',
        fileName: 'serato-complete.mp4',
        fileSize: 678000000,
        mimeType: 'video/mp4',
        duration: 4200,
        width: 1920,
        height: 1080,
        isProcessed: true,
      },
    }),
    prisma.videoAsset.create({
      data: {
        storageKey: 'videos/brand-building.mp4',
        fileName: 'brand-building.mp4',
        fileSize: 345000000,
        mimeType: 'video/mp4',
        duration: 2400,
        width: 1920,
        height: 1080,
        isProcessed: true,
      },
    }),
  ]);

  console.log('Created video assets');

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        title: 'Beatmatching Masterclass',
        slug: 'beatmatching-masterclass',
        description: `Learn the fundamental skill every DJ must master. This comprehensive course covers everything from understanding BPM to advanced tempo manipulation techniques.

## What You'll Learn
- Understanding tempo and BPM
- Using pitch faders effectively
- Manual beatmatching without sync
- Phrase matching and song structure
- Transitioning between different tempos
- Practice techniques and exercises

Perfect for beginners who want to build a solid foundation or intermediate DJs looking to refine their skills.`,
        shortDescription: 'Master the art of beatmatching from scratch with hands-on exercises and pro techniques.',
        price: 4999,
        type: ProductType.COURSE,
        level: Level.BEGINNER,
        status: ProductStatus.PUBLISHED,
        tags: ['beatmatching', 'fundamentals', 'mixing', 'tempo'],
        creatorId: creator1.creatorProfile!.id,
        categoryId: categories[0].id,
        videoAssetId: videoAssets[0].id,
        totalDuration: 3600,
        lessonCount: 8,
        publishedAt: new Date(),
      },
    }),
    prisma.product.create({
      data: {
        title: 'Scratch DJ Fundamentals',
        slug: 'scratch-dj-fundamentals',
        description: `Unlock the world of turntablism with this step-by-step guide to scratching. From your first baby scratch to complex patterns, this course has you covered.

## Course Contents
- Equipment setup for scratching
- The baby scratch and variations
- Tears and transforms
- Chirps and flares
- Combining scratches into patterns
- Practice routines used by champions

Includes slow-motion demonstrations and practice loops.`,
        shortDescription: 'From baby scratches to complex patterns - your complete guide to turntablism.',
        price: 5999,
        type: ProductType.COURSE,
        level: Level.BEGINNER,
        status: ProductStatus.PUBLISHED,
        tags: ['scratching', 'turntablism', 'vinyl', 'techniques'],
        creatorId: creator2.creatorProfile!.id,
        categoryId: categories[1].id,
        videoAssetId: videoAssets[1].id,
        totalDuration: 2700,
        lessonCount: 12,
        publishedAt: new Date(),
      },
    }),
    prisma.product.create({
      data: {
        title: 'Techno Production Deep Dive',
        slug: 'techno-production-deep-dive',
        description: `Create powerful, club-ready techno tracks from start to finish. This comprehensive production course teaches you the techniques used by professional producers.

## What's Included
- Kick drum design and layering
- Building driving basslines
- Creating hypnotic synth patterns
- Arrangement and tension building
- Mixing for the club
- Mastering basics

All examples created in Ableton Live with downloadable project files.`,
        shortDescription: 'Create club-ready techno tracks with professional production techniques.',
        price: 7999,
        type: ProductType.COURSE,
        level: Level.INTERMEDIATE,
        status: ProductStatus.PUBLISHED,
        tags: ['production', 'techno', 'ableton', 'synthesis'],
        creatorId: creator3.creatorProfile!.id,
        categoryId: categories[2].id,
        videoAssetId: videoAssets[2].id,
        totalDuration: 5400,
        lessonCount: 15,
        publishedAt: new Date(),
      },
    }),
    prisma.product.create({
      data: {
        title: 'EQ Mixing Techniques',
        slug: 'eq-mixing-techniques',
        description: `Master the art of EQ mixing to create smooth, professional transitions. Learn when and how to use EQ to blend tracks seamlessly.

## Topics Covered
- Understanding frequency ranges
- Three-band vs four-band EQ
- The swap technique
- Creating space in the mix
- Genre-specific EQ approaches
- Common mistakes to avoid

Short, focused lessons you can apply immediately.`,
        shortDescription: 'Create seamless transitions with professional EQ mixing techniques.',
        price: 2999,
        type: ProductType.LESSON,
        level: Level.INTERMEDIATE,
        status: ProductStatus.PUBLISHED,
        tags: ['eq', 'mixing', 'transitions', 'fundamentals'],
        creatorId: creator1.creatorProfile!.id,
        categoryId: categories[0].id,
        videoAssetId: videoAssets[3].id,
        totalDuration: 1800,
        lessonCount: 1,
        publishedAt: new Date(),
      },
    }),
    prisma.product.create({
      data: {
        title: 'Serato DJ Pro Complete Guide',
        slug: 'serato-dj-pro-complete-guide',
        description: `Everything you need to know about Serato DJ Pro, from installation to advanced features. Become a Serato power user.

## Full Coverage
- Installation and setup
- Library management and playlists
- Cue points and loops
- Sampler and effects
- Recording and streaming
- Keyboard shortcuts and workflow tips
- Hardware integration

Updated for the latest Serato version.`,
        shortDescription: 'Master every feature of Serato DJ Pro from basics to advanced techniques.',
        price: 4499,
        type: ProductType.COURSE,
        level: Level.ALL_LEVELS,
        status: ProductStatus.PUBLISHED,
        tags: ['serato', 'software', 'digital dj', 'workflow'],
        creatorId: creator2.creatorProfile!.id,
        categoryId: categories[3].id,
        videoAssetId: videoAssets[4].id,
        totalDuration: 4200,
        lessonCount: 10,
        publishedAt: new Date(),
      },
    }),
    prisma.product.create({
      data: {
        title: 'Building Your DJ Brand',
        slug: 'building-your-dj-brand',
        description: `Turn your passion into a career. Learn how to build a recognizable brand and market yourself effectively as a DJ.

## What You'll Learn
- Defining your unique sound and style
- Creating a visual identity
- Social media strategy for DJs
- Building an electronic press kit
- Networking and getting gigs
- Working with promoters and venues

Real-world examples and actionable strategies.`,
        shortDescription: 'Build a recognizable brand and market yourself effectively as a DJ.',
        price: 3499,
        type: ProductType.COURSE,
        level: Level.ALL_LEVELS,
        status: ProductStatus.PUBLISHED,
        tags: ['business', 'marketing', 'branding', 'career'],
        creatorId: creator1.creatorProfile!.id,
        categoryId: categories[4].id,
        videoAssetId: videoAssets[5].id,
        totalDuration: 2400,
        lessonCount: 6,
        publishedAt: new Date(),
      },
    }),
    // Draft product
    prisma.product.create({
      data: {
        title: 'Advanced Harmonic Mixing',
        slug: 'advanced-harmonic-mixing',
        description: 'Coming soon: Master the Camelot wheel and create emotionally powerful sets through harmonic mixing.',
        shortDescription: 'Create emotionally powerful sets through harmonic mixing techniques.',
        price: 3999,
        type: ProductType.LESSON,
        level: Level.ADVANCED,
        status: ProductStatus.DRAFT,
        tags: ['harmonic', 'mixing', 'advanced'],
        creatorId: creator1.creatorProfile!.id,
        categoryId: categories[0].id,
        totalDuration: 2400,
        lessonCount: 1,
      },
    }),
  ]);

  console.log('Created products');

  // Create some purchases
  await prisma.purchase.create({
    data: {
      userId: regularUser.id,
      productId: products[0].id,
      stripeSessionId: 'cs_test_demo_' + Date.now(),
      amount: products[0].price,
      platformFee: Math.floor(products[0].price * 0.1),
      creatorPayout: Math.floor(products[0].price * 0.9),
      status: PurchaseStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  await prisma.purchase.create({
    data: {
      userId: regularUser.id,
      productId: products[3].id,
      stripeSessionId: 'cs_test_demo_2_' + Date.now(),
      amount: products[3].price,
      platformFee: Math.floor(products[3].price * 0.1),
      creatorPayout: Math.floor(products[3].price * 0.9),
      status: PurchaseStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  console.log('Created purchases');

  console.log('Seed completed successfully!');
  console.log('\nTest accounts:');
  console.log('  Admin: admin@beatschool.com / password123');
  console.log('  Creator 1: dj.pulse@example.com / password123');
  console.log('  Creator 2: sarah.beats@example.com / password123');
  console.log('  Creator 3: techno.teacher@example.com / password123');
  console.log('  Student: student@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
