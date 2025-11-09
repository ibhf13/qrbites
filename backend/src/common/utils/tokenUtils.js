const jwt = require('jsonwebtoken')
const config = require('@config/environment')

/**
 * Generate JWT token for user authentication
 * @param {String} userId - User ID to encode in token
 * @returns {String} JWT token
 */
const generateToken = userId => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  })
}

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = token => {
  return jwt.verify(token, config.JWT_SECRET)
}

module.exports = {
  generateToken,
  verifyToken,
}
