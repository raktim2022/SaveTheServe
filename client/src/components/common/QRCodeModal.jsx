'use client';

import { useEffect, useRef } from 'react';
import { X, QrCode } from 'lucide-react';

/**
 * QRCodeModal — displays the volunteer's 6-digit OTP + QR image.
 *
 * Props:
 *   open        {boolean}  – controls visibility
 *   onClose     {Function} – called when user closes the modal
 *   otp         {string}   – 6-digit pickup OTP shown to the volunteer
 *   qrToken     {string}   – the raw token encoded in the QR (optional)
 *   foodName    {string}   – name of the food item
 *   donorName   {string}   – donor / restaurant name
 */
export default function QRCodeModal({ open, onClose, otp, qrToken, foodName, donorName }) {
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  // Build a QR image URL via public QR service (no library needed)
  const qrData = qrToken ? encodeURIComponent(qrToken) : encodeURIComponent(otp || 'N/A');
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${qrData}`;

  const digits = (otp || '------').split('');

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-green-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Pickup Verification</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-400 hover:text-gray-600 dark:text-slate-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-6 space-y-6">
          {(foodName || donorName) && (
            <div className="text-center">
              {foodName && <p className="font-semibold text-gray-900 dark:text-white">{foodName}</p>}
              {donorName && <p className="text-sm text-gray-500 dark:text-slate-400">from {donorName}</p>}
            </div>
          )}

          {/* QR Code image */}
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImageSrc}
              alt="Pickup QR Code"
              width={200}
              height={200}
              className="rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          {/* 6-digit OTP */}
          <div className="space-y-2">
            <p className="text-xs text-center text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wide">
              6-digit Pickup Code
            </p>
            <div className="flex justify-center gap-2">
              {digits.map((d, i) => (
                <div
                  key={i}
                  className="w-10 h-12 rounded-lg border-2 border-green-200 bg-green-50 flex items-center justify-center text-xl font-bold text-green-700 shadow-sm"
                >
                  {d}
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 mt-1">
              Show this code or let the donor scan the QR above.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
