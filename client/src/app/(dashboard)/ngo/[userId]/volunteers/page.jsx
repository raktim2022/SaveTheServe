'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import VolunteerManagement from '@/components/ngo/VolunteerManagement';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function VolunteersPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  // Basic authorization check - normally handled by layout but good for direct navigation
  if (user && user.role !== 'NGO') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Only NGOs can manage volunteers.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="mb-8">
        <Link 
          href={`/ngo/${userId}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-green-600 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Volunteer Management</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Review applications, manage active volunteers, and grow your rescue team.
          </p>
        </div>
      </div>

      {/* Main content wrapped in our premium component */}
      <div className="bg-white/50 dark:bg-slate-900/50 rounded-3xl p-1 sm:p-2 border border-gray-100 dark:border-slate-700 shadow-sm">
        <VolunteerManagement />
      </div>
    </div>
  );
}
