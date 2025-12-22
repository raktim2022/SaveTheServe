'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PickupRequests from '@/components/donor/PickupRequests';
import Loader from '@/components/common/Loader';
import {
  getRequestsByRestaurant,
  approveRequest,
  rejectRequest,
  completeRequest,
} from '@/services/request.service';

export default function PickupsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getRequestsByRestaurant(user.restaurantId);
      setRequests(response.data || response);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await approveRequest(requestId);
      fetchRequests();
      alert('Request approved successfully');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await rejectRequest(requestId, reason);
      fetchRequests();
      alert('Request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const handleComplete = async (requestId) => {
    try {
      await completeRequest(requestId);
      fetchRequests();
      alert('Request marked as completed');
    } catch (error) {
      console.error('Error completing request:', error);
      alert('Failed to complete request');
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading pickup requests..." />;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Pickup Requests</h1>
        <p className="text-gray-600">Manage food pickup requests from NGOs</p>
      </div>

      <PickupRequests
        requests={requests}
        onApprove={handleApprove}
        onReject={handleReject}
        onComplete={handleComplete}
      />
    </div>
  );
}

