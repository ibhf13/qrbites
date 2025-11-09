/**
 * Jest Setup File
 * Runs after test framework is installed but before tests
 * Environment variables are set in jest.env.js (loaded via setupFiles)
 */

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongoServer

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}))

// Mock QRCode library
jest.mock('qrcode', () => ({
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-qr-code-buffer')),
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,fakeQRCode'),
  toString: jest.fn().mockResolvedValue('<svg>fake-qr-code</svg>'),
}))

// Mock Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://test.cloudinary.com/test-image.jpg',
        public_id: 'test-public-id',
      }),
      upload_stream: jest.fn((options, callback) => {
        const stream = {
          end: jest.fn(() => {
            // Simulate successful upload
            if (callback) {
              callback(null, {
                secure_url: 'https://test.cloudinary.com/qr-code.png',
                public_id: 'qrcodes/test-qr-code',
                url: 'https://test.cloudinary.com/qr-code.png',
              })
            }
          }),
        }
        return stream
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}))

// Cloudinary config is now mocked via manual mock in __mocks__ directory
// Jest will automatically use src/config/__mocks__/cloudinary.js

// Mock Redis for rate limiting
jest.mock('ioredis', () => {
  const RedisMock = require('ioredis-mock')
  return RedisMock
})

// Mock express-rate-limit to bypass rate limiting in tests
jest.mock('express-rate-limit', () => {
  return jest.fn(() => {
    const middleware = (req, res, next) => next()
    middleware.resetKey = jest.fn()
    return middleware
  })
})

// Mock logger to reduce noise in tests
jest.mock('@commonUtils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  success: jest.fn(),
  http: jest.fn(),
}))

// Mock config module
jest.mock('@config', () => ({
  database: {
    connect: jest.fn().mockResolvedValue(true),
  },
  NODE_ENV: 'test',
  PORT: 5000,
  MONGODB_URI: 'mongodb://localhost:27017/test',
  JWT_SECRET: 'test-secret',
  JWT_EXPIRES_IN: '1h',
}))

// Setup MongoDB Memory Server
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  // Set the MONGODB_URI for the config
  process.env.MONGODB_URI = mongoUri

  await mongoose.connect(mongoUri)
})

// Clean up database between tests
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections
    for (const key in collections) {
      await collections[key].deleteMany({})
    }
  }
  jest.clearAllMocks()
})

// Disconnect and stop MongoDB Memory Server
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  if (mongoServer) {
    await mongoServer.stop()
  }
})

// Set test timeout
jest.setTimeout(10000)
