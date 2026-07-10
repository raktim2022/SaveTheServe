'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ThemeSwitcher from '@/components/common/ThemeSwitcher';
import { forgotPassword } from '@/services/auth.service';
import '@/styles/auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-container relative">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeSwitcher />
      </div>
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="auth-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4">
            <Mail className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">
            No worries! Enter your email and we'll send you a reset link
          </p>
        </motion.div>

        {error && (
          <motion.div 
            className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            className="bg-green-50 text-green-600 p-4 rounded-lg mb-4 text-sm border border-green-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Reset link sent!</p>
                <p className="text-green-700">Check your email for password reset instructions.</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.form 
          onSubmit={handleSubmit} 
          className="auth-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />

          <Button type="submit" fullWidth loading={loading} disabled={success}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : success ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Email Sent
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </motion.form>

        <div className="flex items-center justify-center mt-6">
          <Link 
            href="/login" 
            className="flex items-center text-sm text-gray-600 dark:text-slate-300 hover:text-primary-600 transition-colors dark:text-slate-400 dark:hover:text-emerald-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

