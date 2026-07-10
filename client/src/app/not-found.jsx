import Link from 'next/link';
import Button from '@/components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-200 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-slate-300 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}

