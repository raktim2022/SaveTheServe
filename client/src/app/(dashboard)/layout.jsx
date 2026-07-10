'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [router]);

  if (loading) {
    return <Loader fullScreen text="Loading..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardErrorBoundary>
      <div className="dashboard-container relative min-h-screen overflow-x-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary-600 to-secondary-500 text-white font-bold flex items-center justify-center shadow">
                S
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">SaveTheServe</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-600 to-secondary-500 text-white flex items-center justify-center font-bold shadow text-xs">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Sidebar Backdrop Overlay */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-25 transition-opacity duration-300"
          />
        )}

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="dashboard-main">{children}</main>
        
        {/* Floating Theme Switcher accessible to all users (NGO, Volunteer, Restaurant, Admin) on both Desktop and Mobile */}
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 shadow-xl rounded-full">
          <ThemeSwitcher />
        </div>
      </div>
    </DashboardErrorBoundary>
  );
}

