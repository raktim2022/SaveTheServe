'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { canAccessRoute, getDashboardRoute } from '@/utils/permissions';
import Sidebar from '@/components/layout/Sidebar';
import Loader from '@/components/common/Loader';
import DashboardErrorBoundary from '@/components/common/DashboardErrorBoundary';
import '@/styles/dashboard.css';

import ThemeSwitcher from '@/components/common/ThemeSwitcher';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isSetupPage = pathname === '/setup-profile';

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user) {
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
      <div className="dashboard-container relative min-h-screen w-full">
        {!isSetupPage && (
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
            className="fixed left-3 top-3 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/95 text-slate-700 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/95 dark:text-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {!isSetupPage && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <main className={`dashboard-main${isSetupPage ? ' dashboard-main--full' : ''}`}>{children}</main>

        {/* Floating Theme Switcher accessible to all users (NGO, Volunteer, Restaurant, Admin) on both Desktop and Mobile */}
        <div className="fixed bottom-4 right-4 z-50 rounded-full shadow-xl sm:bottom-8 sm:right-8">
          <ThemeSwitcher />
        </div>
      </div>
    </DashboardErrorBoundary>
  );
}

