'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/common/Loader';
import { getMyFoodListings } from '@/services/food.service';
import { getIncomingRequests } from '@/services/request.service';
import { formatDate } from '@/utils/formatDate';
import { getDynamicRoutes } from '@/utils/constants';

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-800',
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  PICKED: 'bg-gray-100 text-gray-600',
};

export default function DonorDashboard() {
  const { userId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const routes = getDynamicRoutes(userId);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listingsRes, requestsRes] = await Promise.all([
        getMyFoodListings(),
        getIncomingRequests(),
      ]);
      setListings(listingsRes?.data || []);
      setRequests(requestsRes?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = {
    total: listings.length,
    available: listings.filter((l) => l.status === 'AVAILABLE').length,
    requested: listings.filter((l) => l.status === 'REQUESTED').length,
    picked: listings.filter((l) => l.status === 'PICKED').length,
    pendingRequests: requests.filter((r) => r.status === 'PENDING').length,
    acceptedRequests: requests.filter((r) => r.status === 'ACCEPTED').length,
  };

  if (loading) return <Loader fullScreen text="Loading dashboard..." />;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Donor'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s an overview of your food donations</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Listings</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Available</p>
          <p className="text-3xl font-bold text-green-600">{stats.available}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Requested</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.requested}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Picked Up</p>
          <p className="text-3xl font-bold text-gray-500">{stats.picked}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Pending Requests</p>
          <p className="text-3xl font-bold text-orange-500">{stats.pendingRequests}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Accepted</p>
          <p className="text-3xl font-bold text-blue-600">{stats.acceptedRequests}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href={routes.DONOR_FOOD_LISTINGS}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add Food Listing
        </Link>
        <Link
          href={routes.DONOR_FOOD_LISTINGS}
          className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Manage Listings
        </Link>
        {stats.pendingRequests > 0 && (
          <Link
            href={routes.DONOR_FOOD_LISTINGS}
            className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            🔔 {stats.pendingRequests} Pending Request{stats.pendingRequests > 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* Recent Listings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Listings</h2>
          <Link href={routes.DONOR_FOOD_LISTINGS} className="text-sm text-green-600 hover:text-green-800">
            View all →
          </Link>
        </div>
        {listings.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
            <div className="text-4xl mb-3">🍱</div>
            <p className="text-gray-500 text-sm">No food listings yet.</p>
            <Link
              href={routes.DONOR_FOOD_LISTINGS}
              className="mt-3 inline-block text-sm text-green-600 font-medium hover:underline"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {listings.slice(0, 5).map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4"
              >
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.foodName}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                    🍽️
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{listing.foodName}</p>
                  <p className="text-xs text-gray-500">
                    {listing.quantity} {listing.unit || 'units'} · Expires {formatDate(listing.expiryTime)}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[listing.status] || 'bg-gray-100 text-gray-600'}`}>
                  {listing.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Requests */}
      {requests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Incoming Requests</h2>
            <Link href={routes.DONOR_FOOD_LISTINGS} className="text-sm text-green-600 hover:text-green-800">
              View all →
            </Link>
          </div>
          <div className="grid gap-3">
            {requests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{req.foodListing?.foodName || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">
                    By {req.ngo?.ngoName || req.ngo?.user?.name || 'NGO'} · {formatDate(req.createdAt)}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                  req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  req.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}