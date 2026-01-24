'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { currentAdmin, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const isAuthorized = 
      (requiredRole === 'admin' && currentAdmin) ||
      (requiredRole === 'user' && currentUser) ||
      (!requiredRole && (currentAdmin || currentUser));

    if (!isAuthorized) {
      const redirectPath = requiredRole === 'admin' ? '/admin/login' : '/user/login';
      router.push(redirectPath);
    }
  }, [currentAdmin, currentUser, requiredRole, router]);

  const hasAccess = 
    (requiredRole === 'admin' && currentAdmin) ||
    (requiredRole === 'user' && currentUser) ||
    (!requiredRole && (currentAdmin || currentUser));

  if (!hasAccess) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};
