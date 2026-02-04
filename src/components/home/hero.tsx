'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-glow-gradient opacity-50" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-accent/10 rounded-full px-4 py-1.5 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm text-accent font-medium">
                1000+ DJs Learning Every Day
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Master the Art of{' '}
              <span className="text-accent">DJing</span>{' '}
              from Industry Pros
            </h1>

            <p className="text-lg text-foreground-muted mb-8 max-w-xl">
              Learn mixing, scratching, production, and more from world-class DJs. 
              Video lessons designed to take your skills to the next level.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/browse">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Explore Courses
                </Button>
              </Link>
              <Link href="#featured">
                <Button variant="secondary" size="lg" leftIcon={<Play className="h-5 w-5" />}>
                  Watch Preview
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              {[
                { value: '50+', label: 'Expert Instructors' },
                { value: '200+', label: 'Video Lessons' },
                { value: '10k+', label: 'Students' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-foreground-muted">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Animated Rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute inset-0 rounded-full border border-accent/20"
                  style={{ scale: 0.6 + ring * 0.15 }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20 + ring * 5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              ))}

              {/* Center Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-48 h-48 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="w-32 h-32 rounded-full bg-background-secondary border-4 border-accent/30 flex items-center justify-center shadow-glow">
                    <motion.div
                      className="w-4 h-4 rounded-full bg-accent"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Floating Elements */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <motion.div
                  key={angle}
                  className="absolute w-12 h-12 rounded-lg bg-background-secondary border border-border shadow-lg flex items-center justify-center"
                  style={{
                    top: `${50 + 40 * Math.sin((angle * Math.PI) / 180)}%`,
                    left: `${50 + 40 * Math.cos((angle * Math.PI) / 180)}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  <div className="w-6 h-6 rounded bg-accent/20" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
