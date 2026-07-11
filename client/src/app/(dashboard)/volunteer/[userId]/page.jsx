'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Shield, Phone, Key, Building2, CheckCircle, AlertCircle, Eye, EyeOff, Truck, QrCode, TrendingUp, Star, Award, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  getMyVolunteerProfile,
  changeVolunteerPassword,
  requestPhoneOTP,
  verifyPhoneOTP,
} from '@/services/volunteer.service';
import { getMyVolunteerPickups } from '@/services/request.service';
import { formatDate } from '@/utils/formatDate';
// import { useLiveTracking } from '@/hooks/useLiveTracking';

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, color = 'green' }) {
  const colors = {
    green: 'bg-green-100 dark:bg-emerald-900/30 text-green-600 dark:text-emerald-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Change Password Section ───────────────────────────────────────────────────
function ChangePasswordSection({ onPasswordChanged }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.next.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (form.next !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await changeVolunteerPassword(form.current, form.next);
      toast.success('Password changed successfully!');
      onPasswordChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'current', label: 'Current (Temporary) Password', placeholder: 'Enter the password the NGO sent you' },
    { id: 'next', label: 'New Password', placeholder: 'Min 8 characters' },
    { id: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(({ id, label, placeholder }) => (
        <div key={id}>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{label}</label>
          <div className="relative">
            <input
              type={show[id] ? 'text' : 'password'}
              value={form[id]}
              onChange={(e) => { setForm((f) => ({ ...f, [id]: e.target.value })); setError(''); }}
              placeholder={placeholder}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
            <button type="button" onClick={() => toggle(id)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-300">
              {show[id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ))}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 text-sm font-semibold text-white bg-yellow-500 hover:bg-yellow-600 rounded-xl transition-colors disabled:opacity-60"
      >
        {loading ? 'Saving...' : 'Change Password'}
      </button>
    </form>
  );
}

// ── Phone Verification Section ────────────────────────────────────────────────
function PhoneVerificationSection({ volunteerPhone, onPhoneVerified }) {
  const [phone, setPhone] = useState(volunteerPhone || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!phone.trim()) { setError('Enter your phone number'); return; }
    setLoading(true);
    setError('');
    try {
      await requestPhoneOTP(phone.trim());
      toast.success('OTP sent! Check your phone or email.');
      setStep('otp');
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { setError('Enter the OTP'); return; }
    setLoading(true);
    setError('');
    try {
      await verifyPhoneOTP(otp.trim());
      toast.success('Phone verified successfully! 🎉');
      onPhoneVerified?.();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(''); }}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Sending OTP...' : 'Send Verification Code'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            OTP will be sent via SMS if configured, otherwise via email.
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-slate-300">Enter the 6-digit code sent to <strong>{phone}</strong>:</p>
          <input
            type="text"
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
            placeholder="000000"
            maxLength={6}
            className="w-full px-3 py-2.5 text-2xl font-bold text-center tracking-widest border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
          <button type="submit" disabled={loading || otp.length < 6} className="w-full py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
              className="hover:text-gray-600 dark:text-slate-300"
            >
              Change number
            </button>
            {countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={loading}
                className="text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

// ── Performance Section ──────────────────────────────────────────────────────
function PerformanceSection({ pickups }) {
  const total = pickups.length;
  const completed = pickups.filter((p) => p.status === 'COMPLETED' || p.pickupOtpVerified).length;
  const active = pickups.filter((p) => p.status === 'ACCEPTED' && !p.pickupOtpVerified).length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: 'Total Assigned', value: total, icon: Truck, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-green-600 dark:text-emerald-400', bg: 'bg-green-50 dark:bg-emerald-900/20' },
    { label: 'In Progress', value: active, icon: Star, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Success Rate', value: `${rate}%`, icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ];

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-3 ${bg}`}>
            <div className={`h-9 w-9 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm shrink-0`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1.5">
            <span>Completion progress</span>
            <span className="font-medium text-gray-700 dark:text-slate-200">{completed} / {total} pickups</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-6">
          <BarChart3 className="h-8 w-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No pickups yet — stats will appear here once you're assigned one.</p>
        </div>
      )}

      {/* Badge */}
      {rate === 100 && total >= 5 && (
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3">
          <Award className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">Perfect record! 🎉 {total} pickups, 100% completion.</p>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function VolunteerDashboard() {
  const { userId } = useParams();
  const { user, updateUser } = useAuth();
  const { socket } = useSocket();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickups, setPickups] = useState([]);
  const [pickupsLoading, setPickupsLoading] = useState(false);
  const [activeTrackingId, setActiveTrackingId] = useState(null);

  /* Commented out tracking hook for safe deployment
  useLiveTracking({
    requestId: activeTrackingId,
    isVolunteer: true,
    enabled: !!activeTrackingId
  });
  */

  useEffect(() => {
    getMyVolunteerProfile()
      .then((res) => {
        setProfile(res.data);
        // Fetch pickups if profile is active
        if (res.data?.status === 'ACTIVE') {
          setPickupsLoading(true);
          getMyVolunteerPickups()
            .then((r) => setPickups(r?.data || []))
            .catch(() => setPickups([]))
            .finally(() => setPickupsLoading(false));
        }
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  // ── Real-time socket listeners ──────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // New pickup assigned to this volunteer
    const onVolunteerAssigned = (payload) => {
      const incoming = payload.data;
      if (!incoming) return;
      setPickups((prev) => {
        if (prev.some((p) => p.id === incoming.id)) return prev; // dedup
        return [incoming, ...prev];
      });
      toast.success(payload.message || 'You have a new pickup assignment!', { icon: '🚚' });
    };

    // Pickup status changed (e.g. donor verified → COMPLETED)
    const onRequestStatusChanged = (payload) => {
      const { requestId, status } = payload.data || {};
      if (!requestId) return;
      setPickups((prev) =>
        prev.map((p) =>
          p.id === requestId ? { ...p, status, pickupOtpVerified: status === 'COMPLETED' || p.pickupOtpVerified } : p
        )
      );
      if (status === 'COMPLETED') {
        toast.success('Your pickup was confirmed as completed! 🎉', { icon: '✅' });
      }
    };

    socket.on('volunteer:assigned', onVolunteerAssigned);
    socket.on('request:status_changed', onRequestStatusChanged);
    return () => {
      socket.off('volunteer:assigned', onVolunteerAssigned);
      socket.off('request:status_changed', onRequestStatusChanged);
    };
  }, [socket]);

  const mustChangePassword = profile?.mustChangePassword ?? false;
  const phoneVerified = profile?.phoneVerified ?? false;

  const handlePasswordChanged = () => {
    setProfile((p) => p ? { ...p, mustChangePassword: false } : p);
  };

  const handlePhoneVerified = () => {
    setProfile((p) => p ? { ...p, phoneVerified: true, status: 'ACTIVE' } : p);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[28px] border border-emerald-100 bg-linear-to-br from-emerald-700 via-green-600 to-teal-500 p-5 text-white shadow-xl sm:p-7 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Welcome, {user?.name}!</h1>
              <p className="mt-1 text-sm text-emerald-50/90">
                You are volunteering with <strong>{profile?.ngo?.ngoName || 'your NGO'}</strong>
              </p>
            </div>
          </div>
          {!mustChangePassword && phoneVerified && (
            <Link
              href={`/volunteer/${userId}/settings`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/25"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          )}
        </div>

        {(mustChangePassword || !phoneVerified) && (
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
              <AlertCircle className="h-4 w-4 text-amber-200" />
              <span className="text-amber-100">Phone Not Verified</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
              <Shield className="h-4 w-4 text-emerald-100" />
              <span className="text-emerald-50 capitalize">{profile?.status || 'Pending'}</span>
            </div>
          </div>
        )}
      </section>

      {/* Step indicators */}
      {(mustChangePassword || !phoneVerified) && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2">⚠️ Complete your account setup:</p>
          <ol className="space-y-1 text-sm text-amber-700 dark:text-amber-300 list-decimal list-inside">
            {mustChangePassword && <li>Change your temporary password</li>}
            {!phoneVerified && <li>Verify your phone number</li>}
          </ol>
        </div>
      )}

      {/* Step 1: Change Password */}
      {mustChangePassword && (
        <Card>
          <SectionHeader icon={Key} title="Change Your Password" subtitle="Required – your account uses a temporary password" color="yellow" />
          <ChangePasswordSection onPasswordChanged={handlePasswordChanged} />
        </Card>
      )}

      {/* Step 2: Phone Verification */}
      {!mustChangePassword && !phoneVerified && (
        <Card>
          <SectionHeader icon={Phone} title="Verify Your Phone" subtitle="Required – enter your phone number to receive an OTP" color="purple" />
          <PhoneVerificationSection volunteerPhone={profile?.phone} onPhoneVerified={handlePhoneVerified} />
        </Card>
      )}

      {/* Fully Set Up — no card, just show stats directly */}

      {/* NGO Info */}
      {profile?.ngo && (
        <Card>
          <SectionHeader icon={Building2} title="Your NGO" subtitle="Organisation you are volunteering with" color="green" />
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2"><dt className="font-medium text-gray-600 dark:text-slate-300 w-24">Name</dt><dd className="text-gray-900 dark:text-white">{profile.ngo.ngoName}</dd></div>
            <div className="flex gap-2"><dt className="font-medium text-gray-600 dark:text-slate-300 w-24">Address</dt><dd className="text-gray-900 dark:text-white">{profile.ngo.address}</dd></div>
          </dl>
        </Card>
      )}

      {/* Performance Section — shown once active */}
      {profile?.status === 'ACTIVE' && (
        <Card>
          <SectionHeader icon={TrendingUp} title="My Performance" subtitle="Your pickup stats and completion rate" color="green" />
          <PerformanceSection pickups={pickups} />
        </Card>
      )}

      {/* My Pickup Assignments */}
      {profile?.status === 'ACTIVE' && (
        <Card>
          <SectionHeader icon={Truck} title="My Pickup Assignments" subtitle="Pickups assigned to you by your NGO" color="green" />
          {pickupsLoading ? (
            <p className="text-sm text-gray-400 text-center py-6">Loading assignments…</p>
          ) : pickups.length === 0 ? (
            <div className="text-center py-8">
              <QrCode className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No pickup assignments yet.</p>
              <p className="text-xs text-gray-400 mt-1">When your NGO assigns you a pickup, it'll appear here with your QR code &amp; OTP.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pickups.map((req) => {
                const isComplete = req.status === 'COMPLETED' || req.pickupOtpVerified;
                const foodName = req.foodListing?.foodName || req.foodListing?.title || 'Food pickup';
                const donorName = req.foodListing?.restaurant?.shopName || req.foodListing?.restaurant?.user?.firstName || 'Donor';
                const donorAddress = req.foodListing?.restaurant?.address || '';
                return (
                  <div
                    key={req.id}
                    className={`rounded-xl border p-4 ${isComplete ? 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700' : 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/50'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{foodName}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          🏪 {donorName}{donorAddress ? ` — ${donorAddress}` : ''}
                        </p>
                        {req.pickupTime && (
                          <p className="text-xs text-gray-500 dark:text-slate-400">🕐 {formatDate(req.pickupTime)}</p>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isComplete ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                      }`}>
                        {isComplete ? 'Completed' : 'Assigned'}
                      </span>
                    </div>

                    {!isComplete && (
                      <div className="mt-3 bg-white dark:bg-slate-800 rounded-lg border border-teal-200 dark:border-teal-800/50 p-3">
                        <p className="text-xs font-semibold text-gray-700 dark:text-slate-200 mb-2">Your Verification Details</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                          Show this OTP or QR code to the donor at time of pickup:
                        </p>
                        <p className="text-2xl font-bold tracking-widest text-teal-700 text-center py-2">
                          {req.pickupOtp || '------'}
                        </p>
                        <p className="text-xs text-gray-400 text-center">
                          Also check your email for the full QR code image.
                        </p>
                        
                        {/* Commented out tracking button for safe deployment
                        <button
                          onClick={() => setActiveTrackingId(activeTrackingId === req.id ? null : req.id)}
                          className={`w-full text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                            activeTrackingId === req.id
                              ? 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-200'
                              : 'bg-teal-600 hover:bg-teal-700 text-white'
                          }`}
                        >
                          {activeTrackingId === req.id ? '🛑 Stop Sharing Location' : '📡 Start Sharing Location (In Transit)'}
                        </button>
                        */}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
