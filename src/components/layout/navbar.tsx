'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  Library,
  Settings,
} from 'lucide-react';
import { Button, Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isCreator = session?.user?.role === 'CREATOR' || session?.user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-end space-x-0.5 h-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-accent rounded-full"
                  initial={{ height: 8 }}
                  animate={{ height: 8 + (i % 3) * 6 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
            <span className="text-xl font-bold">
              <span className="text-foreground">Beat</span>
              <span className="text-accent">School</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-accent bg-accent/10'
                    : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth/User */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-10 w-10 rounded-full bg-background-tertiary animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-background-tertiary transition-colors"
                >
                  <Avatar
                    src={session.user.image}
                    name={session.user.name}
                    size="sm"
                  />
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-foreground-muted transition-transform',
                      isUserMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-background-secondary border border-border shadow-xl z-20 overflow-hidden"
                      >
                        <div className="p-3 border-b border-border">
                          <p className="text-sm font-medium text-foreground truncate">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-foreground-muted truncate">
                            {session.user.email}
                          </p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/library"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-background-tertiary rounded-lg transition-colors"
                          >
                            <Library className="h-4 w-4" />
                            <span>My Library</span>
                          </Link>
                          {isCreator && (
                            <Link
                              href="/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-background-tertiary rounded-lg transition-colors"
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              <span>Creator Dashboard</span>
                            </Link>
                          )}
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-foreground-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors w-full"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background-secondary"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-accent bg-accent/10'
                      : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {session ? (
                <>
                  <Link
                    href="/library"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-colors"
                  >
                    My Library
                  </Link>
                  {isCreator && (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 rounded-lg text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-colors"
                    >
                      Creator Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="pt-2 border-t border-border space-y-2">
                  <Link
                    href="/auth/signin"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="secondary" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
