'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PickupStatus from '@/components/ngo/PickupStatus';
import Loader from '@/components/common/Loader';
import { getRequestsByNGO, cancelRequest } from '@/services/request.service';
import Button from '@/components/common/Button';

export default function NGORequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getRequestsByNGO(user.ngoId);
      setRequests(response.data || response);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      await cancelRequest(requestId);
      fetchRequests();
      alert('Request cancelled successfully');
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Failed to cancel request');
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading requests..." />;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Requests</h1>
        <p className="text-gray-600">View and manage your food requests</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id}>
              <PickupStatus request={request} />
              {request.status === 'pending' && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleCancel(request.id)}
                  >
                    Cancel Request
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

