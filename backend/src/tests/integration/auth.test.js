const request = require('supertest');
const mongoose = require('mongoose');
const app = require('@root/app');
const User = require('@models/User');
const { mockUsers } = require('@tests/mocks/userMocks');
const { authenticatedRequest } = require('@tests/utils/apiTestUtils');

describe('Auth Routes Integration Tests', () => {
  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert response
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.data).toHaveProperty('name', userData.name);
      expect(res.body.data).toHaveProperty('email', userData.email);
      expect(res.body.data).toHaveProperty('restaurantName', userData.restaurantName);
      expect(res.body.data).not.toHaveProperty('password'); // Password should not be returned

      // Verify user was created in database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.restaurantName).toBe(userData.restaurantName);
      expect(user.role).toBe('user'); // Default role
    });

    it('should return validation error for missing fields', async () => {
      const incompleteUserData = {
        name: 'Incomplete User',
        email: 'incomplete@example.com'
        // Missing password and restaurantName
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(incompleteUserData);

      // Assert response
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();

      // Verify user was not created
      const user = await User.findOne({ email: incompleteUserData.email });
      expect(user).toBeNull();
    });

    it('should return error for duplicate email', async () => {
      // First create a user
      const userData = {
        name: 'Original User',
        email: 'duplicate@example.com',
        password: 'password123',
        restaurantName: 'Original Restaurant'
      };

      await User.create(userData);

      // Try to register with the same email
      const duplicateUserData = {
        name: 'Duplicate User',
        email: 'duplicate@example.com', // Same email
        password: 'password456',
        restaurantName: 'Duplicate Restaurant'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(duplicateUserData);

      // Assert response
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Email already in use');

      // Verify only one user exists with that email
      const users = await User.find({ email: userData.email });
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe(userData.name); // Original user name
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return token', async () => {
      // Create a user first
      const userData = {
        name: 'Login Test',
        email: 'login@example.com',
        password: 'password123',
        restaurantName: 'Login Restaurant'
      };

      await User.create(userData);

      // Login with credentials
      const credentials = {
        email: userData.email,
        password: userData.password
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      // Assert response
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.data).toHaveProperty('email', userData.email);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return validation error for missing fields', async () => {
      const incompleteCredentials = {
        email: 'login@example.com'
        // Missing password
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(incompleteCredentials);

      // Assert response
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('should return error for non-existent user', async () => {
      const nonExistentCredentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(nonExistentCredentials);

      // Assert response
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should return error for incorrect password', async () => {
      // Create a user first
      const userData = {
        name: 'Password Test',
        email: 'password@example.com',
        password: 'correctpassword',
        restaurantName: 'Password Restaurant'
      };

      await User.create(userData);

      // Login with wrong password
      const wrongCredentials = {
        email: userData.email,
        password: 'wrongpassword'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(wrongCredentials);

      // Assert response
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile', async () => {
      // Create a user first
      const userData = {
        name: 'Profile User',
        email: 'profile@example.com',
        password: 'password123',
        restaurantName: 'Profile Restaurant'
      };

      const user = await User.create(userData);
      const token = user.getSignedJwtToken();

      // Get profile with token
      const res = await authenticatedRequest(app, 'get', '/api/auth/me', { token });

      // Assert response
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id', user._id.toString());
      expect(res.body.data).toHaveProperty('name', userData.name);
      expect(res.body.data).toHaveProperty('email', userData.email);
      expect(res.body.data).toHaveProperty('restaurantName', userData.restaurantName);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/auth/me');

      // Assert response
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Not authorized to access this route');
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      // Assert response
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Not authorized to access this route');
    });
  });

  describe('GET /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      // Create a user first
      const userData = {
        name: 'Logout User',
        email: 'logout@example.com',
        password: 'password123',
        restaurantName: 'Logout Restaurant'
      };

      const user = await User.create(userData);
      const token = user.getSignedJwtToken();

      // Logout with token
      const res = await authenticatedRequest(app, 'get', '/api/auth/logout', { token });

      // Assert response
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/auth/logout');

      // Assert response
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Not authorized to access this route');
    });
  });

  describe('Auth middleware functionality', () => {
    it('should correctly extract user ID from token', async () => {
      // Create a user
      const userData = {
        name: 'Token Test',
        email: 'token@example.com',
        password: 'password123',
        restaurantName: 'Token Restaurant'
      };

      const user = await User.create(userData);
      const token = user.getSignedJwtToken();

      // Make request to a protected route
      const res = await authenticatedRequest(app, 'get', '/api/auth/me', { token });

      // Assert that the user ID was correctly extracted
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(user._id.toString());
    });

    it('should handle token format correctly', async () => {
      // Create a user
      const userData = {
        name: 'Format Test',
        email: 'format@example.com',
        password: 'password123',
        restaurantName: 'Format Restaurant'
      };

      const user = await User.create(userData);
      const token = user.getSignedJwtToken();

      // Test with token in the correct format
      const resWithBearer = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(resWithBearer.status).toBe(200);

      // Test with incorrect format (no Bearer prefix)
      const resWithoutBearer = await request(app)
        .get('/api/auth/me')
        .set('Authorization', token);
      
      expect(resWithoutBearer.status).toBe(401);
    });
  });
});