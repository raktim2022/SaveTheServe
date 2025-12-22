'use client';

import { useState, useEffect } from 'react';
import Loader from '@/components/common/Loader';
import { getFoodStats } from '@/services/food.service';
import { getRequestStats } from '@/services/request.service';

export default function AdminReportsPage() {
  const [foodStats, setFoodStats] = useState(null);
  const [requestStats, setRequestStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [food, requests] = await Promise.all([getFoodStats(), getRequestStats()]);
      setFoodStats(food);
      setRequestStats(requests);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading reports..." />;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Reports & Analytics</h1>
        <p className="text-gray-600">Platform statistics and insights</p>
      </div>

      <div className="space-y-6">
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-4">Food Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary-600">
                {foodStats?.total || 0}
              </div>
              <div className="text-sm text-gray-600">Total Listings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {foodStats?.available || 0}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {foodStats?.reserved || 0}
              </div>
              <div className="text-sm text-gray-600">Reserved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {foodStats?.completed || 0}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-semibold mb-4">Request Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary-600">
                {requestStats?.total || 0}
              </div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {requestStats?.pending || 0}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {requestStats?.approved || 0}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {requestStats?.completed || 0}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

