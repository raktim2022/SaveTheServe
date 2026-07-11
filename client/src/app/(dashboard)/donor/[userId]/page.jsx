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
  PICKED: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300',
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
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[28px] border border-green-100 bg-gradient-to-br from-green-700 via-emerald-600 to-teal-500 p-5 text-white shadow-xl sm:p-7 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-50">
              Donor dashboard
            </div>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Welcome back, {user?.name || 'Donor'} 👋
            </h1>
            <p className="mt-2 text-sm text-emerald-50/90 sm:text-base">
              Track your donations, review incoming requests, and keep every pickup running smoothly.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm font-medium text-emerald-50">Your impact</p>
            <p className="text-2xl font-semibold">{stats.available} available</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-4 mt-6 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-slate-400">Total Listings</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-slate-400">Available</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{stats.available}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-slate-400">Requested</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">{stats.requested}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-slate-400">Picked Up</p>
          <p className="mt-2 text-3xl font-semibold text-slate-500 dark:text-slate-400">{stats.picked}</p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-slate-400">Pending Requests</p>
          <p className="mt-2 text-3xl font-semibold text-orange-500">{stats.pendingRequests}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-slate-400">Accepted</p>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{stats.acceptedRequests}</p>
        </div>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        <Link
          href={routes.DONOR_FOOD_LISTINGS}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          + Add Food Listing
        </Link>
        <Link
          href={routes.DONOR_FOOD_LISTINGS}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          Manage Listings
        </Link>
        {stats.pendingRequests > 0 && (
          <Link
            href={routes.DONOR_FOOD_LISTINGS}
            className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100"
          >
            🔔 {stats.pendingRequests} Pending Request{stats.pendingRequests > 1 ? 's' : ''}
          </Link>
        )}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Listings</h2>
            <Link href={routes.DONOR_FOOD_LISTINGS} className="text-sm font-medium text-emerald-600 hover:text-emerald-800">
              View all →
            </Link>
          </div>
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-600 dark:bg-slate-900/60">
              <div className="mb-3 text-4xl">🍱</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">No food listings yet.</p>
              <Link href={routes.DONOR_FOOD_LISTINGS} className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:underline">
                Create your first listing
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {listings.slice(0, 5).map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/70"
                >
                  {listing.imageUrl || listing.image || listing.images?.[0] ? (
                    <img src={listing.imageUrl || listing.image || listing.images?.[0]} alt={listing.foodName} className="h-14 w-14 flex-shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl dark:bg-slate-800">
                      🍽️
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900 dark:text-white">{listing.foodName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {listing.quantity} {listing.unit || 'units'} · Expires {formatDate(listing.expiryTime)}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[listing.status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {listing.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Incoming Requests</h2>
            <Link href={routes.DONOR_PICKUPS} className="text-sm font-medium text-emerald-600 hover:text-emerald-800">
              View all →
            </Link>
          </div>
          {requests.length > 0 ? (
            <div className="grid gap-3">
              {requests.slice(0, 3).map((req) => (
                <div key={req.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{req.foodListing?.foodName || 'Unknown'}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        By {req.ngo?.ngoName || req.ngo?.user?.name || 'NGO'} · {formatDate(req.createdAt)}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-600 dark:bg-slate-900/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">No new requests yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}