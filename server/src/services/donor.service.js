import { RestaurantModel, UserModel, FoodListingModel } from '../models/index.js';
import { getDistanceFromLatLonInKm } from '../helpers/geo.helper.js';

class DonorService {
  /**
   * Register restaurant
   */
  async registerRestaurant(restaurantData) {
    try {
      const { userId } = restaurantData;

      // Check if user exists and role is RESTAURANT
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== 'RESTAURANT') {
        throw new Error('User role must be RESTAURANT');
      }

      // Check if restaurant already exists
      const existingRestaurant = await RestaurantModel.findByUserId(userId);
      if (existingRestaurant) {
        throw new Error('Restaurant already exists for this user');
      }

      const restaurant = await RestaurantModel.create({
        ...restaurantData,
        isApproved: null, // Pending approval
        createdAt: new Date()
      });

      return restaurant;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get restaurant by user ID
   */
  async getRestaurantByUserId(userId) {
    try {
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      return restaurant;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get restaurant by ID
   */
  async getRestaurantById(restaurantId) {
    try {
      const restaurant = await RestaurantModel.findById(restaurantId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      return restaurant;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update restaurant profile
   */
  async updateRestaurant(userId, updateData) {
    try {
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      // Don't allow updating approval status through this method
      delete updateData.isApproved;
      delete updateData.approvedBy;
      delete updateData.approvedAt;

      const updatedRestaurant = await RestaurantModel.update(restaurant.id, {
        ...updateData,
        updatedAt: new Date()
      });

      return updatedRestaurant;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all restaurants with pagination and filters
   */
  async getAllRestaurants(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const restaurants = await RestaurantModel.findMany({
        offset,
        limit,
        ...filters
      });

      const total = await RestaurantModel.count(filters);

      return {
        restaurants,
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
   * Find nearby restaurants
   */
  async findNearbyRestaurants(latitude, longitude, radius = 5) {
    try {
      // Get all approved restaurants
      const restaurants = await RestaurantModel.findMany({
        where: { isApproved: true }
      });

      // Filter by distance
      const nearbyRestaurants = restaurants.filter(restaurant => {
        const distance = getDistanceFromLatLonInKm(
          latitude, longitude,
          restaurant.latitude, restaurant.longitude
        );
        return distance <= radius;
      }).map(restaurant => ({
        ...restaurant,
        distance: getDistanceFromLatLonInKm(
          latitude, longitude,
          restaurant.latitude, restaurant.longitude
        )
      })).sort((a, b) => a.distance - b.distance);

      return nearbyRestaurants;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get restaurant food listings
   */
  async getRestaurantFoodListings(userId, page = 1, limit = 10, filters = {}) {
    try {
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const offset = (page - 1) * limit;
      const foodListings = await FoodListingModel.findMany({
        offset,
        limit,
        where: {
          restaurantId: restaurant.id,
          ...filters
        }
      });

      const total = await FoodListingModel.count({
        where: {
          restaurantId: restaurant.id,
          ...filters
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
   * Get restaurant statistics
   */
  async getRestaurantStats(userId) {
    try {
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const [
        totalFoodListings,
        activeFoodListings,
        expiredFoodListings,
        fulfilledRequests
      ] = await Promise.all([
        FoodListingModel.count({ where: { restaurantId: restaurant.id } }),
        FoodListingModel.count({ 
          where: { 
            restaurantId: restaurant.id,
            status: 'AVAILABLE' 
          }
        }),
        FoodListingModel.count({ 
          where: { 
            restaurantId: restaurant.id,
            status: 'EXPIRED' 
          }
        }),
        FoodListingModel.count({ 
          where: { 
            restaurantId: restaurant.id,
            status: 'FULFILLED' 
          }
        })
      ]);

      return {
        totalFoodListings,
        activeFoodListings,
        expiredFoodListings,
        fulfilledRequests,
        restaurant
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete restaurant
   */
  async deleteRestaurant(userId) {
    try {
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      // Check if restaurant has active food listings
      const activeFoodListings = await FoodListingModel.count({
        where: {
          restaurantId: restaurant.id,
          status: 'AVAILABLE'
        }
      });

      if (activeFoodListings > 0) {
        throw new Error('Cannot delete restaurant with active food listings');
      }

      await RestaurantModel.delete(restaurant.id);
      
      return { message: 'Restaurant deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search restaurants by cuisine or name
   */
  async searchRestaurants(query, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const restaurants = await RestaurantModel.findMany({
        offset,
        limit,
        where: {
          isApproved: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { cuisine: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        }
      });

      const total = await RestaurantModel.count({
        where: {
          isApproved: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { cuisine: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        }
      });

      return {
        restaurants,
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
   * Update restaurant operating hours
   */
  async updateOperatingHours(userId, operatingHours) {
    try {
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const updatedRestaurant = await RestaurantModel.update(restaurant.id, {
        operatingHours,
        updatedAt: new Date()
      });

      return updatedRestaurant;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update restaurant contact information
   */
  async updateContactInfo(userId, contactData) {
    try {
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const updatedRestaurant = await RestaurantModel.update(restaurant.id, {
        ...contactData,
        updatedAt: new Date()
      });

      return updatedRestaurant;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle restaurant availability
   */
  async toggleAvailability(userId) {
    try {
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const updatedRestaurant = await RestaurantModel.update(restaurant.id, {
        isActive: !restaurant.isActive,
        updatedAt: new Date()
      });

      return updatedRestaurant;
    } catch (error) {
      throw error;
    }
  }
}

export default new DonorService();
