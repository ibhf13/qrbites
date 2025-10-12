/* eslint-disable */
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

/**
 * Environment configuration
 * Validates and exports all environment variables with defaults
 */

const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
]

// Validate required environment variables (skip in test environment)
// Test environment variables are set in jest.env.js before any imports
if (process.env.NODE_ENV !== 'test') {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '))
    console.error('Please check your .env file and ensure all required variables are set.')
    console.error('\nRequired variables:')
    console.error('  - JWT_SECRET: Your JWT secret key')
    console.error('  - MONGODB_URI: MongoDB connection string')
    console.error('  - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name')
    console.error('  - CLOUDINARY_API_KEY: Your Cloudinary API key')
    console.error('  - CLOUDINARY_API_SECRET: Your Cloudinary API secret')
    process.exit(1)
  }
}

const config = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  HOST: process.env.HOST || 'localhost',

  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_OPTIONS: {
    // Connection options are now handled by mongoose defaults
    // Keeping this for backward compatibility
  },

  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Cloudinary configuration (NEW)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // CORS configuration
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:5173'],

  // File upload configuration
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'), // For backward compatibility

  // API configuration
  API_URL: process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`,
  BASE_URL:
    process.env.BASE_URL || process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`,

  // Frontend URL (for redirects)
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Rate limiting configuration
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 5,
  CREATE_USER_RATE_LIMIT_MAX: parseInt(process.env.CREATE_USER_RATE_LIMIT_MAX, 10) || 3,

  // Cache configuration
  CACHE_TTL: parseInt(process.env.CACHE_TTL, 10) || 600, // 10 minutes

  // Logging configuration
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  LOG_FILE: process.env.LOG_FILE || path.join(__dirname, '../../logs/app.log'),

  // Security configuration
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  SESSION_SECRET: process.env.SESSION_SECRET || process.env.JWT_SECRET,

  // Development/Testing flags
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TESTING: process.env.NODE_ENV === 'test',
}

// Validate configuration in production
if (config.IS_PRODUCTION) {
  const productionWarnings = []

  if (config.JWT_SECRET === 'your-secret-key' || config.JWT_SECRET.length < 32) {
    productionWarnings.push('JWT_SECRET should be a strong, random string (32+ characters)')
  }

  if (config.ALLOWED_ORIGINS.length === 0) {
    productionWarnings.push('ALLOWED_ORIGINS should be explicitly set in production')
  }

  if (config.API_URL.includes('localhost')) {
    productionWarnings.push('API_URL should not use localhost in production')
  }

  if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET) {
    productionWarnings.push('Cloudinary credentials must be set in production')
  }

  if (productionWarnings.length > 0) {
    console.warn('⚠️  Production configuration warnings:')
    productionWarnings.forEach(warning => console.warn(`   - ${warning}`))
  }
}

// Log configuration summary (without sensitive data) - skip in test mode
if (config.NODE_ENV !== 'test' && config.MONGODB_URI) {
  console.log('🔧 Configuration loaded:')
  console.log(`   Environment: ${config.NODE_ENV}`)
  console.log(`   Port: ${config.PORT}`)
  console.log(`   Database: ${config.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`)
  console.log(`   Cloudinary: ${config.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Not configured'}`)
  console.log(`   CORS Origins: ${config.ALLOWED_ORIGINS.length} configured`)
  console.log(`   Log Level: ${config.LOG_LEVEL}`)
}

module.exports = config