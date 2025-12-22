'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Package, Users, TrendingUp, Clock, ChefHat, Heart, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import Modal from '@/components/common/Modal';
import FoodForm from '@/components/donor/FoodForm';
import { getFoodStats, getMyFoodListings } from '@/services/food.service';
import { getRequestStats, getIncomingRequests } from '@/services/request.service';

export default function DonorDashboard() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;

  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalRequests: 0,
    pendingRequests: 0,
    mealsShared: 0,
    impactScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentListings, setRecentListings] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showFoodForm, setShowFoodForm] = useState(false);

  // Validate user access to this dashboard
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
    fetchStats();
    fetchRecentData();
  }, []);

  const fetchStats = async () => {
    try {
      const [foodStats, requestStats] = await Promise.all([
        getFoodStats(),
        getRequestStats(),
      ]);
      setStats({
        totalListings: foodStats.total || 0,
        activeListings: foodStats.active || 0,
        totalRequests: requestStats.total || 0,
        pendingRequests: requestStats.pending || 0,
        mealsShared: foodStats.mealsShared || 145, // Mock data
        impactScore: 85 // Mock data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentData = async () => {
    try {
      const [listings, requests] = await Promise.all([
        getMyFoodListings(),
        getIncomingRequests()
      ]);
      
      setRecentListings((listings.data || listings).slice(0, 3));
      setPendingRequests((requests.data || requests).filter(req => 
        req.status.toLowerCase() === 'pending'
      ).slice(0, 3));
    } catch (error) {
      console.error('Error fetching recent data:', error);
    }
  };

  const handleFoodSubmit = async (foodData) => {
    try {
      // Handle food creation
      setShowFoodForm(false);
      fetchStats();
      fetchRecentData();
    } catch (error) {
      console.error('Error creating food listing:', error);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading dashboard..." />;
  }

  const statCards = [
    { 
      title: 'Food Listings', 
      value: stats.totalListings, 
      icon: <Package className="h-6 w-6" />, 
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    { 
      title: 'Active Listings', 
      value: stats.activeListings, 
      icon: <ChefHat className="h-6 w-6" />, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'Total Requests', 
      value: stats.totalRequests, 
      icon: <Users className="h-6 w-6" />, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'Pending Requests', 
      value: stats.pendingRequests, 
      icon: <Clock className="h-6 w-6" />, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    { 
      title: 'Meals Shared', 
      value: stats.mealsShared, 
      icon: <Heart className="h-6 w-6" />, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      title: 'Impact Score', 
      value: `${stats.impactScore}%`, 
      icon: <TrendingUp className="h-6 w-6" />, 
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Continue making a difference by sharing surplus food
          </p>
        </div>
        <Button 
          onClick={() => setShowFoodForm(true)} 
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Food Listing
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="glass-card p-6 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Food Listings */}
        <motion.div 
          className="glass-card rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Food Listings</h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </div>
          <div className="p-6">
            {recentListings.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No food listings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    className="flex items-center space-x-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {listing.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {listing.quantity} portions • {listing.category}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        listing.status === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Pending Requests */}
        <motion.div 
          className="glass-card rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Pending Requests
                {stats.pendingRequests > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {stats.pendingRequests} new
                  </span>
                )}
              </h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </div>
          <div className="p-6">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    className="flex items-center space-x-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {request.ngo?.name || 'NGO'} • {request.foodListing?.title}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Requested {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0 space-x-2">
                      <Button size="sm" variant="outline">
                        Accept
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Food Form Modal */}
      <Modal
        isOpen={showFoodForm}
        onClose={() => setShowFoodForm(false)}
        title="Add Food Listing"
      >
        <FoodForm
          onSubmit={handleFoodSubmit}
          onCancel={() => setShowFoodForm(false)}
        />
      </Modal>
    </div>
  );
          <div className="dashboard-stat-label">Total Listings</div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat-value">{stats.activeListings}</div>
          <div className="dashboard-stat-label">Active Listings</div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat-value">{stats.pendingRequests}</div>
          <div className="dashboard-stat-label">Pending Requests</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button fullWidth onClick={() => (window.location.href = '/donor/food-listings')}>
              Manage Food Listings
            </Button>
            <Button
              fullWidth
              variant="outline"
              onClick={() => (window.location.href = '/donor/pickups')}
            >
              View Pickup Requests
            </Button>
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <p className="text-gray-600 text-sm">
            You have {stats.pendingRequests} pending pickup requests
          </p>
        </div>
      </div>
    </div>
  );
}

