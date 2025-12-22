import pickupService from '../services/pickup.service.js';
import {
  initiatePickupSchema,
  verifyQRCodeSchema,
  completePickupSchema,
  cancelPickupSchema,
  pickupFilterSchema,
  updatePickupStatusSchema,
  generateReportSchema,
  idParamSchema,
  paginationSchema
} from '../validations/pickup.validation.js';
import { responseHelper } from '../helpers/response.helper.js';

class PickupController {
  /**
   * Initiate pickup process
   */
  async initiatePickup(req, res) {
    try {
      const { error, value } = initiatePickupSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const pickup = await pickupService.initiatePickup(value.requestId, req.user.id, req.user.role);
      
      return responseHelper.success(res, pickup, 'Pickup initiated successfully', 201);
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Verify QR code for pickup
   */
  async verifyQRCode(req, res) {
    try {
      const { error, value } = verifyQRCodeSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const result = await pickupService.verifyQRCodeForPickup(value.qrCodeData, req.user.id, req.user.role);
      
      return responseHelper.success(res, result, 'QR code verified successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Complete pickup
   */
  async completePickup(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error, value } = completePickupSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const pickup = await pickupService.completePickup(
        paramValue.id, 
        req.user.id, 
        req.user.role, 
        value.completionNotes
      );
      
      return responseHelper.success(res, pickup, 'Pickup completed successfully');
    } catch (error) {
      if (error.message === 'Pickup log not found') {
        return responseHelper.notFound(res, 'Pickup not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Cancel pickup
   */
  async cancelPickup(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error, value } = cancelPickupSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const pickup = await pickupService.cancelPickup(
        paramValue.id, 
        req.user.id, 
        req.user.role, 
        value.cancellationReason
      );
      
      return responseHelper.success(res, pickup, 'Pickup cancelled successfully');
    } catch (error) {
      if (error.message === 'Pickup log not found') {
        return responseHelper.notFound(res, 'Pickup not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get pickup by ID
   */
  async getPickupById(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const pickup = await pickupService.getPickupById(parseInt(value.id, 10));
      
      return responseHelper.success(res, pickup, 'Pickup retrieved successfully');
    } catch (error) {
      if (error.message === 'Pickup log not found') {
        return responseHelper.notFound(res, 'Pickup not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get pickup by request ID
   */
  async getPickupByRequestId(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const pickup = await pickupService.getPickupByRequestId(parseInt(value.id, 10));
      
      if (!pickup) {
        return responseHelper.notFound(res, 'No pickup found for this request');
      }
      
      return responseHelper.success(res, pickup, 'Pickup retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get all pickups
   */
  async getAllPickups(req, res) {
    try {
      const { error, value } = pickupFilterSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { page, limit, ...filters } = value;
      const result = await pickupService.getAllPickups(page, limit, filters);
      
      return responseHelper.success(res, result, 'Pickups retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get user pickups
   */
  async getUserPickups(req, res) {
    try {
      const { error, value } = pickupFilterSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { page, limit, ...filters } = value;
      const result = await pickupService.getUserPickups(req.user.id, req.user.role, page, limit, filters);
      
      return responseHelper.success(res, result, 'User pickups retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get pickup statistics
   */
  async getPickupStats(req, res) {
    try {
      const stats = await pickupService.getPickupStats(req.user.id, req.user.role);
      
      return responseHelper.success(res, stats, 'Pickup statistics retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get pending pickups
   */
  async getPendingPickups(req, res) {
    try {
      const { error, value } = paginationSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { page, limit } = value;
      const result = await pickupService.getPendingPickups(page, limit);
      
      return responseHelper.success(res, result, 'Pending pickups retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get overdue pickups
   */
  async getOverduePickups(req, res) {
    try {
      const hours = req.query.hours ? parseInt(req.query.hours) : 24;
      
      if (isNaN(hours) || hours < 1 || hours > 168) {
        return responseHelper.validationError(res, 'Hours must be a number between 1 and 168');
      }

      const overduePickups = await pickupService.getOverduePickups(hours);
      
      return responseHelper.success(res, overduePickups, `Overdue pickups (${hours} hours) retrieved successfully`);
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Update pickup status (Admin)
   */
  async updatePickupStatus(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error, value } = updatePickupStatusSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const additionalData = {};
      if (value.notes) {
        additionalData.adminNotes = value.notes;
      }

      const pickup = await pickupService.updatePickupStatus(paramValue.id, value.status, additionalData);
      
      return responseHelper.success(res, pickup, 'Pickup status updated successfully');
    } catch (error) {
      if (error.message === 'Pickup log not found') {
        return responseHelper.notFound(res, 'Pickup not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Generate pickup report (Admin)
   */
  async generateReport(req, res) {
    try {
      const { error, value } = generateReportSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { startDate, endDate, ...filters } = value;
      const report = await pickupService.generatePickupReport(startDate, endDate, filters);
      
      return responseHelper.success(res, report, 'Pickup report generated successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }
}

export default new PickupController();
