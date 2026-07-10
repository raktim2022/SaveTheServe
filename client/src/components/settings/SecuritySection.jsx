'use client';

import { useState } from 'react';
import { Eye, EyeOff, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import { changePassword } from '@/services/auth.service';

const FC =
  'w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400';

function PasswordField({ label, name, value, onChange, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-slate-200">
        <KeyRound className="h-3.5 w-3.5 text-gray-400" />
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          required
          className={`${FC} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-300 transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export default function SecuritySection() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmPassword,
      });
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          err.message ||
          'Failed to change password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Change Password
        </p>
        <div className="space-y-4">
          <PasswordField
            label="Current Password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
          />
          <PasswordField
            label="New Password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            hint="Min 8 chars with uppercase, lowercase, number &amp; special character"
          />
          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Password changed successfully.
        </div>
      )}

      <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
        <Button type="submit" loading={loading}>
          {!loading && 'Change Password →'}
        </Button>
      </div>
    </form>
  );
}
