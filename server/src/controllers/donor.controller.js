import donorService from '../services/donor.service.js';
import {
  registerRestaurantSchema,
  updateRestaurantSchema,
  searchRestaurantSchema,
  nearbyRestaurantsSchema,
  operatingHoursSchema,
  contactInfoSchema,
  foodListingsFilterSchema,
  paginationSchema,
  uuidParamSchema
} from '../validations/donor.validation.js';
import { responseHelper } from '../helpers/response.helper.js';

class DonorController {
  /**
   * Register restaurant
   */
  async registerRestaurant(req, res) {
    try {
      const { error, value } = registerRestaurantSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const restaurant = await donorService.registerRestaurant(value);
      
      return responseHelper.success(res, restaurant, 'Restaurant registered successfully', 201);
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get current restaurant profile
   */
  async getProfile(req, res) {
    try {
      const restaurant = await donorService.getRestaurantByUserId(req.user.id);
      
      return responseHelper.success(res, restaurant, 'Restaurant profile retrieved successfully');
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        return responseHelper.notFound(res, 'Restaurant profile not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Update restaurant profile
   */
  async updateProfile(req, res) {
    try {
      const { error, value } = updateRestaurantSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const restaurant = await donorService.updateRestaurant(req.user.id, value);
      
      return responseHelper.success(res, restaurant, 'Restaurant profile updated successfully');
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        return responseHelper.notFound(res, 'Restaurant not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get restaurant by ID
   */
  async getRestaurantById(req, res) {
    try {
      const { error, value } = uuidParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const restaurant = await donorService.getRestaurantById(value.id);
      
      return responseHelper.success(res, restaurant, 'Restaurant retrieved successfully');
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        return responseHelper.notFound(res, 'Restaurant not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get all restaurants
   */
  async getAllRestaurants(req, res) {
    try {
      const { error, value } = paginationSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { page, limit, search } = value;
      const filters = { search };
      
      const result = await donorService.getAllRestaurants(page, limit, filters);
      
      return responseHelper.success(res, result, 'Restaurants retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Search restaurants
   */
  async searchRestaurants(req, res) {
    try {
      const { error, value } = searchRestaurantSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { query, page, limit } = value;
      const result = await donorService.searchRestaurants(query, page, limit);
      
      return responseHelper.success(res, result, 'Search results retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Find nearby restaurants
   */
  async findNearbyRestaurants(req, res) {
    try {
      const { error, value } = nearbyRestaurantsSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { latitude, longitude, radius } = value;
      const restaurants = await donorService.findNearbyRestaurants(latitude, longitude, radius);
      
      return responseHelper.success(res, restaurants, 'Nearby restaurants retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get restaurant food listings
   */
  async getFoodListings(req, res) {
    try {
      const { error, value } = foodListingsFilterSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { page, limit, status, foodType } = value;
      const filters = {};
      
      if (status) filters.status = status;
      if (foodType) filters.foodType = foodType;

      const result = await donorService.getRestaurantFoodListings(req.user.id, page, limit, filters);
      
      return responseHelper.success(res, result, 'Food listings retrieved successfully');
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        return responseHelper.notFound(res, 'Restaurant not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get restaurant statistics
   */
  async getStats(req, res) {
    try {
      const stats = await donorService.getRestaurantStats(req.user.id);
      
      return responseHelper.success(res, stats, 'Restaurant statistics retrieved successfully');
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        return responseHelper.notFound(res, 'Restaurant not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Update operating hours
   */
  async updateOperatingHours(req, res) {
    try {
      const { error, value } = operatingHoursSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const restaurant = await donorService.updateOperatingHours(req.user.id, value.operatingHours);
      
      return responseHelper.success(res, restaurant, 'Operating hours updated successfully');
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        return responseHelper.notFound(res, 'Restaurant not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Update contact information
   */
  async updateContactInfo(req, res) {
    try {
      const { error, value } = contactInfoSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const restaurant = await donorService.updateContactInfo(req.user.id, value);
      
      return responseHelper.success(res, restaurant, 'Contact information updated successfully');
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        return responseHelper.notFound(res, 'Restaurant not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Toggle restaurant availability
   */
  async toggleAvailability(req, res) {
    try {
      const restaurant = await donorService.toggleAvailability(req.user.id);
      
      const message = restaurant.isActive 
        ? 'Restaurant is now available for donations'
        : 'Restaurant is now unavailable for donations';
      
      return responseHelper.success(res, restaurant, message);
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        return responseHelper.notFound(res, 'Restaurant not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Delete restaurant
   */
  async deleteRestaurant(req, res) {
    try {
      const result = await donorService.deleteRestaurant(req.user.id);
      
      return responseHelper.success(res, result, 'Restaurant deleted successfully');
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        return responseHelper.notFound(res, 'Restaurant not found');
      }
      return responseHelper.error(res, error.message);
    }
  }
}

export default new DonorController();
