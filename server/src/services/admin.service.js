import { AdminModel, UserModel, NGOModel, RestaurantModel } from '../models/index.js';
import bcrypt from 'bcryptjs';

class AdminService {
  /**
   * Create admin
   */
  async createAdmin(adminData) {
    try {
      const { userId } = adminData;

      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user role is ADMIN
      if (user.role !== 'ADMIN') {
        throw new Error('User role must be ADMIN');
      }

      // Check if admin already exists
      const existingAdmin = await AdminModel.findByUserId(userId);
      if (existingAdmin) {
        throw new Error('Admin already exists for this user');
      }

      const admin = await AdminModel.create(adminData);
      return admin;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all admins
   */
  async getAllAdmins(page = 1, limit = 10, search = '') {
    try {
      const offset = (page - 1) * limit;
      const admins = await AdminModel.findMany({
        offset,
        limit,
        search
      });

      const total = await AdminModel.count({ search });
      
      return {
        admins,
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
   * Get admin by ID
   */
  async getAdminById(adminId) {
    try {
      const admin = await AdminModel.findById(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }
      return admin;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get admin by user ID
   */
  async getAdminByUserId(userId) {
    try {
      const admin = await AdminModel.findByUserId(userId);
      if (!admin) {
        throw new Error('Admin not found');
      }
      return admin;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update admin
   */
  async updateAdmin(adminId, updateData) {
    try {
      const admin = await AdminModel.findById(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      const updatedAdmin = await AdminModel.update(adminId, updateData);
      return updatedAdmin;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete admin
   */
  async deleteAdmin(adminId) {
    try {
      const admin = await AdminModel.findById(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      await AdminModel.delete(adminId);
      return { message: 'Admin deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users for admin management
   */
  async getAllUsers(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const users = await UserModel.findMany({
        offset,
        limit,
        ...filters
      });

      const total = await UserModel.count(filters);
      
      return {
        users,
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
   * Approve NGO registration
   */
  async approveNGO(ngoId, adminId) {
    try {
      const ngo = await NGOModel.findById(ngoId);
      if (!ngo) {
        throw new Error('NGO not found');
      }

      if (ngo.isApproved) {
        throw new Error('NGO is already approved');
      }

      const approvedNGO = await NGOModel.update(ngoId, {
        isApproved: true,
        approvedBy: adminId,
        approvedAt: new Date()
      });

      return approvedNGO;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reject NGO registration
   */
  async rejectNGO(ngoId, adminId, reason) {
    try {
      const ngo = await NGOModel.findById(ngoId);
      if (!ngo) {
        throw new Error('NGO not found');
      }

      const rejectedNGO = await NGOModel.update(ngoId, {
        isApproved: false,
        rejectionReason: reason,
        rejectedBy: adminId,
        rejectedAt: new Date()
      });

      return rejectedNGO;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Approve Restaurant
   */
  async approveRestaurant(restaurantId, adminId) {
    try {
      const restaurant = await RestaurantModel.findById(restaurantId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      if (restaurant.isApproved) {
        throw new Error('Restaurant is already approved');
      }

      const approvedRestaurant = await RestaurantModel.update(restaurantId, {
        isApproved: true,
        approvedBy: adminId,
        approvedAt: new Date()
      });

      return approvedRestaurant;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reject Restaurant
   */
  async rejectRestaurant(restaurantId, adminId, reason) {
    try {
      const restaurant = await RestaurantModel.findById(restaurantId);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const rejectedRestaurant = await RestaurantModel.update(restaurantId, {
        isApproved: false,
        rejectionReason: reason,
        rejectedBy: adminId,
        rejectedAt: new Date()
      });

      return rejectedRestaurant;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pending approvals (NGOs and Restaurants)
   */
  async getPendingApprovals() {
    try {
      const pendingNGOs = await NGOModel.findMany({
        where: { isApproved: null }
      });

      const pendingRestaurants = await RestaurantModel.findMany({
        where: { isApproved: null }
      });

      return {
        pendingNGOs,
        pendingRestaurants,
        totalPending: pendingNGOs.length + pendingRestaurants.length
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const [
        totalUsers,
        totalNGOs,
        totalRestaurants,
        approvedNGOs,
        approvedRestaurants,
        pendingNGOs,
        pendingRestaurants
      ] = await Promise.all([
        UserModel.count(),
        NGOModel.count(),
        RestaurantModel.count(),
        NGOModel.count({ where: { isApproved: true } }),
        RestaurantModel.count({ where: { isApproved: true } }),
        NGOModel.count({ where: { isApproved: null } }),
        RestaurantModel.count({ where: { isApproved: null } })
      ]);

      return {
        totalUsers,
        totalNGOs,
        totalRestaurants,
        approvedNGOs,
        approvedRestaurants,
        pendingNGOs,
        pendingRestaurants,
        totalPendingApprovals: pendingNGOs + pendingRestaurants
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Suspend user
   */
  async suspendUser(userId, adminId, reason) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role === 'ADMIN') {
        throw new Error('Cannot suspend admin users');
      }

      const suspendedUser = await UserModel.update(userId, {
        isActive: false,
        suspendedBy: adminId,
        suspendedAt: new Date(),
        suspensionReason: reason
      });

      return suspendedUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reactivate user
   */
  async reactivateUser(userId, adminId) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const reactivatedUser = await UserModel.update(userId, {
        isActive: true,
        reactivatedBy: adminId,
        reactivatedAt: new Date(),
        suspensionReason: null
      });

      return reactivatedUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password (admin override)
   */
  async changeUserPassword(userId, newPassword) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      const updatedUser = await UserModel.update(userId, {
        password: hashedPassword,
        passwordChangedAt: new Date()
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  }
}

export default new AdminService();