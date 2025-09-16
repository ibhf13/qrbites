const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
const logger = require('@utils/logger')
const loggerMiddleware = require('@middlewares/loggerMiddleware')
const { notFoundMiddleware, errorHandlerMiddleware } = require('@middlewares/errorMiddleware')
const { apiLimiter } = require('@middlewares/rateLimitMiddleware')
const { multerErrorHandler } = require('@services/fileUploadService')
const { cacheMiddleware } = require('@middlewares/cacheMiddleware')

const authRoutes = require('@routes/authRoutes')
const userRoutes = require('@routes/userRoutes')
const profileRoutes = require('@routes/profileRoutes')
const restaurantRoutes = require('@routes/restaurantRoutes')
const menuRoutes = require('@routes/menuRoutes')
const menuItemRoutes = require('@routes/menuItemRoutes')
const publicRoutes = require('@routes/publicRoutes')
const redirectRoutes = require('@routes/redirectRoutes')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from public directory
// app.use(express.static(path.join(process.cwd(), 'public')))

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

// Environment-based CORS configuration
const getAllowedOrigins = () => {
  const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173']

  if (process.env.NODE_ENV === 'production') {
    // In production, use only explicitly defined origins
    const prodOrigins = process.env.ALLOWED_ORIGINS ?
      process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) :
      []

    if (prodOrigins.length === 0) {
      logger.warn('⚠️  PRODUCTION WARNING: No ALLOWED_ORIGINS defined. CORS will block all requests!')
    }

    return prodOrigins
  }

  // In development/test, allow localhost origins + any custom ones
  const customOrigins = process.env.ALLOWED_ORIGINS ?
    process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) :
    []

  return [...defaultOrigins, ...customOrigins]
}

const ALLOWED_ORIGINS = getAllowedOrigins()

logger.info(`🔒 CORS configured for origins: ${JSON.stringify(ALLOWED_ORIGINS)}`)

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return cb(null, true)
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      return cb(null, true)
    }

    logger.warn(`🚫 CORS blocked request from origin: ${origin}`)
    cb(new Error(`Origin ${origin} not allowed by CORS policy`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With', 'Content-Type', 'Accept']
}))

app.use(morgan('dev'))
app.use(loggerMiddleware)

// Helper function to set CORS headers for static files
const setStaticFileCorsHeaders = (req, res) => {
  const origin = req.get('Origin')

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else if (!origin) {
    // For requests without origin (direct file access), allow first allowed origin or none in production
    const fallbackOrigin = process.env.NODE_ENV === 'production' ?
      (ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS[0] : null) :
      'http://localhost:3000'

    if (fallbackOrigin) {
      res.setHeader('Access-Control-Allow-Origin', fallbackOrigin)
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
}

// Add CORS headers for static files before serving them
app.use('/uploads', (req, res, next) => {
  setStaticFileCorsHeaders(req, res)
  next()
})

// Also handle potential /restaurants/ path for images
app.use('/restaurants', (req, res, next) => {
  if (req.url.includes('.jpg') || req.url.includes('.png') || req.url.includes('.webp') || req.url.includes('.gif')) {
    setStaticFileCorsHeaders(req, res)
  }
  next()
})

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to QrBites API',
    version: '1.0.0'
  })
})

app.use('/r', redirectRoutes)
app.use('/api/public', cacheMiddleware(1800), publicRoutes)

app.use('/api', apiLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/menus', menuRoutes)
app.use('/api/menu-items', menuItemRoutes)

app.use(multerErrorHandler)

app.use(notFoundMiddleware)

app.use(errorHandlerMiddleware)

module.exports = app 