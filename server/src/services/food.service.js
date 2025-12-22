import { FoodListingModel, RestaurantModel } from '../models/index.js';
import { getDistanceFromLatLonInKm } from '../helpers/geo.helper.js';

class FoodService {
  /**
   * Create food listing
   */
  async createFoodListing(userId, foodData) {
    try {
      // Get restaurant by user ID
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const foodListing = await FoodListingModel.create({
        foodName: foodData.foodName,
        quantity: foodData.quantity,
        expiryTime: foodData.expiryTime,
        restaurantId: restaurant.id,
        status: 'AVAILABLE',
        createdAt: new Date()
      });

      return foodListing;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get food listing by ID
   */
  async getFoodListingById(foodId) {
    try {
      const foodListing = await FoodListingModel.findById(foodId);
      if (!foodListing) {
        throw new Error('Food listing not found');
      }
      return foodListing;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update food listing
   */
  async updateFoodListing(userId, foodId, updateData) {
    try {
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const foodListing = await FoodListingModel.findById(foodId);
      if (!foodListing) {
        throw new Error('Food listing not found');
      }

      // Check if food listing belongs to the restaurant
      if (foodListing.restaurantId !== restaurant.id) {
        throw new Error('You can only update your own food listings');
      }

      // Don't allow updating status through this method
      delete updateData.status;

      const updatedFoodListing = await FoodListingModel.update(foodId, {
        ...updateData,
        updatedAt: new Date()
      });

      return updatedFoodListing;
    } catch (error) {
      console.error('FoodService.updateFoodListing error:', error.message);
      throw error;
    }
  }

  /**
   * Delete food listing
   */
  async deleteFoodListing(userId, foodId) {
    try {
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const foodListing = await FoodListingModel.findById(foodId);
      if (!foodListing) {
        throw new Error('Food listing not found');
      }

      // Check if food listing belongs to the restaurant
      if (foodListing.restaurantId !== restaurant.id) {
        throw new Error('You can only delete your own food listings');
      }

      // Check if food listing has active requests
      if (foodListing.status === 'REQUESTED') {
        throw new Error('Cannot delete food listing with active requests');
      }

      await FoodListingModel.delete(foodId);
      
      return { message: 'Food listing deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all food listings with filters
   */
  async getAllFoodListings(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      
      // Build where conditions
      const whereConditions = {
        status: 'AVAILABLE', // Only show available food by default
        ...filters
      };

      const foodListings = await FoodListingModel.findMany({
        offset,
        limit,
        where: whereConditions,
        include: {
          restaurant: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const total = await FoodListingModel.count({ where: whereConditions });

      return {
        foodListings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available food listings for authenticated users
   */
  async getAvailableFoodListings(filters = {}) {
    try {
      // If no location provided, return all available listings
      if (!filters.latitude || !filters.longitude) {
        return await FoodListingModel.findAvailable();
      }

      const { latitude, longitude, radius = 5 } = filters;

      // Get available listings with restaurant coordinates
      const listings = await FoodListingModel.findAvailable();

      return listings
        .map(listing => {
          const distance = getDistanceFromLatLonInKm(
            latitude,
            longitude,
            listing.restaurant.latitude,
            listing.restaurant.longitude
          );
          return { ...listing, distance };
        })
        .filter(listing => listing.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search food listings
   */
  async searchFoodListings(query, page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      
      const whereConditions = {
        status: 'AVAILABLE',
        OR: [
          { foodType: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ],
        ...filters
      };

      const foodListings = await FoodListingModel.findMany({
        offset,
        limit,
        where: whereConditions,
        include: {
          restaurant: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const total = await FoodListingModel.count({ where: whereConditions });

      return {
        foodListings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find nearby food listings
   */
  async findNearbyFoodListings(latitude, longitude, radius = 5, page = 1, limit = 10) {
    try {
      // Get all available food listings with restaurant data
      if (!latitude || !longitude) {
        const available = await FoodListingModel.findAvailable();
        return {
          foodListings: available,
          pagination: { page: 1, limit: available.length, total: available.length, pages: 1 }
        };
      }

      const allFoodListings = await FoodListingModel.findMany({
        where: {
          status: 'AVAILABLE'
        },
        include: {
          restaurant: true
        }
      });

      // Filter by distance
      const nearbyFoodListings = allFoodListings
        .filter(food => {
          if (!food.restaurant || !food.restaurant.latitude || !food.restaurant.longitude) {
            return false;
          }
          
          const distance = getDistanceFromLatLonInKm(
            latitude, longitude,
            food.restaurant.latitude, food.restaurant.longitude
          );
          return distance <= radius;
        })
        .map(food => ({
          ...food,
          distance: getDistanceFromLatLonInKm(
            latitude, longitude,
            food.restaurant.latitude, food.restaurant.longitude
          )
        }))
        .sort((a, b) => a.distance - b.distance);

      // Apply pagination
      const offset = (page - 1) * limit;
      const paginatedResults = nearbyFoodListings.slice(offset, offset + limit);

      return {
        foodListings: paginatedResults,
        pagination: {
          page,
          limit,
          total: nearbyFoodListings.length,
          pages: Math.ceil(nearbyFoodListings.length / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update food listing status
   */
  async updateFoodStatus(foodId, status, userId = null) {
    try {
      const foodListing = await FoodListingModel.findById(foodId);
      if (!foodListing) {
        throw new Error('Food listing not found');
      }

      // If userId is provided, check if it belongs to the restaurant
      if (userId) {
        const restaurant = await RestaurantModel.findByUserId(userId);
        if (!restaurant || restaurant.id !== foodListing.restaurantId) {
          throw new Error('You can only update your own food listings');
        }
      }

      const updatedFoodListing = await FoodListingModel.update(foodId, {
        status,
        updatedAt: new Date()
      });

      return updatedFoodListing;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get food listings for a restaurant owner
   */
  async getMyListings(userId) {
    const restaurant = await RestaurantModel.findByUserId(userId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    return FoodListingModel.findByRestaurant(restaurant.id);
  }

  /**
   * Mark food as expired
   */
  async markAsExpired(foodId, userId = null) {
    try {
      return await this.updateFoodStatus(foodId, 'EXPIRED', userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark food as fulfilled
   */
  async markAsFulfilled(foodId, userId = null) {
    try {
      return await this.updateFoodStatus(foodId, 'FULFILLED', userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get food by category
   */
  async getFoodByCategory(category, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const foodListings = await FoodListingModel.findMany({
        offset,
        limit,
        where: {
          status: 'AVAILABLE',
          foodType: { contains: category, mode: 'insensitive' }
        },
        include: {
          restaurant: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const total = await FoodListingModel.count({
        where: {
          status: 'AVAILABLE',
          foodType: { contains: category, mode: 'insensitive' }
        }
      });

      return {
        foodListings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get expiring food (expires in next 24 hours)
   */
  async getExpiringFood(hours = 24) {
    try {
      const expiryThreshold = new Date();
      expiryThreshold.setHours(expiryThreshold.getHours() + hours);

      const expiringFood = await FoodListingModel.findMany({
        where: {
          status: 'AVAILABLE',
          expiryTime: {
            lte: expiryThreshold,
            gte: new Date()
          }
        },
        include: {
          restaurant: true
        },
        orderBy: {
          expiryTime: 'asc'
        }
      });

      return expiringFood;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get food statistics
   */
  async getFoodStats() {
    try {
      const [
        totalFoodListings,
        availableFood,
        expiredFood,
        fulfilledFood,
        expiringInNext24Hours
      ] = await Promise.all([
        FoodListingModel.count(),
        FoodListingModel.count({ where: { status: 'AVAILABLE' } }),
        FoodListingModel.count({ where: { status: 'EXPIRED' } }),
        FoodListingModel.count({ where: { status: 'FULFILLED' } }),
        this.getExpiringFood(24)
      ]);

      return {
        totalFoodListings,
        availableFood,
        expiredFood,
        fulfilledFood,
        expiringInNext24Hours: expiringInNext24Hours.length
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update quantity when food is requested
   */
  async updateQuantity(foodId, newQuantity) {
    try {
      const foodListing = await FoodListingModel.findById(foodId);
      if (!foodListing) {
        throw new Error('Food listing not found');
      }

      if (newQuantity < 0) {
        throw new Error('Quantity cannot be negative');
      }

      const status = newQuantity === 0 ? 'FULFILLED' : foodListing.status;

      const updatedFoodListing = await FoodListingModel.update(foodId, {
        quantity: newQuantity,
        status,
        updatedAt: new Date()
      });

      return updatedFoodListing;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk expire food listings
   */
  async bulkExpireFood() {
    try {
      const now = new Date();
      
      const expiredFood = await FoodListingModel.updateMany({
        where: {
          status: 'AVAILABLE',
          expiryTime: {
            lte: now
          }
        },
        data: {
          status: 'EXPIRED',
          updatedAt: now
        }
      });

      return {
        message: `${expiredFood.count} food listings marked as expired`,
        expiredCount: expiredFood.count
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new FoodService();
