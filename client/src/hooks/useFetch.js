import { useState, useEffect, useCallback } from 'react';
import axios from '@/lib/axios';

/**
 * Custom hook for data fetching
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Object} { data, loading, error, refetch }
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(url, options);
      setData(response.data);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

/**
 * Custom hook for POST requests
 * @returns {Object} { mutate, data, loading, error }
 */
export const usePost = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (url, payload, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(url, payload, options);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Post error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, data, loading, error };
};

/**
 * Custom hook for PUT requests
 * @returns {Object} { mutate, data, loading, error }
 */
export const usePut = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (url, payload, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(url, payload, options);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Put error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, data, loading, error };
};

/**
 * Custom hook for DELETE requests
 * @returns {Object} { mutate, data, loading, error }
 */
export const useDelete = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (url, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.delete(url, options);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Delete error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, data, loading, error };
};

export default useFetch;

