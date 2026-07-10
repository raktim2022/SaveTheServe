'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Clock, Package, TrendingUp, Award, BarChart3, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/common/Loader';
import Badge from '@/components/common/Badge';
import { getMyRequests } from '@/services/request.service';
import { formatDate } from '@/utils/formatDate';

export default function NGOHistoryPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // 'week', 'month', 'year', 'all'
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    mealsRescued: 0,
    carbonSaved: 0
  });

  // Validate user access to this page
  useEffect(() => {
    if (user && userId) {
      // Check if the user ID matches the logged-in user and user is NGO
      if (user.id.toString() !== userId.toString() || user.role !== 'NGO') {
        router.push('/login');
        return;
      }
    }
  }, [user, userId, router]);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [requests, timeFilter]);

  const fetchHistory = async () => {
    try {
      const response = await getMyRequests();
      const allRequests = response.data || response;
      // Filter to only show completed requests for history
      const completedRequests = allRequests.filter(req => 
        req.status.toLowerCase() === 'completed'
      );
      setRequests(completedRequests);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    let filteredRequests = requests;
    
    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (timeFilter) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filteredRequests = requests.filter(req => 
        new Date(req.completedAt || req.updatedAt) >= cutoffDate
      );
    }
    
    const totalMeals = filteredRequests.reduce((sum, req) => 
      sum + (req.foodListing?.quantity || 0), 0
    );
    
    setStats({
      totalRequests: filteredRequests.length,
      completedRequests: filteredRequests.length,
      mealsRescued: totalMeals,
      carbonSaved: Math.round(totalMeals * 2.5) // Assuming 2.5kg CO2 saved per meal
    });
  };

  const getImpactLevel = (meals) => {
    if (meals >= 1000) return { level: 'Hero', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (meals >= 500) return { level: 'Champion', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (meals >= 100) return { level: 'Warrior', color: 'text-green-600', bg: 'bg-green-100' };
    if (meals >= 10) return { level: 'Helper', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Beginner', color: 'text-gray-600 dark:text-slate-300', bg: 'bg-gray-100 dark:bg-slate-800' };
  };

  if (loading) {
    return <Loader fullScreen text="Loading history..." />;
  }

  const impact = getImpactLevel(stats.mealsRescued);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Impact History</h1>
          <p className="text-gray-600 dark:text-slate-300 mt-1">Your food rescue journey and impact</p>
        </div>
        
        {/* Time Filter */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500 dark:text-slate-400" />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </motion.div>

      {/* Impact Badge */}
      <motion.div 
        className="glass-card p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center justify-center mb-6">
          <div className={`flex items-center space-x-3 px-6 py-3 rounded-full ${impact.bg}`}>
            <Award className={`h-6 w-6 ${impact.color}`} />
            <span className={`font-semibold text-lg ${impact.color}`}>
              {impact.level} Status
            </span>
          </div>
        </div>
        <p className="text-sm sm:text-base text-center text-gray-600 dark:text-slate-300">
          You've rescued <strong>{stats.mealsRescued} meals</strong> and saved approximately{' '}
          <strong>{stats.carbonSaved}kg CO₂</strong> from entering the atmosphere!
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {[
          { title: 'Total Requests', value: stats.totalRequests, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Meals Rescued', value: stats.mealsRescued, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'CO₂ Saved (kg)', value: stats.carbonSaved, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
          { title: 'Success Rate', value: `${stats.totalRequests > 0 ? '100' : '0'}%`, icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-50' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            className="glass-card p-6 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* History Timeline */}
      <motion.div 
        className="glass-card rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Rescue History</h2>
          <p className="text-gray-600 dark:text-slate-300">Your completed food rescue requests</p>
        </div>

        <div className="p-6">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No completed rescues yet</h3>
              <p className="text-gray-600 dark:text-slate-300">Start making requests to build your impact history!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {request.foodListing?.title || 'Food Rescue'}
                      </h3>
                      <Badge className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-slate-300">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(request.completedAt || request.updatedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>{request.foodListing?.quantity || 0} portions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{request.foodListing?.restaurant?.name || 'Unknown'}</span>
                      </div>
                    </div>
                    
                    {request.foodListing?.description && (
                      <p className="text-gray-600 dark:text-slate-300 mt-2 text-sm">
                        {request.foodListing.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

