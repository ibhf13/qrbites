const { register, login, getMe, logout } = require('../../controllers/authController');
const User = require('../../models/User');

// Mock User model
jest.mock('../../models/User');

describe('Auth Controller', () => {
  let req;
  let res;
  let next;
  
  beforeEach(() => {
    // Setup request, response, and next function
    req = {
      body: {},
      user: { id: 'mockUserId' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  describe('register', () => {
    it('should register a new user and return token', async () => {
      // Setup
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant',
        getSignedJwtToken: jest.fn().mockReturnValue('mockedToken')
      };
      
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      };
      
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      
      // Execute
      await register(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(User.create).toHaveBeenCalledWith({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        restaurantName: req.body.restaurantName
      });
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
      req.body = {
        email: 'existing@example.com'
      };
      
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });
      
      // Execute
      await register(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email already in use'
      });
    });
    
    it('should call next with error if user creation fails', async () => {
      // Setup
      const mockError = new Error('Database error');
      
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        restaurantName: 'Test Restaurant'
      };
      
      User.findOne.mockResolvedValue(null);
      User.create.mockRejectedValue(mockError);
      
      // Execute
      await register(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
  
  describe('login', () => {
    it('should login user and return token', async () => {
      // Setup
      const mockUser = {
        email: 'test@example.com',
        password: 'hashedPassword',
        getSignedJwtToken: jest.fn().mockReturnValue('mockedToken'),
        matchPassword: jest.fn().mockResolvedValue(true)
      };
      
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      
      // Execute
      await login(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(mockUser.matchPassword).toHaveBeenCalledWith(req.body.password);
      expect(mockUser.getSignedJwtToken).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mockedToken',
        data: mockUser
      });
    });
    
    it('should return 401 if user not found', async () => {
      // Setup
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      
      // Execute
      await login(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials'
      });
    });
    
    it('should return 401 if password is incorrect', async () => {
      // Setup
      const mockUser = {
        email: 'test@example.com',
        password: 'hashedPassword',
        matchPassword: jest.fn().mockResolvedValue(false)
      };
      
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      
      // Execute
      await login(req, res, next);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(mockUser.matchPassword).toHaveBeenCalledWith(req.body.password);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials'
      });
    });
  });
  
  describe('getMe', () => {
    it('should return current user', async () => {
      // Setup
      const mockUser = {
        id: 'mockUserId',
        name: 'Test User',
        email: 'test@example.com'
      };
      
      User.findById.mockResolvedValue(mockUser);
      
      // Execute
      await getMe(req, res, next);
      
      // Assert
      expect(User.findById).toHaveBeenCalledWith(req.user.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });
    
    it('should call next with error if user retrieval fails', async () => {
      // Setup
      const mockError = new Error('Database error');
      User.findById.mockRejectedValue(mockError);
      
      // Execute
      await getMe(req, res, next);
      
      // Assert
      expect(User.findById).toHaveBeenCalledWith(req.user.id);
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
  
  describe('logout', () => {
    it('should logout user successfully', () => {
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