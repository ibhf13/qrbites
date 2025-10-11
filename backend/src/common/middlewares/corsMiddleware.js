const cors = require('cors')
const logger = require('@commonUtils/logger')
const { ForbiddenError } = require('@errors')

/**
 * Get allowed origins based on environment
 * @returns {string[]} Array of allowed origins
 */
const getAllowedOrigins = () => {
  const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173']

  if (process.env.NODE_ENV === 'production') {
    // In production, use only explicitly defined origins
    const prodOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : []

    if (prodOrigins.length === 0) {
      const errorMessage =
        'CRITICAL ERROR: No ALLOWED_ORIGINS defined in production environment. This would block all requests and break the application.'
      logger.error(errorMessage)
      throw new ForbiddenError(errorMessage)
    }

    return prodOrigins
  }

  // In development/test, allow localhost origins + any custom ones
  const customOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : []

  return [...defaultOrigins, ...customOrigins]
}

const ALLOWED_ORIGINS = getAllowedOrigins()

logger.info(`🔒 CORS configured for origins: ${JSON.stringify(ALLOWED_ORIGINS)}`)

/**
 * CORS middleware configuration
 */
const corsMiddleware = cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return cb(null, true)
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      return cb(null, true)
    }

    logger.warn(`🚫 CORS blocked request from origin: ${origin}`)
    cb(new ForbiddenError(`Origin ${origin} not allowed by CORS policy`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-QR-Scan',
    'X-User-Agent',
    'X-Referrer',
    'X-Timestamp'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With', 'Content-Type', 'Accept'],
})

/**
 * Helper function to set CORS headers for static files
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const setStaticFileCorsHeaders = (req, res) => {
  const origin = req.get('Origin')

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else if (!origin) {
    // For requests without origin (direct file access), allow first allowed origin or none in production
    const fallbackOrigin =
      process.env.NODE_ENV === 'production'
        ? ALLOWED_ORIGINS.length > 0
          ? ALLOWED_ORIGINS[0]
          : null
        : 'http://localhost:3000'

    if (fallbackOrigin) {
      res.setHeader('Access-Control-Allow-Origin', fallbackOrigin)
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
}


/**
 * Middleware to add CORS headers to image file responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const imageFileCorsMiddleware = (req, res, next) => {
  if (req.url.includes('.jpg') || req.url.includes('.png') || req.url.includes('.jpeg')) {
    setStaticFileCorsHeaders(req, res)
  }
  next()
}

module.exports = {
  corsMiddleware,
  imageFileCorsMiddleware,
  getAllowedOrigins,
  setStaticFileCorsHeaders,
}
