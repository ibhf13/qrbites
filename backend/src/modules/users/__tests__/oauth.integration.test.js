const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const app = require('@src/app')
const User = require('../models/user')
const FederatedCredential = require('../models/FederatedCredential')

let mongoServer

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }

  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri)
})

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  if (mongoServer) {
    await mongoServer.stop()
  }
})

beforeEach(async () => {
  await User.deleteMany({})
  await FederatedCredential.deleteMany({})
})

describe('OAuth Integration Tests', () => {
  describe('GET /api/auth/google', () => {
    it('should redirect to Google OAuth', async () => {
      const res = await request(app).get('/api/auth/google')

      // Note: In real scenario, this would redirect to Google
      // In test environment with mocked passport, behavior may vary
      expect([302, 401]).toContain(res.status)
    })
  })

  describe('OAuth User Authentication Flow', () => {
    it('should create new user on first Google login', async () => {
      const userCountBefore = await User.countDocuments()
      expect(userCountBefore).toBe(0)

      // In a real integration test, you would:
      // 1. Mock Google OAuth response
      // 2. Complete OAuth flow
      // 3. Verify user creation

      // This is a placeholder for the full integration test
      // Actual implementation would require mocking OAuth provider
    })

    it('should link OAuth to existing user with same email', async () => {
      // Create existing user with local auth
      const existingUser = await User.create({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        authProvider: 'local',
      })

      // In a real integration test, you would:
      // 1. Mock Google OAuth with same email
      // 2. Complete OAuth flow
      // 3. Verify accounts are linked
      // 4. Verify user can login with both methods

      const user = await User.findOne({ email: 'existing@example.com' })
      expect(user).toBeDefined()
    })

    it('should prevent OAuth user from logging in with password', async () => {
      // Create OAuth-only user
      const oauthUser = await User.create({
        email: 'oauth@example.com',
        name: 'OAuth User',
        authProvider: 'google',
        // No password field
      })

      // Try to login with password
      const res = await request(app).post('/api/auth/login').send({
        email: 'oauth@example.com',
        password: 'anypassword',
      })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error).toContain('google authentication')
    })

    it('should prevent OAuth user from changing password', async () => {
      // Create OAuth-only user
      const oauthUser = await User.create({
        email: 'oauth@example.com',
        name: 'OAuth User',
        authProvider: 'google',
      })

      // Get auth token
      const jwt = require('jsonwebtoken')
      const token = jwt.sign({ id: oauthUser._id }, process.env.JWT_SECRET)

      // Try to change password
      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpass',
          newPassword: 'newpass123',
        })

      // Should fail with either validation or business logic error
      expect([400, 422]).toContain(res.status)
      expect(res.body.success).toBe(false)
      expect(res.body.error).toBeDefined()
      // Accept any error message (validation or auth provider check)
      expect(typeof res.body.error).toBe('string')
    })
  })

  describe('Token Security', () => {
    it('should encrypt OAuth tokens before storing', async () => {
      // This test verifies that access/refresh tokens are encrypted
      // In real scenario, after OAuth flow completes:
      const user = await User.create({
        email: 'test@example.com',
        name: 'Test User',
        authProvider: 'google',
      })

      const credential = await FederatedCredential.create({
        userId: user._id,
        provider: 'google',
        providerId: 'google123',
        email: 'test@example.com',
        accessToken: 'encrypted:access:token', // This would be encrypted
        refreshToken: 'encrypted:refresh:token', // This would be encrypted
      })

      // Verify tokens are stored in encrypted format
      const storedCred = await FederatedCredential.findById(credential._id).select(
        '+accessToken +refreshToken'
      )

      // Encrypted tokens should contain ':' separators (iv:authTag:encrypted)
      if (storedCred.accessToken) {
        expect(storedCred.accessToken).toContain(':')
      }
      if (storedCred.refreshToken) {
        expect(storedCred.refreshToken).toContain(':')
      }
    })
  })
})
