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

// Import routes
const authRoutes = require('@routes/authRoutes')
const userRoutes = require('@routes/userRoutes')
const restaurantRoutes = require('@routes/restaurantRoutes')
const menuRoutes = require('@routes/menuRoutes')
const menuItemRoutes = require('@routes/menuItemRoutes')
const publicRoutes = require('@routes/publicRoutes')
const redirectRoutes = require('@routes/redirectRoutes')

// Create Express app
const app = express()

// Basic middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from public directory
// app.use(express.static(path.join(process.cwd(), 'public')))

// Security middleware
app.use(helmet())
app.use(cors())

// Logging middleware
app.use(morgan('dev'))
app.use(loggerMiddleware)

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to QrBites API',
    version: '1.0.0'
  })
})

// Public routes (no rate limiting)
app.use('/r', redirectRoutes)
app.use('/api/public', cacheMiddleware(1800), publicRoutes)

// Apply rate limiting to protected API routes
app.use('/api', apiLimiter)

// Protected routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/menus', menuRoutes)
app.use('/api/menu-items', menuItemRoutes)

// Multer error handler middleware
app.use(multerErrorHandler)

// 404 handler - must be after all routes
app.use(notFoundMiddleware)

// Error handler - must be the last middleware
app.use(errorHandlerMiddleware)

module.exports = app 