'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';
import { getFoodListings } from '@/services/food.service';
import { createRequest, getMyRequests } from '@/services/request.service';
import { useRealTimeFood } from '@/hooks/useRealTimeFood';
import { useRealTimeRequests } from '@/hooks/useRealTimeRequests';
import { formatDate } from '@/utils/formatDate';
import { FOOD_CATEGORIES, getDynamicRoutes } from '@/utils/constants';
import VolunteerManagement from '@/components/ngo/VolunteerManagement';
import ReviewList from '@/components/common/ReviewList';
import { getRestaurantReviews } from '@/services/review.service';
import toast from 'react-hot-toast';

function getCategoryLabel(value) {
  return FOOD_CATEGORIES.find((c) => c.value === value)?.label || value || 'Other';
}

function isExpiringSoon(expiryTime) {
  const diff = new Date(expiryTime) - new Date();
  return diff > 0 && diff < 24 * 60 * 60 * 1000;
}

export default function NGODashboard() {
  const { userId } = useParams();
  const { user } = useAuth();

  const [listings, setListings] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Request modal state
  const [requestModal, setRequestModal] = useState(null); // { listing }
  const [viewReviewsModal, setViewReviewsModal] = useState(null); // { restaurantId, name, reviews: [], averageRating: 0, totalReviews: 0, loading: false }
  const [pickupTime, setPickupTime] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');
  const [requestError, setRequestError] = useState('');
  const [activeTab, setActiveTab] = useState('food'); // 'food' | 'volunteers'

  const routes = getDynamicRoutes(userId);

  const handleViewRestaurantReviews = async (restaurantId, shopName) => {
    setViewReviewsModal({ restaurantId, name: shopName, reviews: [], loading: true });
    try {
      const res = await getRestaurantReviews(restaurantId);
      setViewReviewsModal({
        restaurantId,
        name: shopName,
        reviews: res.data?.reviews || res.reviews || [],
        averageRating: res.data?.averageRating ?? res.averageRating ?? 0,
        totalReviews: res.data?.totalReviews ?? res.totalReviews ?? 0,
        loading: false
      });
    } catch (err) {
      toast.error(err.message || 'Failed to fetch reviews');
      setViewReviewsModal(null);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listingsRes, myReqRes] = await Promise.all([
        getFoodListings(),
        getMyRequests(),
      ]);
      setListings(listingsRes?.data || []);
      setMyRequests(myReqRes?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load food listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Real-time food & request updates ─────────────────────────────────────────────
  const onFoodNew = useCallback((payload) => {
    setListings((prev) => [payload.data, ...prev]);
  }, []);

  const onFoodUpdated = useCallback((payload) => {
    setListings((prev) =>
      prev.map((l) => (l.id === payload.data?.id ? { ...l, ...payload.data } : l))
    );
  }, []);

  const onFoodDeleted = useCallback((payload) => {
    setListings((prev) => prev.filter((l) => l.id !== payload.data?.id));
  }, []);

  const onFoodStatusChanged = useCallback((payload) => {
    const { id, status } = payload.data || {};
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  }, []);

  const onRequestStatusChanged = useCallback((payload) => {
    const { requestId, status } = payload.data || {};
    setMyRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
  }, []);

  useRealTimeFood({
    onNew:           onFoodNew,
    onUpdated:       onFoodUpdated,
    onDeleted:       onFoodDeleted,
    onStatusChanged: onFoodStatusChanged,
  });
  useRealTimeRequests({ onStatusChanged: onRequestStatusChanged });
  // ───────────────────────────────────────────────────────────────────────────

  const alreadyRequested = (listingId) =>
    myRequests.some(
      (r) =>
        r.foodListingId === listingId &&
        (r.status === 'PENDING' || r.status === 'ACCEPTED')
    );

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!pickupTime) {
      setRequestError('Please select a pickup time');
      return;
    }
    if (new Date(pickupTime) <= new Date()) {
      setRequestError('Pickup time must be in the future');
      return;
    }
    setRequestLoading(true);
    setRequestError('');
    try {
      await createRequest({
        foodListingId: requestModal.listing.id,
        pickupTime: new Date(pickupTime).toISOString(),
      });
      setRequestMsg('Request sent successfully! The donor will review it.');
      setTimeout(() => {
        setRequestModal(null);
        setRequestMsg('');
        setPickupTime('');
        fetchData();
      }, 2000);
    } catch (err) {
      setRequestError(err.message || 'Failed to send request');
    } finally {
      setRequestLoading(false);
    }
  };

  const filtered = listings.filter((l) => {
    const matchesSearch = !search || l.foodName?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || l.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    available: listings.length,
    myTotal: myRequests.length,
    myPending: myRequests.filter((r) => r.status === 'PENDING').length,
    myAccepted: myRequests.filter((r) => r.status === 'ACCEPTED').length,
  };

  if (loading) return <Loader fullScreen text="Loading available food..." />;

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[28px] border border-emerald-100 bg-linear-to-br from-emerald-700 via-green-600 to-lime-500 p-5 text-white shadow-xl sm:p-7 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-50">
              NGO operations hub
            </div>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Welcome, {user?.name || 'NGO'} 🤝
            </h1>
            <p className="mt-2 text-sm text-emerald-50/90 sm:text-base">
              Coordinate pickups, review incoming requests, and connect with volunteers from one calm dashboard.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm font-medium text-emerald-50">Available now</p>
            <p className="text-2xl font-semibold">{stats.available} listings</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-4 mt-6 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-slate-400">Available Now</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{stats.available}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-slate-400">My Requests</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.myTotal}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-slate-400">Pending</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">{stats.myPending}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-slate-400">Accepted</p>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{stats.myAccepted}</p>
        </div>
      </section>

      <section className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Keep the flow moving</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review requests and manage volunteer support from a clean, focused workspace.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={routes.NGO_REQUESTS}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            My Requests →
          </Link>
          <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('food')}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'food' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              🍱 Food Listings
            </button>
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'volunteers' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              👥 Volunteers
            </button>
          </div>
        </div>
      </section>

      {/* Volunteers Tab */}
      {activeTab === 'volunteers' && (
        <VolunteerManagement />
      )}

      {/* Food listings only shown when on food tab */}
      {activeTab === 'food' && (<>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="all">All Categories</option>
          {FOOD_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Food Listings Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 py-16 text-center shadow-sm dark:border-slate-600 dark:bg-slate-900/60">
          <div className="mb-4 text-5xl">🔍</div>
          <p className="text-gray-500 dark:text-slate-400">No available food listings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((listing) => {
            const requested = alreadyRequested(listing.id);
            const expiringSoon = isExpiringSoon(listing.expiryTime);
            return (
              <div
                key={listing.id}
                className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                {listing.imageUrl || listing.image || listing.images?.[0] ? (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={listing.imageUrl || listing.image || listing.images?.[0]}
                      alt={listing.foodName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center text-4xl">
                    🍽️
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{listing.foodName}</h3>
                    {expiringSoon && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full shrink-0">
                        Expiring!
                      </span>
                    )}
                  </div>
                  {listing.description && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-2 line-clamp-2">{listing.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-slate-300 mb-3">
                    <span>📦 {listing.quantity} {listing.unit || 'units'}</span>
                    {listing.category && <span>🏷️ {getCategoryLabel(listing.category)}</span>}
                    <span className={expiringSoon ? 'text-red-600 font-medium' : ''}>
                      ⏰ {formatDate(listing.expiryTime)}
                    </span>
                  </div>
                  {listing.restaurant?.shopName && (
                    <div className="text-xs text-gray-400 mb-3 flex items-center gap-1.5 flex-wrap">
                      <span>🏪 {listing.restaurant.shopName}</span>
                      <button
                        onClick={() => handleViewRestaurantReviews(listing.restaurant.id, listing.restaurant.shopName)}
                        className="text-green-600 hover:underline hover:text-green-700 font-medium cursor-pointer"
                      >
                        ⭐ View Reviews
                      </button>
                      {listing.restaurant?.user?.phone && <span>· 📞 {listing.restaurant.user.phone}</span>}
                    </div>
                  )}
                  {listing.pickupInstructions && (
                    <p className="text-xs text-gray-400 mb-3 italic">
                      📍 {listing.pickupInstructions}
                    </p>
                  )}
                  <Button
                    fullWidth
                    size="sm"
                    disabled={requested}
                    variant={requested ? 'secondary' : 'primary'}
                    onClick={() => {
                      if (!requested) {
                        setRequestModal({ listing });
                        setPickupTime('');
                        setRequestError('');
                        setRequestMsg('');
                      }
                    }}
                  >
                    {requested ? '✓ Requested' : 'Request Donation'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request Modal */}
      {requestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-1">Request Donation</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              <strong>{requestModal.listing.foodName}</strong> — {requestModal.listing.quantity} {requestModal.listing.unit || 'units'}
            </p>

            {requestMsg ? (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm mb-4">
                {requestMsg}
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
                    Preferred Pickup Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    min={new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16)}
                    max={requestModal.listing.expiryTime ? new Date(requestModal.listing.expiryTime).toISOString().slice(0, 16) : undefined}
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                {requestError && (
                  <p className="text-red-600 text-xs">{requestError}</p>
                )}
                <div className="flex gap-3">
                  <Button type="submit" fullWidth loading={requestLoading}>
                    Send Request
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => { setRequestModal(null); setRequestError(''); }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      </>)}
      {/* View Reviews Modal */}
      {viewReviewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Reviews for {viewReviewsModal.name}
                </h3>
              </div>
              <button
                onClick={() => setViewReviewsModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <ReviewList
              reviews={viewReviewsModal.reviews}
              averageRating={viewReviewsModal.averageRating}
              totalReviews={viewReviewsModal.totalReviews}
              loading={viewReviewsModal.loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
