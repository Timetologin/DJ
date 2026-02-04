// Local type definitions (matching Prisma schema)
// These are defined here since Prisma client generation requires network access

export type Role = 'USER' | 'CREATOR' | 'ADMIN';
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ProductType = 'LESSON' | 'COURSE';
export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
export type PurchaseStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  passwordHash: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
  stripeAccountId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoAsset {
  id: string;
  storageKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration: number | null;
  width: number | null;
  height: number | null;
  thumbnailKey: string | null;
  previewKey: string | null;
  isProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  type: ProductType;
  level: Level;
  status: ProductStatus;
  tags: string[];
  creatorId: string;
  categoryId: string | null;
  videoAssetId: string | null;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  totalDuration: number | null;
  lessonCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: string;
  userId: string;
  productId: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  amount: number;
  platformFee: number;
  creatorPayout: number;
  status: PurchaseStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductWithRelations = Product & {
  creator: CreatorProfile & {
    user: Pick<User, 'name' | 'image'>;
  };
  category: Category | null;
  videoAsset: VideoAsset | null;
  _count?: {
    purchases: number;
  };
};

export type ProductWithPurchaseStatus = ProductWithRelations & {
  isPurchased?: boolean;
};

export type PurchaseWithProduct = Purchase & {
  product: ProductWithRelations;
};

export type CreatorWithProducts = CreatorProfile & {
  user: Pick<User, 'name' | 'email' | 'image'>;
  products: Product[];
};

export type SalesData = {
  totalRevenue: number;
  totalSales: number;
  platformFees: number;
  creatorEarnings: number;
  recentSales: (Purchase & {
    product: Pick<Product, 'id' | 'title' | 'price'>;
    user: Pick<User, 'name' | 'email'>;
  })[];
  salesByProduct: {
    productId: string;
    productTitle: string;
    totalSales: number;
    totalRevenue: number;
  }[];
  salesOverTime: {
    date: string;
    sales: number;
    revenue: number;
  }[];
};

export type FilterOptions = {
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  type?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'popular';
};

export type APIResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
