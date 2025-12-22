'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Users, CheckCircle, XCircle, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/common/Loader';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { getIncomingRequests, updateRequestStatus } from '@/services/request.service';

export default function PickupRequestsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRequest, setUpdatingRequest] = useState(null);

  // Validate user access to this page
  useEffect(() => {
    if (user && userId) {
      // Check if the user ID matches the logged-in user and user is RESTAURANT
      if (user.id.toString() !== userId.toString() || user.role !== 'RESTAURANT') {
        router.push('/login');
        return;
      }
    }
  }, [user, userId, router]);

  useEffect(() => {
    if (user && userId) {
      fetchPickupRequests();
    }
  }, [user, userId]);

  const fetchPickupRequests = async () => {
    try {
      setLoading(true);
      const response = await getIncomingRequests();
      setRequests(response.data || response || []);
    } catch (error) {
      console.error('Error fetching pickup requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      setUpdatingRequest(requestId);
      await updateRequestStatus(requestId, status);
      
      // Update local state
      setRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, status }
          : request
      ));
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Failed to update request status');
    } finally {
      setUpdatingRequest(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ACCEPTED':
        return 'success';
      case 'COMPLETED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loader fullScreen text="Loading pickup requests..." />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pickup Requests</h1>
          <p className="text-gray-600 mt-1">Manage pickup requests from NGOs for your food listings</p>
        </div>
      </div>

      {/* Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-6 rounded-xl"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Pending Requests ({requests.filter(r => r.status === 'PENDING').length})
        </h2>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pickup Requests</h3>
            <p className="text-gray-600">When NGOs request your food donations, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {request.foodListing?.title || 'Food Request'}
                      </h3>
                      <Badge variant={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          <strong>NGO:</strong> {request.ngo?.organizationName || 'Unknown NGO'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>
                          <strong>Quantity:</strong> {request.quantity || request.foodListing?.quantity || 0} servings
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          <strong>Requested:</strong> {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>

                    {request.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>NGO Notes:</strong> {request.notes}
                        </p>
                      </div>
                    )}

                    {request.ngo?.contactEmail && (
                      <div className="mb-4 text-sm text-gray-600">
                        <strong>Contact:</strong> {request.ngo.contactEmail}
                        {request.ngo.phone && ` | ${request.ngo.phone}`}
                      </div>
                    )}
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(request.id, 'REJECTED')}
                        disabled={updatingRequest === request.id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(request.id, 'ACCEPTED')}
                        disabled={updatingRequest === request.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Completed Requests Section */}
      {requests.filter(r => r.status !== 'PENDING').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Processed Requests ({requests.filter(r => r.status !== 'PENDING').length})
          </h2>

          <div className="space-y-4">
            {requests
              .filter(r => r.status !== 'PENDING')
              .map((request, index) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {request.foodListing?.title || 'Food Request'}
                        </h3>
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        NGO: {request.ngo?.organizationName || 'Unknown'} | 
                        Processed: {formatDate(request.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}