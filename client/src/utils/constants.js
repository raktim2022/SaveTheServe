/**
 * Application constants
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // NGO Routes
  NGO_DASHBOARD: '/ngo',
  NGO_REQUESTS: '/ngo/requests',
  NGO_HISTORY: '/ngo/history',
  
  // Donor Routes
  DONOR_DASHBOARD: '/donor',
  DONOR_FOOD_LISTINGS: '/donor/food-listings',
  DONOR_PICKUPS: '/donor/pickups',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  NGO: 'ngo',
  RESTAURANT: 'restaurant',
};

export const FOOD_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const FOOD_CATEGORIES = [
  { value: 'prepared', label: 'Prepared Food' },
  { value: 'packaged', label: 'Packaged Food' },
  { value: 'produce', label: 'Fresh Produce' },
  { value: 'bakery', label: 'Bakery Items' },
  { value: 'dairy', label: 'Dairy Products' },
  { value: 'other', label: 'Other' },
];

export const UNITS = [
  { value: 'kg', label: 'Kilograms' },
  { value: 'g', label: 'Grams' },
  { value: 'l', label: 'Liters' },
  { value: 'ml', label: 'Milliliters' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'servings', label: 'Servings' },
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
};

export const MAPBOX_CONFIG = {
  TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  DEFAULT_CENTER: [0, 0],
  DEFAULT_ZOOM: 12,
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN: 'Password must be at least 8 characters',
  PHONE: 'Please enter a valid phone number',
  NUMBER: 'Please enter a valid number',
};

