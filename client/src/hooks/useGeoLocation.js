import { useState, useEffect } from 'react';
import { getCurrentLocation } from '@/lib/map';

/**
 * Custom hook for geolocation
 * @param {Object} options - Geolocation options
 * @returns {Object} { location, loading, error, refetch }
 */
export const useGeoLocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const position = await getCurrentLocation();
      setLocation(position);
    } catch (err) {
      setError(err.message || 'Failed to get location');
      console.error('Geolocation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchLocation();
    } else {
      setLoading(false);
    }
  }, []);

  const refetch = () => {
    fetchLocation();
  };

  return { location, loading, error, refetch };
};

/**
 * Custom hook for watching geolocation changes
 * @param {Function} callback - Callback function when location changes
 * @param {Object} options - Geolocation options
 * @returns {Object} { location, error, stopWatching }
 */
export const useWatchGeoLocation = (callback, options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        if (callback) {
          callback(newLocation);
        }
      },
      (err) => {
        setError(err.message);
        console.error('Geolocation watch error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
        ...options,
      }
    );

    setWatchId(id);

    return () => {
      if (id) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, [callback]);

  const stopWatching = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  return { location, error, stopWatching };
};

export default useGeoLocation;

