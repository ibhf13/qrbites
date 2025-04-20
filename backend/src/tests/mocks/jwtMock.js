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
 * Generate an expired JWT token for testing
 * @param {Object} payload - Token payload
 * @param {String} secret - JWT secret
 * @returns {String} Expired JWT token
 */
const generateExpiredToken = (payload = {}, secret = 'test-secret') => {
  const defaultPayload = {
    id: '60d0fe4f5311236168a109ca',
    ...payload
  };
  
  // Set expiration to 1 second in the past
  const options = {
    expiresIn: '-1s'
  };
  
  return jwt.sign(defaultPayload, secret, options);
};

/**
 * Generate a malformed JWT token for testing
 * @returns {String} Malformed JWT token
 */
const generateMalformedToken = () => {
  return 'malformed.jwt.token';
};

/**
 * Mock JWT token responses for different scenarios
 */
const mockTokenResponses = {
  valid: {
    token: 'valid-jwt-token',
    payload: {
      id: '60d0fe4f5311236168a109ca',
      iat: 1625097600,
      exp: 1625101200
    }
  },
  expired: {
    token: 'expired-jwt-token',
    error: {
      name: 'TokenExpiredError',
      message: 'jwt expired',
      expiredAt: new Date()
    }
  },
  invalid: {
    token: 'invalid-jwt-token',
    error: {
      name: 'JsonWebTokenError',
      message: 'invalid token'
    }
  },
  malformed: {
    token: 'malformed.jwt.token',
    error: {
      name: 'JsonWebTokenError',
      message: 'jwt malformed'
    }
  }
};

module.exports = {
  generateValidToken,
  generateExpiredToken,
  generateMalformedToken,
  mockTokenResponses
};
