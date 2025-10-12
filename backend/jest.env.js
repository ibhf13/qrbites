/**
 * Jest Environment Setup
 * Sets environment variables BEFORE any test files or modules are loaded
 * This file is loaded via setupFiles (before test framework) rather than
 * setupFilesAfterEnv (after test framework) to ensure env vars are available
 * when environment.js is first imported.
 */

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only'
process.env.JWT_EXPIRES_IN = '1h'
process.env.BCRYPT_ROUNDS = '4' // Lower rounds for faster tests
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
process.env.CLOUDINARY_API_KEY = 'test-api-key'
process.env.CLOUDINARY_API_SECRET = 'test-api-secret'
process.env.API_URL = 'http://localhost:5000'
process.env.FRONTEND_URL = 'http://localhost:3000'
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-placeholder' // Temporary, will be replaced by MongoMemoryServer

