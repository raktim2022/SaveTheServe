import reviewService from '../services/review.service.js';
import {
  createReviewSchema,
  updateReviewSchema,
  reviewFilterSchema,
  idParamSchema,
  paginationSchema
} from '../validations/review.validation.js';
import { responseHelper } from '../helpers/response.helper.js';
import logger from '../utils/logger.js';

class ReviewController {
  /**
   * Create a new review
   * POST /api/reviews
   */
  async createReview(req, res) {
    try {
      const { error, value } = createReviewSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const review = await reviewService.createReview(req.user.id, value);
      return responseHelper.success(res, review, 'Review created successfully', 201);
    } catch (error) {
      logger.error('Error in createReview controller:', error);
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get review by ID
   * GET /api/reviews/:id
   */
  async getReviewById(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const review = await reviewService.getReviewById(parseInt(value.id, 10));
      return responseHelper.success(res, review, 'Review retrieved successfully');
    } catch (error) {
      logger.error('Error in getReviewById controller:', error);
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get reviews for a restaurant
   * GET /api/reviews/restaurant/:id
   */
  async getRestaurantReviews(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error: queryError, value: queryValue } = paginationSchema.validate(req.query);
      if (queryError) {
        return responseHelper.validationError(res, queryError.details[0].message);
      }

      const result = await reviewService.getRestaurantReviews(
        parseInt(paramValue.id, 10),
        queryValue.page,
        queryValue.limit
      );
      
      return responseHelper.success(res, result, 'Restaurant reviews retrieved successfully');
    } catch (error) {
      logger.error('Error in getRestaurantReviews controller:', error);
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get reviews for an NGO
   * GET /api/reviews/ngo/:id
   */
  async getNgoReviews(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error: queryError, value: queryValue } = paginationSchema.validate(req.query);
      if (queryError) {
        return responseHelper.validationError(res, queryError.details[0].message);
      }

      const result = await reviewService.getNgoReviews(
        parseInt(paramValue.id, 10),
        queryValue.page,
        queryValue.limit
      );
      
      return responseHelper.success(res, result, 'NGO reviews retrieved successfully');
    } catch (error) {
      logger.error('Error in getNgoReviews controller:', error);
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get user's reviews
   * GET /api/reviews/my-reviews
   */
  async getUserReviews(req, res) {
    try {
      const { error, value } = paginationSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const result = await reviewService.getUserReviews(
        req.user.id,
        value.page,
        value.limit
      );
      
      return responseHelper.success(res, result, 'User reviews retrieved successfully');
    } catch (error) {
      logger.error('Error in getUserReviews controller:', error);
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Update a review
   * PUT /api/reviews/:id
   */
  async updateReview(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error: bodyError, value: bodyValue } = updateReviewSchema.validate(req.body);
      if (bodyError) {
        return responseHelper.validationError(res, bodyError.details[0].message);
      }

      const review = await reviewService.updateReview(
        req.user.id,
        parseInt(paramValue.id, 10),
        bodyValue
      );

      return responseHelper.success(res, review, 'Review updated successfully');
    } catch (error) {
      logger.error('Error in updateReview controller:', error);
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Delete a review
   * DELETE /api/reviews/:id
   */
  async deleteReview(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const result = await reviewService.deleteReview(
        req.user.id,
        parseInt(value.id, 10),
        req.user.role
      );

      return responseHelper.success(res, result, 'Review deleted successfully');
    } catch (error) {
      logger.error('Error in deleteReview controller:', error);
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get all reviews (Admin only)
   * GET /api/reviews
   */
  async getAllReviews(req, res) {
    try {
      const { error, value } = reviewFilterSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { page, limit, ...filters } = value;
      const result = await reviewService.getAllReviews(page, limit, filters);

      return responseHelper.success(res, result, 'Reviews retrieved successfully');
    } catch (error) {
      logger.error('Error in getAllReviews controller:', error);
      return responseHelper.error(res, error.message);
    }
  }
}

export default new ReviewController();
