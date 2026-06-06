'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, KeyRound, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import { completeVolunteerInvite } from '@/services/volunteer.service';
import '@/styles/auth.css';

export default function VolunteerInvitePage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') || '');
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('This invite link is missing a token. Please use the latest email from your NGO.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await completeVolunteerInvite({ token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 1600);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invite setup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
            {success ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <KeyRound className="h-8 w-8 text-green-600" />
            )}
          </div>
          <h1 className="auth-title">Set Up Volunteer Account</h1>
          <p className="auth-subtitle">Create your password to activate your SaveTheServe login.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200 flex gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 text-sm border border-green-200">
            Your account is ready. Redirecting you to sign in...
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="auth-input"
              placeholder="Minimum 8 characters"
              disabled={success}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="auth-input"
              placeholder="Repeat password"
              disabled={success}
              required
            />
          </div>

          <Button type="submit" fullWidth loading={loading} disabled={loading || success}>
            {success ? 'Account Ready' : 'Set Password'}
          </Button>
        </form>

        <div className="flex items-center justify-center mt-6">
          <Link href="/login" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
