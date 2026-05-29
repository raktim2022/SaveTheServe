'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/common/Loader';
import VolunteerManagement from '@/components/ngo/VolunteerManagement';

export default function NGOVolunteersPage() {
  const { userId } = useParams();
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen text="Loading..." />;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage and verify volunteers assigned to your NGO
        </p>
      </div>

      <VolunteerManagement />
    </div>
  );
}
