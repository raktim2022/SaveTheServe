import foodService from '../services/food.service.js';
import { RestaurantModel } from '../models/index.js';
import {
  createFoodListingSchema,
  updateFoodListingSchema,
  searchFoodSchema,
  nearbyFoodSchema,
  foodFilterSchema,
  categorySchema,
  updateQuantitySchema,
  idParamSchema
} from '../validations/food.validation.js';
import { responseHelper } from '../helpers/response.helper.js';
import { sendNotificationByRole } from '../services/notification.service.js';
import logger from '../utils/logger.js';

class FoodController {
  /**
   * Create food listing
   */
  async createFoodListing(req, res) {
    try {
      const { error, value } = createFoodListingSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const foodListing = await foodService.createFoodListing(req.user.id, value);
      
      // Notify all NGOs about new food listing
      try {
        await sendNotificationByRole(
          'NGO',
          'new_listing_created',
          'New Food Available',
          `${value.foodName} is now available for pickup. Quantity: ${value.quantity} ${value.unit || 'units'}`,
          { foodListingId: foodListing.id, foodName: value.foodName }
        );
      } catch (notifError) {
        logger.warn('Failed to send food listing notification:', notifError.message);
      }
      
      return responseHelper.success(res, foodListing, 'Food listing created successfully', 201);
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get available food listings
   */
  async getAvailableFoodListings(req, res) {
    try {
      const { error, value } = nearbyFoodSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const listings = await foodService.getAvailableFoodListings(value);
      return responseHelper.success(res, listings, 'Available food listings retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get food listing by ID
   */
  async getFoodListingById(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const foodListing = await foodService.getFoodListingById(parseInt(value.id, 10));
      
      return responseHelper.success(res, foodListing, 'Food listing retrieved successfully');
    } catch (error) {
      console.error('Update food listing error:', error.message);
      if (error.message === 'Restaurant not found') {
        return responseHelper.forbidden(res, 'Access forbidden');
      }
      if (error.message === 'Food listing not found') {
        return responseHelper.notFound(res, 'Food listing not found');
      }
      if (error.message.toLowerCase().includes('your own food listings')) {
        return responseHelper.forbidden(res, error.message);
      }
      return responseHelper.forbidden(res, error.message || 'Access forbidden');
    }
  }

  /**
   * Update food listing
   */
  async updateFoodListing(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error, value } = updateFoodListingSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const restaurant = await RestaurantModel.findByUserId(req.user.id);
      if (!restaurant) {
        return responseHelper.forbidden(res, 'Access forbidden');
      }

      const foodListing = await foodService.updateFoodListing(req.user.id, parseInt(paramValue.id, 10), value);
      
      return responseHelper.success(res, foodListing, 'Food listing updated successfully');
    } catch (error) {
      if (error.message === 'Food listing not found') {
        return responseHelper.notFound(res, 'Food listing not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Delete food listing
   */
  async deleteFoodListing(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const result = await foodService.deleteFoodListing(req.user.id, parseInt(value.id, 10));
      
      return responseHelper.success(res, result, 'Food listing deleted successfully');
    } catch (error) {
      if (error.message === 'Food listing not found') {
        return responseHelper.notFound(res, 'Food listing not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get restaurant's own food listings
   */
  async getMyFoodListings(req, res) {
    try {
      const listings = await foodService.getMyListings(req.user.id);
      return responseHelper.success(res, listings, 'Food listings retrieved successfully');
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        return responseHelper.forbidden(res, 'Access forbidden');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get all food listings
   */
  async getAllFoodListings(req, res) {
    try {
      const { error, value } = foodFilterSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { page, limit, ...filters } = value;
      const result = await foodService.getAllFoodListings(page, limit, filters);
      
      return responseHelper.success(res, result, 'Food listings retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Search food listings
   */
  async searchFoodListings(req, res) {
    try {
      const { error, value } = searchFoodSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { query, page, limit, ...filters } = value;
      const result = await foodService.searchFoodListings(query, page, limit, filters);
      
      return responseHelper.success(res, result, 'Search results retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Find nearby food listings
   */
  async findNearbyFoodListings(req, res) {
    try {
      const { error, value } = nearbyFoodSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { latitude, longitude, radius, page, limit } = value;
      const result = await foodService.findNearbyFoodListings(latitude, longitude, radius, page, limit);
      
      return responseHelper.success(res, result, 'Nearby food listings retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get food by category
   */
  async getFoodByCategory(req, res) {
    try {
      const { error, value } = categorySchema.validate({ ...req.params, ...req.query });
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { category, page, limit } = value;
      const result = await foodService.getFoodByCategory(category, page, limit);
      
      return responseHelper.success(res, result, `Food listings in category '${category}' retrieved successfully`);
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get expiring food
   */
  async getExpiringFood(req, res) {
    try {
      const hours = req.query.hours ? parseInt(req.query.hours) : 24;
      
      if (isNaN(hours) || hours < 1 || hours > 168) { // Max 7 days
        return responseHelper.validationError(res, 'Hours must be a number between 1 and 168');
      }

      const expiringFood = await foodService.getExpiringFood(hours);
      
      return responseHelper.success(res, expiringFood, `Food expiring in next ${hours} hours retrieved successfully`);
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get food statistics
   */
  async getFoodStats(req, res) {
    try {
      const stats = await foodService.getFoodStats();
      
      return responseHelper.success(res, stats, 'Food statistics retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Update food quantity
   */
  async updateQuantity(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error, value } = updateQuantitySchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const foodListing = await foodService.updateQuantity(paramValue.id, value.quantity);
      
      return responseHelper.success(res, foodListing, 'Food quantity updated successfully');
    } catch (error) {
      if (error.message === 'Food listing not found') {
        return responseHelper.notFound(res, 'Food listing not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Mark food as expired
   */
  async markAsExpired(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const foodListing = await foodService.markAsExpired(value.id, req.user.id);
      
      return responseHelper.success(res, foodListing, 'Food marked as expired successfully');
    } catch (error) {
      if (error.message === 'Food listing not found') {
        return responseHelper.notFound(res, 'Food listing not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Mark food as fulfilled
   */
  async markAsFulfilled(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const foodListing = await foodService.markAsFulfilled(value.id, req.user.id);
      
      return responseHelper.success(res, foodListing, 'Food marked as fulfilled successfully');
    } catch (error) {
      if (error.message === 'Food listing not found') {
        return responseHelper.notFound(res, 'Food listing not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Bulk expire food listings (Admin only)
   */
  async bulkExpireFood(req, res) {
    try {
      const result = await foodService.bulkExpireFood();
      
      return responseHelper.success(res, result, 'Bulk food expiry completed successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Upload food image (Restaurant only)
   */
  async uploadFoodImage(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      if (!req.file) {
        return responseHelper.validationError(res, 'Image file is required');
      }

      const foodId = parseInt(value.id, 10);
      const imageUrl = req.file.path;

      const foodListing = await foodService.updateFoodListing(req.user.id, foodId, { imageUrl });

      return responseHelper.success(res, foodListing, 'Food image uploaded successfully');
    } catch (error) {
      if (error.message === 'Food listing not found') {
        return responseHelper.notFound(res, 'Food listing not found');
      }
      return responseHelper.error(res, error.message);
    }
  }
}

export default new FoodController();
