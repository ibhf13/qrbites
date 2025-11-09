const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const User = require('../models/user')
const FederatedCredential = require('../models/FederatedCredential')
const { findUserByFederatedCredential, findOrCreateOAuthUser } = require('../services/oauthService')

let mongoServer

beforeAll(async () => {
  // Disconnect any existing connections
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

describe('OAuth Service', () => {
  describe('findUserByFederatedCredential', () => {
    it('should return user if federated credential exists', async () => {
      // Create user
      const user = await User.create({
        email: 'test@example.com',
        name: 'Test User',
        authProvider: 'google',
      })

      // Create federated credential
      await FederatedCredential.create({
        userId: user._id,
        provider: 'google',
        providerId: 'google123',
        email: 'test@example.com',
      })

      const foundUser = await findUserByFederatedCredential('google', 'google123')

      expect(foundUser).toBeDefined()
      expect(foundUser.email).toBe('test@example.com')
    })

    it('should return null if federated credential does not exist', async () => {
      const foundUser = await findUserByFederatedCredential('google', 'nonexistent')
      expect(foundUser).toBeNull()
    })
  })

  describe('findOrCreateOAuthUser', () => {
    it('should create new user and federated credential for first-time OAuth login', async () => {
      const profile = {
        id: 'google123',
        email: 'newuser@example.com',
        displayName: 'New User',
        picture: 'https://example.com/photo.jpg',
      }

      const tokens = { accessToken: 'access', refreshToken: 'refresh' }
      const user = await findOrCreateOAuthUser(profile, 'google', tokens)

      expect(user).toBeDefined()
      expect(user.email).toBe('newuser@example.com')
      expect(user.authProvider).toBe('google')

      // Verify federated credential was created
      const credential = await FederatedCredential.findOne({
        providerId: 'google123',
      })
      expect(credential).toBeDefined()
      expect(credential.userId.toString()).toBe(user._id.toString())
    })

    it('should link OAuth account to existing user with same email', async () => {
      // Create existing user with local auth
      const existingUser = await User.create({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        authProvider: 'local',
      })

      const profile = {
        id: 'google456',
        email: 'existing@example.com',
        displayName: 'Existing User',
        picture: 'https://example.com/photo.jpg',
      }

      const tokens = { accessToken: 'access', refreshToken: 'refresh' }
      const user = await findOrCreateOAuthUser(profile, 'google', tokens)

      expect(user._id.toString()).toBe(existingUser._id.toString())

      // Verify federated credential was created and linked
      const credential = await FederatedCredential.findOne({
        providerId: 'google456',
      })
      expect(credential).toBeDefined()
      expect(credential.userId.toString()).toBe(existingUser._id.toString())
    })

    it('should return existing user for returning OAuth user', async () => {
      // Setup existing OAuth user
      const user = await User.create({
        email: 'oauth@example.com',
        name: 'OAuth User',
        authProvider: 'google',
      })

      await FederatedCredential.create({
        userId: user._id,
        provider: 'google',
        providerId: 'google789',
        email: 'oauth@example.com',
      })

      const profile = {
        id: 'google789',
        email: 'oauth@example.com',
        displayName: 'OAuth User',
      }

      const tokens = { accessToken: 'access', refreshToken: 'refresh' }
      const returnedUser = await findOrCreateOAuthUser(profile, 'google', tokens)

      expect(returnedUser._id.toString()).toBe(user._id.toString())
    })
  })
})
