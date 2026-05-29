
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '@/lib/auth';

const SocketContext = createContext({ socket: null, connected: false });

// Derive the backend origin from the API URL env var.
// Socket.IO CORS on the server already allows this origin.
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace('/api', '');

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Only connect when a user is authenticated
    if (!user) {
      if (socket) {
        console.log('[Socket] 🔌 Disconnecting - no user');
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const token = getToken();
    if (!token) {
      console.warn('[Socket] ⚠️ No token available');
      return;
    }

    console.log(`[Socket] 🔄 Connecting to ${SOCKET_URL}...`);
    
    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
      upgrade: true,
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000,
    });

    s.on('connect', () => {
      console.info(`[Socket] ✅ Connected  id=${s.id}  user=${user?.id}  role=${user?.role}`);
      setConnected(true);
    });

    s.on('disconnect', (reason) => {
      console.warn(`[Socket] ⚠️ Disconnected  reason=${reason}`);
      setConnected(false);
    });

    s.on('connect_error', (err) => {
      console.error(`[Socket] ❌ Connection error: ${err.message}`);
      console.error('[Socket] Error details:', err);
      setConnected(false);
    });

    setSocket(s);

    return () => {
      console.log('[Socket] 🔌 Cleanup - disconnecting');
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
    // Re-run only when the logged-in user changes (login / logout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

export default SocketContext;