const express = require('express')
const morgan = require('morgan')
const passport = require('passport')
const { helmetConfig, makeQueryWritable } = require('@config/security')
const {
  getJsonParser,
  getUrlencodedParser,
  getCompression,
  getMongoSanitize,
} = require('@config/middlewareConfig')
const { mountRoutes } = require('@config/routes')
const { mountDocumentationRoutes } = require('@config/documentationRoutes')
const loggerMiddleware = require('@commonMiddlewares/loggerMiddleware')
const { notFoundMiddleware, errorHandlerMiddleware } = require('@commonMiddlewares/errorMiddleware')
const { ddosProtection, ipBlacklist } = require('@commonMiddlewares/rateLimitMiddleware')
const { corsMiddleware } = require('@commonMiddlewares/corsMiddleware')
const { multerErrorHandler } = require('@commonServices/upload')
const configurePassport = require('@config/passport')

const app = express()

// 1. CORS (must be first to handle preflight requests)
app.use(corsMiddleware)

// 2. Body parsers (before any middleware that needs parsed body)
app.use(getJsonParser())
app.use(getUrlencodedParser())

// 3. Security headers (helmet after CORS to avoid conflicts)
app.use(helmetConfig)

// 4. Logging (after body parsing to log complete requests)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
  app.use(loggerMiddleware)
}

// 5. Compression for responses
app.use(getCompression())

// 6. Fix for Express 5 compatibility with express-mongo-sanitize
app.use(makeQueryWritable)

// 7. MongoDB injection prevention
app.use(getMongoSanitize())

// 8. DDoS Protection and IP Blacklist
app.use(ddosProtection)
app.use(ipBlacklist.middleware())

// 9. Initialize Passport and configure OAuth strategies
configurePassport()
app.use(passport.initialize())

// API DOCUMENTATION
mountDocumentationRoutes(app)

// APPLICATION ROUTES
mountRoutes(app)

// ERROR HANDLING

// 404 handler (before error handlers)
app.use(notFoundMiddleware)

// Error handlers (must be last!)
app.use(multerErrorHandler)
app.use(errorHandlerMiddleware)

module.exports = app
