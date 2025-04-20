const jwt = require('jsonwebtoken');

/**
 * Generate a valid JWT token for testing
 * @param {Object} payload - Token payload
 * @param {String} secret - JWT secret
 * @param {Object} options - JWT options
 * @returns {String} JWT token
 */
const generateValidToken = (payload = {}, secret = 'test-secret', options = {}) => {
  const defaultPayload = {
    id: '60d0fe4f5311236168a109ca',
    ...payload
  };
  
  const defaultOptions = {
    expiresIn: '1h',
    ...options
  };
  
  return jwt.sign(defaultPayload, secret, defaultOptions);
};

/**
 * Generate a mock token with specific user ID
 * @param {String} userId - User ID to include in token
 * @returns {String} JWT token
 */
const generateMockToken = (userId) => {
  return generateValidToken({ id: userId });
};

/**
 * Generate an expired JWT token for testing
 * @param {Object} payload - Token payload
 * @returns {String} Expired JWT token
 */
const generateExpiredToken = (payload = {}) => {
  return generateValidToken(payload, 'test-secret', { expiresIn: '-1h' });
};

/**
 * Generate a malformed JWT token for testing
 * @returns {String} Malformed JWT token
 */
const generateMalformedToken = () => {
  return 'malformed.jwt.token';
};

module.exports = {
  generateValidToken,
  generateMockToken,
  generateExpiredToken,
  generateMalformedToken
}; 