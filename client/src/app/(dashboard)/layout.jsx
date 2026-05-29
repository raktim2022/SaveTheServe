'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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
      const expectedPath = getExpectedDashboardPath(user);
      
      // If on root dashboard path, redirect to user-specific route
      if (currentPath === '/dashboard' || currentPath.endsWith('/dashboard/')) {
        router.push(expectedPath);
      }
    }
  }, [user, loading, router]);

  // Helper function to get the expected dashboard path for a user
  const getExpectedDashboardPath = (user) => {
    const roleMap = {
      NGO: 'ngo',
      RESTAURANT: 'donor', 
      ADMIN: 'admin',
      VOLUNTEER: 'volunteer',
    };
    
    const rolePath = roleMap[user.role] || 'ngo';
    return `/${rolePath}/${user.id}`;
  };

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

