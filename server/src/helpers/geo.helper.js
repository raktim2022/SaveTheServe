/**
 * Geographic utility functions for location-based operations
 */

/**
 * Calculate the distance between two points on Earth using Haversine formula
 * @param {number} lat1 - Latitude of first point in decimal degrees
 * @param {number} lon1 - Longitude of first point in decimal degrees
 * @param {number} lat2 - Latitude of second point in decimal degrees
 * @param {number} lon2 - Longitude of second point in decimal degrees
 * @returns {number} Distance in kilometers
 */
export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate the distance between two points in meters
 * @param {number} lat1 - Latitude of first point in decimal degrees
 * @param {number} lon1 - Longitude of first point in decimal degrees
 * @param {number} lat2 - Latitude of second point in decimal degrees
 * @param {number} lon2 - Longitude of second point in decimal degrees
 * @returns {number} Distance in meters
 */
export const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  return getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) * 1000;
};

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees to convert
 * @returns {number} Radians
 */
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Convert radians to degrees
 * @param {number} rad - Radians to convert
 * @returns {number} Degrees
 */
export const rad2deg = (rad) => {
  return rad * (180 / Math.PI);
};

/**
 * Check if a point is within a radius of another point
 * @param {number} lat1 - Latitude of center point in decimal degrees
 * @param {number} lon1 - Longitude of center point in decimal degrees
 * @param {number} lat2 - Latitude of point to check in decimal degrees
 * @param {number} lon2 - Longitude of point to check in decimal degrees
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean} True if point is within radius
 */
export const isWithinRadius = (lat1, lon1, lat2, lon2, radiusKm) => {
  const distance = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
  return distance <= radiusKm;
};

/**
 * Get the center point (centroid) of an array of coordinates
 * @param {Array} coordinates - Array of {lat, lon} objects
 * @returns {Object} Center point with lat and lon properties
 */
export const getCenterPoint = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    throw new Error('Coordinates array is required and cannot be empty');
  }

  let totalLat = 0;
  let totalLon = 0;

  coordinates.forEach(coord => {
    totalLat += coord.lat;
    totalLon += coord.lon;
  });

  return {
    lat: totalLat / coordinates.length,
    lon: totalLon / coordinates.length
  };
};

/**
 * Calculate bounding box for a given center point and radius
 * @param {number} centerLat - Center latitude
 * @param {number} centerLon - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Object} Bounding box with north, south, east, west boundaries
 */
export const getBoundingBox = (centerLat, centerLon, radiusKm) => {
  const latChange = radiusKm / 110.54; // 1 degree latitude ≈ 110.54 km
  const lonChange = Math.abs(radiusKm / (111.32 * Math.cos(deg2rad(centerLat))));

  return {
    north: centerLat + latChange,
    south: centerLat - latChange,
    east: centerLon + lonChange,
    west: centerLon - lonChange
  };
};

/**
 * Validate latitude coordinate
 * @param {number} lat - Latitude to validate
 * @returns {boolean} True if valid latitude
 */
export const isValidLatitude = (lat) => {
  return typeof lat === 'number' && lat >= -90 && lat <= 90;
};

/**
 * Validate longitude coordinate
 * @param {number} lon - Longitude to validate
 * @returns {boolean} True if valid longitude
 */
export const isValidLongitude = (lon) => {
  return typeof lon === 'number' && lon >= -180 && lon <= 180;
};

/**
 * Validate coordinate pair
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if both coordinates are valid
 */
export const isValidCoordinate = (lat, lon) => {
  return isValidLatitude(lat) && isValidLongitude(lon);
};