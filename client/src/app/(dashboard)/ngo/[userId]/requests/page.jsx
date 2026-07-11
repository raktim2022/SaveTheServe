'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';
import { getMyRequests, cancelRequest, assignVolunteer } from '@/services/request.service';
import { getVolunteersForMyNGO } from '@/services/volunteer.service';
import { useRealTimeRequests } from '@/hooks/useRealTimeRequests';
import { formatDate } from '@/utils/formatDate';
import { getDynamicRoutes } from '@/utils/constants';
import QRCodeModal from '@/components/common/QRCodeModal';
import ReviewForm from '@/components/common/ReviewForm';
import { createReview } from '@/services/review.service';
// import TrackingMap from '@/components/common/TrackingMap';
// import { useLiveTracking } from '@/hooks/useLiveTracking';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
};

const STATUS_LABELS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
};

export default function NGORequestsPage() {
  const { userId } = useParams();
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  // QR code modal state
  const [qrModal, setQrModal] = useState(null); // { otp, qrToken, foodName, donorName }

  // Review modal state
  const [reviewModal, setReviewModal] = useState(null); // { restaurantId, foodRequestId, name }
  const [trackingModal, setTrackingModal] = useState(null); // { requestId, restaurantCoords, ngoCoords, restaurantName, ngoName, isPickedUp }

  /* 
  const trackingData = useLiveTracking({
    requestId: trackingModal?.requestId,
    isVolunteer: false,
    enabled: !!trackingModal
  });
  */

  // Assign volunteer modal state
  const [assignModal, setAssignModal] = useState(null); // { requestId }
  const [volunteers, setVolunteers] = useState([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const routes = getDynamicRoutes(userId);

  const handleReviewSubmit = async (reviewData) => {
    try {
      await createReview(reviewData);
      toast.success('Review submitted successfully!', { icon: '⭐' });
      setReviewModal(null);
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
      throw err;
    }
  };

  // const trackingData = useLiveTracking({
  //   requestId: trackingModal?.requestId,
  //   isVolunteer: false,
  //   enabled: !!trackingModal
  // });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyRequests();
      setRequests(res?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Real-time request status updates ────────────────────────────────────────────
  const onRequestStatusChanged = useCallback((payload) => {
    const { requestId, status } = payload.data || {};
    setRequests((prev) => {
      const updated = prev.map((r) => (r.id === requestId ? { ...r, status } : r));
      if (status === 'COMPLETED') {
        const targetReq = updated.find((r) => r.id === requestId);
        if (targetReq) {
          toast.success(`Pickup for "${targetReq.foodListing?.foodName || 'food'}" completed!`, { icon: '🎉' });
          setReviewModal({
            restaurantId: targetReq.foodListing?.restaurant?.id,
            foodRequestId: requestId,
            name: targetReq.foodListing?.restaurant?.shopName || 'Restaurant',
          });
        }
      }
      return updated;
    });
  }, []);

  useRealTimeRequests({ onStatusChanged: onRequestStatusChanged });
  // ───────────────────────────────────────────────────────────────────────────

  const showFeedback = (msg, isError = false) => {
    if (isError) {
      setActionError(msg);
      setActionMsg('');
    } else {
      setActionMsg(msg);
      setActionError('');
    }
    setTimeout(() => {
      setActionMsg('');
      setActionError('');
    }, 4000);
  };

  const handleCancel = async (requestId) => {
    if (!confirm('Cancel this request?')) return;
    try {
      await cancelRequest(requestId);
      showFeedback('Request cancelled successfully');
      fetchRequests();
    } catch (err) {
      showFeedback(err.message || 'Failed to cancel request', true);
    }
  };

  const openAssignModal = async (requestId) => {
    setAssignModal({ requestId });
    setSelectedVolunteerId('');
    setVolunteersLoading(true);
    try {
      const res = await getVolunteersForMyNGO();
      const active = (res?.data || []).filter((v) => v.status === 'ACTIVE');
      setVolunteers(active);
    } catch {
      setVolunteers([]);
    } finally {
      setVolunteersLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVolunteerId) return;
    setAssignLoading(true);
    try {
      await assignVolunteer(assignModal.requestId, parseInt(selectedVolunteerId, 10));
      toast.success('Volunteer assigned! Confirmation emails sent.', { icon: '✅' });
      setAssignModal(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to assign volunteer');
    } finally {
      setAssignLoading(false);
    }
  };

  const filtered = statusFilter === 'all'
    ? requests
    : requests.filter((r) => r.status === statusFilter);

  if (loading) return <Loader fullScreen text="Loading your requests..." />;

  return (
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/90 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Requests</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Track your food donation requests</p>
          </div>
          <Link
            href={routes.NGO_DASHBOARD}
            className="text-sm font-medium text-green-600 hover:text-green-800"
          >
            ← Browse Food
          </Link>
        </div>
      </section>

      {/* Feedback */}
      {actionMsg && (
        <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
          {actionMsg}
        </div>
      )}
      {actionError && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {actionError}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs text-gray-500 dark:text-slate-400">Total</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">Pending</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600">{requests.filter(r => r.status === 'PENDING').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">Completed</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">{requests.filter(r => r.status === 'COMPLETED').length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 overflow-x-auto pb-1">
        <div className="flex flex-nowrap gap-2">
          {['all', 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`whitespace-nowrap text-xs sm:text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 py-16 text-center shadow-sm dark:border-slate-600 dark:bg-slate-900/60">
          <div className="text-5xl mb-4">📬</div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-slate-200">
            {statusFilter === 'all' ? 'No requests yet' : `No ${STATUS_LABELS[statusFilter]?.toLowerCase()} requests`}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {statusFilter === 'all' && (
              <Link href={routes.NGO_DASHBOARD} className="text-green-600 hover:underline">
                Browse available food →
              </Link>
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex gap-3 items-center">
                    {req.foodListing?.imageUrl || req.foodListing?.image || req.foodListing?.images?.[0] ? (
                      <img
                        src={req.foodListing?.imageUrl || req.foodListing?.image || req.foodListing?.images?.[0]}
                        alt={req.foodListing.foodName}
                        className="h-12 w-12 rounded-lg object-cover shrink-0 sm:h-14 sm:w-14"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-2xl shrink-0 dark:bg-slate-800 sm:h-14 sm:w-14">
                        🍽️
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {req.foodListing?.foodName || 'Unknown Food'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {req.foodListing?.quantity} {req.foodListing?.unit || 'units'}
                        {req.foodListing?.category && ` · ${req.foodListing.category}`}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium shrink-0 ${STATUS_COLORS[req.status] || 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300'}`}>
                    {STATUS_LABELS[req.status] || req.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3 text-sm text-gray-600 dark:text-slate-300 mb-3">
                  {req.foodListing?.restaurant?.shopName && (
                    <span>🏪 {req.foodListing.restaurant.shopName}</span>
                  )}
                  {req.foodListing?.restaurant?.user?.phone && (
                    <a
                      href={`tel:${req.foodListing.restaurant.user.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      📞 {req.foodListing.restaurant.user.phone}
                    </a>
                  )}
                  {req.pickupTime && (
                    <span>🕐 Pickup: {formatDate(req.pickupTime)}</span>
                  )}
                  <span className="text-gray-400">📅 {formatDate(req.createdAt)}</span>
                </div>

                {req.foodListing?.pickupInstructions && (
                  <p className="text-xs text-gray-400 italic mb-3">
                    📍 {req.foodListing.pickupInstructions}
                  </p>
                )}

                {/* Status-specific info */}
                {req.status === 'ACCEPTED' && (
                  <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                    <p className="text-sm text-green-800 font-medium">✓ Your request was accepted!</p>
                    {req.assignedVolunteer ? (
                      <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
                        <p className="text-xs text-green-700">
                          👤 Volunteer assigned: <strong>
                            {req.assignedVolunteer.user
                              ? `${req.assignedVolunteer.user.firstName ?? ''} ${req.assignedVolunteer.user.lastName ?? ''}`.trim()
                              : req.assignedVolunteer.name}
                          </strong> — OTP &amp; QR sent via email.
                        </p>
                        <div className="flex gap-2">
                          {/* Commented out tracking button for safe deployment
                          {req.assignedVolunteer && (
                            <button
                              onClick={() => setTrackingModal({
                                requestId: req.id,
                                restaurantCoords: {
                                  lat: parseFloat(req.foodListing?.restaurant?.latitude),
                                  lng: parseFloat(req.foodListing?.restaurant?.longitude)
                                },
                                ngoCoords: {
                                  lat: parseFloat(req.ngo?.latitude),
                                  lng: parseFloat(req.ngo?.longitude)
                                },
                                restaurantName: req.foodListing?.restaurant?.shopName,
                                ngoName: req.ngo?.ngoName,
                                isPickedUp: req.foodListing?.status === 'PICKED'
                              })}
                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-colors shrink-0"
                            >
                              🛵 Track Volunteer
                            </button>
                          )}
                          */}
                          {req.pickupOtp && (
                            <button
                              onClick={() => setQrModal({
                                otp: req.pickupOtp,
                                qrToken: req.pickupQrToken,
                                foodName: req.foodListing?.foodName,
                                donorName: req.foodListing?.restaurant?.shopName,
                              })}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-medium transition-colors shrink-0"
                            >
                              🔑 View QR Code
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 mt-0.5">
                        Please arrive at the pickup location by your scheduled time.
                      </p>
                    )}
                  </div>
                )}

                {req.status === 'COMPLETED' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm text-blue-800 font-medium">✓ Pickup completed!</p>
                      <p className="text-xs text-blue-600 mt-0.5">Thank you for rescuing this food.</p>
                    </div>
                    <button
                      onClick={() => setReviewModal({
                        restaurantId: req.foodListing?.restaurant?.id,
                        foodRequestId: req.id,
                        name: req.foodListing?.restaurant?.shopName || 'Restaurant',
                      })}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      ⭐ Review Restaurant
                    </button>
                  </div>
                )}

                {req.status === 'REJECTED' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-red-800 font-medium">✗ Your request was declined by the donor.</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      The food listing may still be available —{' '}
                      <Link href={routes.NGO_DASHBOARD} className="underline font-medium">
                        browse food to request again →
                      </Link>
                    </p>
                  </div>
                )}

                {/* Actions */}
                {req.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancel(req.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Cancel Request
                  </button>
                )}
                {req.status === 'ACCEPTED' && !req.assignedVolunteerId && (
                  <button
                    onClick={() => openAssignModal(req.id)}
                    className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    👤 Assign Volunteer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code / OTP Modal */}
      {qrModal && (
        <QRCodeModal
          open={!!qrModal}
          onClose={() => setQrModal(null)}
          otp={qrModal.otp}
          qrToken={qrModal.qrToken}
          foodName={qrModal.foodName}
          donorName={qrModal.donorName}
        />
      )}

      {/* Assign Volunteer Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Assign Volunteer</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
              Select an active volunteer to handle this pickup. They will receive a QR code &amp; OTP via email.
            </p>
            {volunteersLoading ? (
              <p className="text-sm text-gray-400 text-center py-4">Loading volunteers…</p>
            ) : volunteers.length === 0 ? (
              <p className="text-sm text-red-500 text-center py-4">No active volunteers found. Verify volunteers first.</p>
            ) : (
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <select
                  value={selectedVolunteerId}
                  onChange={(e) => setSelectedVolunteerId(e.target.value)}
                  required
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">— Select a volunteer —</option>
                  {volunteers.map((v) => {
                    const name = v.user
                      ? `${v.user.firstName ?? ''} ${v.user.lastName ?? ''}`.trim() || v.name
                      : v.name;
                    return (
                      <option key={v.id} value={v.id}>
                        {name} {v.user?.email ? `(${v.user.email})` : ''}
                      </option>
                    );
                  })}
                </select>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAssignModal(null)}
                    className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assignLoading || !selectedVolunteerId}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {assignLoading ? 'Assigning…' : 'Assign & Send Emails'}
                  </button>
                </div>
              </form>
            )}
            {!volunteersLoading && (
              <button
                type="button"
                onClick={() => setAssignModal(null)}
                className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 dark:text-slate-300"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <ReviewForm
              restaurantId={reviewModal.restaurantId}
              foodRequestId={reviewModal.foodRequestId}
              onSubmit={handleReviewSubmit}
              onCancel={() => setReviewModal(null)}
            />
          </div>
        </div>
      )}

      {/* Commented out tracking modal for safe deployment
      {trackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Tracking</h3>
              <button
                onClick={() => setTrackingModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <TrackingMap
              volunteerCoords={trackingData?.coordinates}
              restaurantCoords={trackingModal.restaurantCoords}
              ngoCoords={trackingModal.ngoCoords}
              restaurantName={trackingModal.restaurantName}
              ngoName={trackingModal.ngoName}
              isPickedUp={trackingModal.isPickedUp}
            />
          </div>
        </div>
      )}
      */}
    </div>
  );
}