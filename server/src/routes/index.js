import { Router } from 'express';

// Import route modules
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import userRoutes from './user.routes.js';
import ngoRoutes from './ngo.routes.js';
import donorRoutes from './donor.routes.js';
import foodRoutes from './food.routes.js';
import requestRoutes from './request.routes.js';
import pickupRoutes from './pickup.routes.js';
import volunteerRoutes from './volunteer.routes.js';
import reviewRoutes from './review.routes.js';
import analyticsRoutes from './analytics.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SaveTheServe API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SaveTheServe API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      ngos: '/api/ngos',
      restaurants: '/api/restaurants',
      food: '/api/food',
      requests: '/api/requests',
      pickups: '/api/pickups',
      reviews: '/api/reviews',
      analytics: '/api/analytics',
      health: '/api/health'
    },
    documentation: '/api/docs'
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes); // User profile management
router.use('/admin/users', adminRoutes); // Admin user management // Users route points to admin for now
router.use('/ngos', ngoRoutes);
router.use('/restaurants', donorRoutes);
router.use('/food', foodRoutes);
router.use('/requests', requestRoutes);
router.use('/pickups', pickupRoutes);
router.use('/volunteers', volunteerRoutes);
router.use('/reviews', reviewRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'SaveTheServe API Documentation',
    endpoints: {
      authentication: {
        base: '/api/auth',
        endpoints: [
          'POST /register - Register new user',
          'POST /login - User login',
          'POST /logout - User logout',
          'POST /refresh-token - Refresh access token',
          'POST /verify-email - Verify email address',
          'POST /forgot-password - Request password reset',
          'POST /reset-password - Reset password with token',
          'GET /profile - Get user profile',
          'PUT /profile - Update user profile',
          'POST /change-password - Change password'
        ]
      },
      admin: {
        base: '/api/admin',
        description: 'Admin management endpoints (ADMIN role required)',
        endpoints: [
          'GET / - Get all admins',
          'POST / - Create admin',
          'GET /profile - Get admin profile',
          'GET /users/all - Get all users',
          'GET /approvals/pending - Get pending approvals',
          'PATCH /ngos/:id/approve - Approve NGO',
          'PATCH /restaurants/:id/approve - Approve restaurant',
          'GET /dashboard/stats - Get dashboard statistics'
        ]
      },
      ngo: {
        base: '/api/ngos',
        description: 'NGO management endpoints',
        endpoints: [
          'GET / - Get all NGOs (public)',
          'GET /search - Search NGOs (public)',
          'GET /nearby - Find nearby NGOs (public)',
          'POST /register - Register NGO (authenticated)',
          'GET /profile/me - Get NGO profile (NGO role)',
          'PUT /profile/me - Update NGO profile (NGO role)'
        ]
      },
      restaurants: {
        base: '/api/restaurants',
        description: 'Restaurant/Donor management endpoints',
        endpoints: [
          'GET / - Get all restaurants (public)',
          'GET /search - Search restaurants (public)',
          'GET /nearby - Find nearby restaurants (public)',
          'POST /register - Register restaurant (authenticated)',
          'GET /profile/me - Get restaurant profile (RESTAURANT role)',
          'PUT /profile/me - Update restaurant profile (RESTAURANT role)'
        ]
      },
      food: {
        base: '/api/food',
        description: 'Food listing management endpoints',
        endpoints: [
          'GET / - Get all food listings (public)',
          'GET /search - Search food listings (public)',
          'GET /nearby - Find nearby food (public)',
          'POST /create - Create food listing (RESTAURANT role)',
          'PUT /:id/update - Update food listing (RESTAURANT role)',
          'DELETE /:id/delete - Delete food listing (RESTAURANT role)'
        ]
      },
      requests: {
        base: '/api/requests',
        description: 'Food request management endpoints',
        endpoints: [
          'POST /ngo/create - Create food request (NGO role)',
          'GET /ngo/my-requests - Get NGO requests (NGO role)',
          'GET /restaurant/received - Get restaurant requests (RESTAURANT role)',
          'PATCH /restaurant/:id/approve - Approve request (RESTAURANT role)',
          'GET /admin/all - Get all requests (ADMIN role)'
        ]
      },
      pickups: {
        base: '/api/pickups',
        description: 'Pickup management endpoints',
        endpoints: [
          'POST /initiate - Initiate pickup',
          'POST /verify-qr - Verify QR code',
          'PATCH /:id/complete - Complete pickup',
          'GET /my/pickups - Get user pickups',
          'GET /admin/all - Get all pickups (ADMIN role)'
        ]
      },
      reviews: {
        base: '/api/reviews',
        description: 'Review management endpoints',
        endpoints: [
          'POST / - Create review (authenticated)',
          'GET /my-reviews - Get user reviews (authenticated)',
          'GET /restaurant/:id - Get restaurant reviews (public)',
          'GET /ngo/:id - Get NGO reviews (public)',
          'GET /:id - Get review by ID (public)',
          'PUT /:id - Update review (reviewer only)',
          'DELETE /:id - Delete review (reviewer or admin)',
          'GET /all - Get all reviews (ADMIN role)'
        ]
      },
      analytics: {
        base: '/api/analytics',
        description: 'Analytics and statistics endpoints',
        endpoints: [
          'GET /restaurant/:id - Get restaurant analytics (authenticated)',
          'GET /ngo/:id - Get NGO analytics (authenticated)',
          'GET /admin - Get admin analytics (ADMIN role)',
          'GET /public/leaderboard - Get public leaderboard (public)'
        ]
      }
    },
    authentication: {
      type: 'Bearer Token (JWT)',
      header: 'Authorization: Bearer <token>',
      roles: ['ADMIN', 'NGO', 'RESTAURANT']
    },
    responses: {
      success: {
        structure: {
          success: true,
          message: 'string',
          data: 'object'
        }
      },
      error: {
        structure: {
          success: false,
          message: 'string',
          error: 'string (optional)'
        }
      }
    }
  });
});

// 404 handler for unknown API endpoints
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      '/api/health',
      '/api/docs',
      '/api/auth/*',
      '/api/admin/*',
      '/api/ngos/*',
      '/api/restaurants/*',
      '/api/food/*',
      '/api/requests/*',
      '/api/pickups/*',
      '/api/reviews/*',
      '/api/analytics/*'
    ]
  });
});

export default router;
