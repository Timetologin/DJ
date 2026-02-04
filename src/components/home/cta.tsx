'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

export function CTA() {
  return (
    <section className="py-20 bg-background-secondary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-glow-gradient opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to Start Your{' '}
            <span className="text-accent">DJ Journey</span>?
          </h2>
          <p className="text-lg text-foreground-muted mb-8 max-w-2xl mx-auto">
            Join thousands of DJs learning from industry professionals. 
            Start with our free preview lessons today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="xl" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Create Free Account
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="secondary" size="xl">
                Browse Courses
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-foreground-subtle">
            No credit card required. Start learning in minutes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
