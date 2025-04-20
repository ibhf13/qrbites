const request = require('supertest');
const User = require('../../models/User');
const { generateMockToken } = require('./testHelpers');

/**
 * Create a test user in the database and return auth token
 * @param {Object} app - Express app
 * @param {Object} userData - User data object
 * @returns {Promise<String>} JWT token
 */
const createUserAndGetToken = async (app, userData) => {
  // Create user
  const user = await User.create(userData);
  
  // Generate token
  return user.getSignedJwtToken();
};

/**
 * Login a user and return auth token
 * @param {Object} app - Express app
 * @param {Object} credentials - Login credentials
 * @returns {Promise<String>} JWT token
 */
const loginUserAndGetToken = async (app, credentials) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send(credentials);
  
  return response.body.token;
};

/**
 * Make authenticated request to API
 * @param {Object} app - Express app
 * @param {String} method - HTTP method (get, post, put, delete)
 * @param {String} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Supertest response
 */
const authenticatedRequest = async (app, method, endpoint, options = {}) => {
  const {
    token,
    userId,
    payload = {},
    query = {}
  } = options;

  // Use provided token or generate a new one
  const authToken = token || (userId ? generateMockToken(userId) : null);
  
  if (!authToken) {
    throw new Error('Either token or userId must be provided');
  }

  // Build request
  let req = request(app)[method](endpoint);
  
  // Add auth header
  req = req.set('Authorization', `Bearer ${authToken}`);
  
  // Add query params if any
  if (Object.keys(query).length > 0) {
    req = req.query(query);
  }
  
  // Add payload for POST, PUT, PATCH requests
  if (['post', 'put', 'patch'].includes(method.toLowerCase()) && Object.keys(payload).length > 0) {
    req = req.send(payload);
  }
  
  return req;
};

module.exports = {
  createUserAndGetToken,
  loginUserAndGetToken,
  authenticatedRequest
};
