'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getMyVolunteerProfile } from '@/services/volunteer.service';

export default function VolunteerPendingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const checkStatus = useCallback(async () => {
    if (!user) return;
    setChecking(true);
    try {
      const res = await getMyVolunteerProfile();
      const profile = res?.data;
      // If phone is now verified, redirect to dashboard
      if (profile?.phoneVerified === true || profile?.status === 'ACTIVE') {
        router.push(`/volunteer/${user.id}`);
        return;
      }
    } catch {
      // ignore errors silently
    } finally {
      setChecking(false);
      setLastChecked(new Date());
    }
  }, [user, router]);

  // Poll every 30 seconds
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Application Under Review
        </h1>

        <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-8">
          Your volunteer application has been submitted successfully.
          The selected NGO has been notified and will review your application.
        </p>

        {/* Status Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-left dark:bg-amber-900/20 dark:border-amber-800/50">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-300">
                NGO Notification Sent
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                The NGO has received your application in their dashboard
                and via email.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-left">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700 dark:text-slate-200">
              Application submitted
            </span>
          </div>

          <div className="flex items-center gap-3 text-left">
            <Clock className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-gray-700 dark:text-slate-200">
              Waiting for NGO approval &amp; phone verification
            </span>
          </div>

          <div className="flex items-center gap-3 text-left opacity-50">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm">
              Volunteer dashboard access
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 dark:bg-blue-900/20 dark:border-blue-800/50">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Once approved, you will receive an email notification and
            gain access to your volunteer dashboard. This page checks
            automatically every 30 seconds.
          </p>
          {lastChecked && (
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={checkStatus}
            disabled={checking}
            className="w-full rounded-xl bg-green-600 py-3 text-white font-medium hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking...' : 'Check Status Now'}
          </button>

          <Link
            href="/login"
            className="w-full rounded-xl border border-gray-300 dark:border-slate-600 py-3 text-gray-700 dark:text-slate-200 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}