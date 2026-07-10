"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="rounded-full bg-green-100 p-6 mb-6 dark:bg-green-900/30">
        <svg
          className="w-12 h-12 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
        You're offline
      </h1>
      <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md">
        Some features are unavailable until your connection is restored. We will automatically reconnect when you are back online.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
