'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Video, 
  DollarSign, 
  Settings, 
  User,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Products',
    href: '/dashboard/products',
    icon: Video,
  },
  {
    label: 'Sales',
    href: '/dashboard/sales',
    icon: DollarSign,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back to site</span>
        </Link>
        <h2 className="text-xl font-bold text-white mt-4">Creator Studio</h2>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    active
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:text-white hover:bg-background-tertiary'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-white hover:bg-background-tertiary transition-all"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 bg-background-secondary rounded-lg border border-border"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 z-50 w-64 h-full bg-background-secondary border-r border-border flex flex-col lg:hidden"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <NavContent />
          </motion.aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed top-0 left-0 z-30 w-64 h-full bg-background-secondary border-r border-border flex-col hidden lg:flex">
        <NavContent />
      </aside>
    </>
  );
}
