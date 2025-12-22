import { FoodRequestModel, FoodListingModel, NGOModel, RestaurantModel } from '../models/index.js';

class RequestService {
  /**
   * Create food request
   */
  async createFoodRequest(userId, requestData) {
    try {
      const { foodListingId } = requestData;

      // Get NGO by user ID
      const ngo = await NGOModel.findByUserId(userId);
      if (!ngo) {
        throw new Error('NGO profile not found');
      }



      // Check if food listing exists and is available
      const foodListing = await FoodListingModel.findById(foodListingId);
      if (!foodListing) {
        throw new Error('Food listing not found');
      }

      if (foodListing.status !== 'AVAILABLE') {
        throw new Error('Food listing is not available');
      }

      // Check if NGO already has a pending request for this food
      const existingRequest = await FoodRequestModel.findOne({
        where: {
          ngoId: ngo.id,
          foodListingId,
          status: 'PENDING'
        }
      });

      if (existingRequest) {
        throw new Error('You already have a pending request for this food item');
      }

      const foodRequest = await FoodRequestModel.create({
        foodListingId,
        pickupTime: requestData.pickupTime,
        ngoId: ngo.id,
        status: 'PENDING'
      });

      return foodRequest;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get food request by ID
   */
  async getFoodRequestById(requestId) {
    try {
      const foodRequest = await FoodRequestModel.findById(requestId);
      if (!foodRequest) {
        throw new Error('Food request not found');
      }
      return foodRequest;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get NGO food requests
   */
  async getNGOFoodRequests(userId, page = 1, limit = 10, filters = {}) {
    try {
      const ngo = await NGOModel.findByUserId(userId);
      if (!ngo) {
        throw new Error('NGO profile not found');
      }

      const offset = (page - 1) * limit;
      const foodRequests = await FoodRequestModel.findMany({
        offset,
        limit,
        where: {
          ngoId: ngo.id,
          ...filters
        },
        include: {
          foodListing: {
            include: {
              restaurant: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const total = await FoodRequestModel.count({
        where: {
          ngoId: ngo.id,
          ...filters
        }
      });

      return {
        foodRequests,
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
   * Get restaurant food requests
   */
  async getRestaurantFoodRequests(userId, page = 1, limit = 10, filters = {}) {
    try {
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant profile not found');
      }

      const offset = (page - 1) * limit;
      const foodRequests = await FoodRequestModel.findMany({
        offset,
        limit,
        where: {
          foodListing: {
            restaurantId: restaurant.id
          },
          ...filters
        },
        include: {
          ngo: {
            include: {
              user: true
            }
          },
          foodListing: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const total = await FoodRequestModel.count({
        where: {
          foodListing: {
            restaurantId: restaurant.id
          },
          ...filters
        }
      });

      return {
        foodRequests,
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
   * Approve food request (Restaurant)
   */
  async approveFoodRequest(userId, requestId, status) {
    try {
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant profile not found');
      }

      const foodRequest = await FoodRequestModel.findById(requestId);
      if (!foodRequest) {
        throw new Error('Food request not found');
      }

      // Check if the food listing belongs to this restaurant
      const foodListing = await FoodListingModel.findById(foodRequest.foodListingId);
      if (!foodListing || foodListing.restaurantId !== restaurant.id) {
        throw new Error('You can only approve requests for your own food listings');
      }

      if (status === 'ACCEPTED') {
        if (foodRequest.status !== 'PENDING') {
          throw new Error('Food request is not in pending status');
        }

        const acceptedRequest = await FoodRequestModel.update(requestId, {
          status: 'ACCEPTED',
          updatedAt: new Date()
        });

        await FoodListingModel.update(foodListing.id, {
          status: 'REQUESTED',
          updatedAt: new Date()
        });

        return acceptedRequest;
      }

      if (status === 'COMPLETED') {
        if (foodRequest.status !== 'ACCEPTED') {
          throw new Error('Only accepted requests can be completed');
        }

        const completedRequest = await FoodRequestModel.update(requestId, {
          status: 'COMPLETED',
          updatedAt: new Date()
        });

        await FoodListingModel.update(foodListing.id, {
          status: 'PICKED',
          updatedAt: new Date()
        });

        return completedRequest;
      }

      throw new Error('Invalid status update');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reject food request (Restaurant)
   */
  async rejectFoodRequest(userId, requestId, reason) {
    try {
      const restaurant = await RestaurantModel.findByUserId(userId);
      if (!restaurant) {
        throw new Error('Restaurant profile not found');
      }

      const foodRequest = await FoodRequestModel.findById(requestId);
      if (!foodRequest) {
        throw new Error('Food request not found');
      }

      // Check if the food listing belongs to this restaurant
      const foodListing = await FoodListingModel.findById(foodRequest.foodListingId);
      if (!foodListing || foodListing.restaurantId !== restaurant.id) {
        throw new Error('You can only reject requests for your own food listings');
      }

      if (foodRequest.status !== 'PENDING') {
        throw new Error('Food request is not in pending status');
      }

      const rejectedRequest = await FoodRequestModel.update(requestId, {
        status: 'PENDING',
        rejectionReason: reason,
        updatedAt: new Date()
      });

      return rejectedRequest;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel food request (NGO)
   */
  async cancelFoodRequest(userId, requestId) {
    try {
      const ngo = await NGOModel.findByUserId(userId);
      if (!ngo) {
        throw new Error('NGO profile not found');
      }

      const foodRequest = await FoodRequestModel.findById(requestId);
      if (!foodRequest) {
        throw new Error('Food request not found');
      }

      if (foodRequest.ngoId !== ngo.id) {
        throw new Error('You can only cancel your own requests');
      }

      if (foodRequest.status === 'ACCEPTED') {
        throw new Error('Request cannot be cancelled once accepted');
      }

      if (foodRequest.status === 'COMPLETED') {
        throw new Error('Request cannot be cancelled once completed');
      }

      await FoodRequestModel.delete(requestId);

      return { message: 'Request cancelled successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all food requests (Admin)
   */
  async getAllFoodRequests(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const foodRequests = await FoodRequestModel.findMany({
        offset,
        limit,
        where: filters,
        include: {
          ngo: {
            include: {
              user: true
            }
          },
          foodListing: {
            include: {
              restaurant: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const total = await FoodRequestModel.count({ where: filters });

      return {
        foodRequests,
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
   * Get request statistics
   */
  async getRequestStats(userId = null, userRole = null) {
    try {
      let whereCondition = {};

      if (userRole === 'NGO' && userId) {
        const ngo = await NGOModel.findByUserId(userId);
        if (ngo) {
          whereCondition.ngoId = ngo.id;
        }
      } else if (userRole === 'RESTAURANT' && userId) {
        const restaurant = await RestaurantModel.findByUserId(userId);
        if (restaurant) {
          whereCondition.foodListing = {
            restaurantId: restaurant.id
          };
        }
      }

      const [
        totalRequests,
        pendingRequests,
        acceptedRequests,
        completedRequests
      ] = await Promise.all([
        FoodRequestModel.count({ where: whereCondition }),
        FoodRequestModel.count({ where: { ...whereCondition, status: 'PENDING' } }),
        FoodRequestModel.count({ where: { ...whereCondition, status: 'ACCEPTED' } }),
        FoodRequestModel.count({ where: { ...whereCondition, status: 'COMPLETED' } })
      ]);

      return {
        totalRequests,
        pendingRequests,
        acceptedRequests,
        completedRequests
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update request status
   */
  async updateRequestStatus(requestId, status, additionalData = {}) {
    try {
      const foodRequest = await FoodRequestModel.findById(requestId);
      if (!foodRequest) {
        throw new Error('Food request not found');
      }

      const updatedRequest = await FoodRequestModel.update(requestId, {
        status,
        ...additionalData,
        updatedAt: new Date()
      });

      return updatedRequest;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pending requests for a specific food listing
   */
  async getPendingRequestsForFood(foodListingId) {
    try {
      const pendingRequests = await FoodRequestModel.findMany({
        where: {
          foodListingId,
          status: 'PENDING'
        },
        include: {
          ngo: {
            include: {
              user: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc' // First come, first serve
        }
      });

      return pendingRequests;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get urgent requests (expiring soon)
   */
  async getUrgentRequests(hours = 24) {
    try {
      const expiryThreshold = new Date();
      expiryThreshold.setHours(expiryThreshold.getHours() + hours);

      const urgentRequests = await FoodRequestModel.findMany({
        where: {
          status: 'ACCEPTED',
          foodListing: {
            expiryTime: {
              lte: expiryThreshold,
              gte: new Date()
            }
          }
        },
        include: {
          ngo: {
            include: {
              user: true
            }
          },
          foodListing: {
            include: {
              restaurant: true
            }
          }
        },
        orderBy: {
          'foodListing.expiryTime': 'asc'
        }
      });

      return urgentRequests;
    } catch (error) {
      throw error;
    }
  }
}

export default new RequestService();
