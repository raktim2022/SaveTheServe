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

  const fetchLocation = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try with high accuracy first, then fallback to lower accuracy if it fails
      const geoOptions = retryCount > 0 ? {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes for retry
      } : undefined;
      
      const position = await getCurrentLocation(geoOptions);
      setLocation(position);
    } catch (err) {
      console.error('Geolocation error:', err);
      
      // If high accuracy failed and we haven't retried yet, try with lower accuracy
      if (err.code === 3 && retryCount === 0) { // TIMEOUT
        console.log('Retrying with lower accuracy...');
        return fetchLocation(1);
      }
      
      setError(err.message || 'Failed to get location');
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

