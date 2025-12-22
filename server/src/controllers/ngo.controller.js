import { NGOService } from '../services/ngo.service.js';
import { validationResult } from 'express-validator';

const ngoService = new NGOService();

export class NGOController {

  /**
   * Register a new NGO profile
   * POST /api/ngos
   */
  async registerNGO(req, res, next) {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = req.user.id;
      const ngoData = req.body;

      const ngo = await ngoService.registerNGO(userId, ngoData);

      res.status(201).json({
        success: true,
        message: 'NGO profile created successfully',
        data: ngo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's NGO profile
   * GET /api/ngos/profile
   */
  async getCurrentNGOProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const ngo = await ngoService.getNGOByUserId(userId);

      res.json({
        success: true,
        data: ngo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get NGO by ID
   * GET /api/ngos/:id
   */
  async getNGOById(req, res, next) {
    try {
      const { id } = req.params;
      const ngo = await ngoService.getNGOById(parseInt(id));

      res.json({
        success: true,
        data: ngo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update NGO profile
   * PUT /api/ngos/:id
   */
  async updateNGO(req, res, next) {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Allow admins to update any NGO, others can only update their own
      const allowUpdate = userRole === 'ADMIN' ? null : userId;
      
      const updatedNGO = await ngoService.updateNGO(parseInt(id), updateData, allowUpdate);

      res.json({
        success: true,
        message: 'NGO profile updated successfully',
        data: updatedNGO,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete NGO profile
   * DELETE /api/ngos/:id
   */
  async deleteNGO(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Allow admins to delete any NGO, others can only delete their own
      const allowDelete = userRole === 'ADMIN' ? null : userId;

      const result = await ngoService.deleteNGO(parseInt(id), allowDelete);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all NGOs with pagination and filters
   * GET /api/ngos
   */
  async getAllNGOs(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        coverageRadius,
        latitude,
        longitude,
      } = req.query;

      let filters = {};
      
      // Add search filter
      if (search) {
        filters.ngoName = {
          contains: search,
          mode: 'insensitive',
        };
      }

      // Add coverage radius filter
      if (coverageRadius) {
        filters.coverageRadiusKm = {
          gte: parseFloat(coverageRadius),
        };
      }

      const result = await ngoService.getAllNGOs(page, limit, filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Find NGOs by service area
   * GET /api/ngos/service-area
   */
  async getNGOsByServiceArea(req, res, next) {
    try {
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required',
        });
      }

      const ngos = await ngoService.findNGOsByServiceArea(
        parseFloat(latitude),
        parseFloat(longitude)
      );

      res.json({
        success: true,
        data: ngos,
        count: ngos.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get NGO's food requests
   * GET /api/ngos/:id/requests
   */
  async getNGORequests(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check authorization - NGO can only see their own requests, admins can see all
      if (userRole !== 'ADMIN') {
        const ngo = await ngoService.getNGOById(parseInt(id));
        if (ngo.userId !== userId) {
          return res.status(403).json({
            success: false,
            message: 'Unauthorized to view these requests',
          });
        }
      }

      const result = await ngoService.getNGORequests(parseInt(id), page, limit, status);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a food request
   * POST /api/ngos/:id/requests
   */
  async createFoodRequest(req, res, next) {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { foodListingId } = req.body;
      const userId = req.user.id;

      const request = await ngoService.createFoodRequest(
        parseInt(id),
        parseInt(foodListingId),
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Food request created successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get NGO dashboard statistics
   * GET /api/ngos/:id/stats
   */
  async getNGOStats(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check authorization - NGO can only see their own stats, admins can see all
      if (userRole !== 'ADMIN') {
        const ngo = await ngoService.getNGOById(parseInt(id));
        if (ngo.userId !== userId) {
          return res.status(403).json({
            success: false,
            message: 'Unauthorized to view these statistics',
          });
        }
      }

      const stats = await ngoService.getNGOStats(parseInt(id));

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get NGOs with capacity information for a specific area
   * GET /api/ngos/capacity
   */
  async getNGOsWithCapacity(req, res, next) {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required',
        });
      }

      const ngos = await ngoService.getNGOsWithCapacity(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );

      res.json({
        success: true,
        data: ngos,
        count: ngos.length,
        searchArea: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radiusKm: parseFloat(radius),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search NGOs by name or location
   * GET /api/ngos/search
   */
  async searchNGOs(req, res, next) {
    try {
      const {
        q: searchTerm,
        latitude,
        longitude,
        radius = 25,
        page = 1,
        limit = 10,
      } = req.query;

      if (!searchTerm && (!latitude || !longitude)) {
        return res.status(400).json({
          success: false,
          message: 'Either search term or coordinates are required',
        });
      }

      let filters = {};
      let searchResults;

      if (searchTerm) {
        filters = {
          OR: [
            {
              ngoName: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              address: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        };
        
        const result = await ngoService.getAllNGOs(page, limit, filters);
        searchResults = result.data;
      }

      // If coordinates provided, also search by location
      if (latitude && longitude) {
        const locationResults = await ngoService.getNGOsWithCapacity(
          parseFloat(latitude),
          parseFloat(longitude),
          parseFloat(radius)
        );

        if (searchTerm) {
          // Merge results and remove duplicates
          const combinedResults = [...searchResults, ...locationResults];
          const uniqueResults = combinedResults.filter((ngo, index, self) =>
            index === self.findIndex(n => n.id === ngo.id)
          );
          searchResults = uniqueResults;
        } else {
          searchResults = locationResults;
        }
      }

      res.json({
        success: true,
        data: searchResults,
        count: searchResults.length,
        searchParams: {
          searchTerm: searchTerm || null,
          location: latitude && longitude ? { latitude, longitude, radius } : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Create controller instance
export const ngoController = new NGOController();
