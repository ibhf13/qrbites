const Joi = require('joi');
const { validate, registrationSchema, loginSchema, menuSchema, sectionSchema, menuItemSchema } = require('../../../middleware/validator');
const { mockRequestResponse } = require('../../utils/testHelpers');

describe('Validator Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validate function', () => {
    it('should call next if validation passes', () => {
      // Create a simple schema
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required()
      });

      // Setup valid data
      const validData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const { req, res, next } = mockRequestResponse({
        body: validData
      });

      // Create middleware with schema
      const middleware = validate(schema);

      // Execute
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 400 if validation fails', () => {
      // Create a simple schema
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required()
      });

      // Setup invalid data
      const invalidData = {
        name: 'Test User'
        // Missing email
      };

      const { req, res, next } = mockRequestResponse({
        body: invalidData
      });

      // Create middleware with schema
      const middleware = validate(schema);

      // Execute
      middleware(req, res, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.stringContaining('is required')
      });
    });

    it('should strip unknown fields', () => {
      // Create a simple schema
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required()
      });

      // Setup data with extra field
      const dataWithExtra = {
        name: 'Test User',
        email: 'test@example.com',
        extraField: 'This should be stripped'
      };

      const { req, res, next } = mockRequestResponse({
        body: dataWithExtra
      });

      // Create middleware with schema
      const middleware = validate(schema);

      // Execute
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({
        name: 'Test User',
        email: 'test@example.com'
        // extraField should be stripped
      });
    });
  });

  describe('Registration Schema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      };

      const { error } = registrationSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject if name is missing', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      };

      const { error } = registrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Name is required');
    });

    it('should reject if name is too short', () => {
      const invalidData = {
        name: 'A', // Too short
        email: 'test@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      };

      const { error } = registrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Name must be at least 2 characters');
    });

    it('should reject if email is invalid', () => {
      const invalidData = {
        name: 'Test User',
        email: 'notanemail', // Invalid email
        password: 'password123',
        restaurantName: 'Test Restaurant'
      };

      const { error } = registrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid email');
    });

    it('should reject if password is too short', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '12345', // Too short
        restaurantName: 'Test Restaurant'
      };

      const { error } = registrationSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Password must be at least 6 characters');
    });
  });

  describe('Login Schema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const { error } = loginSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject if email is missing', () => {
      const invalidData = {
        password: 'password123'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Email is required');
    });

    it('should reject if password is missing', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Password is required');
    });

    it('should reject if email is invalid', () => {
      const invalidData = {
        email: 'notanemail',
        password: 'password123'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid email');
    });
  });

  describe('Menu Schema', () => {
    it('should validate valid menu data', () => {
      const validData = {
        name: 'Test Menu',
        description: 'A test menu description',
        isPublished: false
      };

      const { error } = menuSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should allow empty description', () => {
      const validData = {
        name: 'Test Menu',
        description: '',
        isPublished: true
      };

      const { error } = menuSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject if name is missing', () => {
      const invalidData = {
        description: 'A test menu description'
      };

      const { error } = menuSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Menu name is required');
    });

    it('should reject if name is too short', () => {
      const invalidData = {
        name: 'A', // Too short
        description: 'A test menu description'
      };

      const { error } = menuSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Menu name must be at least 2 characters');
    });
  });

  describe('Section Schema', () => {
    it('should validate valid section data', () => {
      const validData = {
        name: 'Appetizers',
        description: 'Starter dishes',
        order: 1
      };

      const { error } = sectionSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should allow null order', () => {
      const validData = {
        name: 'Appetizers',
        description: 'Starter dishes',
        order: null
      };

      const { error } = sectionSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject if name is missing', () => {
      const invalidData = {
        description: 'Starter dishes',
        order: 1
      };

      const { error } = sectionSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Section name is required');
    });

    it('should reject if name is too short', () => {
      const invalidData = {
        name: 'A', // Too short
        description: 'Starter dishes',
        order: 1
      };

      const { error } = sectionSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Section name must be at least 2 characters');
    });

    it('should reject negative order value', () => {
      const invalidData = {
        name: 'Appetizers',
        description: 'Starter dishes',
        order: -1 // Negative
      };

      const { error } = sectionSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('at least 0');
    });
  });

  describe('MenuItem Schema', () => {
    it('should validate valid menu item data', () => {
      const validData = {
        name: 'Caesar Salad',
        description: 'Romaine lettuce with Caesar dressing',
        price: 9.99,
        currency: 'USD',
        isAvailable: true,
        section: '60d0fe4f5311236168a109d4',
        order: 1,
        tags: ['salad', 'vegetarian'],
        nutritionalInfo: {
          calories: 350,
          allergens: ['dairy', 'gluten'],
          dietary: ['vegetarian']
        }
      };

      const { error } = menuItemSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should set default values', () => {
      const minimalData = {
        name: 'Caesar Salad',
        price: 9.99,
        section: '60d0fe4f5311236168a109d4'
      };

      const { value } = menuItemSchema.validate(minimalData);
      expect(value.currency).toBe('USD'); // Default currency
      expect(value.isAvailable).toBe(true); // Default availability
      expect(value.order).toBe(0); // Default order
    });

    it('should reject if name is missing', () => {
      const invalidData = {
        price: 9.99,
        section: '60d0fe4f5311236168a109d4'
      };

      const { error } = menuItemSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Item name is required');
    });

    it('should reject if price is missing', () => {
      const invalidData = {
        name: 'Caesar Salad',
        section: '60d0fe4f5311236168a109d4'
      };

      const { error } = menuItemSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Price is required');
    });

    it('should reject if section is missing', () => {
      const invalidData = {
        name: 'Caesar Salad',
        price: 9.99
      };

      const { error } = menuItemSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Section is required');
    });

    it('should reject negative price', () => {
      const invalidData = {
        name: 'Caesar Salad',
        price: -9.99, // Negative price
        section: '60d0fe4f5311236168a109d4'
      };

      const { error } = menuItemSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Price cannot be negative');
    });

    it('should reject invalid currency', () => {
      const invalidData = {
        name: 'Caesar Salad',
        price: 9.99,
        currency: 'INVALID', // Invalid currency
        section: '60d0fe4f5311236168a109d4'
      };

      const { error } = menuItemSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('must be one of');
    });
  });
});
