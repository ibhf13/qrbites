// Mock user data for testing
const mockUsers = [
  {
    _id: '60d0fe4f5311236168a109ca',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    restaurantName: 'John\'s Restaurant',
    role: 'user'
  },
  {
    _id: '60d0fe4f5311236168a109cb',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    restaurantName: 'Jane\'s Bistro',
    role: 'user'
  },
  {
    _id: '60d0fe4f5311236168a109cc',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    restaurantName: 'Admin Restaurant',
    role: 'admin'
  }
];

// Mock user with auth methods
const mockUserWithMethods = {
  _id: '60d0fe4f5311236168a109ca',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword',
  restaurantName: 'Test Restaurant',
  role: 'user',
  getSignedJwtToken: jest.fn().mockReturnValue('mock-token'),
  matchPassword: jest.fn().mockResolvedValue(true)
};

// Mock response for successful registration/login
const mockAuthResponse = {
  success: true,
  token: 'mock-token',
  data: {
    _id: '60d0fe4f5311236168a109ca',
    name: 'Test User',
    email: 'test@example.com',
    restaurantName: 'Test Restaurant',
    role: 'user'
  }
};

// Mock invalid credentials response
const mockInvalidCredentialsResponse = {
  success: false,
  error: 'Invalid credentials'
};

// Mock email already in use response
const mockEmailInUseResponse = {
  success: false,
  error: 'Email already in use'
};

module.exports = {
  mockUsers,
  mockUserWithMethods,
  mockAuthResponse,
  mockInvalidCredentialsResponse,
  mockEmailInUseResponse
};
