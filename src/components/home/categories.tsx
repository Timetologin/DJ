'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Music,
  Disc3,
  Headphones,
  Monitor,
  TrendingUp,
  Radio,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const iconMap: Record<string, React.ReactNode> = {
  'mixing-fundamentals': <Disc3 className="h-6 w-6" />,
  'scratching-turntablism': <Music className="h-6 w-6" />,
  'music-production': <Headphones className="h-6 w-6" />,
  'dj-software': <Monitor className="h-6 w-6" />,
  'business-marketing': <TrendingUp className="h-6 w-6" />,
  'genre-techniques': <Radio className="h-6 w-6" />,
};

interface CategoriesProps {
  categories: Category[];
}

export function Categories({ categories }: CategoriesProps) {
  return (
    <section className="py-20 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-foreground-muted max-w-2xl mx-auto">
            From beginner basics to advanced techniques, find exactly what you need to level up.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/browse?category=${category.slug}`}>
                <motion.div
                  className="bg-background rounded-xl border border-border p-6 text-center cursor-pointer group"
                  whileHover={{
                    y: -4,
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    {iconMap[category.slug] || <Music className="h-6 w-6" />}
                  </div>
                  <h3 className="font-medium text-foreground text-sm group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
