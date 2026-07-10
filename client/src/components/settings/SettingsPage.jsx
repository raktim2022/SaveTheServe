'use client';

import { useState, useEffect } from 'react';
import { User, ShieldCheck, BadgeCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getProfile } from '@/services/auth.service';
import { requestProfileOtp, updateProfileWithOtp } from '@/services/settings.service';
import ProfileSection from './ProfileSection';
import SecuritySection from './SecuritySection';
import VerificationSection from './VerificationSection';
import OtpModal from './OtpModal';
import Loader from '@/components/common/Loader';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'verification', label: 'Verification', icon: BadgeCheck },
];

export default function SettingsPage({ role }) {
  const { updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  // OTP flow state
  const [otpOpen, setOtpOpen] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [pendingData, setPendingData] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Profile save state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  // Step 1 — user submits profile form → trigger OTP email
  const handleSaveProfile = async (formData) => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await requestProfileOtp();
      setMaskedEmail(res.maskedEmail || '');
      setPendingData(formData);
      setOtpError('');
      setOtpOpen(true);
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
          err.message ||
          'Could not send verification code. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Step 2 — user enters OTP → apply changes
  const handleOtpVerify = async (otp) => {
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await updateProfileWithOtp(pendingData, otp);

      // Update AuthContext with base user fields (strip embedded relations)
      if (res.data) {
        const { ngo, restaurant, admin, roleProfile, ...baseUser } = res.data;
        updateUser(baseUser);
      }

      setOtpOpen(false);
      setPendingData(null);
      setSaveSuccess(true);
      await fetchProfile();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setOtpError(
        err.response?.data?.message ||
          err.message ||
          'Invalid verification code. Please try again.'
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await requestProfileOtp();
      setMaskedEmail(res.maskedEmail || maskedEmail);
    } catch (err) {
      setOtpError('Failed to resend code. Please try again.');
    }
  };

  const roleData = profile?.roleProfile || null;

  if (fetchLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <Loader text="Loading settings…" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage your profile, security, and account verification.
        </p>
      </div>

      {/* Profile-save error banner */}
      {saveError && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
          <span className="shrink-0 mt-0.5">⚠</span>
          <span>{saveError}</span>
        </div>
      )}

      {/* Success toast */}
      {saveSuccess && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl mb-5">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Profile updated successfully!
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Tab sidebar */}
        <nav className="lg:w-44 shrink-0">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-1.5 flex lg:flex-col gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left
                    ${
                      active
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-900 hover:text-gray-900 dark:text-white'
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline lg:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content panel */}
        <div className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 min-w-0">
          {activeTab === 'profile' && (
            <ProfileSection
              user={profile}
              roleProfile={roleData}
              role={role}
              onSave={handleSaveProfile}
              saving={saving}
            />
          )}
          {activeTab === 'security' && <SecuritySection />}
          {activeTab === 'verification' && <VerificationSection user={profile} />}
        </div>
      </div>

      {/* OTP modal */}
      <OtpModal
        isOpen={otpOpen}
        maskedEmail={maskedEmail}
        onVerify={handleOtpVerify}
        onClose={() => { setOtpOpen(false); setOtpError(''); }}
        onResend={handleResendOtp}
        loading={otpLoading}
        error={otpError}
      />
    </div>
  );
}
