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

const ALLOWED_ORIGINS = ['http://localhost:3000']

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return cb(null, true)
    }
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['Content-Length', 'X-Requested-With', 'Content-Type', 'Accept']
}))

app.use(morgan('dev'))
app.use(loggerMiddleware)

// Add CORS headers for static files before serving them
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// Also handle potential /restaurants/ path for images
app.use('/restaurants', (req, res, next) => {
  if (req.url.includes('.jpg') || req.url.includes('.png') || req.url.includes('.webp') || req.url.includes('.gif')) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
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