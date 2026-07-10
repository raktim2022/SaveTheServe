'use client';

import { useState } from 'react';
import { Mail, Phone, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '@/components/common/Button';
import { resendEmailVerification } from '@/services/settings.service';

function StatusBadge({ verified, label }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
        <CheckCircle className="h-3 w-3" />
        {label || 'Verified'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
      <AlertCircle className="h-3 w-3" />
      Unverified
    </span>
  );
}

function Card({ iconBg, icon: Icon, iconColor, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

export default function VerificationSection({ user }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setSending(true);
    setError('');
    setSent(false);
    try {
      await resendEmailVerification(user.email);
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to resend verification email. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-5 max-w-lg">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        Account Verification Status
      </p>

      {/* Email card */}
      <Card icon={Mail} iconBg="bg-blue-50" iconColor="text-blue-600">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Email Address</p>
          <StatusBadge verified={user.isVerified} />
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-3 break-all">{user.email}</p>

        {user.isVerified ? (
          <p className="text-xs text-gray-400">
            Your email is verified. You have full access to all features.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg leading-relaxed">
              Verify your email to receive donation alerts and important account notifications.
            </p>

            {sent ? (
              <p className="text-xs text-green-700 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                Verification email sent! Check your inbox (and spam folder).
              </p>
            ) : (
              <Button
                variant="outline"
                size="sm"
                loading={sending}
                onClick={handleResend}
              >
                {!sending && (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        )}
      </Card>

      {/* Phone card */}
      <Card icon={Phone} iconBg="bg-purple-50" iconColor="text-purple-600">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Phone Number</p>
          {user.phone ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
              <CheckCircle className="h-3 w-3" />
              Registered
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 px-2.5 py-1 rounded-full">
              Not added
            </span>
          )}
        </div>
        {user.phone ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">{user.phone}</p>
        ) : (
          <p className="text-xs text-gray-400 leading-relaxed">
            Add your phone number in the <strong className="text-gray-600 dark:text-slate-300">Profile</strong> tab.
            It helps donors and NGOs coordinate pickups efficiently.
          </p>
        )}
      </Card>

      {/* Account created */}
      <div className="bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-xs text-gray-400">
        Member since{' '}
        <span className="font-medium text-gray-600 dark:text-slate-300">
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : '—'}
        </span>
      </div>
    </div>
  );
}
