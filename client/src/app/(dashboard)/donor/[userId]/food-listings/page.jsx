"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import FoodForm from "@/components/donor/FoodForm";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import {
  getMyFoodListings,
  createFood,
  updateFood,
  deleteFood,
} from "@/services/food.service";
import {
  getIncomingRequests,
  updateRequestStatus,
} from "@/services/request.service";
import { useRealTimeRequests } from "@/hooks/useRealTimeRequests";
import { useRealTimeFood } from "@/hooks/useRealTimeFood";
import { formatDate } from "@/utils/formatDate";
import { FOOD_CATEGORIES } from "@/utils/constants";

const STATUS_COLORS = {
  AVAILABLE: "bg-green-100 text-green-800",
  REQUESTED: "bg-yellow-100 text-yellow-800",
  PICKED: "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300",
};

const REQUEST_STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

function getCategoryLabel(value) {
  return FOOD_CATEGORIES.find((c) => c.value === value)?.label || value || "—";
}

export default function FoodListingsPage() {
  const { userId } = useParams();
  const { user } = useAuth();

  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editListing, setEditListing] = useState(null);
  const [activeTab, setActiveTab] = useState("listings");
  const [actionMsg, setActionMsg] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [listingsRes, requestsRes] = await Promise.all([
        getMyFoodListings(),
        getIncomingRequests(),
      ]);
      setListings(listingsRes?.data || []);
      setRequests(requestsRes?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Real-time: incoming requests ────────────────────────────────────────────
  const onRequestNew = useCallback((payload) => {
    setRequests((prev) => [payload.data, ...prev]);
    // Switch to requests tab so the donor sees it immediately
    setActiveTab('requests');
  }, []);

  const onRequestStatusChanged = useCallback((payload) => {
    const { requestId, status } = payload.data || {};
    if (status === 'CANCELLED') {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
  }, []);

  useRealTimeRequests({ onNew: onRequestNew, onStatusChanged: onRequestStatusChanged });

  // ── Real-time: donor's own food listing changes ─────────────────────────────
  const onFoodStatusChanged = useCallback((payload) => {
    const { id, status } = payload.data || {};
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }, []);

  const onFoodUpdated = useCallback((payload) => {
    setListings((prev) =>
      prev.map((l) => (l.id === payload.data?.id ? { ...l, ...payload.data } : l))
    );
  }, []);

  const onFoodDeleted = useCallback((payload) => {
    setListings((prev) => prev.filter((l) => l.id !== payload.data?.id));
  }, []);

  useRealTimeFood({ onStatusChanged: onFoodStatusChanged, onUpdated: onFoodUpdated, onDeleted: onFoodDeleted });
  // ───────────────────────────────────────────────────────────────────────────

  const showFeedback = (msg, isError = false) => {
    if (isError) {
      setActionError(msg);
      setActionMsg("");
    } else {
      setActionMsg(msg);
      setActionError("");
    }
    setTimeout(() => {
      setActionMsg("");
      setActionError("");
    }, 4000);
  };

  const handleCreate = async (formData) => {
    try {
      await createFood(formData);
      showFeedback("Food listing created successfully!");
      setShowForm(false);
      fetchData();
    } catch (err) {
      showFeedback(err.message || "Failed to create listing", true);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await updateFood(editListing.id, formData);
      showFeedback("Food listing updated successfully!");
      setEditListing(null);
      fetchData();
    } catch (err) {
      showFeedback(err.message || "Failed to update listing", true);
    }
  };

  const handleDelete = async (listing) => {
    if (!confirm(`Delete "${listing.foodName}"? This cannot be undone.`))
      return;
    try {
      await deleteFood(listing.id);
      showFeedback("Food listing deleted.");
      fetchData();
    } catch (err) {
      showFeedback(err.message || "Failed to delete listing", true);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      await updateRequestStatus(requestId, status);
      showFeedback(`Request ${status.toLowerCase()} successfully!`);
      fetchData();
    } catch (err) {
      showFeedback(err.message || "Failed to update request", true);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const reviewedRequests = requests.filter((r) => r.status !== "PENDING");

  if (loading)
    return <Loader fullScreen text="Loading your food listings..." />;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food Listings</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            Manage your food donations
          </p>
        </div>
        <Button
          className="text-gray-500 dark:text-slate-400"
          onClick={() => {
            setShowForm(true);
            setEditListing(null);
          }}
        >
          + Add Listing
        </Button>
      </div>

      {/* Feedback */}
      {actionMsg && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          {actionMsg}
        </div>
      )}
      {actionError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {actionError}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-slate-700">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "listings"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200"
          }`}
          onClick={() => setActiveTab("listings")}
        >
          My Listings ({listings.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
            activeTab === "requests"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200"
          }`}
          onClick={() => setActiveTab("requests")}
        >
          Incoming Requests ({requests.length})
          {pendingRequests.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {pendingRequests.length} pending
            </span>
          )}
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {(showForm || editListing) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editListing ? "Edit Food Listing" : "Add New Food Listing"}
            </h2>
            <FoodForm
              initialData={editListing || undefined}
              onSubmit={editListing ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditListing(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Listings Tab */}
      {activeTab === "listings" && (
        <>
          {listings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🍱</div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-slate-200">
                No food listings yet
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Add your first donation listing above
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col sm:flex-row"
                >
                  {listing.imageUrl ? (
                    <div className="sm:w-40 h-40 sm:h-auto flex-shrink-0">
                      <img
                        src={listing.imageUrl}
                        alt={listing.foodName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="sm:w-40 h-24 sm:h-auto flex-shrink-0 bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
                      🍽️
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {listing.foodName}
                        </h3>
                        {listing.description && (
                          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {listing.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[listing.status] || "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300"}`}
                      >
                        {listing.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-slate-300">
                      <span>
                        📦 {listing.quantity} {listing.unit || "units"}
                      </span>
                      {listing.category && (
                        <span>🏷️ {getCategoryLabel(listing.category)}</span>
                      )}
                      <span>⏰ Expires {formatDate(listing.expiryTime)}</span>
                    </div>
                    {listing.pickupInstructions && (
                      <p className="mt-2 text-xs text-gray-400 italic">
                        📍 {listing.pickupInstructions}
                      </p>
                    )}
                    {listing.requests?.length > 0 && (
                      <p className="mt-2 text-xs text-blue-600">
                        {listing.requests.length} request
                        {listing.requests.length > 1 ? "s" : ""} received
                      </p>
                    )}
                    {listing.status === "AVAILABLE" && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => setEditListing(listing)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDelete(listing)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <>
          {requests.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📬</div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-slate-200">
                No requests yet
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                NGOs will request your available food listings
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending section */}
              {pendingRequests.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                    Needs Review ({pendingRequests.length})
                  </h3>
                  <div className="grid gap-3">
                    {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {req.foodListing?.foodName || "Unknown Food"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        Requested by:{" "}
                        <strong>
                          {req.ngo?.ngoName ||
                            req.ngo?.user?.name ||
                            "Unknown NGO"}
                        </strong>
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${REQUEST_STATUS_COLORS[req.status] || "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300"}`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-slate-300 mb-3">
                    <span>
                      📦 {req.foodListing?.quantity}{" "}
                      {req.foodListing?.unit || "units"}
                    </span>
                    {req.pickupTime && (
                      <span>🕐 Pickup: {formatDate(req.pickupTime)}</span>
                    )}
                    {req.ngo?.user?.phone && (
                      <span>📞 {req.ngo.user.phone}</span>
                    )}
                    <span>📅 {formatDate(req.createdAt)}</span>
                  </div>
                  {req.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRequestAction(req.id, "ACCEPTED")}
                      >
                        ✓ Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRequestAction(req.id, "REJECTED")}
                        className="text-red-600! hover:bg-red-50!"
                      >
                        ✗ Reject
                      </Button>
                    </div>
                  )}
                  {req.status === "ACCEPTED" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRequestAction(req.id, "COMPLETED")}
                      >
                        ✓ Mark as Completed
                      </Button>
                    </div>
                  )}
                </div>
              ))}
                  </div>
                </div>
              )}

              {/* Reviewed section */}
              {reviewedRequests.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                    Reviewed ({reviewedRequests.length})
                  </h3>
                  <div className="grid gap-3">
                    {reviewedRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 opacity-80"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {req.foodListing?.foodName || "Unknown Food"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              {req.ngo?.ngoName || req.ngo?.user?.name || "Unknown NGO"}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${REQUEST_STATUS_COLORS[req.status] || "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300"}`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">📅 {formatDate(req.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
