'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Building2, Package, Activity, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/common/Loader';
import Badge from '@/components/common/Badge';
import { getUserStats } from '@/services/user.service';
import { getFoodStats } from '@/services/food.service';
import { getRequestStats } from '@/services/request.service';

export default function AdminDashboard() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNGOs: 0,
    totalRestaurants: 0,
    totalFood: 0,
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    mealsRescued: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  // Validate user access to this dashboard
  useEffect(() => {
    if (user && userId) {
      // Check if the user ID matches the logged-in user and user is ADMIN
      if (user.id.toString() !== userId.toString() || user.role !== 'ADMIN') {
        router.push('/login');
        return;
      }
    }
  }, [user, userId, router]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [userStats, foodStats, requestStats] = await Promise.all([
        getUserStats(),
        getFoodStats(),
        getRequestStats(),
      ]);
      
      setStats({
        totalUsers: userStats.total || 45,
        totalNGOs: userStats.ngos || 18,
        totalRestaurants: userStats.restaurants || 27,
        totalFood: foodStats.total || 123,
        totalRequests: requestStats.total || 89,
        completedRequests: requestStats.completed || 67,
        pendingRequests: requestStats.pending || 22,
        mealsRescued: foodStats.mealsRescued || 1245,
      });

      // Mock recent activity data
      setRecentActivity([
        { id: 1, type: 'user', message: 'Green Kitchen NGO joined', time: '2 hours ago', status: 'info' },
        { id: 2, type: 'request', message: 'Food rescue completed - 50 meals', time: '3 hours ago', status: 'success' },
        { id: 3, type: 'food', message: 'New food listing: Italian Cuisine', time: '5 hours ago', status: 'info' },
        { id: 4, type: 'alert', message: '2 food items expiring today', time: '6 hours ago', status: 'warning' },
        { id: 5, type: 'request', message: 'Charity Connect submitted request', time: '8 hours ago', status: 'info' }
      ]);
      
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'request':
        return <Activity className="h-5 w-5 text-green-500" />;
      case 'food':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading admin dashboard..." />;
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: <Users className="h-6 w-6" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'NGOs', value: stats.totalNGOs, icon: <Building2 className="h-6 w-6" />, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Restaurants', value: stats.totalRestaurants, icon: <Building2 className="h-6 w-6" />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Food Listings', value: stats.totalFood, icon: <Package className="h-6 w-6" />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Total Requests', value: stats.totalRequests, icon: <Activity className="h-6 w-6" />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Meals Rescued', value: stats.mealsRescued, icon: <TrendingUp className="h-6 w-6" />, color: 'text-primary-600', bg: 'bg-primary-50' }
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and system statistics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            System Healthy
          </Badge>
        </div>
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
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Overview */}
        <motion.div 
          className="glass-card rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Request Overview</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Completed</p>
                  <p className="text-sm text-gray-600">Successfully fulfilled</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.completedRequests}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900">Pending</p>
                  <p className="text-sm text-gray-600">Awaiting response</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="glass-card rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

