const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const mongoSanitize = require('express-mongo-sanitize')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('@config/swagger')
const logger = require('@commonUtils/logger')
const loggerMiddleware = require('@commonMiddlewares/loggerMiddleware')
const { notFoundMiddleware, errorHandlerMiddleware } = require('@commonMiddlewares/errorMiddleware')
const {
  qrCodeScanLimiter,
  globalPublicLimiter,
  ddosProtection,
  ipBlacklist,
} = require('@commonMiddlewares/rateLimitMiddleware')
const { corsMiddleware } = require('@commonMiddlewares/corsMiddleware')
const { multerErrorHandler } = require('@commonServices/upload')
const { healthRoutes } = require('@modules/health/routes')
const authRoutes = require('@modules/users/routes/authRoutes')
const userRoutes = require('@modules/users/routes/userRoutes')
const restaurantRoutes = require('@modules/restaurants/routes/restaurantRoutes')
const menuRoutes = require('@modules/menus/routes/menuRoutes')
const menuItemRoutes = require('@modules/menuItems/routes/menuItemRoutes')
const publicRoutes = require('@modules/users/routes/publicRoutes')
const redirectRoutes = require('@modules/users/routes/redirectRoutes')
const app = express()

// 1. CORS (must be first to handle preflight requests)
app.use(corsMiddleware)

// 2. Body parsers (before any middleware that needs parsed body)
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf.toString('utf8')
    },
  })
)
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 3. Security headers (helmet after CORS to avoid conflicts)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:', 'https://res.cloudinary.com'],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for Swagger UI
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", 'data:'], // For Swagger UI fonts
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
)

// 4. Logging (after body parsing to log complete requests)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
  app.use(loggerMiddleware)
}

// 5. Compression for responses
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    },
    level: 6,
  })
)

// 6. Fix for Express 5 compatibility with express-mongo-sanitize
app.use((req, res, next) => {
  // Make req.query writable for express-mongo-sanitize compatibility
  Object.defineProperty(req, 'query', {
    ...Object.getOwnPropertyDescriptor(req, 'query'),
    value: req.query,
    writable: true,
  })
  next()
})

// 7. MongoDB injection prevention
app.use(
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      logger.warn(`Attempted NoSQL injection from ${req.ip}: ${key}`)
    },
  })
)

// 8. DDoS Protection and IP Blacklist
app.use(ddosProtection)
app.use(ipBlacklist.middleware())

// ============================================================
// API DOCUMENTATION (Swagger/OpenAPI)
// ============================================================
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .scheme-container { padding: 20px 0 }
  `,
  customSiteTitle: 'QrBites API Documentation',
  swaggerOptions: {
    persistAuthorization: true, // Keep auth token between page refreshes
    displayRequestDuration: true, // Show request duration
    filter: true, // Enable search/filter
    tryItOutEnabled: true, // Enable "Try it out" by default
    syntaxHighlight: {
      activate: true,
      theme: 'monokai',
    },
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    docExpansion: 'list', // 'list', 'full', or 'none'
  },
}

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions))

// Serve Swagger JSON spec
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// Log documentation URL on startup
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 5000
  logger.info(`📚 API Documentation available at: http://localhost:${port}/api-docs`)
}

// 9. Routes (with proper rate limiting scoping)

// Health check (no rate limiting needed)
app.use('/health', healthRoutes)

// QR code redirects (lenient rate limiting)
app.use('/r', qrCodeScanLimiter, redirectRoutes)

// Public API endpoints with specific rate limits
app.use('/api/public', globalPublicLimiter, publicRoutes)

// Auth routes (have their own specific rate limiters)
app.use('/api/auth', authRoutes)

// Protected routes (apply user restaurant filtering)
app.use('/api/users', userRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/menus', menuRoutes)
app.use('/api/menu-items', menuItemRoutes)

// 10. 404 handler (before error handler)
app.use(notFoundMiddleware)

// 11. Error handling (must be last!)
app.use(multerErrorHandler)
app.use(errorHandlerMiddleware)

module.exports = app