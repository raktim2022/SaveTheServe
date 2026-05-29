import { useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';

/**
 * Subscribe to food listing real-time events emitted by the server.
 *
 * All callbacks are optional — just pass the ones you need.
 *
 * @param {Object} handlers
 * @param {Function} [handlers.onNew]          - food:new          payload: { type, message, data: FoodListing, timestamp }
 * @param {Function} [handlers.onUpdated]      - food:updated      payload: { type, message, data: FoodListing, timestamp }
 * @param {Function} [handlers.onDeleted]      - food:deleted      payload: { type, message, data: { id }, timestamp }
 * @param {Function} [handlers.onStatusChanged]- food:status_changed payload: { type, data: { id, status }, timestamp }
 */
export function useRealTimeFood({ onNew, onUpdated, onDeleted, onStatusChanged } = {}) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    if (onNew)           socket.on('food:new',            onNew);
    if (onUpdated)       socket.on('food:updated',        onUpdated);
    if (onDeleted)       socket.on('food:deleted',        onDeleted);
    if (onStatusChanged) socket.on('food:status_changed', onStatusChanged);

    return () => {
      if (onNew)           socket.off('food:new',            onNew);
      if (onUpdated)       socket.off('food:updated',        onUpdated);
      if (onDeleted)       socket.off('food:deleted',        onDeleted);
      if (onStatusChanged) socket.off('food:status_changed', onStatusChanged);
    };
  }, [socket, onNew, onUpdated, onDeleted, onStatusChanged]);
}
