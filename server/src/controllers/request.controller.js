import requestService from '../services/request.service.js';
import {
  createFoodRequestSchema,
  requestFilterSchema,
  rejectRequestSchema,
  updateStatusSchema,
  idParamSchema,
  paginationSchema
} from '../validations/request.validation.js';
import { responseHelper } from '../helpers/response.helper.js';

class RequestController {
  /**
   * Create food request
   */
  async createFoodRequest(req, res) {
    try {
      const { error, value } = createFoodRequestSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const foodRequest = await requestService.createFoodRequest(req.user.id, value);
      
      return responseHelper.success(res, foodRequest, 'Food request created successfully', 201);
    } catch (error) {
      if (error.message.toLowerCase().includes('pending request')) {
        return responseHelper.validationError(res, error.message);
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get food request by ID
   */
  async getFoodRequestById(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const foodRequest = await requestService.getFoodRequestById(parseInt(value.id, 10));
      
      return responseHelper.success(res, foodRequest, 'Food request retrieved successfully');
    } catch (error) {
      if (error.message === 'Food request not found') {
        return responseHelper.notFound(res, 'Food request not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get NGO food requests
   */
  async getNGOFoodRequests(req, res) {
    try {
      const { error, value } = requestFilterSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { page, limit, ...filters } = value;
      const result = await requestService.getNGOFoodRequests(req.user.id, page, limit, filters);
      const payload = result?.foodRequests || result;
      
      return responseHelper.success(res, payload, 'NGO food requests retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get restaurant food requests
   */
  async getRestaurantFoodRequests(req, res) {
    try {
      const { error, value } = requestFilterSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { page, limit, ...filters } = value;
      const result = await requestService.getRestaurantFoodRequests(req.user.id, page, limit, filters);
      const payload = result?.foodRequests || result;
      
      return responseHelper.success(res, payload, 'Restaurant food requests retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Approve food request (Restaurant)
   */
  async approveFoodRequest(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { error: bodyError, value: bodyValue } = updateStatusSchema.validate(req.body);
      if (bodyError) {
        return responseHelper.validationError(res, bodyError.details[0].message);
      }

      const foodRequest = await requestService.approveFoodRequest(
        req.user.id,
        parseInt(value.id, 10),
        bodyValue.status
      );
      
      return responseHelper.success(res, foodRequest, 'Food request approved successfully');
    } catch (error) {
      if (error.message === 'Food request not found') {
        return responseHelper.notFound(res, 'Food request not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Reject food request (Restaurant)
   */
  async rejectFoodRequest(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error, value } = rejectRequestSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const foodRequest = await requestService.rejectFoodRequest(req.user.id, paramValue.id, value.reason);
      
      return responseHelper.success(res, foodRequest, 'Food request rejected successfully');
    } catch (error) {
      if (error.message === 'Food request not found') {
        return responseHelper.notFound(res, 'Food request not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Cancel food request (NGO)
   */
  async cancelFoodRequest(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const foodRequest = await requestService.cancelFoodRequest(req.user.id, parseInt(value.id, 10));
      
      return responseHelper.success(res, foodRequest, 'Food request cancelled successfully');
    } catch (error) {
      if (error.message === 'Food request not found') {
        return responseHelper.notFound(res, 'Food request not found');
      }
      if (error.message.toLowerCase().includes('cannot be cancelled')) {
        return responseHelper.validationError(res, error.message);
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get all food requests (Admin)
   */
  async getAllFoodRequests(req, res) {
    try {
      const { error, value } = requestFilterSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { page, limit, ...filters } = value;
      const result = await requestService.getAllFoodRequests(page, limit, filters);
      
      return responseHelper.success(res, result, 'Food requests retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get request statistics
   */
  async getRequestStats(req, res) {
    try {
      const stats = await requestService.getRequestStats(req.user.id, req.user.role);
      
      return responseHelper.success(res, stats, 'Request statistics retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Update request status (Admin)
   */
  async updateRequestStatus(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error, value } = updateStatusSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const additionalData = {};
      if (value.reason) {
        if (value.status === 'REJECTED') {
          additionalData.rejectionReason = value.reason;
          additionalData.rejectedAt = new Date();
        } else if (value.status === 'CANCELLED') {
          additionalData.cancelledAt = new Date();
        }
      }

      const foodRequest = await requestService.updateRequestStatus(paramValue.id, value.status, additionalData);
      
      return responseHelper.success(res, foodRequest, 'Request status updated successfully');
    } catch (error) {
      if (error.message === 'Food request not found') {
        return responseHelper.notFound(res, 'Food request not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get pending requests for a specific food listing
   */
  async getPendingRequestsForFood(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const pendingRequests = await requestService.getPendingRequestsForFood(parseInt(value.id, 10));
      
      return responseHelper.success(res, pendingRequests, 'Pending requests retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get urgent requests
   */
  async getUrgentRequests(req, res) {
    try {
      const hours = req.query.hours ? parseInt(req.query.hours) : 24;
      
      if (isNaN(hours) || hours < 1 || hours > 168) {
        return responseHelper.validationError(res, 'Hours must be a number between 1 and 168');
      }

      const urgentRequests = await requestService.getUrgentRequests(hours);
      
      return responseHelper.success(res, urgentRequests, `Urgent requests (expiring in ${hours} hours) retrieved successfully`);
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }
}

export default new RequestController();
