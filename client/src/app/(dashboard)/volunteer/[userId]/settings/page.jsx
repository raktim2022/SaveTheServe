'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Key, Phone, Building2, AlertCircle, Eye, EyeOff,
  CheckCircle, ShieldCheck, User,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import {
  getMyVolunteerProfile,
  changeVolunteerPassword,
  requestPhoneOTP,
  verifyPhoneOTP,
} from '@/services/volunteer.service';

// ── Shared helpers ─────────────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

const TABS = [
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'phone',    label: 'Phone',    icon: Phone },
  { id: 'ngo',      label: 'NGO Info', icon: Building2 },
];

// ── Change Password Tab ────────────────────────────────────────────────────────
function ChangePasswordTab() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (f) => setShow((s) => ({ ...s, [f]: !s[f] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.next.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (form.next !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await changeVolunteerPassword(form.current, form.next);
      toast.success('Password changed successfully!');
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'current', label: 'Current Password',      placeholder: 'Enter your current password' },
    { id: 'next',    label: 'New Password',           placeholder: 'Min 8 characters' },
    { id: 'confirm', label: 'Confirm New Password',   placeholder: 'Repeat new password' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Change Password</h3>
        <p className="text-sm text-gray-500">Update your account password at any time.</p>
      </div>

      {fields.map(({ id, label, placeholder }) => (
        <div key={id}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <div className="relative">
            <input
              type={show[id] ? 'text' : 'password'}
              value={form[id]}
              onChange={(e) => { setForm((f) => ({ ...f, [id]: e.target.value })); setError(''); }}
              placeholder={placeholder}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => toggle(id)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {show[id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ))}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-2.5 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 text-sm font-semibold text-white bg-yellow-500 hover:bg-yellow-600 rounded-xl transition-colors disabled:opacity-60"
      >
        {loading ? 'Saving…' : 'Change Password'}
      </button>
    </form>
  );
}

// ── Phone Re-Verification Tab ─────────────────────────────────────────────────
function PhoneTab({ profile, onPhoneVerified }) {
  const [phone, setPhone] = useState(profile?.phone || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
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
    e?.preventDefault();
    if (!phone.trim()) { setError('Enter your phone number'); return; }
    setLoading(true); setError('');
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
    setLoading(true); setError('');
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

  if (profile?.phoneVerified && step === 'phone') {
    return (
      <div className="max-w-md space-y-5">
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Phone Number</h3>
          <p className="text-sm text-gray-500">Your phone is currently verified.</p>
        </div>
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">{profile.phone || 'Phone verified'}</p>
            <p className="text-xs text-green-600">Verified ✓</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setStep('phone-edit')}
          className="text-sm text-purple-600 hover:text-purple-800 font-medium"
        >
          Change phone number
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-5">
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Phone Verification</h3>
        <p className="text-sm text-gray-500">
          {profile?.phoneVerified ? 'Update your verified phone number.' : 'Verify your phone to activate your volunteer account.'}
        </p>
      </div>

      {(step === 'phone' || step === 'phone-edit') && (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(''); }}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? 'Sending OTP…' : 'Send Verification Code'}
          </button>
          <p className="text-xs text-gray-400 text-center">OTP sent via SMS if configured, otherwise via email.</p>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <p className="text-sm text-gray-600">Enter the 6-digit code sent to <strong>{phone}</strong>:</p>
          <input
            type="text"
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
            placeholder="000000"
            maxLength={6}
            autoFocus
            className="w-full px-3 py-2.5 text-2xl font-bold text-center tracking-widest border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError(''); }} className="hover:text-gray-600">
              Change number
            </button>
            {countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <button type="button" onClick={handleRequestOTP} disabled={loading} className="text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50">
                Resend OTP
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

// ── NGO Info Tab ───────────────────────────────────────────────────────────────
function NGOInfoTab({ profile }) {
  if (!profile?.ngo) {
    return <p className="text-sm text-gray-400">No NGO information available.</p>;
  }

  const { ngo } = profile;
  const rows = [
    { label: 'Organisation',  value: ngo.ngoName },
    { label: 'Address',       value: ngo.address },
    { label: 'Contact Email', value: ngo.user?.email    || ngo.email },
    { label: 'Contact Phone', value: ngo.user?.phone    || ngo.phone },
    { label: 'Your Status',   value: profile.status },
    { label: 'Phone Verified', value: profile.phoneVerified ? '✓ Verified' : '✗ Not verified' },
    { label: 'Joined',        value: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—' },
  ];

  return (
    <div className="max-w-md space-y-5">
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">NGO Information</h3>
        <p className="text-sm text-gray-500">Details about the organisation you volunteer with.</p>
      </div>
      <dl className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
        {rows.filter((r) => r.value).map(({ label, value }) => (
          <div key={label} className="flex gap-4 px-4 py-3 bg-white">
            <dt className="text-sm font-medium text-gray-500 w-36 shrink-0">{label}</dt>
            <dd className="text-sm text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function VolunteerSettingsPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('security');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userId && (user.id.toString() !== userId.toString() || user.role !== 'VOLUNTEER')) {
      router.push('/login');
      return;
    }
    getMyVolunteerProfile()
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, userId]);

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
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your volunteer account</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <Card>
        {activeTab === 'security' && <ChangePasswordTab />}
        {activeTab === 'phone'    && <PhoneTab profile={profile} onPhoneVerified={handlePhoneVerified} />}
        {activeTab === 'ngo'      && <NGOInfoTab profile={profile} />}
      </Card>
    </div>
  );
}
