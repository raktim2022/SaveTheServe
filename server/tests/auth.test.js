import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Import the app directly for testing
import app from '../src/app.js';

describe('Authentication Tests', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new NGO user', async () => {
      const userData = {
        email: 'newngo@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        name: 'New NGO',
        phone: '+1234567893',
        role: 'NGO'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.role).toBe('NGO');
      expect(response.body.data.accessToken).toBeDefined();
    });

    test('should register a new restaurant user', async () => {
      const userData = {
        email: 'newrestaurant@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        name: 'New Restaurant',
        phone: '+1234567894',
        role: 'RESTAURANT'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.role).toBe('RESTAURANT');
      expect(response.body.data.accessToken).toBeDefined();
    });

    test('should not register user with existing email', async () => {
      const userData = {
        email: 'ngo@test.com', // This email already exists
        password: 'password123',
        name: 'Duplicate NGO',
        role: 'NGO'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
        role: 'NGO'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should validate password length', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123', // Too short
        name: 'Test User',
        role: 'NGO'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'ngo@test.com',
        password: 'testpass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.accessToken).toBeDefined();
      
      // Verify JWT token structure
      const decoded = jwt.verify(response.body.data.accessToken, process.env.JWT_SECRET || 'fallback-secret');
      expect(decoded.id).toBeDefined();
      expect(decoded.role).toBe('NGO');
    });

    test('should not login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'testpass123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    test('should not login with invalid password', async () => {
      const loginData = {
        email: 'ngo@test.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    test('should validate required fields for login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken;

    beforeEach(async () => {
      // Login to get auth token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ngo@test.com',
          password: 'testpass123'
        });
      
      authToken = loginResponse.body.data.accessToken;
    });

    test('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('ngo@test.com');
      expect(response.body.data.role).toBe('NGO');
    });

    test('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });

    test('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Password Security', () => {
    test('should hash passwords during registration', async () => {
      const userData = {
        email: 'passwordtest@test.com',
        password: 'myPlainPassword123',
        name: 'Password Test User',
        role: 'NGO'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Check that password is hashed in database
      const user = await global.prisma.user.findUnique({
        where: { email: userData.email }
      });

      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(50); // Bcrypt hash length
      
      // Verify password can be compared
      const isMatch = await bcrypt.compare(userData.password, user.password);
      expect(isMatch).toBe(true);
    });
  });
});
