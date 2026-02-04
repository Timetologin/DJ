import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  shortDescription: z.string().max(300).optional(),
  price: z.number().min(99, 'Minimum price is $0.99').max(99999, 'Maximum price is $999.99'),
  type: z.enum(['LESSON', 'COURSE']),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  previewUrl: z.string().url().optional().nullable(),
});

export const creatorProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  socialLinks: z.object({
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    soundcloud: z.string().optional(),
    youtube: z.string().optional(),
  }).optional(),
});

export const uploadRequestSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().positive('File size must be positive'),
  uploadType: z.enum(['video', 'thumbnail', 'preview']),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CreatorProfileInput = z.infer<typeof creatorProfileSchema>;
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
