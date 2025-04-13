const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const { users } = require('../seed/users');

describe('Auth Routes', () => {
  beforeEach(async () => {
    // Clear users collection
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.data).toHaveProperty('name', userData.name);
      expect(res.body.data).toHaveProperty('email', userData.email);
      expect(res.body.data).toHaveProperty('restaurantName', userData.restaurantName);
      expect(res.body.data.password).toBeUndefined();
    });

    it('should return validation error for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      };

      // Create first user
      await User.create(userData);

      // Try to create duplicate
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Email already in use');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user and return token', async () => {
      // Create a user first
      const user = {
        name: 'Login Test',
        email: 'login@example.com',
        password: 'password123',
        restaurantName: 'Login Restaurant'
      };

      await User.create(user);

      // Try to login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: user.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.data).toHaveProperty('email', user.email);
      expect(res.body.data.password).toBeUndefined();
    });

    it('should return validation error for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('should return error for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should return error for wrong password', async () => {
      // Create a user first
      const user = {
        name: 'Wrong Password',
        email: 'wrong@example.com',
        password: 'correctpassword',
        restaurantName: 'Wrong Password Restaurant'
      };

      await User.create(user);

      // Try to login with wrong password
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile', async () => {
      // Create a user first
      const user = {
        name: 'Profile Test',
        email: 'profile@example.com',
        password: 'password123',
        restaurantName: 'Profile Restaurant'
      };

      const createdUser = await User.create(user);
      const token = createdUser.getSignedJwtToken();

      // Get profile with token
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', user.email);
      expect(res.body.data).toHaveProperty('name', user.name);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      // Create a user first
      const user = {
        name: 'Logout Test',
        email: 'logout@example.com',
        password: 'password123',
        restaurantName: 'Logout Restaurant'
      };

      const createdUser = await User.create(user);
      const token = createdUser.getSignedJwtToken();

      // Logout with token
      const res = await request(app)
        .get('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/auth/logout');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
}); 