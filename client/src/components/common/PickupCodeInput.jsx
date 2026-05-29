'use client';

import { useRef, useState, useEffect } from 'react';

/**
 * PickupCodeInput — a 6-box auto-advancing OTP input.
 *
 * Props:
 *   length    {number}   – number of digit boxes (default: 6)
 *   value     {string}   – controlled value string
 *   onChange  {Function} – (fullString) => void called on every change
 *   disabled  {boolean}  – disables all inputs
 *   label     {string}   – accessible label (default: "Enter pickup code")
 *   error     {string}   – error message to display below
 */
export default function PickupCodeInput({
  length = 6,
  value = '',
  onChange,
  disabled = false,
  label = 'Enter pickup code',
  error,
}) {
  const inputs = useRef([]);
  const [digits, setDigits] = useState(() => Array(length).fill(''));

  // Sync external value → internal digits
  useEffect(() => {
    const chars = value.split('').slice(0, length);
    const next = Array(length).fill('').map((_, i) => chars[i] || '');
    setDigits(next);
  }, [value, length]);

  const emit = (arr) => {
    onChange?.(arr.join(''));
  };

  const handleChange = (idx, raw) => {
    const char = raw.replace(/\D/g, '').slice(-1); // only last digit
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    emit(next);
    if (char && idx < length - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = '';
        setDigits(next);
        emit(next);
      } else if (idx > 0) {
        inputs.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const next = Array(length).fill('').map((_, i) => pasted[i] || '');
    setDigits(next);
    emit(next);
    const focusIdx = Math.min(pasted.length, length - 1);
    inputs.current[focusIdx]?.focus();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((d, idx) => (
          <input
            key={idx}
            ref={(el) => (inputs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={d}
            disabled={disabled}
            aria-label={`Digit ${idx + 1} of ${length}`}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onFocus={(e) => e.target.select()}
            className={[
              'w-11 h-13 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all',
              'focus:ring-2 focus:ring-green-500 focus:border-green-500',
              error
                ? 'border-red-400 bg-red-50 text-red-700'
                : d
                ? 'border-green-400 bg-green-50 text-green-800'
                : 'border-gray-300 bg-white text-gray-900',
              disabled && 'opacity-50 cursor-not-allowed',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
