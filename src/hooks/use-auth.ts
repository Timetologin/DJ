'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/');
  }, [router]);

  const requireAuth = useCallback((callback?: () => void) => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/signin');
      return false;
    }
    if (isAuthenticated && callback) {
      callback();
    }
    return isAuthenticated;
  }, [isAuthenticated, isLoading, router]);

  const requireCreator = useCallback((callback?: () => void) => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/signin');
      return false;
    }
    if (user?.role !== 'CREATOR' && user?.role !== 'ADMIN') {
      router.push('/');
      return false;
    }
    if (isAuthenticated && callback) {
      callback();
    }
    return true;
  }, [isAuthenticated, isLoading, user?.role, router]);

  const requireAdmin = useCallback((callback?: () => void) => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/signin');
      return false;
    }
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return false;
    }
    if (isAuthenticated && callback) {
      callback();
    }
    return true;
  }, [isAuthenticated, isLoading, user?.role, router]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    isCreator: user?.role === 'CREATOR' || user?.role === 'ADMIN',
    isAdmin: user?.role === 'ADMIN',
    login,
    logout,
    requireAuth,
    requireCreator,
    requireAdmin,
  };
}
