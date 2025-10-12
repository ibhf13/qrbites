const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('@app')
const User = require('@modules/users/models/user')
const { createTestUser, generateToken } = require('../../../../../__tests__/helpers/testHelpers')
const { userFactory, mockUsers } = require('../../../../../__tests__/helpers/factories')

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'ValidPassword123!',
        name: 'New User',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('_id')
      expect(response.body.data).toHaveProperty('email', userData.email.toLowerCase())
      expect(response.body.data).toHaveProperty('name', userData.name)
      expect(response.body.data).toHaveProperty('role', 'user')
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data).not.toHaveProperty('password')

      // Verify token is valid
      const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET)
      expect(decoded.id).toBe(response.body.data._id)
    })

    it('should trim and lowercase email on registration', async () => {
      const userData = {
        email: 'UPPERCASE@EXAMPLE.COM',
        password: 'ValidPassword123!',
        name: 'Test User',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.data.email).toBe('uppercase@example.com')
    })

    it('should reject registration with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'ValidPassword123!',
        name: 'First User',
      }

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...userData,
          name: 'Second User',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('already exists')
    })

    it('should reject registration with missing email', async () => {
      const userData = {
        password: 'ValidPassword123!',
        name: 'Test User',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(422)

      expect(response.body.success).toBe(false)
    })

    it('should reject registration with missing password', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(422)

      expect(response.body.success).toBe(false)
    })

    it('should reject registration with short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '12345',
        name: 'Test User',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(422)

      expect(response.body.success).toBe(false)
    })

    it('should allow registration without name', async () => {
      const userData = {
        email: 'noname@example.com',
        password: 'ValidPassword123!',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.data.email).toBe(userData.email)
      expect(response.body.data.displayName).toBe('Anonymous User')
    })

    it('should set default role to user', async () => {
      const userData = {
        email: 'defaultrole@example.com',
        password: 'ValidPassword123!',
        name: 'Test User',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.data.role).toBe('user')
    })

    it('should not allow setting admin role through registration', async () => {
      const userData = {
        email: 'admin@example.com',
        password: 'ValidPassword123!',
        name: 'Admin User',
        role: 'admin',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      // Should ignore the role field and default to 'user'
      expect(response.body.data.role).toBe('user')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const password = 'ValidPassword123!'
      const { user } = await createTestUser({ password })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password,
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('_id', user._id.toString())
      expect(response.body.data).toHaveProperty('email', user.email)
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data).not.toHaveProperty('password')

      // Verify token is valid
      const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET)
      expect(decoded.id).toBe(user._id.toString())
    })

    it('should handle case-insensitive email login', async () => {
      const password = 'ValidPassword123!'
      const { user } = await createTestUser({
        email: 'lowercase@example.com',
        password
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'LOWERCASE@EXAMPLE.COM',
          password,
        })
        .expect(200)

      expect(response.body.data.email).toBe(user.email)
    })

    it('should trim email whitespace on login', async () => {
      const password = 'ValidPassword123!'
      const { user } = await createTestUser({ password })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email.toUpperCase(),
          password,
        })
        .expect(200)

      expect(response.body.data.email).toBe(user.email)
    })

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'ValidPassword123!',
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid credentials')
    })

    it('should reject login with incorrect password', async () => {
      const { user } = await createTestUser({ password: 'CorrectPassword123!' })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'WrongPassword123!',
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid credentials')
    })

    it('should reject login for inactive user', async () => {
      const password = 'ValidPassword123!'
      const { user } = await createTestUser({
        password,
        isActive: false
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password,
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('disabled')
    })

    it('should reject login with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'ValidPassword123!',
        })
        .expect(422)

      expect(response.body.success).toBe(false)
    })

    it('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(422)

      expect(response.body.success).toBe(false)
    })

    it('should return displayName in login response', async () => {
      const password = 'ValidPassword123!'
      const { user } = await createTestUser({
        name: 'John Doe',
        password
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password,
        })
        .expect(200)

      expect(response.body.data.displayName).toBe('John Doe')
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user profile with valid token', async () => {
      const { user, token } = await createTestUser()

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('_id', user._id.toString())
      expect(response.body.data).toHaveProperty('email', user.email)
      expect(response.body.data).toHaveProperty('name', user.name)
      expect(response.body.data).not.toHaveProperty('password')
    })

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('no token')
    })

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should reject request with expired token', async () => {
      const { user } = await createTestUser()

      // Create an expired token
      const expiredToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      )

      await new Promise(resolve => setTimeout(resolve, 100))

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should reject request for deleted user', async () => {
      const { user, token } = await createTestUser()

      // Delete the user
      await User.findByIdAndDelete(user._id)

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('not found')
    })

    it('should reject request for inactive user', async () => {
      const { user, token } = await createTestUser()

      // Deactivate the user
      await User.findByIdAndUpdate(user._id, { isActive: false })

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('disabled')
    })
  })

  describe('PUT /api/auth/password', () => {
    it('should change password with valid current password', async () => {
      const currentPassword = 'CurrentPassword123!'
      const newPassword = 'NewPassword123!'
      const { user, token } = await createTestUser({ password: currentPassword })

      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword,
          newPassword,
          confirmPassword: newPassword,
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('updated successfully')

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: newPassword,
        })
        .expect(200)

      expect(loginResponse.body.success).toBe(true)
    })

    it('should reject password change with incorrect current password', async () => {
      const currentPassword = 'CurrentPassword123!'
      const { user, token } = await createTestUser({ password: currentPassword })

      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Current password is incorrect')
    })

    it('should reject password change without authentication', async () => {
      const response = await request(app)
        .put('/api/auth/password')
        .send({
          currentPassword: 'CurrentPassword123!',
          newPassword: 'NewPassword123!',
        })
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should reject password change with missing current password', async () => {
      const { token } = await createTestUser()

      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          newPassword: 'NewPassword123!',
        })
        .expect(422)

      expect(response.body.success).toBe(false)
    })

    it('should reject password change with missing new password', async () => {
      const currentPassword = 'CurrentPassword123!'
      const { token } = await createTestUser({ password: currentPassword })

      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword,
        })
        .expect(422)

      expect(response.body.success).toBe(false)
    })

    it('should reject password change with short new password', async () => {
      const currentPassword = 'CurrentPassword123!'
      const { token } = await createTestUser({ password: currentPassword })

      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword,
          newPassword: '12345',
        })
        .expect(422)

      expect(response.body.success).toBe(false)
    })

    it('should hash new password after change', async () => {
      const currentPassword = 'CurrentPassword123!'
      const newPassword = 'NewPassword123!'
      const { user, token } = await createTestUser({ password: currentPassword })

      await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword,
          newPassword,
          confirmPassword: newPassword,
        })
        .expect(200)

      // Fetch updated user
      const updatedUser = await User.findById(user._id)
      expect(updatedUser.password).not.toBe(newPassword)
      expect(updatedUser.password.length).toBeGreaterThan(20)
    })
  })

  describe('Token Generation', () => {
    it('should generate valid JWT token on registration', async () => {
      const userData = {
        email: 'tokentest@example.com',
        password: 'ValidPassword123!',
        name: 'Token Test',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      const token = response.body.data.token
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      expect(decoded).toHaveProperty('id')
      expect(decoded).toHaveProperty('iat')
      expect(decoded).toHaveProperty('exp')
    })

    it('should generate valid JWT token on login', async () => {
      const password = 'ValidPassword123!'
      const { user } = await createTestUser({ password })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password,
        })
        .expect(200)

      const token = response.body.data.token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      expect(decoded.id).toBe(user._id.toString())
    })
  })
})

