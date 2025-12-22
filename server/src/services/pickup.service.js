import { PickupLogModel, FoodRequestModel, FoodListingModel } from '../models/index.js';
import { verifyQRCode } from '../helpers/qr.helper.js';

class PickupService {
  /**
   * Initiate pickup process
   */
  async initiatePickup(requestId, initiatorId, initiatorRole) {
    try {
      // Verify food request exists and is approved
      const foodRequest = await FoodRequestModel.findById(requestId);
      if (!foodRequest) {
        throw new Error('Food request not found');
      }

      if (foodRequest.status !== 'APPROVED') {
        throw new Error('Food request must be approved for pickup');
      }

      // Check if pickup already exists
      const existingPickup = await PickupLogModel.findOne({
        where: { requestId }
      });

      if (existingPickup) {
        throw new Error('Pickup already initiated for this request');
      }

      // Create pickup log
      const pickupLog = await PickupLogModel.create({
        requestId,
        initiatedBy: initiatorId,
        initiatorRole,
        status: 'INITIATED',
        initiatedAt: new Date(),
        createdAt: new Date()
      });

      return pickupLog;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify QR code for pickup
   */
  async verifyQRCodeForPickup(qrCodeData, verifierId, verifierRole) {
    try {
      // Parse and verify QR code
      let parsedData;
      try {
        parsedData = JSON.parse(qrCodeData);
      } catch (err) {
        throw new Error('Invalid QR code format');
      }

      const { requestId, ngoId, foodListingId } = parsedData;

      if (!requestId || !ngoId || !foodListingId) {
        throw new Error('QR code missing required information');
      }

      // Verify food request
      const foodRequest = await FoodRequestModel.findById(requestId);
      if (!foodRequest) {
        throw new Error('Food request not found');
      }

      if (foodRequest.status !== 'APPROVED') {
        throw new Error('Food request not approved for pickup');
      }

      // Verify QR code data matches request
      if (foodRequest.ngoId !== ngoId || foodRequest.foodListingId !== foodListingId) {
        throw new Error('QR code data mismatch');
      }

      // Get or create pickup log
      let pickupLog = await PickupLogModel.findOne({
        where: { requestId }
      });

      if (!pickupLog) {
        pickupLog = await this.initiatePickup(requestId, verifierId, verifierRole);
      }

      // Update pickup log with verification
      const updatedPickup = await PickupLogModel.update(pickupLog.id, {
        verifiedBy: verifierId,
        verifierRole,
        verifiedAt: new Date(),
        status: 'VERIFIED',
        updatedAt: new Date()
      });

      return {
        pickupLog: updatedPickup,
        foodRequest,
        isValid: true
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Complete pickup
   */
  async completePickup(pickupId, completorId, completorRole, completionNotes = null) {
    try {
      const pickupLog = await PickupLogModel.findById(pickupId);
      if (!pickupLog) {
        throw new Error('Pickup log not found');
      }

      if (pickupLog.status === 'COMPLETED') {
        throw new Error('Pickup already completed');
      }

      // Complete the pickup
      const completedPickup = await PickupLogModel.update(pickupId, {
        completedBy: completorId,
        completorRole,
        completedAt: new Date(),
        completionNotes,
        status: 'COMPLETED',
        updatedAt: new Date()
      });

      // Update food request status
      await FoodRequestModel.update(pickupLog.requestId, {
        status: 'COMPLETED',
        completedAt: new Date(),
        updatedAt: new Date()
      });

      return completedPickup;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel pickup
   */
  async cancelPickup(pickupId, cancellerId, cancellerRole, cancellationReason) {
    try {
      const pickupLog = await PickupLogModel.findById(pickupId);
      if (!pickupLog) {
        throw new Error('Pickup log not found');
      }

      if (pickupLog.status === 'COMPLETED') {
        throw new Error('Cannot cancel completed pickup');
      }

      // Cancel the pickup
      const cancelledPickup = await PickupLogModel.update(pickupId, {
        cancelledBy: cancellerId,
        cancellerRole,
        cancelledAt: new Date(),
        cancellationReason,
        status: 'CANCELLED',
        updatedAt: new Date()
      });

      return cancelledPickup;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pickup by ID
   */
  async getPickupById(pickupId) {
    try {
      const pickupLog = await PickupLogModel.findById(pickupId);
      if (!pickupLog) {
        throw new Error('Pickup log not found');
      }
      return pickupLog;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pickup by request ID
   */
  async getPickupByRequestId(requestId) {
    try {
      const pickupLog = await PickupLogModel.findOne({
        where: { requestId },
        include: {
          foodRequest: {
            include: {
              foodListing: {
                include: {
                  restaurant: true
                }
              },
              ngo: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      });

      return pickupLog;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all pickups with filters
   */
  async getAllPickups(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      
      const pickups = await PickupLogModel.findMany({
        offset,
        limit,
        where: filters,
        include: {
          foodRequest: {
            include: {
              foodListing: {
                include: {
                  restaurant: true
                }
              },
              ngo: {
                include: {
                  user: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const total = await PickupLogModel.count({ where: filters });

      return {
        pickups,
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
   * Get user pickups (NGO or Restaurant specific)
   */
  async getUserPickups(userId, userRole, page = 1, limit = 10, filters = {}) {
    try {
      let whereCondition = { ...filters };

      if (userRole === 'NGO') {
        // Get NGO's pickups
        whereCondition.foodRequest = {
          ngo: {
            userId
          }
        };
      } else if (userRole === 'RESTAURANT') {
        // Get Restaurant's pickups
        whereCondition.foodRequest = {
          foodListing: {
            restaurant: {
              userId
            }
          }
        };
      }

      return await this.getAllPickups(page, limit, whereCondition);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pickup statistics
   */
  async getPickupStats(userId = null, userRole = null) {
    try {
      let whereCondition = {};

      if (userRole === 'NGO' && userId) {
        whereCondition.foodRequest = {
          ngo: {
            userId
          }
        };
      } else if (userRole === 'RESTAURANT' && userId) {
        whereCondition.foodRequest = {
          foodListing: {
            restaurant: {
              userId
            }
          }
        };
      }

      const [
        totalPickups,
        initiatedPickups,
        verifiedPickups,
        completedPickups,
        cancelledPickups
      ] = await Promise.all([
        PickupLogModel.count({ where: whereCondition }),
        PickupLogModel.count({ where: { ...whereCondition, status: 'INITIATED' } }),
        PickupLogModel.count({ where: { ...whereCondition, status: 'VERIFIED' } }),
        PickupLogModel.count({ where: { ...whereCondition, status: 'COMPLETED' } }),
        PickupLogModel.count({ where: { ...whereCondition, status: 'CANCELLED' } })
      ]);

      return {
        totalPickups,
        initiatedPickups,
        verifiedPickups,
        completedPickups,
        cancelledPickups
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pending pickups (initiated or verified)
   */
  async getPendingPickups(page = 1, limit = 10) {
    try {
      const filters = {
        status: {
          in: ['INITIATED', 'VERIFIED']
        }
      };

      return await this.getAllPickups(page, limit, filters);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get overdue pickups (verified but not completed within time limit)
   */
  async getOverduePickups(hours = 24) {
    try {
      const overdueThreshold = new Date();
      overdueThreshold.setHours(overdueThreshold.getHours() - hours);

      const overduePickups = await PickupLogModel.findMany({
        where: {
          status: 'VERIFIED',
          verifiedAt: {
            lte: overdueThreshold
          }
        },
        include: {
          foodRequest: {
            include: {
              foodListing: {
                include: {
                  restaurant: true
                }
              },
              ngo: {
                include: {
                  user: true
                }
              }
            }
          }
        },
        orderBy: {
          verifiedAt: 'asc'
        }
      });

      return overduePickups;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update pickup status
   */
  async updatePickupStatus(pickupId, status, additionalData = {}) {
    try {
      const pickupLog = await PickupLogModel.findById(pickupId);
      if (!pickupLog) {
        throw new Error('Pickup log not found');
      }

      const updatedPickup = await PickupLogModel.update(pickupId, {
        status,
        ...additionalData,
        updatedAt: new Date()
      });

      return updatedPickup;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate pickup report
   */
  async generatePickupReport(startDate, endDate, filters = {}) {
    try {
      const reportFilters = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        ...filters
      };

      const pickups = await PickupLogModel.findMany({
        where: reportFilters,
        include: {
          foodRequest: {
            include: {
              foodListing: {
                include: {
                  restaurant: true
                }
              },
              ngo: {
                include: {
                  user: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Calculate statistics
      const stats = {
        totalPickups: pickups.length,
        completedPickups: pickups.filter(p => p.status === 'COMPLETED').length,
        cancelledPickups: pickups.filter(p => p.status === 'CANCELLED').length,
        pendingPickups: pickups.filter(p => ['INITIATED', 'VERIFIED'].includes(p.status)).length,
        avgCompletionTime: 0
      };

      // Calculate average completion time
      const completedPickups = pickups.filter(p => p.status === 'COMPLETED' && p.completedAt && p.initiatedAt);
      if (completedPickups.length > 0) {
        const totalTime = completedPickups.reduce((sum, pickup) => {
          return sum + (new Date(pickup.completedAt) - new Date(pickup.initiatedAt));
        }, 0);
        stats.avgCompletionTime = totalTime / completedPickups.length / (1000 * 60 * 60); // in hours
      }

      return {
        pickups,
        statistics: stats,
        reportPeriod: {
          startDate,
          endDate
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new PickupService();
