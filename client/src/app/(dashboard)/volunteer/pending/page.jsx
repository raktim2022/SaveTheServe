'use client';

import Link from 'next/link';
import { Clock, Mail, CheckCircle2 } from 'lucide-react';

export default function VolunteerPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-10 w-10 text-amber-600" />
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
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-left">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">
                NGO Notification Sent
              </h3>
              <p className="text-sm text-amber-700 mt-1">
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
              Waiting for NGO approval
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
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            Once approved, you will receive an email notification and
            gain access to your volunteer dashboard.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full rounded-xl bg-green-600 py-3 text-white font-medium hover:bg-green-700 transition"
          >
            Back to Login
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-xl border border-gray-300 dark:border-slate-600 py-3 text-gray-700 dark:text-slate-200 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}