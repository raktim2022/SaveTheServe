import { useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';

/**
 * Subscribe to food request real-time events emitted by the server.
 *
 * All callbacks are optional.
 *
 * @param {Object} handlers
 * @param {Function} [handlers.onNew]          - request:new            payload: { type, message, data: FoodRequest, timestamp }
 * @param {Function} [handlers.onStatusChanged]- request:status_changed payload: { type, message, data: { requestId, status, foodListingId }, timestamp }
 */
export function useRealTimeRequests({ onNew, onStatusChanged } = {}) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    if (onNew)           socket.on('request:new',            onNew);
    if (onStatusChanged) socket.on('request:status_changed', onStatusChanged);

    return () => {
      if (onNew)           socket.off('request:new',            onNew);
      if (onStatusChanged) socket.off('request:status_changed', onStatusChanged);
    };
  }, [socket, onNew, onStatusChanged]);
}
