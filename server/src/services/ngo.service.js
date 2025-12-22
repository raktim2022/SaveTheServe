import { NGOModel, FoodRequestModel, UserModel } from '../models/index.js';
import { getDistance } from 'geolib';

export class NGOService {
  
  /**
   * Register a new NGO profile
   */
  async registerNGO(userId, ngoData) {
    try {
      // Check if user already has an NGO profile
      const existingNGO = await NGOModel.findByUserId(userId);
      if (existingNGO) {
        throw new Error('User already has an NGO profile');
      }

      // Validate user role
      const user = await UserModel.findById(userId);
      if (!user || user.role !== 'NGO') {
        throw new Error('User must have NGO role to create NGO profile');
      }

      // Create NGO profile
      const ngoProfile = await NGOModel.create({
        userId,
        ...ngoData,
      });

      return ngoProfile;
    } catch (error) {
      throw new Error(`Failed to register NGO: ${error.message}`);
    }
  }

  /**
   * Get NGO profile by user ID
   */
  async getNGOByUserId(userId) {
    try {
      const ngo = await NGOModel.findByUserId(userId);
      if (!ngo) {
        throw new Error('NGO profile not found');
      }
      return ngo;
    } catch (error) {
      throw new Error(`Failed to get NGO profile: ${error.message}`);
    }
  }

  /**
   * Get NGO profile by ID
   */
  async getNGOById(id) {
    try {
      const ngo = await NGOModel.findById(id);
      if (!ngo) {
        throw new Error('NGO not found');
      }
      return ngo;
    } catch (error) {
      throw new Error(`Failed to get NGO: ${error.message}`);
    }
  }

  /**
   * Update NGO profile
   */
  async updateNGO(id, updateData, userId = null) {
    try {
      const ngo = await NGOModel.findById(id);
      if (!ngo) {
        throw new Error('NGO not found');
      }

      // Check ownership if userId provided
      if (userId && ngo.userId !== userId) {
        throw new Error('Unauthorized to update this NGO profile');
      }

      const updatedNGO = await NGOModel.update(id, updateData);
      return updatedNGO;
    } catch (error) {
      throw new Error(`Failed to update NGO: ${error.message}`);
    }
  }

  /**
   * Delete NGO profile
   */
  async deleteNGO(id, userId = null) {
    try {
      const ngo = await NGOModel.findById(id);
      if (!ngo) {
        throw new Error('NGO not found');
      }

      // Check ownership if userId provided
      if (userId && ngo.userId !== userId) {
        throw new Error('Unauthorized to delete this NGO profile');
      }

      await NGOModel.delete(id);
      return { message: 'NGO profile deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete NGO: ${error.message}`);
    }
  }

  /**
   * Get all NGOs with pagination and filters
   */
  async getAllNGOs(page = 1, limit = 10, filters = {}) {
    try {
      const ngos = await NGOModel.findAll(page, limit, filters);
      const total = await NGOModel.count(filters);
      
      return {
        data: ngos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get NGOs: ${error.message}`);
    }
  }

  /**
   * Find NGOs that can service a specific location
   */
  async findNGOsByServiceArea(latitude, longitude) {
    try {
      const allNGOs = await NGOModel.findByServiceArea(latitude, longitude);
      
      // Filter NGOs by coverage radius using exact distance calculation
      const ngoInRange = allNGOs.filter(ngo => {
        const distance = getDistance(
          { latitude, longitude },
          { latitude: parseFloat(ngo.latitude), longitude: parseFloat(ngo.longitude) }
        );
        
        const distanceKm = distance / 1000;
        return distanceKm <= parseFloat(ngo.coverageRadiusKm);
      });

      return ngoInRange.map(ngo => ({
        ...ngo,
        distanceKm: (getDistance(
          { latitude, longitude },
          { latitude: parseFloat(ngo.latitude), longitude: parseFloat(ngo.longitude) }
        ) / 1000).toFixed(2)
      }));
    } catch (error) {
      throw new Error(`Failed to find NGOs by service area: ${error.message}`);
    }
  }

  /**
   * Get NGO's food requests
   */
  async getNGORequests(ngoId, page = 1, limit = 10, status = null) {
    try {
      const filters = {};
      if (status) {
        filters.status = status;
      }

      const requests = await FoodRequestModel.findByNGO(ngoId, page, limit);
      const stats = await FoodRequestModel.getStats(ngoId);
      
      return {
        requests,
        stats,
      };
    } catch (error) {
      throw new Error(`Failed to get NGO requests: ${error.message}`);
    }
  }

  /**
   * Create a food request
   */
  async createFoodRequest(ngoId, foodListingId, userId) {
    try {
      // Verify NGO ownership
      const ngo = await NGOModel.findById(ngoId);
      if (!ngo || ngo.userId !== userId) {
        throw new Error('Unauthorized to create request for this NGO');
      }

      // Check if request already exists for this food listing
      const existingRequests = await FoodRequestModel.findByFoodListing(foodListingId);
      const existingRequest = existingRequests.find(req => req.ngoId === ngoId);
      
      if (existingRequest) {
        throw new Error('Request already exists for this food listing');
      }

      const request = await FoodRequestModel.create({
        ngoId,
        foodListingId,
        status: 'PENDING'
      });

      return request;
    } catch (error) {
      throw new Error(`Failed to create food request: ${error.message}`);
    }
  }

  /**
   * Get NGO dashboard statistics
   */
  async getNGOStats(ngoId) {
    try {
      const stats = await FoodRequestModel.getStats(ngoId);
      
      // Get recent requests
      const recentRequests = await FoodRequestModel.findByNGO(ngoId, 1, 5);
      
      // Calculate success rate
      const successRate = stats.total > 0 
        ? ((stats.completed / stats.total) * 100).toFixed(1)
        : 0;

      return {
        totalRequests: stats.total,
        pendingRequests: stats.pending,
        acceptedRequests: stats.accepted,
        completedRequests: stats.completed,
        successRate: `${successRate}%`,
        recentRequests,
      };
    } catch (error) {
      throw new Error(`Failed to get NGO statistics: ${error.message}`);
    }
  }

  /**
   * Get NGOs serving a specific area with their active capacity
   */
  async getNGOsWithCapacity(latitude, longitude, radiusKm = 10) {
    try {
      const ngosInArea = await this.findNGOsByServiceArea(latitude, longitude);
      
      // Get request stats for each NGO to determine capacity
      const ngosWithCapacity = await Promise.all(
        ngosInArea.map(async (ngo) => {
          const stats = await FoodRequestModel.getStats(ngo.id);
          return {
            ...ngo,
            activeRequests: stats.pending + stats.accepted,
            completionRate: stats.total > 0 
              ? ((stats.completed / stats.total) * 100).toFixed(1)
              : 0,
          };
        })
      );

      return ngosWithCapacity.sort((a, b) => a.distanceKm - b.distanceKm);
    } catch (error) {
      throw new Error(`Failed to get NGOs with capacity: ${error.message}`);
    }
  }
}
