'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Package, Download, RefreshCw,
  Heart, ChefHat, Shield, AlertCircle, BarChart3, CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/common/Loader';
import { getAdminAnalytics } from '@/services/analytics.service';
import { getUserStats } from '@/services/user.service';

export default function ReportsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user && userId) {
      if (user.id.toString() !== userId.toString() || user.role !== 'ADMIN') {
        router.push('/login');
        return;
      }
      fetchAnalytics();
    }
  }, [user, userId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const [analyticsRes, statsRes] = await Promise.all([
        getAdminAnalytics().catch(() => null),
        getUserStats().catch(() => null),
      ]);
      const aData = analyticsRes?.data || analyticsRes;
      const sData = statsRes?.data || statsRes;
      setAnalytics(aData);
      setUserStats(sData);
    } catch (err) {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!analytics) return;
    setExporting(true);
    try {
      const p = analytics.platformStats || {};
      const imp = analytics.impactStats || {};
      const rec = analytics.recentActivity || {};
      const rows = [
        ['Metric', 'Value'],
        ['Total Restaurants', p.totalRestaurants ?? 0],
        ['Total NGOs', p.totalNGOs ?? 0],
        ['Total Food Listings', p.totalFoodListings ?? 0],
        ['Total Requests', p.totalRequests ?? 0],
        ['Completed Requests', p.completedRequests ?? 0],
        ['Total Reviews', p.totalReviews ?? 0],
        ['Total Food Donated (units)', imp.totalFoodDonated ?? 0],
        ['Estimated People Fed', imp.estimatedPeopleFed ?? 0],
        ['Food Listings (Last 30 days)', rec.listingsLast30Days ?? 0],
        ['Completions (Last 30 days)', rec.completionsLast30Days ?? 0],
        ['Reviews (Last 30 days)', rec.reviewsLast30Days ?? 0],
        ['Total Users', userStats?.total ?? 0],
        ['NGO Users', userStats?.ngos ?? 0],
        ['Restaurant Users', userStats?.restaurants ?? 0],
        ['Admin Users', userStats?.admins ?? 0],
      ];
      const csvContent = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `savetheserve-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'from-primary-600 to-secondary-500' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-xl"
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{value ?? 0}</h3>
      <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </motion.div>
  );

  if (loading) return <Loader fullScreen text="Loading analytics..." />;

  const p = analytics?.platformStats || {};
  const imp = analytics?.impactStats || {};
  const rec = analytics?.recentActivity || {};

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports &amp; Analytics</h1>
          <p className="text-gray-600 dark:text-slate-300 mt-1">Live platform performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exporting || !analytics}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Platform Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard title="Total Restaurants" value={p.totalRestaurants} icon={ChefHat} color="from-blue-500 to-blue-700" />
          <StatCard title="Total NGOs" value={p.totalNGOs} icon={Heart} color="from-green-500 to-green-700" />
          <StatCard title="Food Listings" value={p.totalFoodListings} subtitle="All time" icon={Package} color="from-yellow-500 to-orange-500" />
          <StatCard title="Total Requests" value={p.totalRequests} subtitle={`${p.completedRequests ?? 0} completed`} icon={BarChart3} color="from-indigo-500 to-purple-600" />
          <StatCard title="Food Donated" value={imp.totalFoodDonated} subtitle="Total units rescued" icon={TrendingUp} color="from-emerald-500 to-teal-600" />
          <StatCard title="People Fed" value={imp.estimatedPeopleFed} subtitle="Estimated" icon={Users} color="from-rose-500 to-pink-600" />
        </div>
      </div>

      {/* User Breakdown */}
      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Total Users', value: userStats?.total ?? 0, color: 'bg-blue-100 text-blue-700', Icon: Users },
            { label: 'NGOs', value: userStats?.ngos ?? 0, color: 'bg-green-100 text-green-700', Icon: Heart },
            { label: 'Restaurants', value: userStats?.restaurants ?? 0, color: 'bg-purple-100 text-purple-700', Icon: ChefHat },
            { label: 'Admins', value: userStats?.admins ?? 0, color: 'bg-amber-100 text-amber-700', Icon: Shield },
          ].map(({ label, value, color, Icon }) => (
            <div key={label}>
              <div className={`inline-flex items-center justify-center h-12 w-12 rounded-full ${color} mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
              {userStats?.total > 0 && (
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                  <div
                    className="h-1.5 rounded-full bg-primary-500"
                    style={{ width: `${Math.round((value / userStats.total) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Summary (Last 30 days) */}
      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity — Last 30 Days</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'New Food Listings', value: rec.listingsLast30Days ?? 0, icon: Package, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Completed Pickups', value: rec.completionsLast30Days ?? 0, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
            { label: 'New Reviews', value: rec.reviewsLast30Days ?? 0, icon: BarChart3, color: 'text-indigo-600 bg-indigo-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`flex items-center gap-4 p-4 rounded-xl ${color.split(' ')[1]}`}>
              <div className={`p-3 rounded-xl ${color.split(' ')[1]}`}>
                <Icon className={`h-5 w-5 ${color.split(' ')[0]}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${color.split(' ')[0]}`}>{value}</p>
                <p className="text-sm text-gray-600 dark:text-slate-300">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews KPI */}
      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Platform Reviews</h2>
        <p className="text-4xl font-bold text-gray-900 dark:text-white">{p.totalReviews ?? 0}</p>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Total reviews across all restaurants and NGOs</p>
      </div>
    </div>
  );
}