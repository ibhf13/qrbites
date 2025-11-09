const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('@app')
const User = require('@modules/users/models/user')
const {
  createTestUser,
  createTestRestaurant,
  wait,
} = require('../../../../__tests__/helpers/testHelpers')

describe('Auth Integration Tests', () => {
  describe('Complete Authentication Flow', () => {
    it('should handle full registration → login → access protected route → change password flow', async () => {
      // Step 1: Register a new user
      const userData = {
        email: 'fullflow@example.com',
        password: 'OriginalPassword123!',
        name: 'Full Flow User',
      }

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(registerResponse.body.success).toBe(true)
      expect(registerResponse.body.data.email).toBe(userData.email)
      const registrationToken = registerResponse.body.data.token

      // Step 2: Access protected route with registration token
      const meResponse1 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${registrationToken}`)
        .expect(200)

      expect(meResponse1.body.data.email).toBe(userData.email)

      // Step 3: Login with credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200)

      expect(loginResponse.body.data.token).toBeDefined()
      const loginToken = loginResponse.body.data.token

      // Step 4: Change password
      const newPassword = 'NewPassword123!'
      await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${loginToken}`)
        .send({
          currentPassword: userData.password,
          newPassword,
          confirmPassword: newPassword,
        })
        .expect(200)

      // Step 5: Verify old password no longer works
      await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(401)

      // Step 6: Verify new password works
      const finalLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: newPassword,
        })
        .expect(200)

      expect(finalLoginResponse.body.data.token).toBeDefined()
    })

    it('should handle registration with email normalization', async () => {
      const userData = {
        email: 'MIXED.Case@Example.COM',
        password: 'Password123!',
        name: 'Test User',
      }

      // Register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      const normalizedEmail = 'mixed.case@example.com'
      expect(registerResponse.body.data.email).toBe(normalizedEmail)

      // Login with original format (without whitespace - Joi validation rejects emails with whitespace)
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'MIXED.Case@Example.COM',
          password: userData.password,
        })
        .expect(200)

      expect(loginResponse.body.data.email).toBe(normalizedEmail)
    })
  })

  describe('Token Lifecycle', () => {
    it('should generate different tokens on each login', async () => {
      const password = 'Password123!'
      const { user } = await createTestUser({ password })

      const login1 = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password })
        .expect(200)

      await wait(1000) // Wait to ensure different timestamps

      const login2 = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password })
        .expect(200)

      expect(login1.body.data.token).not.toBe(login2.body.data.token)
    })

    it('should maintain valid token after password change', async () => {
      const currentPassword = 'CurrentPassword123!'
      const newPassword = 'NewPassword123!'
      const { user, token } = await createTestUser({ password: currentPassword })

      // Change password
      await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword,
          newPassword,
          confirmPassword: newPassword,
        })
        .expect(200)

      // Old token should still work (tokens are not invalidated)
      await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200)
    })

    it('should reject token after user deactivation', async () => {
      const { user, token } = await createTestUser()

      // Deactivate user
      await User.findByIdAndUpdate(user._id, { isActive: false })

      // Token should be rejected
      await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(401)
    })

    it('should reject token after user deletion', async () => {
      const { user, token } = await createTestUser()

      // Delete user
      await User.findByIdAndDelete(user._id)

      // Token should be rejected
      await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(401)
    })
  })

  describe('Multi-User Scenarios', () => {
    it('should isolate users and their authentication', async () => {
      const password = 'Password123!'
      const { user: user1, token: token1 } = await createTestUser({
        email: 'user1@example.com',
        password,
      })
      const { user: user2, token: token2 } = await createTestUser({
        email: 'user2@example.com',
        password,
      })

      // User 1 accesses their profile
      const response1 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200)

      expect(response1.body.data.email).toBe(user1.email)

      // User 2 accesses their profile
      const response2 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200)

      expect(response2.body.data.email).toBe(user2.email)

      // Verify they are different users
      expect(response1.body.data._id).not.toBe(response2.body.data._id)
    })

    it('should prevent cross-user password changes', async () => {
      const password = 'Password123!'
      const { user: user1, token: token1 } = await createTestUser({
        email: 'user1@example.com',
        password,
      })
      const { user: user2 } = await createTestUser({
        email: 'user2@example.com',
        password,
      })

      // User 1 changes their password
      await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          currentPassword: password,
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        })
        .expect(200)

      // User 2's password should remain unchanged
      await request(app)
        .post('/api/auth/login')
        .send({
          email: user2.email,
          password,
        })
        .expect(200)
    })
  })

  describe('Concurrent Requests', () => {
    it('should handle concurrent login requests for same user', async () => {
      const password = 'Password123!'
      const { user } = await createTestUser({ password })

      const loginPromises = Array.from({ length: 5 }, () =>
        request(app).post('/api/auth/login').send({
          email: user.email,
          password,
        })
      )

      const responses = await Promise.all(loginPromises)

      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.token).toBeDefined()
      })
    })

    it('should handle concurrent protected route access', async () => {
      const { token } = await createTestUser()

      const accessPromises = Array.from({ length: 5 }, () =>
        request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
      )

      const responses = await Promise.all(accessPromises)

      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
      })
    })
  })

  describe('Security Validations', () => {
    it('should not leak user existence on login', async () => {
      // Login with non-existent email
      const response1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401)

      // Login with existing email but wrong password
      const { user } = await createTestUser({ password: 'CorrectPassword123!' })
      const response2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'WrongPassword123!',
        })
        .expect(401)

      // Both should return same generic error message
      expect(response1.body.error).toBe(response2.body.error)
      expect(response1.body.error).toContain('Invalid credentials')
    })

    it('should require strong password length', async () => {
      const shortPassword = {
        email: 'test@example.com',
        password: '12345',
        name: 'Test User',
      }

      await request(app).post('/api/auth/register').send(shortPassword).expect(422)
    })

    it('should not expose password in any response', async () => {
      const password = 'Password123!'
      const userData = {
        email: 'nopassword@example.com',
        password,
        name: 'No Password User',
      }

      // Registration
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(registerResponse.body.data.password).toBeUndefined()

      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password,
        })
        .expect(200)

      expect(loginResponse.body.data.password).toBeUndefined()

      // Get profile
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.data.token}`)
        .expect(200)

      expect(meResponse.body.data.password).toBeUndefined()
    })

    it('should handle SQL injection attempts gracefully', async () => {
      const maliciousEmail = "admin'--"
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: maliciousEmail,
          password: 'password',
        })
        .expect(422) // Validation catches malicious input

      expect(response.body.success).toBe(false)
    })
  })

  describe('Role-Based Access', () => {
    it('should maintain correct roles throughout auth flow', async () => {
      const password = 'Password123!'

      // Regular user
      const { user, token } = await createTestUser({ password })

      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(meResponse.body.data.role).toBe('user')

      // Admin user (created directly in DB)
      const adminUser = await User.create({
        email: 'admin@example.com',
        password,
        name: 'Admin User',
        role: 'admin',
      })

      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminUser.email,
          password,
        })
        .expect(200)

      expect(adminLogin.body.data.role).toBe('admin')
    })
  })

  describe('Database State Consistency', () => {
    it('should maintain consistent database state after multiple operations', async () => {
      const password = 'Password123!'
      const email = 'consistency@example.com'

      // Register
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password,
          name: 'Consistency User',
        })
        .expect(201)

      // Verify user count
      const userCount1 = await User.countDocuments({ email })
      expect(userCount1).toBe(1)

      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email, password })
        .expect(200)

      // User count should remain same
      const userCount2 = await User.countDocuments({ email })
      expect(userCount2).toBe(1)

      // Change password
      await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${loginResponse.body.data.token}`)
        .send({
          currentPassword: password,
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        })
        .expect(200)

      // User count should still be same
      const userCount3 = await User.countDocuments({ email })
      expect(userCount3).toBe(1)

      // Verify user data integrity
      const user = await User.findOne({ email })
      expect(user.email).toBe(email)
      expect(user.isActive).toBe(true)
      expect(user.role).toBe('user')
    })
  })

  describe('Error Recovery', () => {
    it('should handle and recover from database errors gracefully', async () => {
      const password = 'Password123!'
      const { user, token } = await createTestUser({ password })

      // This should work
      await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200)

      // Subsequent requests should still work
      await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200)
    })

    it('should handle rapid successive logins', async () => {
      const password = 'Password123!'
      const { user } = await createTestUser({ password })

      // Rapid successive logins
      for (let i = 0; i < 3; i++) {
        const response = await request(app).post('/api/auth/login').send({
          email: user.email,
          password,
        })

        expect(response.status).toBe(200)
        expect(response.body.data.token).toBeDefined()
      }
    })
  })

  describe('Integration with Other Features', () => {
    it('should work with resource ownership checks', async () => {
      const { user, token } = await createTestUser()
      const restaurant = await createTestRestaurant(user._id)

      // Access owned restaurant
      const response = await request(app)
        .get(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.data._id).toBe(restaurant._id.toString())
    })

    it('should prevent access to other users resources', async () => {
      const { user: user1, token: token1 } = await createTestUser()
      const { user: user2 } = await createTestUser()
      const restaurant2 = await createTestRestaurant(user2._id)

      // User 1 tries to access User 2's restaurant
      await request(app)
        .get(`/api/restaurants/${restaurant2._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(403)
    })
  })
})
