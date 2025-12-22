'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PickupStatus from '@/components/ngo/PickupStatus';
import Loader from '@/components/common/Loader';
import { getRequestsByNGO } from '@/services/request.service';

export default function NGOHistoryPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await getRequestsByNGO(user.ngoId, {
        status: 'completed,rejected,cancelled',
      });
      setRequests(response.data || response);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading history..." />;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Request History</h1>
        <p className="text-gray-600">View your past requests</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No history yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <PickupStatus key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}

