/**
 * Full Integration Workflow Test
 *
 * The global beforeEach (setup.js) wipes transactional DB tables between every
 * individual test(). To avoid that breaking a sequential workflow we run the
 * ENTIRE flow inside a single beforeAll and cache every response / DB snapshot
 * in `results`. Individual test() calls just verify those cached values.
 */
import request from 'supertest';
import app from '../src/app.js';

describe('Full Integration Workflow', () => {
  const results = {};

  beforeAll(async () => {
    const [restRes, ngoRes, adminRes] = await Promise.all([
      request(app).post('/api/auth/login').send({ email: 'restaurant@test.com', password: 'testpass123' }),
      request(app).post('/api/auth/login').send({ email: 'ngo@test.com', password: 'testpass123' }),
      request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'testpass123' }),
    ]);
    const restaurantToken = restRes.body.data?.accessToken;
    const ngoToken = ngoRes.body.data?.accessToken;
    const adminToken = adminRes.body.data?.accessToken;
    const prisma = global.getPrismaClient();

    results.createListing = await request(app)
      .post('/api/food/create')
      .set('Authorization', `Bearer ${restaurantToken}`)
      .send({
        foodName: 'Integration Test Biryani',
        description: 'Leftover from wedding banquet',
        category: 'cooked',
        quantity: 80,
        unit: 'kg',
        expiryTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      });

    const listingId = results.createListing.body?.data?.id;
    if (!listingId) return;

    results.createRequest = await request(app)
      .post('/api/requests/create')
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({
        foodListingId: listingId,
        pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      });

    results.notifAfterRequest = await prisma.notification.findMany({
      where: { userId: global.testRestaurantUser.id, type: 'new_request' },
      orderBy: { sentAt: 'desc' },
      take: 1,
    });

    const requestId = results.createRequest.body?.data?.id;
    if (!requestId) return;

    results.acceptRequest = await request(app)
      .put(`/api/requests/${requestId}/status`)
      .set('Authorization', `Bearer ${restaurantToken}`)
      .send({ status: 'ACCEPTED' });

    results.listingAfterAccept = await prisma.foodListing.findUnique({ where: { id: listingId } });

    results.completeRequest = await request(app)
      .put(`/api/requests/${requestId}/status`)
      .set('Authorization', `Bearer ${restaurantToken}`)
      .send({ status: 'COMPLETED' });

    results.listingAfterComplete = await prisma.foodListing.findUnique({ where: { id: listingId } });

    results.createReview = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({
        rating: 5,
        comment: 'Excellent donation - food was fresh and handover seamless!',
        restaurantId: global.testRestaurant.id,
        foodRequestId: requestId,
      });

    [
      results.restaurantAnalytics,
      results.ngoAnalytics,
      results.adminAnalytics,
      results.leaderboard,
    ] = await Promise.all([
      request(app).get(`/api/analytics/restaurant/${global.testRestaurant.id}`).set('Authorization', `Bearer ${restaurantToken}`),
      request(app).get(`/api/analytics/ngo/${global.testNgo.id}`).set('Authorization', `Bearer ${ngoToken}`),
      request(app).get('/api/analytics/admin').set('Authorization', `Bearer ${adminToken}`),
      request(app).get('/api/analytics/public/leaderboard'),
    ]);

    results.health = await request(app).get('/api/health');
  });

  test('Step 1 - food listing created (201 + AVAILABLE)', () => {
    expect(results.createListing?.status).toBe(201);
    expect(results.createListing.body.data.foodName).toBe('Integration Test Biryani');
    expect(results.createListing.body.data.status).toBe('AVAILABLE');
  });

  test('Step 2 - NGO request created (201 + PENDING)', () => {
    expect(results.createRequest?.status).toBe(201);
    expect(results.createRequest.body.data.status).toBe('PENDING');
  });

  test('Step 2 - notification stored in DB for restaurant', () => {
    expect(results.notifAfterRequest?.length).toBeGreaterThan(0);
    expect(results.notifAfterRequest[0].title).toContain('Request');
  });

  test('Step 3 - request accepted (200 + ACCEPTED)', () => {
    expect(results.acceptRequest?.status).toBe(200);
    expect(results.acceptRequest.body.data.status).toBe('ACCEPTED');
  });

  test('Step 3 - listing moves to REQUESTED status', () => {
    expect(results.listingAfterAccept?.status).toBe('REQUESTED');
  });

  test('Step 4 - request completed (200 + COMPLETED)', () => {
    expect(results.completeRequest?.status).toBe(200);
    expect(results.completeRequest.body.data.status).toBe('COMPLETED');
  });

  test('Step 4 - listing marked PICKED after completion', () => {
    expect(results.listingAfterComplete?.status).toBe('PICKED');
  });

  test('Step 5 - review created (201 + rating 5)', () => {
    expect(results.createReview?.status).toBe(201);
    expect(results.createReview.body.data.rating).toBe(5);
    expect(results.createReview.body.data.restaurantId).toBe(global.testRestaurant.id);
  });

  test('Step 6 - restaurant analytics completedRequests >= 1', () => {
    expect(results.restaurantAnalytics?.status).toBe(200);
    expect(results.restaurantAnalytics.body.data.requestStats.completedRequests).toBeGreaterThanOrEqual(1);
  });

  test('Step 6 - NGO analytics totalFoodReceived > 0', () => {
    expect(results.ngoAnalytics?.status).toBe(200);
    expect(results.ngoAnalytics.body.data.impactStats.totalFoodReceived).toBeGreaterThan(0);
    expect(results.ngoAnalytics.body.data.impactStats.estimatedPeopleFed).toBeGreaterThan(0);
  });

  test('Step 6 - admin analytics completedRequests >= 1', () => {
    expect(results.adminAnalytics?.status).toBe(200);
    expect(results.adminAnalytics.body.data.platformStats.completedRequests).toBeGreaterThanOrEqual(1);
    expect(results.adminAnalytics.body.data.impactStats.totalFoodDonated).toBeGreaterThan(0);
  });

  test('Step 6 - public leaderboard includes test restaurant', () => {
    expect(results.leaderboard?.status).toBe(200);
    const found = results.leaderboard.body.data.topRestaurants.find(
      (r) => r.id === global.testRestaurant.id
    );
    expect(found).toBeDefined();
    expect(found.completedRequests).toBeGreaterThanOrEqual(1);
  });

  test('Step 7 - health endpoint returns 200', () => {
    expect(results.health?.status).toBe(200);
    expect(results.health.body.success).toBe(true);
    expect(results.health.body.message).toContain('SaveTheServe');
  });
});
