'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { canAccessRoute, getDashboardRoute } from '@/utils/permissions';
import Sidebar from '@/components/layout/Sidebar';
import Loader from '@/components/common/Loader';
import DashboardErrorBoundary from '@/components/common/DashboardErrorBoundary';
import '@/styles/dashboard.css';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard Layout - Auth state:', { user: !!user, loading });
    
    if (!loading && !user) {
      console.log('Redirecting to login - no user found');
      // Add a small delay to prevent race conditions
      setTimeout(() => {
        router.push('/login');
      }, 100);
      return;
    }

    // If user is authenticated, check if we're on a valid dynamic route
    if (!loading && user) {
      const currentPath = window.location.pathname;
      const expectedPath = getDashboardRoute(user);
      const expectedPrefix = expectedPath.split('/').slice(0, 3).join('/');
      
      // If on root dashboard path, redirect to user-specific route
      if (currentPath === '/dashboard' || currentPath.endsWith('/dashboard/')) {
        router.push(expectedPath);
        return;
      }

      if (currentPath === '/setup-profile' || currentPath === '/complete-profile' || currentPath === '/volunteer/pending') {
        return;
      }

      const isExpectedUserPath = currentPath === expectedPrefix || currentPath.startsWith(`${expectedPrefix}/`);

      if (!canAccessRoute(user, currentPath) || !isExpectedUserPath) {
        router.push(expectedPath);
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loader fullScreen text="Loading..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardErrorBoundary>
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">{children}</main>
      </div>
    </DashboardErrorBoundary>
  );
}

