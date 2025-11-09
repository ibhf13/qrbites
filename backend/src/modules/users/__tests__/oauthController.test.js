const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('@src/app')
const User = require('../models/user')
const { generateToken } = require('@commonUtils/tokenUtils')

// Mock passport authentication
jest.mock('passport', () => ({
  authenticate: jest.fn(() => (req, res, next) => {
    // Simulate successful authentication
    req.user = {
      _id: 'mockUserId',
      email: 'test@example.com',
      name: 'Test User',
      displayName: 'Test User',
      role: 'user',
      authProvider: 'google',
    }
    next()
  }),
  use: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn(),
  initialize: jest.fn(() => (req, res, next) => next()),
  session: jest.fn(() => (req, res, next) => next()),
}))

describe('OAuth Controller', () => {
  describe('GET /api/auth/google/callback', () => {
    it('should redirect to frontend with token on successful authentication', async () => {
      const res = await request(app).get('/api/auth/google/callback')

      expect(res.status).toBe(302)
      expect(res.headers.location).toMatch(/\?token=/)
    })

    it('should return JSON with token when format=json', async () => {
      const res = await request(app).get('/api/auth/google/callback?format=json')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('token')
      expect(res.body.data).toHaveProperty('email')
      expect(res.body.data.authProvider).toBe('google')
    })

    it('should return valid JWT token in JSON format', async () => {
      const res = await request(app).get('/api/auth/google/callback?format=json')

      const { token } = res.body.data
      expect(token).toBeDefined()

      // Verify token is valid (would throw if invalid)
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      expect(decoded).toHaveProperty('id')
    })
  })
})
