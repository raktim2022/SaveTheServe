import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { getToken, removeToken } from './auth';

/**
 * Create axios instance with default config
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request interceptor to add auth token
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
      });
    }
    
    // Return error response
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;

/**
 * Helper function for GET requests
 */
export const get = (url, config = {}) => {
  return axiosInstance.get(url, config);
};

/**
 * Helper function for POST requests
 */
export const post = (url, data, config = {}) => {
  return axiosInstance.post(url, data, config);
};

/**
 * Helper function for PUT requests
 */
export const put = (url, data, config = {}) => {
  return axiosInstance.put(url, data, config);
};

/**
 * Helper function for PATCH requests
 */
export const patch = (url, data, config = {}) => {
  return axiosInstance.patch(url, data, config);
};

/**
 * Helper function for DELETE requests
 */
export const del = (url, config = {}) => {
  return axiosInstance.delete(url, config);
};

