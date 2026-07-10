'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Package, Calendar, Download, RefreshCw, Heart, ChefHat, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';

export default function ReportsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  // Validate user access to this page
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
    if (user && userId) {
      fetchAnalytics();
    }
  }, [user, userId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockAnalytics = {
        overview: {
          totalUsers: 156,
          activeUsers: 142,
          totalDonations: 2847,
          foodSaved: 15420, // in kg
          ngoCount: 45,
          restaurantCount: 67,
          adminCount: 3
        },
        growth: {
          usersGrowth: 12.5,
          donationsGrowth: 8.3,
          foodSavedGrowth: 15.7
        },
        recentActivity: [
          { date: '2024-12-22', users: 5, donations: 23, foodSaved: 125 },
          { date: '2024-12-21', users: 3, donations: 18, foodSaved: 98 },
          { date: '2024-12-20', users: 8, donations: 31, foodSaved: 187 },
          { date: '2024-12-19', users: 2, donations: 15, foodSaved: 76 },
          { date: '2024-12-18', users: 6, donations: 27, foodSaved: 156 }
        ],
        topPerformers: {
          ngos: [
            { name: 'Green Hearts Foundation', donations: 234, impact: 'High' },
            { name: 'Food Angels', donations: 189, impact: 'High' },
            { name: 'City Food Bank', donations: 156, impact: 'Medium' }
          ],
          restaurants: [
            { name: 'Downtown Bistro', donations: 98, impact: 'High' },
            { name: 'Corner Cafe', donations: 76, impact: 'Medium' },
            { name: 'Pizza Palace', donations: 65, impact: 'Medium' }
          ]
        }
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card p-6 rounded-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 text-white">
          <Icon className="h-6 w-6" />
        </div>
        {trendValue && (
          <div className={`flex items-center text-sm font-medium ${trendValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {Math.abs(trendValue)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
      <p className="text-sm text-gray-600 dark:text-slate-300">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </motion.div>
  );

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return <Loader fullScreen text="Loading analytics..." />;
  }

  if (!analytics) {
    return <div>Failed to load analytics data</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-slate-300 mt-1">Platform performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.overview.totalUsers}
          subtitle={`${analytics.overview.activeUsers} active`}
          icon={Users}
          trendValue={analytics.growth.usersGrowth}
        />
        <StatCard
          title="Total Donations"
          value={analytics.overview.totalDonations}
          subtitle="Food listings donated"
          icon={Package}
          trendValue={analytics.growth.donationsGrowth}
        />
        <StatCard
          title="Food Saved"
          value={`${formatNumber(analytics.overview.foodSaved)} kg`}
          subtitle="Total food rescued"
          icon={Heart}
          trendValue={analytics.growth.foodSavedGrowth}
        />
        <StatCard
          title="Active NGOs"
          value={analytics.overview.ngoCount}
          subtitle={`${analytics.overview.restaurantCount} restaurants`}
          icon={Shield}
        />
      </div>

      {/* User Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card p-6 rounded-xl"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">User Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <Heart className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.overview.ngoCount}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-300">NGOs</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(analytics.overview.ngoCount / analytics.overview.totalUsers) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <ChefHat className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.overview.restaurantCount}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-300">Restaurants</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(analytics.overview.restaurantCount / analytics.overview.totalUsers) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.overview.adminCount}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-300">Admins</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${(analytics.overview.adminCount / analytics.overview.totalUsers) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-card p-6 rounded-xl"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {analytics.recentActivity.map((day, index) => (
            <div key={day.date} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{day.users}</div>
                  <div className="text-gray-500 dark:text-slate-400">Users</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{day.donations}</div>
                  <div className="text-gray-500 dark:text-slate-400">Donations</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">{day.foodSaved}kg</div>
                  <div className="text-gray-500 dark:text-slate-400">Food Saved</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Top NGOs</h2>
          <div className="space-y-4">
            {analytics.topPerformers.ngos.map((ngo, index) => (
              <div key={ngo.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{ngo.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{ngo.donations} donations received</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ngo.impact === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {ngo.impact} Impact
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Top Restaurants</h2>
          <div className="space-y-4">
            {analytics.topPerformers.restaurants.map((restaurant, index) => (
              <div key={restaurant.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{restaurant.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{restaurant.donations} donations made</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  restaurant.impact === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {restaurant.impact} Impact
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}