import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar, Footer } from '@/components/layout';
import { Preloader, ToastProvider } from '@/components/ui';

export const metadata: Metadata = {
  title: 'BeatSchool - Master the Art of DJing',
  description: 'Learn from industry professionals with our premium DJ education video courses. Master mixing, scratching, production, and more.',
  keywords: ['DJ', 'DJ courses', 'DJ lessons', 'mixing', 'scratching', 'music production', 'DJ education'],
  authors: [{ name: 'BeatSchool' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://beatschool.io',
    siteName: 'BeatSchool',
    title: 'BeatSchool - Master the Art of DJing',
    description: 'Learn from industry professionals with our premium DJ education video courses.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BeatSchool - DJ Education Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BeatSchool - Master the Art of DJing',
    description: 'Learn from industry professionals with our premium DJ education video courses.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <Preloader />
          <ToastProvider />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
