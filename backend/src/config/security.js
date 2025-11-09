/**
 * Security Configuration
 * Helmet and other security-related middleware configurations
 */

const helmet = require('helmet')

/**
 * Helmet security configuration
 * Configured for Swagger UI compatibility and Cloudinary image serving
 */
const helmetConfig = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'https://res.cloudinary.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      fontSrc: ["'self'", 'data:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
})

/**
 * Express query writable middleware
 * Fix for Express 5 compatibility with express-mongo-sanitize
 */
const makeQueryWritable = (req, res, next) => {
  Object.defineProperty(req, 'query', {
    ...Object.getOwnPropertyDescriptor(req, 'query'),
    value: req.query,
    writable: true,
  })
  next()
}

module.exports = {
  helmetConfig,
  makeQueryWritable,
}
