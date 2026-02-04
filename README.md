# BeatSchool - DJ Education Video Marketplace

A production-ready video marketplace for DJ educators to sell lessons and courses online. Built with Next.js 14, featuring secure video streaming, Stripe payments, and a modern dark UI.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js (Credentials Provider)
- **Payments**: Stripe Checkout + Webhooks
- **Storage**: S3-compatible (AWS S3 / Cloudflare R2)

## Features

### Public
- Home page with hero, featured courses, categories, testimonials
- Browse page with filters (category, level, price, duration)
- Course detail pages with preview player
- Secure video streaming (signed URLs, purchase verification)
- User library for purchased content

### Creator Dashboard
- Product management (create, edit, publish/unpublish)
- Video upload with progress tracking
- Thumbnail upload
- Sales analytics with revenue tracking
- Top products and recent sales

### Security
- Role-based access control (USER, CREATOR, ADMIN)
- Signed video URLs (time-limited access)
- Purchase verification for video playback
- Webhook signature verification

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- S3-compatible storage (AWS S3 or Cloudflare R2)

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd dj-marketplace
npm install
```

### 2. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dj_marketplace?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# S3 Storage (AWS S3 or Cloudflare R2)
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="your-bucket-name"
S3_REGION="us-east-1"
S3_ENDPOINT=""  # Leave empty for AWS S3, or use R2 endpoint

# Storage Public URL (CDN or bucket URL)
STORAGE_PUBLIC_URL="https://your-bucket.s3.amazonaws.com"

# Platform Settings
PLATFORM_FEE_PERCENT="15"  # Platform fee percentage (e.g., 15 = 15%)
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed demo data
npx prisma db seed
```

### 4. Stripe Webhook (Local Development)

Install and run Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret from the CLI output to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

After running the seed script, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@beatschool.com | password123 |
| Creator | djpulse@example.com | password123 |
| Creator | sarahbeats@example.com | password123 |
| Creator | marcuswave@example.com | password123 |
| Student | student@example.com | password123 |

## Project Structure

```
dj-marketplace/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Demo data seeder
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # NextAuth routes
│   │   │   ├── checkout/  # Stripe checkout
│   │   │   ├── products/  # Product CRUD
│   │   │   ├── upload/    # Signed upload URLs
│   │   │   ├── video/     # Secure video access
│   │   │   └── webhooks/  # Stripe webhooks
│   │   ├── auth/          # Auth pages
│   │   ├── browse/        # Browse/search page
│   │   ├── course/        # Course detail pages
│   │   ├── dashboard/     # Creator dashboard
│   │   └── library/       # User's purchased videos
│   ├── components/
│   │   ├── home/          # Homepage sections
│   │   ├── layout/        # Navbar, Footer
│   │   ├── product/       # Product cards, video player
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configs
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── prisma.ts      # Prisma client
│   │   ├── storage.ts     # S3 utilities
│   │   ├── stripe.ts      # Stripe utilities
│   │   ├── utils.ts       # Helper functions
│   │   └── validations.ts # Zod schemas
│   └── types/             # TypeScript types
├── .env.example           # Environment template
├── next.config.js         # Next.js config
├── tailwind.config.ts     # Tailwind config
└── tsconfig.json          # TypeScript config
```

## S3 / Cloudflare R2 Setup

### AWS S3

1. Create an S3 bucket
2. Configure CORS:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```
3. Create IAM credentials with S3 access
4. Set bucket policy for public read (thumbnails only)

### Cloudflare R2

1. Create an R2 bucket
2. Generate API tokens with R2 read/write permissions
3. Set `S3_ENDPOINT` to your R2 endpoint (e.g., `https://<account-id>.r2.cloudflarestorage.com`)
4. Configure custom domain or use R2.dev URL for `STORAGE_PUBLIC_URL`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Production Stripe Webhook

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `checkout.session.expired`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | User registration |
| POST | `/api/checkout` | Create Stripe checkout session |
| GET | `/api/categories` | List all categories |
| GET/POST | `/api/products` | List/create products |
| GET/PATCH/DELETE | `/api/products/[id]` | Product CRUD |
| GET | `/api/products/my` | Creator's products |
| GET | `/api/products/dashboard` | Dashboard stats |
| GET | `/api/products/sales` | Sales analytics |
| POST | `/api/upload` | Get signed upload URL |
| GET | `/api/video/[id]` | Get signed video URL |
| POST | `/api/webhooks/stripe` | Stripe webhook handler |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT
