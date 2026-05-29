'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, RefreshCw } from 'lucide-react';
import Button from '@/components/common/Button';

const EXPIRY_SECONDS = 600; // 10 minutes
const RESEND_COOLDOWN = 60;  // 1 minute before resend is enabled

export default function OtpModal({ isOpen, maskedEmail, onVerify, onClose, onResend, loading, error }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef([]);

  // Reset state each time modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setTimeLeft(EXPIRY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
      setResendCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...digits];
    text.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(text.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = () => {
    const code = digits.join('');
    if (code.length === 6) onVerify(code);
  };

  const handleResend = async () => {
    await onResend();
    setTimeLeft(EXPIRY_SECONDS);
    setResendCooldown(RESEND_COOLDOWN);
    setDigits(['', '', '', '', '', '']);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const canResend = resendCooldown === 0 || timeLeft === 0;
  const codeComplete = digits.every((d) => d !== '');
  const expired = timeLeft === 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon + heading */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
            <ShieldCheck className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Verify Your Identity</h2>
          <p className="text-sm text-gray-500 mt-1.5">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-gray-700">{maskedEmail}</span>
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex justify-center gap-2.5 mb-4" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`h-12 w-11 text-center text-lg font-bold border-2 rounded-xl transition-all focus:outline-none ${
                d
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-green-400 focus:bg-white'
              }`}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-4">
          {expired ? (
            <span className="text-sm text-red-500 font-medium">Code expired</span>
          ) : (
            <span className="text-sm text-gray-400">
              Expires in{' '}
              <span className={`font-medium ${timeLeft < 60 ? 'text-red-500' : 'text-gray-600'}`}>
                {formatTime(timeLeft)}
              </span>
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4 text-center">
            {error}
          </div>
        )}

        {/* Verify button */}
        <Button
          onClick={handleVerify}
          disabled={!codeComplete || loading || expired}
          loading={loading}
          className="w-full mb-3"
        >
          Verify & Save Changes
        </Button>

        {/* Resend */}
        <button
          onClick={handleResend}
          disabled={!canResend || loading}
          className={`flex items-center justify-center gap-1.5 w-full text-sm py-2 rounded-xl transition-colors ${
            canResend && !loading
              ? 'text-green-600 hover:bg-green-50'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {resendCooldown > 0 && !expired
            ? `Resend in ${resendCooldown}s`
            : 'Resend code'}
        </button>
      </div>
    </div>
  );
}
