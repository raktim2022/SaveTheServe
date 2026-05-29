import { 
  RestaurantModel, 
  NGOModel, 
  FoodListingModel, 
  FoodRequestModel, 
  ReviewModel,
  getPrismaClient 
} from '../models/index.js';
import logger from '../utils/logger.js';

class AnalyticsService {
  /**
   * Get restaurant analytics
   */
  async getRestaurantAnalytics(restaurantId) {
    try {
      const prisma = getPrismaClient();
      const restaurant = await RestaurantModel.findById(restaurantId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      // Get food listings stats
      const totalListings = await FoodListingModel.count({
        restaurantId
      });

      const availableListings = await FoodListingModel.count({
        restaurantId,
        status: 'AVAILABLE'
      });

      const pickedListings = await FoodListingModel.count({
        restaurantId,
        status: 'PICKED'
      });

      // Get requests stats through food listings
      const requests = await prisma.foodRequest.findMany({
        where: {
          foodListing: {
            restaurantId
          }
        },
        include: {
          foodListing: true
        }
      });

      const totalRequests = requests.length;
      const acceptedRequests = requests.filter(r => r.status === 'ACCEPTED').length;
      const completedRequests = requests.filter(r => r.status === 'COMPLETED').length;
      const pendingRequests = requests.filter(r => r.status === 'PENDING').length;

      // Calculate total food donated (completed requests only)
      const totalFoodDonated = requests
        .filter(r => r.status === 'COMPLETED')
        .reduce((sum, r) => sum + (r.foodListing?.quantity || 0), 0);

      // Get review stats
      const reviewStats = await ReviewModel.getRestaurantAverageRating(restaurantId);

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentListings = await FoodListingModel.count({
        restaurantId,
        createdAt: {
          gte: sevenDaysAgo
        }
      });

      const recentCompletions = requests.filter(r => 
        r.status === 'COMPLETED' && new Date(r.updatedAt) >= sevenDaysAgo
      ).length;

      return {
        restaurant: {
          id: restaurant.id,
          shopName: restaurant.shopName,
          shopType: restaurant.shopType
        },
        foodStats: {
          totalListings,
          availableListings,
          pickedListings,
          totalFoodDonated
        },
        requestStats: {
          totalRequests,
          pendingRequests,
          acceptedRequests,
          completedRequests
        },
        reviewStats: {
          averageRating: reviewStats.averageRating,
          totalReviews: reviewStats.totalReviews
        },
        recentActivity: {
          listingsLast7Days: recentListings,
          completionsLast7Days: recentCompletions
        }
      };
    } catch (error) {
      logger.error('❌ Error getting restaurant analytics:', error);
      throw error;
    }
  }

  /**
   * Get NGO analytics
   */
  async getNGOAnalytics(ngoId) {
    try {
      const ngo = await NGOModel.findById(ngoId);
      if (!ngo) {
        throw new Error('NGO not found');
      }

      // Get requests stats
      const totalRequests = await FoodRequestModel.count({ ngoId });
      const pendingRequests = await FoodRequestModel.count({ 
        ngoId, 
        status: 'PENDING' 
      });
      const acceptedRequests = await FoodRequestModel.count({ 
        ngoId, 
        status: 'ACCEPTED' 
      });
      const completedRequests = await FoodRequestModel.count({ 
        ngoId, 
        status: 'COMPLETED' 
      });

      // Get completed requests with food details
      const completedReqs = await FoodRequestModel.findMany({
        where: { ngoId, status: 'COMPLETED' },
        include: { foodListing: true }
      });

      // Calculate total food received
      const totalFoodReceived = completedReqs.reduce((sum, r) => 
        sum + (r.foodListing?.quantity || 0), 0
      );

      // Estimate people fed (rough estimate: 1kg feeds 4 people)
      const estimatedPeopleFed = Math.round(totalFoodReceived * 4);

      // Get review stats
      const reviewStats = await ReviewModel.getNgoAverageRating(ngoId);

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentRequests = await FoodRequestModel.count({
        ngoId,
        createdAt: {
          gte: sevenDaysAgo
        }
      });

      const recentCompletions = await FoodRequestModel.count({
        ngoId,
        status: 'COMPLETED',
        updatedAt: {
          gte: sevenDaysAgo
        }
      });

      return {
        ngo: {
          id: ngo.id,
          ngoName: ngo.ngoName
        },
        requestStats: {
          totalRequests,
          pendingRequests,
          acceptedRequests,
          completedRequests
        },
        impactStats: {
          totalFoodReceived,
          estimatedPeopleFed
        },
        reviewStats: {
          averageRating: reviewStats.averageRating,
          totalReviews: reviewStats.totalReviews
        },
        recentActivity: {
          requestsLast7Days: recentRequests,
          completionsLast7Days: recentCompletions
        }
      };
    } catch (error) {
      logger.error('❌ Error getting NGO analytics:', error);
      throw error;
    }
  }

  /**
   * Get admin analytics (system-wide)
   */
  async getAdminAnalytics() {
    try {
      const prisma = getPrismaClient();

      // Get counts
      const [
        totalRestaurants,
        totalNGOs,
        totalFoodListings,
        totalRequests,
        completedRequests,
        totalReviews
      ] = await Promise.all([
        prisma.restaurant.count(),
        prisma.nGO.count(),
        prisma.foodListing.count(),
        prisma.foodRequest.count(),
        prisma.foodRequest.count({ where: { status: 'COMPLETED' } }),
        prisma.review.count()
      ]);

      // Get total food donated
      const completedReqs = await prisma.foodRequest.findMany({
        where: { status: 'COMPLETED' },
        include: { foodListing: true }
      });

      const totalFoodDonated = completedReqs.reduce((sum, r) =>
        sum + (r.foodListing?.quantity || 0), 0
      );

      const estimatedPeopleFed = Math.round(totalFoodDonated * 4);

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentListings = await prisma.foodListing.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      });

      const recentCompletions = await prisma.foodRequest.count({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            gte: thirtyDaysAgo
          }
        }
      });

      const recentReviews = await prisma.review.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      });

      return {
        platformStats: {
          totalRestaurants,
          totalNGOs,
          totalFoodListings,
          totalRequests,
          completedRequests,
          totalReviews
        },
        impactStats: {
          totalFoodDonated,
          estimatedPeopleFed
        },
        recentActivity: {
          listingsLast30Days: recentListings,
          completionsLast30Days: recentCompletions,
          reviewsLast30Days: recentReviews
        }
      };
    } catch (error) {
      logger.error('❌ Error getting admin analytics:', error);
      throw error;
    }
  }

  /**
   * Get public leaderboard
   */
  async getPublicLeaderboard(limit = 10) {
    try {
      const prisma = getPrismaClient();

      // Get top restaurants by completed donations
      const restaurantRequests = await prisma.foodRequest.findMany({
        where: { status: 'COMPLETED' },
        include: {
          foodListing: {
            include: {
              restaurant: true
            }
          }
        }
      });

      // Group by restaurant
      const restaurantMap = {};
      for (const req of restaurantRequests) {
        const restId = req.foodListing?.restaurant?.id;
        if (!restId) continue;

        if (!restaurantMap[restId]) {
          restaurantMap[restId] = {
            id: restId,
            shopName: req.foodListing.restaurant.shopName,
            shopType: req.foodListing.restaurant.shopType,
            totalDonations: 0,
            completedRequests: 0
          };
        }

        restaurantMap[restId].totalDonations += req.foodListing.quantity || 0;
        restaurantMap[restId].completedRequests += 1;
      }

      // Get review stats for each restaurant
      const topRestaurants = await Promise.all(
        Object.values(restaurantMap)
          .sort((a, b) => b.totalDonations - a.totalDonations)
          .slice(0, limit)
          .map(async (rest) => ({
            ...rest,
            reviewStats: await ReviewModel.getRestaurantAverageRating(rest.id)
          }))
      );

      // Get top NGOs by food received
      const ngoRequests = await prisma.foodRequest.findMany({
        where: { status: 'COMPLETED' },
        include: {
          ngo: true,
          foodListing: true
        }
      });

      // Group by NGO
      const ngoMap = {};
      for (const req of ngoRequests) {
        const ngoId = req.ngo?.id;
        if (!ngoId) continue;

        if (!ngoMap[ngoId]) {
          ngoMap[ngoId] = {
            id: ngoId,
            ngoName: req.ngo.ngoName,
            totalFoodReceived: 0,
            completedRequests: 0
          };
        }

        ngoMap[ngoId].totalFoodReceived += req.foodListing?.quantity || 0;
        ngoMap[ngoId].completedRequests += 1;
      }

      // Get review stats for each NGO
      const topNGOs = await Promise.all(
        Object.values(ngoMap)
          .sort((a, b) => b.totalFoodReceived - a.totalFoodReceived)
          .slice(0, limit)
          .map(async (ngo) => ({
            ...ngo,
            estimatedPeopleFed: Math.round(ngo.totalFoodReceived * 4),
            reviewStats: await ReviewModel.getNgoAverageRating(ngo.id)
          }))
      );

      return {
        topRestaurants,
        topNGOs
      };
    } catch (error) {
      logger.error('❌ Error getting public leaderboard:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();
