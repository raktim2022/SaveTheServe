'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';
import { SocketProvider } from '@/context/SocketContext';

// Central place to host client-side providers (theme, auth, data fetching, toasts)
export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            {/* SocketProvider must live inside AuthProvider so it can read the user */}
            <SocketProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: { fontFamily: 'Manrope, system-ui, sans-serif' },
                }}
              />
            </SocketProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default Providers;