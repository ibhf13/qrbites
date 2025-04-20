const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { protect, authorize } = require('@middleware/auth');
const User = require('@models/User');
const { mockRequestResponse } = require('@tests/utils/testHelpers');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('@models/User');

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('protect', () => {
    it('should attach user to request if token is valid', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId().toString();
      const mockUser = {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };
      
      const { req, res, next } = mockRequestResponse({
        headers: {
          authorization: 'Bearer validtoken'
        }
      });
      
      // Mock jwt.verify to return decoded token
      jwt.verify.mockReturnValue({ id: userId });
      
      // Mock User.findById
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      
      // Execute
      await protect(req, res, next);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 401 if no token is provided', async () => {
      // Setup
      const { req, res, next } = mockRequestResponse({
        headers: {} // No authorization header
      });
      
      // Execute
      await protect(req, res, next);
      
      // Assert
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(User.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this route'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if token is invalid', async () => {
      // Setup
      const { req, res, next } = mockRequestResponse({
        headers: {
          authorization: 'Bearer invalidtoken'
        }
      });
      
      // Mock jwt.verify to throw an error
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Execute
      await protect(req, res, next);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('invalidtoken', process.env.JWT_SECRET);
      expect(User.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this route'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if user not found', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId().toString();
      
      const { req, res, next } = mockRequestResponse({
        headers: {
          authorization: 'Bearer validtoken'
        }
      });
      
      // Mock jwt.verify to return decoded token
      jwt.verify.mockReturnValue({ id: userId });
      
      // Mock User.findById to return null (user not found)
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      
      // Execute
      await protect(req, res, next);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should call next with error if an exception occurs', async () => {
      // Setup
      const mockError = new Error('Database error');
      
      const { req, res, next } = mockRequestResponse({
        headers: {
          authorization: 'Bearer validtoken'
        }
      });
      
      // Mock jwt.verify to throw a database error
      jwt.verify.mockImplementation(() => {
        throw mockError;
      });
      
      // Execute
      await protect(req, res, next);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    describe('Error handling in protect', () => {
      it('should handle jwt verification errors properly', async () => {
        // Setup
        const { req, res, next } = mockRequestResponse({
          headers: {
            authorization: 'Bearer invalidtoken'
          }
        });
        
        // Mock JWT verification to throw a specific error
        jwt.verify.mockImplementation(() => {
          throw new Error('jwt malformed');
        });

        // Execute
        await protect(req, res, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: 'Not authorized to access this route'
          })
        );
      });

      it('should handle malformed Bearer token properly', async () => {
        // Setup
        const { req, res, next } = mockRequestResponse({
          headers: {
            authorization: 'Bearer'  // Missing the actual token
          }
        });

        // Execute
        await protect(req, res, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: 'Not authorized to access this route'
          })
        );
      });
    });
  });

  describe('authorize', () => {
    it('should call next if user has authorized role', () => {
      // Setup
      const { req, res, next } = mockRequestResponse({
        user: {
          _id: 'userId',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin'
        }
      });
      
      // Create middleware for specific roles
      const middleware = authorize('admin', 'superadmin');
      
      // Execute
      middleware(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user has unauthorized role', () => {
      // Setup
      const { req, res, next } = mockRequestResponse({
        user: {
          _id: 'userId',
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user'
        }
      });
      
      // Create middleware for specific roles
      const middleware = authorize('admin', 'superadmin');
      
      // Execute
      middleware(req, res, next);
      
      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User role user is not authorized to access this route'
      });
    });
    
    it('should return 403 if user has no role', () => {
      // Setup
      const { req, res, next } = mockRequestResponse({
        user: {
          _id: 'userId',
          name: 'Undefined Role User',
          email: 'undefined@example.com'
          // No role property
        }
      });
      
      // Create middleware for specific roles
      const middleware = authorize('admin', 'user');
      
      // Execute
      middleware(req, res, next);
      
      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User has no role assigned'
      });
    });
    
    it('should return 403 if no user in request', () => {
      // Setup
      const { req, res, next } = mockRequestResponse({
        // No user in request
      });
      
      // Create middleware for specific roles
      const middleware = authorize('admin', 'user');
      
      // Execute
      middleware(req, res, next);
      
      // Assert
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User has no role assigned'
      });
    });
  });
});
