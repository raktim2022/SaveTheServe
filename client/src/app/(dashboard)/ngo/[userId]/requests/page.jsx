'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, MapPin, Calendar, Package, AlertTriangle, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import PickupStatus from '@/components/ngo/PickupStatus';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { getRequestsByNGO, cancelRequest } from '@/services/request.service';
import { formatDate } from '@/utils/formatDate';

export default function NGORequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter]);

  const filterRequests = () => {
    let filtered = requests;
    if (statusFilter !== 'all') {
      filtered = requests.filter(request => 
        request.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    setFilteredRequests(filtered);
  };

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

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading requests..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600 mt-1">Track your food rescue requests</p>
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </motion.div>

      {/* Requests Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {filteredRequests.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No requests yet' : `No ${statusFilter} requests`}
            </h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? 'Start by browsing available food and making your first request.'
                : `Try changing the filter to see requests with different statuses.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                className="glass-card rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.foodListing?.title || 'Food Request'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Request #{request.id}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Requested: {formatDate(request.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Pickup: {request.pickupTime ? formatDate(request.pickupTime) : 'TBD'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{request.foodListing?.restaurant?.name || 'Unknown Restaurant'}</span>
                    </div>
                  </div>

                  {request.foodListing && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Food Details</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {request.foodListing.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">
                          Quantity: <span className="font-medium">{request.foodListing.quantity}</span>
                        </span>
                        <span className="text-gray-600">
                          Category: <span className="font-medium">{request.foodListing.category}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {request.notes && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                      <p className="text-sm text-gray-600">{request.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Last updated: {formatDate(request.updatedAt)}
                    </div>
                    {request.status.toLowerCase() === 'pending' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancel(request.id)}
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

