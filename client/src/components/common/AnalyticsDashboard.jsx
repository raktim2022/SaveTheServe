'use client';

import { useEffect, useState } from 'react';
import { getRestaurantAnalytics, getNGOAnalytics, getAdminAnalytics } from '@/services/analytics.service';

/**
 * AnalyticsDashboard component
 * @param {Object} props
 * @param {string} props.type - Type of analytics: 'restaurant', 'ngo', or 'admin'
 * @param {number} props.entityId - ID of restaurant or NGO (not needed for admin)
 */
export default function AnalyticsDashboard({ type, entityId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data;
        if (type === 'restaurant' && entityId) {
          const response = await getRestaurantAnalytics(entityId);
          data = response.data;
        } else if (type === 'ngo' && entityId) {
          const response = await getNGOAnalytics(entityId);
          data = response.data;
        } else if (type === 'admin') {
          const response = await getAdminAnalytics();
          data = response.data;
        }
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (type && (entityId || type === 'admin')) {
      fetchAnalytics();
    }
  }, [type, entityId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading analytics: {error}</p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const StatCard = ({ title, value, subtitle, icon }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

      {/* Restaurant Analytics */}
      {type === 'restaurant' && analytics.foodStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Listings" 
              value={analytics.foodStats.totalListings}
              icon="📋"
            />
            <StatCard 
              title="Available Now" 
              value={analytics.foodStats.availableListings}
              icon="✅"
            />
            <StatCard 
              title="Completed Donations" 
              value={analytics.requestStats.completedRequests}
              icon="🎉"
            />
            <StatCard 
              title="Food Donated (kg)" 
              value={analytics.foodStats.totalFoodDonated.toFixed(1)}
              icon="🍲"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Average Rating" 
              value={analytics.reviewStats.averageRating.toFixed(1)}
              subtitle={`${analytics.reviewStats.totalReviews} reviews`}
              icon="⭐"
            />
            <StatCard 
              title="Recent Listings" 
              value={analytics.recentActivity.listingsLast7Days}
              subtitle="Last 7 days"
              icon="📈"
            />
            <StatCard 
              title="Recent Completions" 
              value={analytics.recentActivity.completionsLast7Days}
              subtitle="Last 7 days"
              icon="✅"
            />
          </div>
        </>
      )}

      {/* NGO Analytics */}
      {type === 'ngo' && analytics.requestStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Requests" 
              value={analytics.requestStats.totalRequests}
              icon="📝"
            />
            <StatCard 
              title="Completed" 
              value={analytics.requestStats.completedRequests}
              icon="✅"
            />
            <StatCard 
              title="Food Received (kg)" 
              value={analytics.impactStats.totalFoodReceived.toFixed(1)}
              icon="🍲"
            />
            <StatCard 
              title="People Fed" 
              value={analytics.impactStats.estimatedPeopleFed}
              subtitle="Estimated"
              icon="👥"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Average Rating" 
              value={analytics.reviewStats.averageRating.toFixed(1)}
              subtitle={`${analytics.reviewStats.totalReviews} reviews`}
              icon="⭐"
            />
            <StatCard 
              title="Recent Requests" 
              value={analytics.recentActivity.requestsLast7Days}
              subtitle="Last 7 days"
              icon="📈"
            />
            <StatCard 
              title="Recent Completions" 
              value={analytics.recentActivity.completionsLast7Days}
              subtitle="Last 7 days"
              icon="✅"
            />
          </div>
        </>
      )}

      {/* Admin Analytics */}
      {type === 'admin' && analytics.platformStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              title="Total Restaurants" 
              value={analytics.platformStats.totalRestaurants}
              icon="🏪"
            />
            <StatCard 
              title="Total NGOs" 
              value={analytics.platformStats.totalNGOs}
              icon="🏢"
            />
            <StatCard 
              title="Total Listings" 
              value={analytics.platformStats.totalFoodListings}
              icon="📋"
            />
            <StatCard 
              title="Completed Requests" 
              value={analytics.platformStats.completedRequests}
              icon="✅"
            />
            <StatCard 
              title="Food Donated (kg)" 
              value={analytics.impactStats.totalFoodDonated.toFixed(1)}
              icon="🍲"
            />
            <StatCard 
              title="People Fed" 
              value={analytics.impactStats.estimatedPeopleFed}
              subtitle="Estimated"
              icon="👥"
            />
          </div>
        </>
      )}
    </div>
  );
}
