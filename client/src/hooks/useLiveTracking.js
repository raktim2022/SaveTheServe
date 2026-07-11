'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import toast from 'react-hot-toast';

/**
 * Custom hook for live location tracking
 * @param {Object} options
 * @param {number|string} options.requestId - The ID of the food request to track
 * @param {boolean} options.isVolunteer - If true, stream user coordinates. If false, listen to volunteer coordinates.
 * @param {boolean} options.enabled - Toggle tracking activation state
 */
export function useLiveTracking({ requestId, isVolunteer = false, enabled = false }) {
  const { socket } = useSocket();
  const [coordinates, setCoordinates] = useState(null); // { lat, lng, timestamp }
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!socket || !requestId || !enabled) {
      // Clear location state if disabled
      setCoordinates(null);
      return;
    }

    // Join tracking room
    socket.emit('tracking:join', { requestId });

    if (isVolunteer) {
      // Stream mode: Watch location and send updates
      if (!navigator.geolocation) {
        const errMsg = 'Geolocation is not supported by your browser';
        setError(errMsg);
        toast.error(errMsg);
        return;
      }



      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = { lat: latitude, lng: longitude, timestamp: new Date().toISOString() };
          setCoordinates(coords);
          setError(null);

          // Stream coordinates to server
          socket.emit('tracking:location_update', {
            requestId,
            lat: latitude,
            lng: longitude
          });
        },
        (geoError) => {
          console.error('[Tracking Geolocation Error]', geoError);
          let message = 'Failed to watch GPS location';
          if (geoError.code === geoError.PERMISSION_DENIED) {
            message = 'GPS location permission denied. Please allow browser location access.';
          }
          setError(message);
          toast.error(message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      // Viewer mode: Listen for location updates
      socket.on('tracking:location_changed', (data) => {
        if (data && data.requestId === requestId) {
          setCoordinates({
            lat: data.lat,
            lng: data.lng,
            timestamp: data.timestamp
          });
        }
      });
    }

    // Cleanup on disable/unmount
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      if (socket) {
        if (!isVolunteer) {
          socket.off('tracking:location_changed');
        }
        socket.emit('tracking:leave', { requestId });
      }
    };
  }, [socket, requestId, isVolunteer, enabled]);

  return { coordinates, error };
}


