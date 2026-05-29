import analyticsService from '../services/analytics.service.js';
import { idParamSchema, leaderboardSchema } from '../validations/analytics.validation.js';
import { responseHelper } from '../helpers/response.helper.js';
import logger from '../utils/logger.js';

class AnalyticsController {
  /**
   * Get restaurant analytics
   * GET /api/analytics/restaurant/:id
   */
  async getRestaurantAnalytics(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const analytics = await analyticsService.getRestaurantAnalytics(parseInt(value.id, 10));
      return responseHelper.success(res, analytics, 'Restaurant analytics retrieved successfully');
    } catch (error) {
      logger.error('❌ Error getting restaurant analytics:', error.message);
      if (error.message.toLowerCase().includes('not found')) {
        return responseHelper.notFound(res, error.message);
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get NGO analytics
   * GET /api/analytics/ngo/:id
   */
  async getNGOAnalytics(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const analytics = await analyticsService.getNGOAnalytics(parseInt(value.id, 10));
      return responseHelper.success(res, analytics, 'NGO analytics retrieved successfully');
    } catch (error) {
      logger.error('❌ Error getting NGO analytics:', error.message);
      if (error.message.toLowerCase().includes('not found')) {
        return responseHelper.notFound(res, error.message);
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get admin analytics (system-wide)
   * GET /api/analytics/admin
   */
  async getAdminAnalytics(req, res) {
    try {
      const analytics = await analyticsService.getAdminAnalytics();
      return responseHelper.success(res, analytics, 'Admin analytics retrieved successfully');
    } catch (error) {
      logger.error('Error in getAdminAnalytics controller:', error);
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get public leaderboard
   * GET /api/analytics/public/leaderboard
   */
  async getPublicLeaderboard(req, res) {
    try {
      const { error, value } = leaderboardSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const leaderboard = await analyticsService.getPublicLeaderboard(value.limit);
      return responseHelper.success(res, leaderboard, 'Leaderboard retrieved successfully');
    } catch (error) {
      logger.error('Error in getPublicLeaderboard controller:', error);
      return responseHelper.error(res, error.message);
    }
  }
}

export default new AnalyticsController();
