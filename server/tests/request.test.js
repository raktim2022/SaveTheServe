import request from 'supertest';
import app from '../src/app.js';

describe('Food Request Tests', () => {
  let ngoToken, restaurantToken;
  let testFoodListing, testFoodRequest;

  beforeEach(async () => {
    // Get NGO token
    const ngoLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ngo@test.com',
        password: 'testpass123'
      });
    ngoToken = ngoLogin.body.data.accessToken;

    // Get restaurant token
    const restaurantLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'restaurant@test.com',
        password: 'testpass123'
      });
    restaurantToken = restaurantLogin.body.data.accessToken;

    // Create test food listing
    testFoodListing = await global.prisma.foodListing.create({
      data: {
        restaurantId: global.testRestaurant.id,
        foodName: 'Test Food for Requests',
        quantity: 100,
        expiryTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        status: 'AVAILABLE',
      },
    });
  });

  describe('POST /api/requests/create', () => {
    test('should create food request as NGO', async () => {
      const requestData = {
        foodListingId: testFoodListing.id,
        pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      };

      const response = await request(app)
        .post('/api/requests/create')
        .set('Authorization', `Bearer ${ngoToken}`)
        .send(requestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.foodListingId).toBe(testFoodListing.id);
      expect(response.body.data.ngoId).toBe(global.testNgo.id);
      expect(response.body.data.status).toBe('PENDING');
    });

    test('should not create request as restaurant', async () => {
      const requestData = {
        foodListingId: testFoodListing.id,
        pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/requests/create')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send(requestData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/requests/create')
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should validate pickup time is in future', async () => {
      const requestData = {
        foodListingId: testFoodListing.id,
        pickupTime: new Date(Date.now() - 60 * 60 * 1000).toISOString() // Past time
      };

      const response = await request(app)
        .post('/api/requests/create')
        .set('Authorization', `Bearer ${ngoToken}`)
        .send(requestData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should not create duplicate request for same food listing', async () => {
      // Create first request
      const requestData = {
        foodListingId: testFoodListing.id,
        pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      };

      await request(app)
        .post('/api/requests/create')
        .set('Authorization', `Bearer ${ngoToken}`)
        .send(requestData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/requests/create')
        .set('Authorization', `Bearer ${ngoToken}`)
        .send(requestData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already');
    });
  });

  describe('GET /api/requests/my-requests', () => {
    beforeEach(async () => {
      // Create test request
      testFoodRequest = await global.prisma.foodRequest.create({
        data: {
          ngoId: global.testNgo.id,
          foodListingId: testFoodListing.id,
          status: 'PENDING',
          pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        },
      });
    });

    test('should get NGO own requests', async () => {
      const response = await request(app)
        .get('/api/requests/my-requests')
        .set('Authorization', `Bearer ${ngoToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // All requests should belong to this NGO
      response.body.data.forEach(request => {
        expect(request.ngoId).toBe(global.testNgo.id);
      });
    });

    test('should include food listing details', async () => {
      const response = await request(app)
        .get('/api/requests/my-requests')
        .set('Authorization', `Bearer ${ngoToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const foundRequest = response.body.data.find(r => r.id === testFoodRequest.id);
      expect(foundRequest).toBeDefined();
      expect(foundRequest.foodListing).toBeDefined();
      expect(foundRequest.foodListing.foodName).toBe(testFoodListing.foodName);
    });

    test('should not work for restaurant', async () => {
      const response = await request(app)
        .get('/api/requests/my-requests')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/requests/incoming', () => {
    beforeEach(async () => {
      // Create test request for restaurant's food
      testFoodRequest = await global.prisma.foodRequest.create({
        data: {
          ngoId: global.testNgo.id,
          foodListingId: testFoodListing.id,
          status: 'PENDING',
          pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        },
      });
    });

    test('should get incoming requests for restaurant', async () => {
      const response = await request(app)
        .get('/api/requests/incoming')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      const foundRequest = response.body.data.find(r => r.id === testFoodRequest.id);
      expect(foundRequest).toBeDefined();
      expect(foundRequest.foodListing.restaurantId).toBe(global.testRestaurant.id);
    });

    test('should include NGO details', async () => {
      const response = await request(app)
        .get('/api/requests/incoming')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200);

      const foundRequest = response.body.data.find(r => r.id === testFoodRequest.id);
      expect(foundRequest.ngo).toBeDefined();
      expect(foundRequest.ngo.ngoName).toBe(global.testNgo.ngoName);
    });

    test('should not work for NGO', async () => {
      const response = await request(app)
        .get('/api/requests/incoming')
        .set('Authorization', `Bearer ${ngoToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/requests/:id/status', () => {
    beforeEach(async () => {
      testFoodRequest = await global.prisma.foodRequest.create({
        data: {
          ngoId: global.testNgo.id,
          foodListingId: testFoodListing.id,
          status: 'PENDING',
          pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        },
      });
    });

    test('should accept request as restaurant owner', async () => {
      const response = await request(app)
        .put(`/api/requests/${testFoodRequest.id}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ status: 'ACCEPTED' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ACCEPTED');

      // Check food listing status changed
      const updatedListing = await global.prisma.foodListing.findUnique({
        where: { id: testFoodListing.id }
      });
      expect(updatedListing.status).toBe('REQUESTED');
    });

    test('should complete request as restaurant owner', async () => {
      // First accept the request
      await global.prisma.foodRequest.update({
        where: { id: testFoodRequest.id },
        data: { status: 'ACCEPTED' }
      });

      const response = await request(app)
        .put(`/api/requests/${testFoodRequest.id}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ status: 'COMPLETED' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');

      // Check food listing status changed
      const updatedListing = await global.prisma.foodListing.findUnique({
        where: { id: testFoodListing.id }
      });
      expect(updatedListing.status).toBe('PICKED');
    });

    test('should not update request status as NGO', async () => {
      const response = await request(app)
        .put(`/api/requests/${testFoodRequest.id}/status`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({ status: 'ACCEPTED' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should validate status values', async () => {
      const response = await request(app)
        .put(`/api/requests/${testFoodRequest.id}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/requests/:id', () => {
    beforeEach(async () => {
      testFoodRequest = await global.prisma.foodRequest.create({
        data: {
          ngoId: global.testNgo.id,
          foodListingId: testFoodListing.id,
          status: 'PENDING',
          pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        },
      });
    });

    test('should cancel own request as NGO', async () => {
      const response = await request(app)
        .delete(`/api/requests/${testFoodRequest.id}`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deletedRequest = await global.prisma.foodRequest.findUnique({
        where: { id: testFoodRequest.id }
      });
      expect(deletedRequest).toBeNull();
    });

    test('should not cancel request as restaurant', async () => {
      const response = await request(app)
        .delete(`/api/requests/${testFoodRequest.id}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should not cancel accepted request', async () => {
      // Update request status to accepted
      await global.prisma.foodRequest.update({
        where: { id: testFoodRequest.id },
        data: { status: 'ACCEPTED' }
      });

      const response = await request(app)
        .delete(`/api/requests/${testFoodRequest.id}`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('cannot be cancelled');
    });
  });
});
