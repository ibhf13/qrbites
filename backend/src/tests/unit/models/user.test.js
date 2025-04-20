const User = require('../../../models/User');
const mongoose = require('mongoose');

describe('User model', () => {
  describe('User schema', () => {
    it('should create a user with valid fields', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      };
      
      const user = await User.create(userData);
      
      expect(user).toHaveProperty('_id');
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.restaurantName).toBe(userData.restaurantName);
      expect(user.role).toBe('user'); // Default role
    });
    
    it('should hash the password before saving', async () => {
      const userData = {
        name: 'Password Test',
        email: 'password@example.com',
        password: 'password123',
        restaurantName: 'Password Restaurant'
      };
      
      const user = await User.create(userData);
      
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toBeDefined();
    });
    
    it('should not create a user without required fields', async () => {
      const invalidUser = new User({
        name: 'Invalid User'
      });
      
      let error;
      try {
        await invalidUser.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
      expect(error.errors.restaurantName).toBeDefined();
    });
    
    it('should not allow duplicate emails', async () => {
      const userData = {
        name: 'Original User',
        email: 'duplicate@example.com',
        password: 'password123',
        restaurantName: 'Original Restaurant'
      };
      
      await User.create(userData);
      
      const duplicateUser = new User({
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'password456',
        restaurantName: 'Duplicate Restaurant'
      });
      
      let error;
      try {
        await duplicateUser.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // Duplicate key error code
    });
  });
  
  describe('User methods', () => {
    it('should generate a JWT token', async () => {
      const user = await User.create({
        name: 'JWT Test',
        email: 'jwt@example.com',
        password: 'password123',
        restaurantName: 'JWT Restaurant'
      });
      
      const token = user.getSignedJwtToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
    
    it('should verify password correctly', async () => {
      const password = 'correctpassword';
      
      const user = await User.create({
        name: 'Password Match Test',
        email: 'pwmatch@example.com',
        password,
        restaurantName: 'Password Restaurant'
      });
      
      // We need to explicitly select the password as it's excluded by default
      const userWithPassword = await User.findById(user._id).select('+password');
      
      const isMatch = await userWithPassword.matchPassword(password);
      const isWrongMatch = await userWithPassword.matchPassword('wrongpassword');
      
      expect(isMatch).toBe(true);
      expect(isWrongMatch).toBe(false);
    });
  });
}); 