'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  const Component = hover ? motion.div : 'div';
  
  const baseProps = {
    className: cn(
      'bg-background-secondary rounded-xl border border-border overflow-hidden',
      hover && 'cursor-pointer',
      className
    ),
    onClick,
  };

  const motionProps = hover
    ? {
        whileHover: {
          y: -4,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          borderColor: 'rgba(139, 92, 246, 0.3)',
        },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component {...baseProps} {...motionProps}>
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('p-6 border-b border-border', className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-border bg-background-tertiary/50', className)}>
      {children}
    </div>
  );
}
