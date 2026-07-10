'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Loader2, Chrome } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import BackButton from '@/components/common/BackButton';
import ThemeSwitcher from '@/components/common/ThemeSwitcher';
import { login as loginService, loginWithGoogle } from '@/services/auth.service';
import '@/styles/auth.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginService(formData);
      const { data } = response;
      await login(data.token || data.accessToken, data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const result = await loginWithGoogle();
      await login(
        result.tokens.accessToken,
        result.user,
        result.needsRoleSetup
      );
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page min-h-screen bg-linear-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-tr from-amber-400/20 to-green-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeSwitcher />
      </div>

      <BackButton
        href="/"
        label="Back to Home"
        showHomeButton={false}
        className="absolute top-6 left-6 z-10"
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Card */}
        <motion.div
          className="auth-card bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="auth-title mb-2">Welcome Back</h1>
            <p className="auth-subtitle text-sm">Sign in to your SaveTheServe account</p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-r-lg mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-400 rounded-full mr-3 shrink-0"></div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </motion.div>
          )}

          {/* Google Sign-In Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              loading={googleLoading}
              variant="secondary"
              className="w-full mb-4 flex items-center justify-center gap-2 border-2 border-gray-300 dark:border-slate-600 hover:border-gray-400"
            >
              <Chrome className="h-5 w-5" />
              Sign in with Google
            </Button>
          </motion.div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/80 dark:bg-slate-900/80 text-gray-500 dark:text-slate-400">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              disabled={loading}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 dark:bg-slate-800 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-200"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 font-medium dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 dark:text-slate-300 mt-6 dark:text-slate-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold dark:text-emerald-400 dark:hover:text-emerald-300">
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

