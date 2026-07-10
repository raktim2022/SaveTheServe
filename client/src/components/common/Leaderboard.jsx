'use client';

import { useEffect, useState } from 'react';
import { getPublicLeaderboard } from '@/services/analytics.service';

/**
 * Leaderboard component - displays top restaurants and NGOs
 * @param {Object} props
 * @param {number} props.limit - Number of entries to display (default: 10)
 */
export default function Leaderboard({ limit = 10 }) {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getPublicLeaderboard(limit);
        setLeaderboard(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

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
        <p className="text-red-600">Error loading leaderboard: {error}</p>
      </div>
    );
  }

  if (!leaderboard) {
    return null;
  }

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < fullStars ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
        🏆 Community Leaderboard
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Restaurants */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🏪</span>
            Top Restaurants
          </h3>
          <div className="space-y-3">
            {leaderboard.topRestaurants?.length === 0 ? (
              <p className="text-gray-500 dark:text-slate-400 text-center py-4">No data available</p>
            ) : (
              leaderboard.topRestaurants?.map((restaurant, index) => (
                <div 
                  key={restaurant.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{restaurant.shopName}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                      <span>{restaurant.totalDonations.toFixed(1)} kg donated</span>
                      <span>•</span>
                      <span>{restaurant.completedRequests} donations</span>
                    </div>
                    {restaurant.reviewStats && restaurant.reviewStats.totalReviews > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        {renderStars(restaurant.reviewStats.averageRating)}
                        <span className="ml-1 text-gray-600 dark:text-slate-300">
                          ({restaurant.reviewStats.averageRating.toFixed(1)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top NGOs */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🏢</span>
            Top NGOs
          </h3>
          <div className="space-y-3">
            {leaderboard.topNGOs?.length === 0 ? (
              <p className="text-gray-500 dark:text-slate-400 text-center py-4">No data available</p>
            ) : (
              leaderboard.topNGOs?.map((ngo, index) => (
                <div 
                  key={ngo.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{ngo.ngoName}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                      <span>{ngo.totalFoodReceived.toFixed(1)} kg received</span>
                      <span>•</span>
                      <span>~{ngo.estimatedPeopleFed} people fed</span>
                    </div>
                    {ngo.reviewStats && ngo.reviewStats.totalReviews > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        {renderStars(ngo.reviewStats.averageRating)}
                        <span className="ml-1 text-gray-600 dark:text-slate-300">
                          ({ngo.reviewStats.averageRating.toFixed(1)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
