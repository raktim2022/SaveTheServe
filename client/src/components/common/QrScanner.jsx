'use client';

/**
 * QrScanner — Camera-based QR code reader
 *
 * Uses html5-qrcode (client-only, loaded after mount to avoid SSR issues).
 *
 * Props:
 *   onScan(text: string)  — called once with raw QR text on success
 *   onClose()             — called when user clicks Cancel
 */

import { useEffect, useRef, useState } from 'react';

const SCANNER_ELEMENT_ID = 'qr-scanner-region';

export default function QrScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const startedRef = useRef(false); // guard against double-start in StrictMode / dep changes
  const onScanRef = useRef(onScan);  // stable ref so the effect never re-runs due to callback identity
  onScanRef.current = onScan;

  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Prevent a second camera session if the effect fires twice (e.g. React StrictMode)
    if (startedRef.current) return;
    startedRef.current = true;

    let scanner = null;

    const start = async () => {
      try {
        // Dynamic import keeps this out of the SSR bundle
        const { Html5Qrcode } = await import('html5-qrcode');
        scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' }, // rear camera
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            // Stop immediately after first successful scan
            scanner.stop().catch(() => {});
            scannerRef.current = null;
            onScanRef.current(decodedText);
          },
          () => {} // ignore per-frame failures silently
        );
        setReady(true);
      } catch (err) {
        startedRef.current = false; // allow retry on error
        setError(
          err?.message?.includes('permission')
            ? 'Camera permission denied. Please allow camera access and try again.'
            : 'Could not start camera. Make sure your device has a camera and this page is served over HTTPS.'
        );
      }
    };

    start();

    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []); // empty — camera session management is independent of callback identity

  return (
    <div className="space-y-3">
      {/* Camera viewport */}
      <div
        id={SCANNER_ELEMENT_ID}
        className="w-full rounded-xl overflow-hidden bg-black"
        style={{ minHeight: 260 }}
      />

      {!ready && !error && (
        <p className="text-xs text-gray-400 text-center animate-pulse">Starting camera…</p>
      )}

      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}

      {ready && !error && (
        <p className="text-xs text-gray-400 text-center">
          Point the camera at the volunteer's QR code
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          if (scannerRef.current) {
            scannerRef.current.stop().catch(() => {});
            scannerRef.current = null;
          }
          onClose();
        }}
        className="w-full border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors"
      >
        Cancel Scan
      </button>
    </div>
  );
}
