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
      await verifyPickupOtp(verifyModal.requestId, otpValue.trim());
      toast.success('Pickup verified! Request marked as completed.', { icon: '✅' });
      setVerifyModal(null);
      setOtpValue('');
      fetchPickupRequests();
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
      await verifyPickupQR(verifyModal.requestId, qrToken);
      toast.success('Pickup verified via QR! Request marked as completed.', { icon: '✅' });
      setVerifyModal(null);
      setVerifyMode('otp');
      fetchPickupRequests();
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pickup Requests</h1>
          <p className="text-gray-600 mt-1">Manage pickup requests from NGOs for your food listings</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
            connected ? 'text-green-700 bg-green-50 border-green-200' : 'text-gray-500 bg-gray-100 border-gray-200'
          }`}>
            {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {connected ? 'Live' : 'Offline'}
          </span>
          <Button size="sm" variant="outline" onClick={fetchPickupRequests}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
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
                  ? `bg-white shadow-sm ${tab.color}`
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold min-w-5 text-center ${
                  isActive ? `${tab.bg} ${tab.color} ${tab.border} border` : 'bg-gray-200 text-gray-600'
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
          className="glass-card p-6 rounded-xl"
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Verify Volunteer Pickup</h3>
            <p className="text-sm text-gray-500 mb-4">
              Confirm pickup of <strong>{verifyModal.foodName}</strong>
            </p>

            {/* Mode toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
              <button
                type="button"
                onClick={() => setVerifyMode('otp')}
                className={`flex-1 text-sm py-1.5 rounded-lg font-medium transition-colors ${
                  verifyMode === 'otp' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🔢 Enter OTP
              </button>
              <button
                type="button"
                onClick={() => setVerifyMode('qr')}
                className={`flex-1 text-sm py-1.5 rounded-lg font-medium transition-colors ${
                  verifyMode === 'qr' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
                    className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
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
                    <p className="text-sm text-gray-500">Verifying…</p>
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
    <div className="text-center py-14">
      <div className="text-5xl mb-4">{icons[tab?.key] || '📦'}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{msg.title}</h3>
      <p className="text-gray-500 text-sm">{msg.body}</p>
    </div>
  );
}

function RequestCard({ request, index, updatingRequest, onUpdateStatus, onVerify, getStatusColor, formatDate }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className="font-semibold text-gray-900 truncate">
              {request.foodListing?.title || 'Food Request'}
            </h3>
            <Badge variant={getStatusColor(request.status)}>{request.status}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 shrink-0" />
              <span className="truncate"><strong>NGO:</strong> {request.ngo?.ngoName || 'Unknown NGO'}</span>
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
            <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
              <strong>Note:</strong> {request.notes}
            </div>
          )}

          {request.ngo?.user?.email && (
            <p className="text-sm text-gray-500">
              <strong>Contact:</strong> {request.ngo.user.email}
              {request.ngo.user.phone && ` · ${request.ngo.user.phone}`}
            </p>
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
            <Button size="sm" onClick={() => onVerify(request)}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Verify Pickup
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}