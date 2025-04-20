const { register, login, getMe, logout } = require('../../../controllers/authController');
const User = require('../../../models/User');
const { mockRequestResponse } = require('../../utils/testHelpers');
const { mockUsers, mockUserWithMethods } = require('../../mocks/userMocks');

// Mock User model and logger
jest.mock('../../../models/User');
jest.mock('../../../utils/logger');

describe('Auth Controller', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      // Setup
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      };
      
      const mockUser = {
        ...userData,
        _id: 'mockUserId',
        getSignedJwtToken: jest.fn().mockReturnValue('mockedToken')
      };
      
      const { req, res, next } = mockRequestResponse({
        body: userData
      });
      
      // Mock User.findOne to return null (no existing user)
      User.findOne.mockResolvedValue(null);
      // Mock User.create to return the new user
      User.create.mockResolvedValue(mockUser);
      
      // Execute
      await register(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(mockUser.getSignedJwtToken).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mockedToken',
        data: mockUser
      });
    });
    
    it('should return 400 if user already exists', async () => {
      // Setup
      const existingEmail = 'existing@example.com';
      const userData = {
        name: 'Existing User',
        email: existingEmail,
        password: 'password123',
        restaurantName: 'Existing Restaurant'
      };
      
      const { req, res, next } = mockRequestResponse({
        body: userData
      });
      
      // Mock User.findOne to return an existing user
      User.findOne.mockResolvedValue({ email: existingEmail });
      
      // Execute
      await register(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: existingEmail });
      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email already in use'
      });
    });
    
    it('should call next with error if user creation fails', async () => {
      // Setup
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      };
      
      const mockError = new Error('Database error');
      
      const { req, res, next } = mockRequestResponse({
        body: userData
      });
      
      // Mock User.findOne to return null (no existing user)
      User.findOne.mockResolvedValue(null);
      // Mock User.create to throw an error
      User.create.mockRejectedValue(mockError);
      
      // Execute
      await register(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User.create).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
  
  describe('login', () => {
    it('should login user and return token', async () => {
      // Setup
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockUser = {
        ...mockUserWithMethods,
        password: 'hashedPassword',
        getSignedJwtToken: jest.fn().mockReturnValue('mock-token'),
        matchPassword: jest.fn().mockResolvedValue(true)
      };
      
      const { req, res, next } = mockRequestResponse({
        body: credentials
      });
      
      // Mock User.findOne().select() to return user
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({
        select: mockSelect
      });
      
      // Execute
      await login(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: credentials.email });
      expect(mockSelect).toHaveBeenCalledWith('+password');
      expect(mockUser.matchPassword).toHaveBeenCalledWith(credentials.password);
      expect(mockUser.getSignedJwtToken).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mock-token',
        data: expect.objectContaining({
          _id: mockUser._id,
          email: mockUser.email
        })
      });
    });
    
    it('should return 401 if user not found', async () => {
      // Setup
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      const { req, res, next } = mockRequestResponse({
        body: credentials
      });
      
      // Mock User.findOne().select() to return null
      const mockSelect = jest.fn().mockResolvedValue(null);
      User.findOne.mockReturnValue({ select: mockSelect });
      
      // Execute
      await login(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: credentials.email });
      expect(mockSelect).toHaveBeenCalledWith('+password');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials'
      });
    });
    
    it('should return 401 if password is incorrect', async () => {
      // Setup
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      const mockUser = {
        ...mockUserWithMethods,
        password: 'hashedPassword',
        matchPassword: jest.fn().mockResolvedValue(false)
      };
      
      const { req, res, next } = mockRequestResponse({
        body: credentials
      });
      
      // Mock User.findOne().select() to return user
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({ select: mockSelect });
      
      // Execute
      await login(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: credentials.email });
      expect(mockSelect).toHaveBeenCalledWith('+password');
      expect(mockUser.matchPassword).toHaveBeenCalledWith(credentials.password);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials'
      });
    });
    
    it('should call next with error if login fails', async () => {
      // Setup
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockError = new Error('Database error');
      
      const { req, res, next } = mockRequestResponse({
        body: credentials
      });
      
      // Mock User.findOne to throw an error
      User.findOne.mockImplementation(() => {
        throw mockError;
      });
      
      // Execute
      await login(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: credentials.email });
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
  
  describe('getMe', () => {
    it('should return current user', async () => {
      // Setup
      const userId = 'currentUserId';
      const mockUser = {
        _id: userId,
        name: 'Current User',
        email: 'current@example.com',
        role: 'user'
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId }
      });
      
      // Mock User.findById to return the user
      User.findById.mockResolvedValue(mockUser);
      
      // Execute
      await getMe(req, res, next);
      
      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });
    
    it('should call next with error if user retrieval fails', async () => {
      // Setup
      const userId = 'currentUserId';
      const mockError = new Error('Database error');
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId }
      });
      
      // Mock User.findById to throw an error
      User.findById.mockRejectedValue(mockError);
      
      // Execute
      await getMe(req, res, next);
      
      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
  
  describe('logout', () => {
    it('should logout user successfully', () => {
      // Setup
      const { req, res, next } = mockRequestResponse();
      
      // Execute
      logout(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully'
      });
    });
  });
});