import { ReviewModel, RestaurantModel, NGOModel, UserModel } from '../models/index.js';
import logger from '../utils/logger.js';

class ReviewService {
  /**
   * Create a new review
   */
  async createReview(userId, reviewData) {
    try {
      const { rating, comment, restaurantId, ngoId, foodRequestId } = reviewData;

      // Verify the user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify target exists (restaurant or NGO)
      if (restaurantId) {
        const restaurant = await RestaurantModel.findById(restaurantId);
        if (!restaurant) {
          throw new Error('Restaurant not found');
        }
      }

      if (ngoId) {
        const ngo = await NGOModel.findById(ngoId);
        if (!ngo) {
          throw new Error('NGO not found');
        }
      }

      // Check if user already reviewed this entity
      const existingReview = await ReviewModel.findOne({
        reviewerId: userId,
        ...(restaurantId ? { restaurantId } : {}),
        ...(ngoId ? { ngoId } : {}),
        ...(foodRequestId ? { foodRequestId } : {})
      });

      if (existingReview) {
        throw new Error('You have already reviewed this entity');
      }

      const review = await ReviewModel.create({
        rating,
        comment: comment || null,
        reviewerId: userId,
        reviewerRole: user.role,
        restaurantId: restaurantId || null,
        ngoId: ngoId || null,
        foodRequestId: foodRequestId || null
      });

      logger.info(`✅ Review created by user ${userId} for ${restaurantId ? 'restaurant' : 'NGO'}`);
      return review;
    } catch (error) {
      logger.error('❌ Error creating review:', error);
      throw error;
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId) {
    try {
      const review = await ReviewModel.findById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }
      return review;
    } catch (error) {
      logger.error('❌ Error getting review:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a restaurant
   */
  async getRestaurantReviews(restaurantId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const reviews = await ReviewModel.findMany({
        where: { restaurantId },
        skip: offset,
        take: limit
      });

      const total = await ReviewModel.count({ restaurantId });
      const avgData = await ReviewModel.getRestaurantAverageRating(restaurantId);

      return {
        reviews,
        averageRating: avgData.averageRating,
        totalReviews: total,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('❌ Error getting restaurant reviews:', error);
      throw error;
    }
  }

  /**
   * Get reviews for an NGO
   */
  async getNgoReviews(ngoId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const reviews = await ReviewModel.findMany({
        where: { ngoId },
        skip: offset,
        take: limit
      });

      const total = await ReviewModel.count({ ngoId });
      const avgData = await ReviewModel.getNgoAverageRating(ngoId);

      return {
        reviews,
        averageRating: avgData.averageRating,
        totalReviews: total,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('❌ Error getting NGO reviews:', error);
      throw error;
    }
  }

  /**
   * Get reviews by user (reviews written by the user)
   */
  async getUserReviews(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const reviews = await ReviewModel.findMany({
        where: { reviewerId: userId },
        skip: offset,
        take: limit
      });

      const total = await ReviewModel.count({ reviewerId: userId });

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('❌ Error getting user reviews:', error);
      throw error;
    }
  }

  /**
   * Update a review (only by the reviewer)
   */
  async updateReview(userId, reviewId, updateData) {
    try {
      const review = await ReviewModel.findById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      // Check if the user is the reviewer
      if (review.reviewerId !== userId) {
        throw new Error('You can only update your own reviews');
      }

      const updatedReview = await ReviewModel.update(reviewId, updateData);
      logger.info(`✅ Review ${reviewId} updated by user ${userId}`);
      return updatedReview;
    } catch (error) {
      logger.error('❌ Error updating review:', error);
      throw error;
    }
  }

  /**
   * Delete a review (only by the reviewer or admin)
   */
  async deleteReview(userId, reviewId, userRole) {
    try {
      const review = await ReviewModel.findById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      // Check permissions: only reviewer or admin can delete
      if (review.reviewerId !== userId && userRole !== 'ADMIN') {
        throw new Error('You do not have permission to delete this review');
      }

      await ReviewModel.delete(reviewId);
      logger.info(`✅ Review ${reviewId} deleted by user ${userId}`);
      return { message: 'Review deleted successfully' };
    } catch (error) {
      logger.error('❌ Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Get all reviews (Admin only)
   */
  async getAllReviews(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = {};

      if (filters.restaurantId) where.restaurantId = filters.restaurantId;
      if (filters.ngoId) where.ngoId = filters.ngoId;
      if (filters.rating) where.rating = filters.rating;
      if (filters.reviewerId) where.reviewerId = filters.reviewerId;

      const reviews = await ReviewModel.findMany({
        where,
        skip: offset,
        take: limit
      });

      const total = await ReviewModel.count(where);

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('❌ Error getting all reviews:', error);
      throw error;
    }
  }
}

export default new ReviewService();
