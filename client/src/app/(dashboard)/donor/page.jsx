'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { getFoodStats } from '@/services/food.service';
import { getRequestStats } from '@/services/request.service';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalRequests: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading dashboard..." />;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Restaurant Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}</p>
      </div>

      <div className="dashboard-grid mb-6">
        <div className="dashboard-stat">
          <div className="dashboard-stat-value">{stats.totalListings}</div>
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

