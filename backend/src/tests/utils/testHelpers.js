const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

/**
 * Create a mock MongoDB ObjectId
 * @returns {mongoose.Types.ObjectId} A new ObjectId
 */
const createObjectId = () => new mongoose.Types.ObjectId();

/**
 * Format object IDs in an object to string representation
 * @param {Object} obj - Object containing ObjectIds
 * @returns {Object} Object with string IDs
 */
const formatObjectIds = (obj) => {
  const formatted = { ...obj };
  
  // Convert ObjectId to string if it exists
  if (formatted._id) {
    formatted._id = formatted._id.toString();
  }

  // Handle nested objects like restaurant, menu, section
  const objectIdFields = ['restaurant', 'menu', 'section'];
  objectIdFields.forEach(field => {
    if (formatted[field] && typeof formatted[field] !== 'string') {
      formatted[field] = formatted[field].toString();
    }
  });

  return formatted;
};

/**
 * Create a mock JWT token for testing
 * @param {String} userId - User ID to include in token
 * @returns {String} JWT token
 */
const generateMockToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

/**
 * Create mock request and response objects for controller testing
 * @param {Object} options - Configuration options
 * @returns {Object} Object containing req, res, and next
 */
const mockRequestResponse = (options = {}) => {
  const {
    body = {},
    params = {},
    query = {},
    user = null,
    headers = {}
  } = options;

  // Create mock request object
  const req = {
    body,
    params,
    query,
    user,
    headers
  };

  // Create mock response object
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  };

  // Create mock next function
  const next = jest.fn();

  return { req, res, next };
};

module.exports = {
  createObjectId,
  formatObjectIds,
  generateMockToken,
  mockRequestResponse
};
