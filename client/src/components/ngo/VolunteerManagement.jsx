'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Clock, CheckCircle, XCircle, Eye, EyeOff, KeyRound, AlertCircle, RefreshCw, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { getVolunteersForMyNGO, verifyVolunteer, rejectVolunteer } from '@/services/volunteer.service';

const STATUS_BADGE = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  VERIFIED: 'bg-blue-100 text-blue-800 border-blue-200',
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_ICON = {
  PENDING: <Clock className="h-3 w-3" />,
  VERIFIED: <CheckCircle className="h-3 w-3" />,
  ACTIVE: <CheckCircle className="h-3 w-3" />,
  REJECTED: <XCircle className="h-3 w-3" />,
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_BADGE[status] || STATUS_BADGE.PENDING}`}>
      {STATUS_ICON[status]}
      {status}
    </span>
  );
}

function VerifyModal({ volunteer, onClose, onVerified }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await verifyVolunteer(volunteer.id, password);
      toast.success(`${volunteer.name} verified! Credentials sent via email.`);
      onVerified(volunteer.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Verify Volunteer</h3>
        <p className="text-sm text-gray-500 mb-5">
          Set a temporary password for <strong>{volunteer.name}</strong>. They will receive it via email and must change it on first login.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Volunteer Email</label>
            <input value={volunteer.email} readOnly className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temporary Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Min 8 characters"
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                placeholder="Repeat password"
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-2.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Sending...' : 'Verify & Send Credentials'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VolunteerManagement() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [verifyModal, setVerifyModal] = useState(null); // volunteer object
  const [rejectingId, setRejectingId] = useState(null);

  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getVolunteersForMyNGO();
      setVolunteers(res.data || []);
    } catch {
      toast.error('Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVolunteers(); }, [fetchVolunteers]);

  const handleReject = async (volunteerId) => {
    if (!confirm('Reject this volunteer application?')) return;
    setRejectingId(volunteerId);
    try {
      await rejectVolunteer(volunteerId);
      setVolunteers((prev) => prev.map((v) => v.id === volunteerId ? { ...v, status: 'REJECTED' } : v));
      toast.success('Application rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setRejectingId(null);
    }
  };

  const handleVerified = (volunteerId) => {
    setVolunteers((prev) => prev.map((v) => v.id === volunteerId ? { ...v, status: 'VERIFIED' } : v));
  };

  const filtered = filter === 'ALL' ? volunteers : volunteers.filter((v) => v.status === filter);

  const counts = {
    ALL: volunteers.length,
    PENDING: volunteers.filter((v) => v.status === 'PENDING').length,
    VERIFIED: volunteers.filter((v) => v.status === 'VERIFIED').length,
    ACTIVE: volunteers.filter((v) => v.status === 'ACTIVE').length,
    REJECTED: volunteers.filter((v) => v.status === 'REJECTED').length,
  };

  const tabs = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'VERIFIED', label: 'Verified' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Volunteer Applications</h2>
            <p className="text-xs text-gray-500">Review and manage volunteer sign-ups</p>
          </div>
        </div>
        <button
          onClick={fetchVolunteers}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {counts.PENDING > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            <strong>{counts.PENDING}</strong> volunteer application{counts.PENDING > 1 ? 's' : ''} awaiting your review.
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${filter === tab.key ? 'bg-gray-100' : 'bg-gray-200'}`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-7 w-7 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14">
          <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {filter === 'ALL' ? 'No volunteers yet' : `No ${filter.toLowerCase()} volunteers`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((vol) => (
            <div key={vol.id} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-gray-200 transition-colors">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{vol.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">{vol.name}</p>
                    <StatusBadge status={vol.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail className="h-3 w-3" />{vol.email}
                    </span>
                    {vol.phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="h-3 w-3" />{vol.phone}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Applied {new Date(vol.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {vol.status === 'PENDING' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setVerifyModal(vol)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Verify
                  </button>
                  <button
                    onClick={() => handleReject(vol.id)}
                    disabled={rejectingId === vol.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-60"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {rejectingId === vol.id ? '...' : 'Reject'}
                  </button>
                </div>
              )}

              {vol.status === 'VERIFIED' && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Credentials sent</span>
                </div>
              )}

              {vol.status === 'ACTIVE' && (
                <div className="flex items-center gap-1.5 text-xs text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Active volunteer</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Verify Modal */}
      {verifyModal && (
        <VerifyModal
          volunteer={verifyModal}
          onClose={() => setVerifyModal(null)}
          onVerified={handleVerified}
        />
      )}
    </div>
  );
}
