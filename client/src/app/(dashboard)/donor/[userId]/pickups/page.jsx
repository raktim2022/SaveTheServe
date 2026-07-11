'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Clock, Users, CheckCircle, XCircle, Package, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';
import Loader from '@/components/common/Loader';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import dynamic from 'next/dynamic';
import { getIncomingRequests, updateRequestStatus, verifyPickupOtp, verifyPickupQR } from '@/services/request.service';
import toast from 'react-hot-toast';
import PickupCodeInput from '@/components/common/PickupCodeInput';
import ReviewForm from '@/components/common/ReviewForm';
import { createReview, getNgoReviews } from '@/services/review.service';
import ReviewList from '@/components/common/ReviewList';
// import TrackingMap from '@/components/common/TrackingMap';
// import { useLiveTracking } from '@/hooks/useLiveTracking';

// Loaded client-only — html5-qrcode must not run on the server
const QrScanner = dynamic(() => import('@/components/common/QrScanner'), { ssr: false });

const TABS = [
  { key: 'PENDING',   label: 'Pending',   color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  { key: 'ACCEPTED',  label: 'Active',    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  { key: 'COMPLETED', label: 'Completed', color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  { key: 'REJECTED',  label: 'Rejected',  color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
];

export default function PickupRequestsPage() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRequest, setUpdatingRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('PENDING');

  // OTP / QR verification modal state
  const [verifyModal, setVerifyModal] = useState(null); // { requestId, foodName }
  const [reviewModal, setReviewModal] = useState(null); // { ngoId, foodRequestId, name }
  const [viewReviewsModal, setViewReviewsModal] = useState(null); // { ngoId, name, reviews: [], averageRating: 0, totalReviews: 0, loading: false }
  const [trackingModal, setTrackingModal] = useState(null); // { requestId, restaurantCoords, ngoCoords, restaurantName, ngoName, isPickedUp }
  const [verifyMode, setVerifyMode] = useState('otp'); // 'otp' | 'qr'
  const [otpValue, setOtpValue] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Validate user access to this page
  useEffect(() => {
    if (user && userId) {
      if (user.id.toString() !== userId.toString() || user.role !== 'RESTAURANT') {
        router.push('/login');
      }
    }
  }, [user, userId, router]);

  useEffect(() => {
    if (user && userId) {
      fetchPickupRequests();
    }
  }, [user, userId]);

  // ── Real-time socket listeners ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // A new request arrived from an NGO → prepend to list
    const onRequestNew = (payload) => {
      const incoming = payload.data;
      if (!incoming) return;
      setRequests((prev) => {
        if (prev.some((r) => r.id === incoming.id)) return prev; // dedup
        return [incoming, ...prev];
      });
      setActiveTab('PENDING'); // jump to Pending tab so the user sees it
    };

    // A request's status changed (e.g. volunteer assigned, OTP verified)
    const onRequestStatusChanged = (payload) => {
      const { requestId, status } = payload.data || {};
      if (!requestId) return;
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r))
      );
    };

    socket.on('request:new', onRequestNew);
    socket.on('request:status_changed', onRequestStatusChanged);

    return () => {
      socket.off('request:new', onRequestNew);
      socket.off('request:status_changed', onRequestStatusChanged);
    };
  }, [socket]);

  const fetchPickupRequests = async () => {
    try {
      setLoading(true);
      const response = await getIncomingRequests();
      setRequests(response.data || response || []);
    } catch (error) {
      console.error('Error fetching pickup requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewNgoReviews = async (ngoId, ngoName) => {
    setViewReviewsModal({ ngoId, name: ngoName, reviews: [], loading: true });
    try {
      const res = await getNgoReviews(ngoId);
      setViewReviewsModal({
        ngoId,
        name: ngoName,
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

  const handleUpdateStatus = async (requestId, status) => {
    try {
      setUpdatingRequest(requestId);
      await updateRequestStatus(requestId, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      );
      if (status === 'ACCEPTED') setActiveTab('ACCEPTED');
      if (status === 'REJECTED') setActiveTab('REJECTED');
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error(error.message || 'Failed to update request status');
    } finally {
      setUpdatingRequest(null);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpValue.trim()) return;
    setVerifyLoading(true);
    try {
      const targetReqId = verifyModal.requestId;
      await verifyPickupOtp(targetReqId, otpValue.trim());
      toast.success('Pickup verified! Request marked as completed.', { icon: '✅' });
      setVerifyModal(null);
      setOtpValue('');
      fetchPickupRequests();

      const targetReq = requests.find((r) => r.id === targetReqId);
      if (targetReq) {
        setReviewModal({
          ngoId: targetReq.ngo?.id,
          foodRequestId: targetReqId,
          name: targetReq.ngo?.ngoName || 'NGO',
        });
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleQrScan = async (rawText) => {
    setVerifyLoading(true);
    try {
      let qrToken = rawText;
      try {
        const parsed = JSON.parse(rawText);
        if (parsed.token) qrToken = parsed.token;
      } catch {
        // raw string is the token
      }
      const targetReqId = verifyModal.requestId;
      await verifyPickupQR(targetReqId, qrToken);
      toast.success('Pickup verified via QR! Request marked as completed.', { icon: '✅' });
      setVerifyModal(null);
      setVerifyMode('otp');
      fetchPickupRequests();

      const targetReq = requests.find((r) => r.id === targetReqId);
      if (targetReq) {
        setReviewModal({
          ngoId: targetReq.ngo?.id,
          foodRequestId: targetReqId,
          name: targetReq.ngo?.ngoName || 'NGO',
        });
      }
    } catch (err) {
      toast.error(err.message || 'QR verification failed');
      setVerifyMode('otp');
    } finally {
      setVerifyLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':   return 'warning';
      case 'ACCEPTED':  return 'success';
      case 'COMPLETED': return 'success';
      case 'REJECTED':  return 'danger';
      default:          return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const tabRequests = requests.filter((r) => r.status === activeTab);

  if (loading) {
    return <Loader fullScreen text="Loading pickup requests..." />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-3 py-4 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-emerald-700 via-green-600 to-teal-500 p-5 text-white shadow-xl dark:border-slate-700 sm:p-7 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-50">
              Donor pickup center
            </div>
            <h1 className="text-2xl font-semibold sm:text-3xl">Pickup Requests</h1>
            <p className="mt-2 max-w-2xl text-sm text-emerald-50/90 sm:text-base">
              Review NGO requests, approve pickups, and verify handoffs from a clearer, more reliable workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
              connected ? 'border-emerald-200/60 bg-white/15 text-emerald-50' : 'border-white/20 bg-white/10 text-emerald-50/80'
            }`}>
              {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {connected ? 'Live' : 'Offline'}
            </span>
            <Button size="sm" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={fetchPickupRequests}>
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-100/80 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 w-full sm:w-auto">
        {TABS.map((tab) => {
          const count = requests.filter((r) => r.status === tab.key).length;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? `bg-white dark:bg-slate-800 shadow-sm ${tab.color}`
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-900'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold min-w-5 text-center ${
                  isActive ? `${tab.bg} ${tab.color} ${tab.border} border` : 'bg-gray-200 text-gray-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/90 sm:p-6"
        >
          {tabRequests.length === 0 ? (
            <EmptyState tab={TABS.find((t) => t.key === activeTab)} />
          ) : (
            <div className="space-y-4">
              {tabRequests.map((request, index) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  index={index}
                  updatingRequest={updatingRequest}
                  onUpdateStatus={handleUpdateStatus}
                  onVerify={(req) => {
                    setVerifyModal({
                      requestId: req.id,
                      foodName: req.foodListing?.foodName || req.foodListing?.title || 'Food',
                    });
                    setOtpValue('');
                    setVerifyMode('otp');
                  }}
                  onReview={(req) => {
                    setReviewModal({
                      ngoId: req.ngo?.id,
                      foodRequestId: req.id,
                      name: req.ngo?.ngoName || 'NGO',
                    });
                  }}
                  onTrack={(req) => {
                    setTrackingModal({
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
                    });
                  }}
                  onViewReviews={(ngoId, name) => {
                    handleViewNgoReviews(ngoId, name);
                  }}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* OTP / QR Verification Modal */}
      {verifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Verify Volunteer Pickup</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Confirm pickup of <strong>{verifyModal.foodName}</strong>
            </p>

            {/* Mode toggle */}
            <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 mb-5">
              <button
                type="button"
                onClick={() => setVerifyMode('otp')}
                className={`flex-1 text-sm py-1.5 rounded-lg font-medium transition-colors ${
                  verifyMode === 'otp' ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
                }`}
              >
                🔢 Enter OTP
              </button>
              <button
                type="button"
                onClick={() => setVerifyMode('qr')}
                className={`flex-1 text-sm py-1.5 rounded-lg font-medium transition-colors ${
                  verifyMode === 'qr' ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200'
                }`}
              >
                📷 Scan QR
              </button>
            </div>

            {verifyMode === 'otp' ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <PickupCodeInput
                  value={otpValue}
                  onChange={setOtpValue}
                  disabled={verifyLoading}
                  label="Enter the 6-digit code shown by the volunteer"
                />
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setVerifyModal(null); setOtpValue(''); }}
                    className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifyLoading || otpValue.length !== 6}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {verifyLoading ? 'Verifying…' : 'Confirm Pickup'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                {verifyLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 dark:text-slate-400">Verifying…</p>
                  </div>
                ) : (
                  <QrScanner
                    onScan={handleQrScan}
                    onClose={() => { setVerifyMode('otp'); setVerifyModal(null); }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <ReviewForm
              ngoId={reviewModal.ngoId}
              foodRequestId={reviewModal.foodRequestId}
              onSubmit={handleReviewSubmit}
              onCancel={() => setReviewModal(null)}
            />
          </div>
        </div>
      )}

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

// ── Sub-components ─────────────────────────────────────────────────────────────

function EmptyState({ tab }) {
  const icons = { PENDING: '📋', ACCEPTED: '🚚', COMPLETED: '🎉', REJECTED: '🚫' };
  const messages = {
    PENDING:   { title: 'No Pending Requests', body: "You're all caught up! New NGO requests will appear here in real-time." },
    ACCEPTED:  { title: 'No Active Orders', body: 'Accepted requests waiting for volunteer pickup will appear here.' },
    COMPLETED: { title: 'No Completed Pickups', body: 'Successfully collected food donations will show up here.' },
    REJECTED:  { title: 'No Rejected Requests', body: 'Declined requests will appear here.' },
  };
  const msg = messages[tab?.key] || { title: 'Nothing here', body: '' };
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 py-14 text-center dark:border-slate-600 dark:bg-slate-900/60">
      <div className="mb-4 text-5xl">{icons[tab?.key] || '📦'}</div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">{msg.title}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400">{msg.body}</p>
    </div>
  );
}

function RequestCard({ request, index, updatingRequest, onUpdateStatus, onVerify, onReview, onTrack, onViewReviews, getStatusColor, formatDate }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="rounded-[22px] border border-slate-200 bg-white/95 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/95"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {request.foodListing?.title || 'Food Request'}
            </h3>
            <Badge variant={getStatusColor(request.status)}>{request.status}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600 dark:text-slate-300 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Users className="h-4 w-4 shrink-0" />
              <span className="truncate"><strong>NGO:</strong> {request.ngo?.ngoName || 'Unknown NGO'}</span>
              {request.ngo?.id && (
                <button
                  onClick={() => onViewReviews(request.ngo.id, request.ngo.ngoName)}
                  className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  ⭐ View Reviews
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Package className="h-4 w-4 shrink-0" />
              <span><strong>Qty:</strong> {request.quantity || request.foodListing?.quantity || 0} servings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{formatDate(request.createdAt)}</span>
            </div>
          </div>

          {request.notes && (
            <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-gray-700 dark:bg-slate-900/70 dark:text-slate-200">
              <strong>Note:</strong> {request.notes}
            </div>
          )}

          {request.ngo?.user?.email && (
            <p className="text-sm text-gray-500 dark:text-slate-400">
              <strong>Contact:</strong> {request.ngo.user.email}
              {request.ngo.user.phone && ` · ${request.ngo.user.phone}`}
            </p>
          )}

          {request.status === 'COMPLETED' && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
              <span className="text-xs text-green-800 dark:text-green-300 font-medium">✓ Handed over successfully!</span>
              <Button
                size="sm"
                variant="outline"
                className="text-xs text-green-700 border-green-300 hover:bg-green-100 dark:hover:bg-green-950 shrink-0"
                onClick={() => onReview(request)}
              >
                ⭐ Review NGO
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          {request.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                onClick={() => onUpdateStatus(request.id, 'ACCEPTED')}
                disabled={updatingRequest === request.id}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(request.id, 'REJECTED')}
                disabled={updatingRequest === request.id}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}

          {request.status === 'ACCEPTED' && request.assignedVolunteerId && !request.pickupOtpVerified && (
            <div className="flex gap-2 shrink-0">
              <Button size="sm" onClick={() => onVerify(request)}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Verify Pickup
              </Button>
              {/* Commented out tracking button for safe deployment
              <Button size="sm" variant="outline" onClick={() => onTrack(request)}>
                🛵 Track Volunteer
              </Button>
              */}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}