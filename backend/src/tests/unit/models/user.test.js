const User = require('../../../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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

    it('should validate email format', async () => {
      const invalidUser = new User({
        name: 'Invalid Email',
        email: 'invalid-email',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      });

      let error;
      try {
        await invalidUser.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.email.message).toBe('Please add a valid email');
    });

    it('should validate name and restaurantName maxlength', async () => {
      const longName = 'a'.repeat(51);
      const longRestaurantName = 'b'.repeat(101);

      const invalidUser = new User({
        name: longName,
        email: 'test@example.com',
        password: 'password123',
        restaurantName: longRestaurantName
      });

      let error;
      try {
        await invalidUser.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.restaurantName).toBeDefined();
      expect(error.errors.name.message).toBe('Name cannot be more than 50 characters');
      expect(error.errors.restaurantName.message).toBe('Restaurant name cannot be more than 100 characters');
    });

    it('should validate role enum', async () => {
      const invalidUser = new User({
        name: 'Invalid Role',
        email: 'role@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant',
        role: 'invalid_role'
      });

      let error;
      try {
        await invalidUser.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.role).toBeDefined();
    });

    it('should validate password minlength', async () => {
      const invalidUser = new User({
        name: 'Short Password',
        email: 'short@example.com',
        password: '12345',
        restaurantName: 'Test Restaurant'
      });

      let error;
      try {
        await invalidUser.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
      expect(error.errors.password.message).toBe('Password must be at least 6 characters');
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

    it('should not hash password when not modified', async () => {
      const user = await User.create({
        name: 'No Hash',
        email: 'nohash@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      });

      const originalPassword = user.password;
      user.name = 'Updated Name';
      await user.save();

      expect(user.password).toBe(originalPassword);
    });

    it('should generate reset password token', async () => {
      const user = await User.create({
        name: 'Reset Token',
        email: 'reset@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      });

      const resetToken = user.getResetPasswordToken();

      expect(resetToken).toBeDefined();
      expect(typeof resetToken).toBe('string');
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpire).toBeDefined();
      expect(user.resetPasswordExpire.getTime()).toBeGreaterThan(Date.now());
    });

    it('should generate JWT token with expiration', async () => {
      process.env.JWT_SECRET = 'testsecret';
      process.env.JWT_EXPIRES_IN = '1h';

      const user = await User.create({
        name: 'JWT Expire',
        email: 'jwt@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      });

      const token = user.getSignedJwtToken();
      const decoded = jwt.verify(token, 'testsecret');

      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('exp');
      expect(decoded.id).toBe(user._id.toString());
    });
  });
}); 