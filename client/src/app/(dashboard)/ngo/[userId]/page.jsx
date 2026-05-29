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
  const [pickupTime, setPickupTime] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');
  const [requestError, setRequestError] = useState('');
  const [activeTab, setActiveTab] = useState('food'); // 'food' | 'volunteers'

  const routes = getDynamicRoutes(userId);

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
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name || 'NGO'} 🤝
        </h1>
        <p className="text-gray-500 text-sm mt-1">Browse available food donations from restaurants</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">Available Now</p>
          <p className="text-3xl font-bold text-green-600">{stats.available}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">My Requests</p>
          <p className="text-3xl font-bold text-gray-900">{stats.myTotal}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.myPending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">Accepted</p>
          <p className="text-3xl font-bold text-blue-600">{stats.myAccepted}</p>
        </div>
      </div>

      {/* Quick link to requests + Tab switcher */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link
          href={routes.NGO_REQUESTS}
          className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          My Requests →
        </Link>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('food')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'food' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🍱 Food Listings
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'volunteers' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👥 Volunteers
          </button>
        </div>
      </div>

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
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="all">All Categories</option>
          {FOOD_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Food Listings Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500">No available food listings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((listing) => {
            const requested = alreadyRequested(listing.id);
            const expiringSoon = isExpiringSoon(listing.expiryTime);
            return (
              <div
                key={listing.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {listing.imageUrl ? (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={listing.imageUrl}
                      alt={listing.foodName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-4xl">
                    🍽️
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{listing.foodName}</h3>
                    {expiringSoon && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex-shrink-0">
                        Expiring!
                      </span>
                    )}
                  </div>
                  {listing.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{listing.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
                    <span>📦 {listing.quantity} {listing.unit || 'units'}</span>
                    {listing.category && <span>🏷️ {getCategoryLabel(listing.category)}</span>}
                    <span className={expiringSoon ? 'text-red-600 font-medium' : ''}>
                      ⏰ {formatDate(listing.expiryTime)}
                    </span>
                  </div>
                  {listing.restaurant?.shopName && (
                    <p className="text-xs text-gray-400 mb-3">
                      🏪 {listing.restaurant.shopName}
                      {listing.restaurant?.user?.phone && ` · ${listing.restaurant.user.phone}`}
                    </p>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-1">Request Donation</h2>
            <p className="text-sm text-gray-500 mb-4">
              <strong>{requestModal.listing.foodName}</strong> — {requestModal.listing.quantity} {requestModal.listing.unit || 'units'}
            </p>

            {requestMsg ? (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm mb-4">
                {requestMsg}
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Pickup Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    min={new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16)}
                    max={requestModal.listing.expiryTime ? new Date(requestModal.listing.expiryTime).toISOString().slice(0, 16) : undefined}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
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
    </div>
  );
}
