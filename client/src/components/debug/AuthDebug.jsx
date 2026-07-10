'use client';

import { useAuth } from '@/hooks/useAuth';
import { getToken, getUser, isTokenExpired } from '@/lib/auth';

export default function AuthDebug() {
  const { user, loading, isAuthenticated } = useAuth();
  const token = getToken();
  const userData = getUser();

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.email : 'None'}</div>
        <div>Token: {token ? 'Present' : 'None'}</div>
        <div>UserData: {userData ? 'Present' : 'None'}</div>
        <div>Token Expired: {token ? (isTokenExpired(token) ? 'Yes' : 'No') : 'N/A'}</div>
      </div>
    </div>
  );
}