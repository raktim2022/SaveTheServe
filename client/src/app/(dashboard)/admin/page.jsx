'use client';

import { useState, useEffect } from 'react';
import Loader from '@/components/common/Loader';
import { getUserStats } from '@/services/user.service';
import { getFoodStats } from '@/services/food.service';
import { getRequestStats } from '@/services/request.service';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNGOs: 0,
    totalRestaurants: 0,
    totalFood: 0,
    totalRequests: 0,
  });
  const [loading, setLoading] = useState(true);

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
        totalUsers: userStats.total || 0,
        totalNGOs: userStats.ngos || 0,
        totalRestaurants: userStats.restaurants || 0,
        totalFood: foodStats.total || 0,
        totalRequests: requestStats.total || 0,
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
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and statistics</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-stat">
          <div className="dashboard-stat-value">{stats.totalUsers}</div>
          <div className="dashboard-stat-label">Total Users</div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat-value">{stats.totalNGOs}</div>
          <div className="dashboard-stat-label">NGOs</div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat-value">{stats.totalRestaurants}</div>
          <div className="dashboard-stat-label">Restaurants</div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat-value">{stats.totalFood}</div>
          <div className="dashboard-stat-label">Food Listings</div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat-value">{stats.totalRequests}</div>
          <div className="dashboard-stat-label">Total Requests</div>
        </div>
      </div>
    </div>
  );
}

