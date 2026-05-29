import request from 'supertest';
import app from '../src/app.js';

describe('Food Listing Tests', () => {
  let restaurantToken, ngoToken;
  let testFoodListing;

  beforeEach(async () => {
    // Get restaurant token
    const restaurantLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'restaurant@test.com',
        password: 'testpass123'
      });
    restaurantToken = restaurantLogin.body.data.accessToken;

    // Get NGO token
    const ngoLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ngo@test.com',
        password: 'testpass123'
      });
    ngoToken = ngoLogin.body.data.accessToken;

    // Create test food listing
    testFoodListing = await global.getPrismaClient().foodListing.create({
      data: {
        restaurantId: global.testRestaurant.id,
        foodName: 'Test Food Item',
        quantity: 50,
        expiryTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        status: 'AVAILABLE',
      },
    });
  });

  describe('POST /api/food/create', () => {
    test('should create food listing as restaurant', async () => {
      const foodData = {
        foodName: 'Fresh Vegetables',
        quantity: 100,
        expiryTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/food/create')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send(foodData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.foodName).toBe(foodData.foodName);
      expect(response.body.data.quantity).toBe(foodData.quantity);
      expect(response.body.data.status).toBe('AVAILABLE');
    });

    test('should not create food listing as NGO', async () => {
      const foodData = {
        foodName: 'Test Food',
        quantity: 50,
        expiryTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/food/create')
        .set('Authorization', `Bearer ${ngoToken}`)
        .send(foodData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/food/create')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should validate expiry time is in future', async () => {
      const foodData = {
        foodName: 'Expired Food',
        quantity: 10,
        expiryTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      };

      const response = await request(app)
        .post('/api/food/create')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send(foodData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/food/available', () => {
    test('should get available food listings', async () => {
      const response = await request(app)
        .get('/api/food/available')
        .set('Authorization', `Bearer ${ngoToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check if test food listing is included
      const foundListing = response.body.data.find(
        listing => listing.id === testFoodListing.id
      );
      expect(foundListing).toBeDefined();
      expect(foundListing.status).toBe('AVAILABLE');
    });

    test('should filter by location (within radius)', async () => {
      const response = await request(app)
        .get('/api/food/available')
        .query({
          latitude: 19.0760,
          longitude: 72.8777,
          radius: 10
        })
        .set('Authorization', `Bearer ${ngoToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/food/available')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/food/my-listings', () => {
    test('should get restaurant own food listings', async () => {
      const response = await request(app)
        .get('/api/food/my-listings')
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // All listings should belong to this restaurant
      response.body.data.forEach(listing => {
        expect(listing.restaurantId).toBe(global.testRestaurant.id);
      });
    });

    test('should not work for NGO', async () => {
      const response = await request(app)
        .get('/api/food/my-listings')
        .set('Authorization', `Bearer ${ngoToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/food/:id', () => {
    test('should update own food listing', async () => {
      const updateData = {
        foodName: 'Updated Food Name',
        quantity: 75,
      };

      const response = await request(app)
        .put(`/api/food/${testFoodListing.id}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.foodName).toBe(updateData.foodName);
      expect(response.body.data.quantity).toBe(updateData.quantity);
    });

    test('should not update other restaurant food listing', async () => {
      // Create another restaurant user first
      const hashedPassword = await global.getPrismaClient().user.findFirst();
      const otherRestaurantUser = await global.getPrismaClient().user.create({
        data: {
          email: 'other@restaurant.com',
          password: hashedPassword.password,
          name: 'Other Restaurant',
          role: 'RESTAURANT',
          isVerified: true,
        },
      });

      // Get token for other restaurant
      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@restaurant.com',
          password: 'testpass123'
        });

      const response = await request(app)
        .put(`/api/food/${testFoodListing.id}`)
        .set('Authorization', `Bearer ${otherLogin.body.data.token}`)
        .send({ foodName: 'Unauthorized Update' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/food/:id', () => {
    test('should delete own food listing', async () => {
      const response = await request(app)
        .delete(`/api/food/${testFoodListing.id}`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deletedListing = await global.getPrismaClient().foodListing.findUnique({
        where: { id: testFoodListing.id }
      });
      expect(deletedListing).toBeNull();
    });

    test('should not delete food listing as NGO', async () => {
      const response = await request(app)
        .delete(`/api/food/${testFoodListing.id}`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
