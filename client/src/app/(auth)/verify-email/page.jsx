'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import BackButton from '@/components/common/BackButton';
import { verifyEmailCode, resendVerification } from '@/services/auth.service';
import '@/styles/auth.css';

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const email = searchParams?.get('email') || sessionStorage.getItem('registrationEmail') || '';
  const userId = searchParams?.get('userId') || '';

  useEffect(() => {
    // If no email in URL params, try to get from session storage
    if (!searchParams?.get('email')) {
      const registrationEmail = sessionStorage.getItem('registrationEmail');
      if (!registrationEmail) {
        // No email found, redirect back to registration
        router.push('/register');
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await verifyEmailCode({ 
        userId, 
        email, 
        code: verificationCode.trim() 
      });
      
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      await resendVerification({ email, userId });
      setSuccess('Verification code sent! Please check your email.');
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <BackButton href="/register" label="Back to Registration" />
      
      <motion.div 
        className="auth-card max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="auth-header text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          
          <h1 className="auth-title">Verify Your Email</h1>
          <p className="auth-subtitle">
            We've sent a verification code to<br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </motion.div>

        {error && (
          <motion.div 
            className="flex items-center bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm border border-green-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {success}
          </motion.div>
        )}

        <motion.form 
          onSubmit={handleSubmit} 
          className="auth-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="space-y-4">
            <Input
              label="Verification Code"
              type="text"
              name="verificationCode"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value);
                setError('');
              }}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="text-center text-lg tracking-widest"
              required
            />
          </div>

          <Button type="submit" fullWidth loading={loading} className="group">
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Verify Email
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </motion.form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 mb-3">
            Didn't receive the code?
          </p>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={!canResend}
            loading={resendLoading}
            className="w-full"
          >
            {resendLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            {canResend 
              ? 'Resend Code' 
              : `Resend in ${countdown}s`
            }
          </Button>
        </div>

        <div className="text-center mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Having trouble? Check your spam folder or{' '}
            <button 
              type="button"
              onClick={() => router.push('/contact')}
              className="text-primary-600 hover:text-primary-700 underline"
            >
              contact support
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}