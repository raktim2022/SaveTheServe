import adminService from '../services/admin.service.js';
import { 
  createAdminSchema, 
  updateAdminSchema,
  userFilterSchema,
  approvalDecisionSchema,
  suspendUserSchema,
  changePasswordSchema,
  idParamSchema,
  paginationSchema
} from '../validations/admin.validation.js';
import { responseHelper } from '../helpers/response.helper.js';

class AdminController {
  /**
   * Create admin
   */
  async createAdmin(req, res) {
    try {
      const { error, value } = createAdminSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const admin = await adminService.createAdmin(value);
      
      return responseHelper.success(res, admin, 'Admin created successfully', 201);
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get all admins
   */
  async getAllAdmins(req, res) {
    try {
      const { error, value } = paginationSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { page, limit, search } = value;
      const result = await adminService.getAllAdmins(page, limit, search);
      
      return responseHelper.success(res, result, 'Admins retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get admin by ID
   */
  async getAdminById(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const admin = await adminService.getAdminById(value.id);
      
      return responseHelper.success(res, admin, 'Admin retrieved successfully');
    } catch (error) {
      if (error.message === 'Admin not found') {
        return responseHelper.notFound(res, 'Admin not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get current admin profile
   */
  async getProfile(req, res) {
    try {
      const admin = await adminService.getAdminByUserId(req.user.id);
      
      return responseHelper.success(res, admin, 'Admin profile retrieved successfully');
    } catch (error) {
      if (error.message === 'Admin not found') {
        return responseHelper.notFound(res, 'Admin profile not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Update admin
   */
  async updateAdmin(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error, value } = updateAdminSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const admin = await adminService.updateAdmin(paramValue.id, value);
      
      return responseHelper.success(res, admin, 'Admin updated successfully');
    } catch (error) {
      if (error.message === 'Admin not found') {
        return responseHelper.notFound(res, 'Admin not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Delete admin
   */
  async deleteAdmin(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const result = await adminService.deleteAdmin(value.id);
      
      return responseHelper.success(res, result, 'Admin deleted successfully');
    } catch (error) {
      if (error.message === 'Admin not found') {
        return responseHelper.notFound(res, 'Admin not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(req, res) {
    try {
      const stats = await adminService.getUserStats();
      return responseHelper.success(res, stats, 'User statistics retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(req, res) {
    try {
      const { error, value } = userFilterSchema.validate(req.query);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const { page, limit, ...filters } = value;
      const result = await adminService.getAllUsers(page, limit, filters);
      
      return responseHelper.success(res, result, 'Users retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Approve NGO
   */
  async approveNGO(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      // Get admin ID from current user
      const admin = await adminService.getAdminByUserId(req.user.id);
      
      const ngo = await adminService.approveNGO(value.id, admin.id);
      
      return responseHelper.success(res, ngo, 'NGO approved successfully');
    } catch (error) {
      if (error.message === 'NGO not found') {
        return responseHelper.notFound(res, 'NGO not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Reject NGO
   */
  async rejectNGO(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error, value } = approvalDecisionSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      // Get admin ID from current user
      const admin = await adminService.getAdminByUserId(req.user.id);
      
      const ngo = await adminService.rejectNGO(paramValue.id, admin.id, value.reason);
      
      return responseHelper.success(res, ngo, 'NGO rejected successfully');
    } catch (error) {
      if (error.message === 'NGO not found') {
        return responseHelper.notFound(res, 'NGO not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Approve Restaurant
   */
  async approveRestaurant(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      // Get admin ID from current user
      const admin = await adminService.getAdminByUserId(req.user.id);
      
      const restaurant = await adminService.approveRestaurant(value.id, admin.id);
      
      return responseHelper.success(res, restaurant, 'Restaurant approved successfully');
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        return responseHelper.notFound(res, 'Restaurant not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Reject Restaurant
   */
  async rejectRestaurant(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error, value } = approvalDecisionSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      // Get admin ID from current user
      const admin = await adminService.getAdminByUserId(req.user.id);
      
      const restaurant = await adminService.rejectRestaurant(paramValue.id, admin.id, value.reason);
      
      return responseHelper.success(res, restaurant, 'Restaurant rejected successfully');
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        return responseHelper.notFound(res, 'Restaurant not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get pending approvals
   */
  async getPendingApprovals(req, res) {
    try {
      const result = await adminService.getPendingApprovals();
      
      return responseHelper.success(res, result, 'Pending approvals retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(req, res) {
    try {
      const stats = await adminService.getDashboardStats();
      
      return responseHelper.success(res, stats, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Suspend user
   */
  async suspendUser(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error, value } = suspendUserSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      // Get admin ID from current user
      const admin = await adminService.getAdminByUserId(req.user.id);
      
      const user = await adminService.suspendUser(paramValue.id, admin.id, value.reason);
      
      return responseHelper.success(res, user, 'User suspended successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return responseHelper.notFound(res, 'User not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Reactivate user
   */
  async reactivateUser(req, res) {
    try {
      const { error, value } = idParamSchema.validate(req.params);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      // Get admin ID from current user
      const admin = await adminService.getAdminByUserId(req.user.id);
      
      const user = await adminService.reactivateUser(value.id, admin.id);
      
      return responseHelper.success(res, user, 'User reactivated successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return responseHelper.notFound(res, 'User not found');
      }
      return responseHelper.error(res, error.message);
    }
  }

  /**
   * Change user password
   */
  async changeUserPassword(req, res) {
    try {
      const { error: paramError, value: paramValue } = idParamSchema.validate(req.params);
      if (paramError) {
        return responseHelper.validationError(res, paramError.details[0].message);
      }

      const { error, value } = changePasswordSchema.validate(req.body);
      if (error) {
        return responseHelper.validationError(res, error.details[0].message);
      }

      const result = await adminService.changeUserPassword(paramValue.id, value.newPassword);
      
      return responseHelper.success(res, result, 'Password changed successfully');
    } catch (error) {
      if (error.message === 'User not found') {
        return responseHelper.notFound(res, 'User not found');
      }
      return responseHelper.error(res, error.message);
    }
  }
}

export default new AdminController();
