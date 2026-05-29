/**
 * Analytics API Tests
 * Tests restaurant analytics, NGO analytics, admin analytics, and public leaderboard
 */
import request from 'supertest';
import app from '../src/app.js';

describe('Analytics API', () => {
  let adminToken, ngoToken, restaurantToken;

  beforeAll(async () => {
    // Login all three roles
    const [adminRes, ngoRes, restRes] = await Promise.all([
      request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'testpass123' }),
      request(app).post('/api/auth/login').send({ email: 'ngo@test.com', password: 'testpass123' }),
      request(app).post('/api/auth/login').send({ email: 'restaurant@test.com', password: 'testpass123' }),
    ]);
    adminToken = adminRes.body.data.accessToken;
    ngoToken = ngoRes.body.data.accessToken;
    restaurantToken = restRes.body.data.accessToken;

    // NOTE: No DB fixtures here — setup.js beforeEach clears all transactional
    // tables (foodListing, foodRequest, etc.) before each individual test(),
    // so any data created in beforeAll would be wiped before the tests run.
    // Analytics tests verify response structure and access control only.
  });

  // ── Public leaderboard ────────────────────────────────────────────────────
  describe('GET /api/analytics/public/leaderboard', () => {
    test('should return leaderboard without authentication', async () => {
      const res = await request(app)
        .get('/api/analytics/public/leaderboard')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('topRestaurants');
      expect(res.body.data).toHaveProperty('topNGOs');
      expect(Array.isArray(res.body.data.topRestaurants)).toBe(true);
      expect(Array.isArray(res.body.data.topNGOs)).toBe(true);
    });

    test('top restaurants should have required fields', async () => {
      const res = await request(app)
        .get('/api/analytics/public/leaderboard')
        .expect(200);

      if (res.body.data.topRestaurants.length > 0) {
        const rest = res.body.data.topRestaurants[0];
        expect(rest).toHaveProperty('shopName');
        expect(rest).toHaveProperty('completedRequests');
        expect(rest).toHaveProperty('totalDonations');
      }
    });
  });

  // ── Restaurant analytics ───────────────────────────────────────────────────
  describe('GET /api/analytics/restaurant/:id', () => {
    test('should return restaurant analytics when authenticated', async () => {
      const res = await request(app)
        .get(`/api/analytics/restaurant/${global.testRestaurant.id}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('foodStats');
      expect(res.body.data).toHaveProperty('requestStats');
      expect(res.body.data).toHaveProperty('reviewStats');
      expect(res.body.data).toHaveProperty('recentActivity');
    });

    test('should require authentication', async () => {
      const res = await request(app)
        .get(`/api/analytics/restaurant/${global.testRestaurant.id}`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    test('should return 404 for non-existent restaurant', async () => {
      const res = await request(app)
        .get('/api/analytics/restaurant/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    test('foodStats should include completedRequests field (numeric)', async () => {
      const res = await request(app)
        .get(`/api/analytics/restaurant/${global.testRestaurant.id}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200);

      // beforeEach clears transactional data between tests, so count may be 0.
      // We verify the field exists and is a non-negative number.
      expect(typeof res.body.data.requestStats.completedRequests).toBe('number');
      expect(res.body.data.requestStats.completedRequests).toBeGreaterThanOrEqual(0);
    });
  });

  // ── NGO analytics ─────────────────────────────────────────────────────────
  describe('GET /api/analytics/ngo/:id', () => {
    test('should return NGO analytics when authenticated', async () => {
      const res = await request(app)
        .get(`/api/analytics/ngo/${global.testNgo.id}`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('requestStats');
      expect(res.body.data).toHaveProperty('impactStats');
      expect(res.body.data.impactStats).toHaveProperty('totalFoodReceived');
      expect(res.body.data.impactStats).toHaveProperty('estimatedPeopleFed');
    });

    test('should return 404 for non-existent NGO', async () => {
      const res = await request(app)
        .get('/api/analytics/ngo/999999')
        .set('Authorization', `Bearer ${ngoToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  // ── Admin analytics ───────────────────────────────────────────────────────
  describe('GET /api/analytics/admin', () => {
    test('should return platform-wide analytics for admin', async () => {
      const res = await request(app)
        .get('/api/analytics/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('platformStats');
      expect(res.body.data).toHaveProperty('impactStats');
      expect(res.body.data).toHaveProperty('recentActivity');
      expect(res.body.data.platformStats.totalRestaurants).toBeGreaterThanOrEqual(1);
      expect(res.body.data.platformStats.totalNGOs).toBeGreaterThanOrEqual(1);
    });

    test('should deny access to non-admin users', async () => {
      const res = await request(app)
        .get('/api/analytics/admin')
        .set('Authorization', `Bearer ${ngoToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    test('should deny access without token', async () => {
      const res = await request(app)
        .get('/api/analytics/admin')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
