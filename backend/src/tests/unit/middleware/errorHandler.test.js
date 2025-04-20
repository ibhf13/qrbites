const mongoose = require('mongoose');
const errorHandler = require('../../../middleware/errorHandler');
const { mockRequestResponse } = require('../../utils/testHelpers');
const logger = require('../../../utils/logger');

// Mock logger
jest.mock('../../../utils/logger');

describe('Error Handler Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Save original NODE_ENV and set to development for testing
    this.originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
  });
  
  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = this.originalNodeEnv;
  });

  it('should handle generic errors', () => {
    // Setup
    const error = new Error('Something went wrong');
    const { req, res, next } = mockRequestResponse();
    
    // Execute
    errorHandler(error, req, res, next);
    
    // Assert
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Something went wrong',
      stack: expect.any(String)
    });
  });
  
  it('should handle validation errors (mongoose)', () => {
    // Setup
    const validationError = new mongoose.Error.ValidationError();
    validationError.errors = {
      name: { message: 'Name is required' },
      email: { message: 'Email is invalid' }
    };
    
    const { req, res, next } = mockRequestResponse();
    
    // Execute
    errorHandler(validationError, req, res, next);
    
    // Assert
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Name is required, Email is invalid',
      stack: expect.any(String)
    });
  });
  
  it('should handle cast errors (invalid IDs)', () => {
    // Setup
    const castError = new mongoose.Error.CastError('ObjectId', 'invalidid', 'id');
    castError.value = 'invalidid';
    
    const { req, res, next } = mockRequestResponse();
    
    // Execute
    errorHandler(castError, req, res, next);
    
    // Assert
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Resource not found with id of invalidid',
      stack: expect.any(String)
    });
  });
  
  it('should handle duplicate key errors', () => {
    // Setup
    const duplicateError = new Error('Duplicate key error');
    duplicateError.code = 11000;
    duplicateError.keyValue = { email: 'duplicate@example.com' };
    
    const { req, res, next } = mockRequestResponse();
    
    // Execute
    errorHandler(duplicateError, req, res, next);
    
    // Assert
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Duplicate value entered for email field',
      stack: expect.any(String)
    });
  });
  
  it('should handle JWT errors', () => {
    // Setup
    const jwtError = new Error('Invalid token');
    jwtError.name = 'JsonWebTokenError';
    
    const { req, res, next } = mockRequestResponse();
    
    // Execute
    errorHandler(jwtError, req, res, next);
    
    // Assert
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid token',
      stack: expect.any(String)
    });
  });
  
  it('should handle token expiration errors', () => {
    // Setup
    const tokenError = new Error('Token expired');
    tokenError.name = 'TokenExpiredError';
    
    const { req, res, next } = mockRequestResponse();
    
    // Execute
    errorHandler(tokenError, req, res, next);
    
    // Assert
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token expired',
      stack: expect.any(String)
    });
  });
  
  it('should not include stack trace in production', () => {
    // Setup
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Production error');
    const { req, res, next } = mockRequestResponse();
    
    // Execute
    errorHandler(error, req, res, next);
    
    // Assert
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Production error',
      stack: null
    });
  });
  
  it('should use statusCode from error if available', () => {
    // Setup
    const customError = new Error('Custom status code error');
    customError.statusCode = 418; // I'm a teapot!
    
    const { req, res, next } = mockRequestResponse();
    
    // Execute
    errorHandler(customError, req, res, next);
    
    // Assert
    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Custom status code error',
      stack: expect.any(String)
    });
  });
});