import { FoodRequestModel, FoodListingModel, NGOModel, RestaurantModel } from '../models/index.js';
import { VolunteerModel } from '../models/Volunteer.model.js';
import EmailService from './email.service.js';
import { generatePickupToken, generatePickupOtp, generateQRCodeDataURL } from '../helpers/qr.helper.js';
import { getPrismaClient } from '../config/db.config.js';
import { emitToUser, emitToRole } from '../sockets/index.js';
import { SOCKET_EVENTS, buildRequestNewPayload, buildRequestStatusPayload, buildVolunteerAssignedPayload } from '../sockets/notification.socket.js';
import logger from '../utils/logger.js';

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

      // Resolve the restaurant's user ID for socket emit.
      // Prefer the data already included in the create response; fall back to
      // the listing we fetched earlier (which already includes restaurant.user).
      let restaurantUserId = foodRequest.foodListing?.restaurant?.user?.id
        ?? foodListing?.restaurant?.user?.id;

      if (!restaurantUserId) {
        // Last-resort: re-fetch the listing with full relations.
        logger.warn(`[Request] restaurantUserId missing after create – re-fetching listing ${foodListingId}`);
        const freshListing = await FoodListingModel.findById(foodListingId);
        restaurantUserId = freshListing?.restaurant?.user?.id;
      }

      logger.info(`[Request] New request id=${foodRequest.id} foodListing=${foodListingId} ngo=${ngo.id} → notifying restaurantUser=${restaurantUserId ?? 'NOT_FOUND'}`);

      if (restaurantUserId) {
        emitToUser(restaurantUserId, SOCKET_EVENTS.REQUEST_NEW, buildRequestNewPayload(foodRequest));
      } else {
        logger.error(`[Request] Could not resolve restaurantUserId for foodListing ${foodListingId} – real-time notify skipped`);
      }

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

        // Notify the NGO their request was accepted
        const ngoUserId = foodRequest.ngo?.user?.id;
        if (ngoUserId) {
          emitToUser(ngoUserId, SOCKET_EVENTS.REQUEST_STATUS_CHANGED,
            buildRequestStatusPayload(requestId, 'ACCEPTED', foodRequest.foodListingId));
        }
        // Notify all NGOs the food is now taken
        emitToRole('NGO', SOCKET_EVENTS.FOOD_STATUS_CHANGED, {
          type: SOCKET_EVENTS.FOOD_STATUS_CHANGED,
          data: { id: foodListing.id, status: 'REQUESTED' },
          timestamp: new Date().toISOString(),
        });
        // Notify the restaurant user (donor) their own listing changed status
        emitToUser(userId, SOCKET_EVENTS.FOOD_STATUS_CHANGED, {
          type: SOCKET_EVENTS.FOOD_STATUS_CHANGED,
          data: { id: foodListing.id, status: 'REQUESTED' },
          timestamp: new Date().toISOString(),
        });

        return acceptedRequest;
      }

      if (status === 'REJECTED') {
        if (foodRequest.status !== 'PENDING') {
          throw new Error('Only pending requests can be rejected');
        }

        const rejectedRequest = await FoodRequestModel.update(requestId, {
          status: 'REJECTED',
          updatedAt: new Date()
        });

        // Notify the NGO their request was rejected
        const ngoUserId = foodRequest.ngo?.user?.id;
        if (ngoUserId) {
          emitToUser(ngoUserId, SOCKET_EVENTS.REQUEST_STATUS_CHANGED,
            buildRequestStatusPayload(requestId, 'REJECTED', foodRequest.foodListingId));
        }

        return rejectedRequest;
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

        // Notify the NGO their pickup is complete
        const ngoUserId = foodRequest.ngo?.user?.id;
        if (ngoUserId) {
          emitToUser(ngoUserId, SOCKET_EVENTS.REQUEST_STATUS_CHANGED,
            buildRequestStatusPayload(requestId, 'COMPLETED', foodRequest.foodListingId));
        }
        // Notify all NGOs the food is fully picked
        emitToRole('NGO', SOCKET_EVENTS.FOOD_STATUS_CHANGED, {
          type: SOCKET_EVENTS.FOOD_STATUS_CHANGED,
          data: { id: foodListing.id, status: 'PICKED' },
          timestamp: new Date().toISOString(),
        });
        // Notify the restaurant user (donor) their own listing changed status
        emitToUser(userId, SOCKET_EVENTS.FOOD_STATUS_CHANGED, {
          type: SOCKET_EVENTS.FOOD_STATUS_CHANGED,
          data: { id: foodListing.id, status: 'PICKED' },
          timestamp: new Date().toISOString(),
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
        status: 'REJECTED',
        rejectionReason: reason,
        updatedAt: new Date()
      });

      // Notify the NGO their request was rejected
      const ngoUserId = foodRequest.ngo?.user?.id;
      if (ngoUserId) {
        emitToUser(ngoUserId, SOCKET_EVENTS.REQUEST_STATUS_CHANGED,
          buildRequestStatusPayload(requestId, 'REJECTED', foodRequest.foodListingId));
      }

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

      // Notify the restaurant their request was cancelled
      const restaurantUserId = foodRequest.foodListing?.restaurant?.user?.id;
      if (restaurantUserId) {
        emitToUser(restaurantUserId, SOCKET_EVENTS.REQUEST_STATUS_CHANGED,
          buildRequestStatusPayload(requestId, 'CANCELLED', foodRequest.foodListingId));
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
  /**
   * Assign a volunteer to an accepted food request (NGO)
   * Generates QR token + OTP, emails both parties
   */
  async assignVolunteer(ngoUserId, requestId, volunteerId) {
    const prisma = getPrismaClient();
    const ngo = await NGOModel.findByUserId(ngoUserId);
    if (!ngo) throw new Error('NGO profile not found');

    const foodRequest = await FoodRequestModel.findById(requestId);
    if (!foodRequest) throw new Error('Food request not found');
    if (foodRequest.ngoId !== ngo.id) throw new Error('This request does not belong to your NGO');
    if (foodRequest.status !== 'ACCEPTED') throw new Error('Only accepted requests can have a volunteer assigned');

    const volunteer = await VolunteerModel.findById(volunteerId);
    if (!volunteer) throw new Error('Volunteer not found');
    if (volunteer.ngoId !== ngo.id) throw new Error('Volunteer does not belong to your NGO');
    if (volunteer.status !== 'ACTIVE') throw new Error('Volunteer must be active to be assigned');

    const token = generatePickupToken();
    const otp = generatePickupOtp();
    const qrPayload = { token, requestId, ngoId: ngo.id };
    const qrDataURL = await generateQRCodeDataURL(qrPayload);

    const updated = await prisma.foodRequest.update({
      where: { id: requestId },
      data: {
        assignedVolunteerId: volunteer.id,
        pickupQrToken: token,
        pickupOtp: otp,
        pickupOtpVerified: false,
      },
      include: {
        ngo: { include: { user: true } },
        foodListing: { include: { restaurant: { include: { user: true } } } },
        assignedVolunteer: { include: { user: true } },
        pickupLog: true,
      },
    });

    const foodName = updated.foodListing?.name ?? 'Food pickup';
    const donorShopName = updated.foodListing?.restaurant?.shopName ?? 'Donor';
    const donorAddress = updated.foodListing?.restaurant?.address ?? '';
    const pickupTime = updated.pickupTime ?? null;
    const volunteerEmail = volunteer.user?.email ?? volunteer.email;
    const volunteerName = volunteer.user
      ? `${volunteer.user.firstName ?? ''} ${volunteer.user.lastName ?? ''}`.trim()
      : volunteer.name ?? 'Volunteer';

    // Email the volunteer
    if (volunteerEmail) {
      await EmailService.sendVolunteerPickupAssignment(
        volunteerEmail, volunteerName, foodName, donorShopName, donorAddress, otp, qrDataURL, pickupTime
      ).catch(() => {}); // non-blocking
    }

    // Email the donor
    const donorEmail = updated.foodListing?.restaurant?.user?.email;
    const donorName = updated.foodListing?.restaurant?.user?.firstName ?? donorShopName;
    if (donorEmail) {
      await EmailService.sendDonorPickupNotification(
        donorEmail, donorName, foodName, volunteerName, otp, pickupTime
      ).catch(() => {}); // non-blocking
    }

    // Socket: notify NGO
    const ngoUserId2 = updated.ngo?.user?.id;
    if (ngoUserId2) {
      emitToUser(ngoUserId2, SOCKET_EVENTS.REQUEST_STATUS_CHANGED,
        buildRequestStatusPayload(requestId, 'ACCEPTED', updated.foodListingId));
    }

    // Socket: notify the assigned volunteer
    const volunteerUserId = updated.assignedVolunteer?.user?.id;
    if (volunteerUserId) {
      emitToUser(volunteerUserId, SOCKET_EVENTS.VOLUNTEER_ASSIGNED,
        buildVolunteerAssignedPayload(updated));
    }

    return updated;
  }

  /**
   * Verify pickup OTP or QR token (Restaurant/Donor)
   * Marks request as COMPLETED when verified
   */
  async verifyPickupOtp(restaurantUserId, requestId, { otp, qrToken }) {
    const prisma = getPrismaClient();
    const restaurant = await RestaurantModel.findByUserId(restaurantUserId);
    if (!restaurant) throw new Error('Restaurant profile not found');

    const foodRequest = await FoodRequestModel.findById(requestId);
    if (!foodRequest) throw new Error('Food request not found');
    if (foodRequest.foodListing?.restaurant?.id !== restaurant.id) {
      throw new Error('This request does not belong to your restaurant');
    }
    if (foodRequest.status !== 'ACCEPTED') throw new Error('Request is not in accepted status');
    if (!foodRequest.assignedVolunteerId) throw new Error('No volunteer has been assigned to this request yet');
    if (foodRequest.pickupOtpVerified) throw new Error('Pickup has already been verified');

    if (otp) {
      if (foodRequest.pickupOtp !== otp) throw new Error('Invalid OTP');
    } else if (qrToken) {
      if (foodRequest.pickupQrToken !== qrToken) throw new Error('Invalid QR token');
    } else {
      throw new Error('Provide either an OTP or QR token');
    }

    const completed = await prisma.foodRequest.update({
      where: { id: requestId },
      data: {
        pickupOtpVerified: true,
        status: 'COMPLETED',
      },
      include: {
        ngo: { include: { user: true } },
        foodListing: { include: { restaurant: { include: { user: true } } } },
        assignedVolunteer: { include: { user: true } },
        pickupLog: true,
      },
    });

    // Mark the food listing as PICKED
    await FoodListingModel.update(completed.foodListingId, { status: 'PICKED', updatedAt: new Date() });

    // Notify the NGO
    const ngoUserId = completed.ngo?.user?.id;
    if (ngoUserId) {
      emitToUser(ngoUserId, SOCKET_EVENTS.REQUEST_STATUS_CHANGED,
        buildRequestStatusPayload(requestId, 'COMPLETED', completed.foodListingId));
    }

    // Notify the volunteer that their pickup was confirmed
    const completedVolunteerUserId = completed.assignedVolunteer?.user?.id;
    if (completedVolunteerUserId) {
      emitToUser(completedVolunteerUserId, SOCKET_EVENTS.REQUEST_STATUS_CHANGED,
        buildRequestStatusPayload(requestId, 'COMPLETED', completed.foodListingId));
    }
    // Notify all NGOs and the restaurant that food is now PICKED
    const pickedPayload = {
      type: SOCKET_EVENTS.FOOD_STATUS_CHANGED,
      data: { id: completed.foodListingId, status: 'PICKED' },
      timestamp: new Date().toISOString(),
    };
    emitToRole('NGO', SOCKET_EVENTS.FOOD_STATUS_CHANGED, pickedPayload);
    emitToUser(restaurantUserId, SOCKET_EVENTS.FOOD_STATUS_CHANGED, pickedPayload);

    // Prompt for reviews after successful pickup completion
    // Notify NGO to review the restaurant
    if (ngoUserId && completed.foodListing?.restaurant?.id) {
      emitToUser(ngoUserId, 'review:prompt', {
        type: 'review:prompt',
        message: 'How was your experience with this restaurant? Leave a review!',
        data: {
          requestId: completed.id,
          restaurantId: completed.foodListing.restaurant.id,
          restaurantName: completed.foodListing.restaurant.shopName
        },
        timestamp: new Date().toISOString()
      });
    }

    // Notify Restaurant to review the NGO
    if (restaurantUserId && completed.ngo?.id) {
      emitToUser(restaurantUserId, 'review:prompt', {
        type: 'review:prompt',
        message: 'How was your experience with this NGO? Leave a review!',
        data: {
          requestId: completed.id,
          ngoId: completed.ngo.id,
          ngoName: completed.ngo.ngoName
        },
        timestamp: new Date().toISOString()
      });
    }

    return completed;
  }

  /**
   * Get all pickup assignments for a volunteer
   */
  async getVolunteerPickups(volunteerUserId) {
    const prisma = getPrismaClient();
    const volunteer = await VolunteerModel.findByUserId(volunteerUserId);
    if (!volunteer) throw new Error('Volunteer profile not found');

    return await prisma.foodRequest.findMany({
      where: { assignedVolunteerId: volunteer.id },
      include: {
        ngo: { include: { user: true } },
        foodListing: {
          include: { restaurant: { include: { user: true } } },
        },
        pickupLog: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

}

export default new RequestService();
