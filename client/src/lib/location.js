/**
 * Location utilities for getting user's current location
 */

export class LocationService {
  static async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Unable to retrieve your location.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          
          reject(new Error(message));
        },
        options
      );
    });
  }

  static async requestLocationPermission() {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch (error) {
      console.warn('Permission API not supported');
      // Fallback: try to get location directly
      try {
        await this.getCurrentLocation();
        return 'granted';
      } catch {
        return 'denied';
      }
    }
  }

  static async getReverseGeocode(latitude, longitude) {
    try {
      // Using a free geocoding service
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          address: result.formatted,
          city: result.components.city || result.components.town || result.components.village,
          state: result.components.state,
          country: result.components.country,
          postalCode: result.components.postcode
        };
      }
      
      throw new Error('No address found for coordinates');
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return {
        address: `${latitude}, ${longitude}`,
        city: '',
        state: '',
        country: '',
        postalCode: ''
      };
    }
  }
}

export default LocationService;