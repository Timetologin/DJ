'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Avatar } from '@/components/ui';

const testimonials = [
  {
    name: 'Alex Rivera',
    role: 'Club DJ, Miami',
    content:
      'BeatSchool transformed my mixing skills. The beatmatching course helped me land my first residency within 3 months.',
    rating: 5,
  },
  {
    name: 'Sophie Chen',
    role: 'Wedding DJ',
    content:
      'The business and marketing courses were exactly what I needed. I doubled my bookings after implementing what I learned.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Producer & DJ',
    content:
      'The production courses are incredibly detailed. Finally understood sound design thanks to the techno production deep dive.',
    rating: 5,
  },
  {
    name: 'Elena Kowalski',
    role: 'Scratch DJ',
    content:
      'Sarah Beats is an amazing instructor. Her scratch fundamentals course took me from zero to performing in under 6 months.',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Mobile DJ',
    content:
      'Great value for the price. The software tutorials saved me hours of frustration learning Serato on my own.',
    rating: 5,
  },
  {
    name: 'Maya Thompson',
    role: 'Aspiring DJ',
    content:
      'As a complete beginner, I was intimidated. But the structured lessons made it easy to follow along and actually improve.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by DJs Worldwide
          </h2>
          <p className="text-foreground-muted max-w-2xl mx-auto">
            Join thousands of DJs who have transformed their skills with our courses.
          </p>
        </motion.div>

        <div className="relative">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* Scrolling testimonials */}
          <motion.div
            className="flex gap-6"
            animate={{ x: [0, -1920] }}
            transition={{
              x: {
                duration: 40,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'linear',
              },
            }}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-80 bg-background-secondary rounded-xl border border-border p-6"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Quote className="h-8 w-8 text-accent/30 mb-4" />
                <p className="text-foreground-muted text-sm mb-4 line-clamp-4">
                  {testimonial.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar name={testimonial.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-warning fill-warning"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
