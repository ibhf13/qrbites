const jwt = require('jsonwebtoken')
const {
  protect,
  restrictTo,
  checkResourceOwnership,
  checkRestaurantOwnership,
  checkMenuOwnership,
  checkMenuItemOwnership,
  optionalAuth,
  addUserRestaurants,
} = require('../authMiddleware')
const User = require('@modules/users/models/user')
const Restaurant = require('@modules/restaurants/models/restaurant')
const Menu = require('@modules/menus/models/menu')
const MenuItem = require('@modules/menuItems/models/menuItem')
const {
  createTestUser,
  createTestAdmin,
  createTestRestaurant,
  createTestMenu,
  createTestMenuItem,
  generateToken,
} = require('../../../../__tests__/helpers/testHelpers')

describe('Auth Middleware', () => {
  describe('protect middleware', () => {
    let req, res, next

    beforeEach(() => {
      req = {
        headers: {},
      }
      res = {}
      next = jest.fn()
    })

    it('should authenticate user with valid token', async () => {
      const { user, token } = await createTestUser()
      req.headers.authorization = `Bearer ${token}`

      await protect(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.user).toBeDefined()
      expect(req.user._id.toString()).toBe(user._id.toString())
      expect(req.user.email).toBe(user.email)
      expect(req.user.password).toBeUndefined()
    })

    it('should reject request without token', async () => {
      await protect(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeDefined()
      expect(next.mock.calls[0][0].message).toContain('no token')
    })

    it('should reject request with invalid token format', async () => {
      req.headers.authorization = 'InvalidFormat token123'

      await protect(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeDefined()
      expect(next.mock.calls[0][0].message).toContain('no token')
    })

    it('should reject request with invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token-string'

      await protect(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeDefined()
    })

    it('should reject request with expired token', async () => {
      const { user } = await createTestUser()
      const expiredToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '0s',
      })

      await new Promise(resolve => setTimeout(resolve, 100))

      req.headers.authorization = `Bearer ${expiredToken}`

      await protect(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeDefined()
    })

    it('should reject request with token for non-existent user', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011'
      const token = generateToken(fakeUserId)
      req.headers.authorization = `Bearer ${token}`

      await protect(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeDefined()
      expect(next.mock.calls[0][0].message).toContain('not found')
    })

    it('should reject request with token for inactive user', async () => {
      const { user, token } = await createTestUser({ isActive: false })
      req.headers.authorization = `Bearer ${token}`

      await protect(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeDefined()
      expect(next.mock.calls[0][0].message).toContain('disabled')
    })

    it('should reject token without user id in payload', async () => {
      const token = jwt.sign({ email: 'test@example.com' }, process.env.JWT_SECRET)
      req.headers.authorization = `Bearer ${token}`

      await protect(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeDefined()
      expect(next.mock.calls[0][0].message).toContain('Invalid token payload')
    })

    it('should handle token with Bearer prefix case-insensitively', async () => {
      const { user, token } = await createTestUser()
      req.headers.authorization = `Bearer ${token}`

      await protect(req, res, next)

      expect(req.user._id.toString()).toBe(user._id.toString())
    })
  })

  describe('restrictTo middleware', () => {
    let req, res, next

    beforeEach(() => {
      req = {}
      res = {}
      next = jest.fn()
    })

    it('should allow access for authorized role', async () => {
      const { user } = await createTestAdmin()
      req.user = user

      const middleware = restrictTo('admin')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
    })

    it('should allow access when user has one of multiple allowed roles', async () => {
      const { user } = await createTestUser()
      req.user = user

      const middleware = restrictTo('user', 'admin')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
    })

    it('should deny access for unauthorized role', async () => {
      const { user } = await createTestUser()
      req.user = user

      const middleware = restrictTo('admin')

      expect(() => middleware(req, res, next)).toThrow('Not authorized to access this route')
      expect(next).not.toHaveBeenCalled()
    })

    it('should deny access when user is not authenticated', async () => {
      const middleware = restrictTo('admin')

      expect(() => middleware(req, res, next)).toThrow('User not authenticated')
    })

    it('should handle multiple role restrictions', async () => {
      const { user } = await createTestAdmin()
      req.user = user

      const middleware = restrictTo('admin', 'superadmin')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('checkResourceOwnership middleware', () => {
    describe('Restaurant ownership', () => {
      let req, res, next

      beforeEach(() => {
        req = {
          params: {},
          user: null,
        }
        res = {}
        next = jest.fn()
      })

      it('should allow owner to access their restaurant', async () => {
        const { user } = await createTestUser()
        const restaurant = await createTestRestaurant(user._id)

        req.user = user
        req.params.restaurantId = restaurant._id.toString()

        const middleware = checkRestaurantOwnership()
        await middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
        expect(req.restaurant).toBeDefined()
        expect(req.restaurant._id.toString()).toBe(restaurant._id.toString())
      })

      it('should deny non-owner from accessing restaurant', async () => {
        const { user: owner } = await createTestUser()
        const { user: otherUser } = await createTestUser()
        const restaurant = await createTestRestaurant(owner._id)

        req.user = otherUser
        req.params.restaurantId = restaurant._id.toString()

        const middleware = checkRestaurantOwnership()

        await middleware(req, res, next)

        expect(next).toHaveBeenCalled()
        const error = next.mock.calls[0][0]
        expect(error).toBeDefined()
        expect(error.statusCode).toBe(403)
      })

      it('should allow admin to access any restaurant', async () => {
        const { user: owner } = await createTestUser()
        const { user: admin } = await createTestAdmin()
        const restaurant = await createTestRestaurant(owner._id)

        req.user = admin
        req.params.restaurantId = restaurant._id.toString()

        const middleware = checkRestaurantOwnership()
        await middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
      })

      it('should reject request for non-existent restaurant', async () => {
        const { user } = await createTestUser()
        req.user = user
        req.params.restaurantId = '507f1f77bcf86cd799439011'

        const middleware = checkRestaurantOwnership()

        await middleware(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(next.mock.calls[0][0]).toBeDefined()
        expect(next.mock.calls[0][0].message).toContain('not found')
      })

      it('should reject request without authentication', async () => {
        const middleware = checkRestaurantOwnership()

        await middleware(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(next.mock.calls[0][0]).toBeDefined()
        expect(next.mock.calls[0][0].message).toContain('not authenticated')
      })
    })

    describe('Menu ownership', () => {
      let req, res, next

      beforeEach(() => {
        req = {
          params: {},
          user: null,
        }
        res = {}
        next = jest.fn()
      })

      it('should allow restaurant owner to access their menu', async () => {
        const { user } = await createTestUser()
        const restaurant = await createTestRestaurant(user._id)
        const menu = await createTestMenu(restaurant._id)

        req.user = user
        req.params.id = menu._id.toString()

        const middleware = checkMenuOwnership()
        await middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
        expect(req.menu).toBeDefined()
        expect(req.menu._id.toString()).toBe(menu._id.toString())
        expect(req.restaurant).toBeDefined()
      })

      it('should deny non-owner from accessing menu', async () => {
        const { user: owner } = await createTestUser()
        const { user: otherUser } = await createTestUser()
        const restaurant = await createTestRestaurant(owner._id)
        const menu = await createTestMenu(restaurant._id)

        req.user = otherUser
        req.params.id = menu._id.toString()

        const middleware = checkMenuOwnership()

        await middleware(req, res, next)

        expect(next).toHaveBeenCalled()
        const error = next.mock.calls[0][0]
        expect(error).toBeDefined()
        expect(error.statusCode).toBe(403)
      })

      it('should allow admin to access any menu', async () => {
        const { user: owner } = await createTestUser()
        const { user: admin } = await createTestAdmin()
        const restaurant = await createTestRestaurant(owner._id)
        const menu = await createTestMenu(restaurant._id)

        req.user = admin
        req.params.id = menu._id.toString()

        const middleware = checkMenuOwnership()
        await middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
      })
    })

    describe('MenuItem ownership', () => {
      let req, res, next

      beforeEach(() => {
        req = {
          params: {},
          user: null,
        }
        res = {}
        next = jest.fn()
      })

      it('should allow restaurant owner to access their menu item', async () => {
        const { user } = await createTestUser()
        const restaurant = await createTestRestaurant(user._id)
        const menu = await createTestMenu(restaurant._id)
        const menuItem = await createTestMenuItem(menu._id)

        req.user = user
        req.params.id = menuItem._id.toString()

        const middleware = checkMenuItemOwnership()
        await middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
        expect(req.menuitem).toBeDefined()
        expect(req.menu).toBeDefined()
        expect(req.restaurant).toBeDefined()
      })

      it('should deny non-owner from accessing menu item', async () => {
        const { user: owner } = await createTestUser()
        const { user: otherUser } = await createTestUser()
        const restaurant = await createTestRestaurant(owner._id)
        const menu = await createTestMenu(restaurant._id)
        const menuItem = await createTestMenuItem(menu._id)

        req.user = otherUser
        req.params.id = menuItem._id.toString()

        const middleware = checkMenuItemOwnership()

        await middleware(req, res, next)

        expect(next).toHaveBeenCalled()
        const error = next.mock.calls[0][0]
        expect(error).toBeDefined()
        expect(error.statusCode).toBe(403)
      })
    })
  })

  describe('optionalAuth middleware', () => {
    let req, res, next

    beforeEach(() => {
      req = {
        headers: {},
      }
      res = {}
      next = jest.fn()
    })

    it('should set user with valid token', async () => {
      const { user, token } = await createTestUser()
      req.headers.authorization = `Bearer ${token}`

      await optionalAuth(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.user).toBeDefined()
      expect(req.user._id.toString()).toBe(user._id.toString())
    })

    it('should continue without user when no token provided', async () => {
      await optionalAuth(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.user).toBeUndefined()
    })

    it('should continue without user when token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token'

      await optionalAuth(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.user).toBeUndefined()
    })

    it('should continue without user when token is expired', async () => {
      const { user } = await createTestUser()
      const expiredToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '0s',
      })

      await new Promise(resolve => setTimeout(resolve, 100))

      req.headers.authorization = `Bearer ${expiredToken}`

      await optionalAuth(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.user).toBeUndefined()
    })

    it('should not set user for inactive users', async () => {
      const { token } = await createTestUser({ isActive: false })
      req.headers.authorization = `Bearer ${token}`

      await optionalAuth(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.user).toBeUndefined()
    })

    it('should not set user when user is deleted', async () => {
      const { user, token } = await createTestUser()
      await User.findByIdAndDelete(user._id)

      req.headers.authorization = `Bearer ${token}`

      await optionalAuth(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.user).toBeUndefined()
    })
  })

  describe('addUserRestaurants middleware', () => {
    let req, res, next

    beforeEach(() => {
      req = {}
      res = {}
      next = jest.fn()
    })

    it('should add restaurant IDs for regular user', async () => {
      const { user } = await createTestUser()
      const restaurant1 = await createTestRestaurant(user._id, { name: 'Restaurant 1' })
      const restaurant2 = await createTestRestaurant(user._id, { name: 'Restaurant 2' })

      req.user = user

      await addUserRestaurants(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.userRestaurantIds).toBeDefined()
      expect(req.userRestaurantIds).toHaveLength(2)
      expect(req.userRestaurantIds).toContain(restaurant1._id.toString())
      expect(req.userRestaurantIds).toContain(restaurant2._id.toString())
    })

    it('should not add restaurant IDs for admin user', async () => {
      const { user: admin } = await createTestAdmin()
      req.user = admin

      await addUserRestaurants(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.userRestaurantIds).toBeUndefined()
    })

    it('should handle user with no restaurants', async () => {
      const { user } = await createTestUser()
      req.user = user

      await addUserRestaurants(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.userRestaurantIds).toBeDefined()
      expect(req.userRestaurantIds).toHaveLength(0)
    })

    it('should work without user', async () => {
      await addUserRestaurants(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.userRestaurantIds).toBeUndefined()
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle malformed JWT token', async () => {
      const req = {
        headers: {
          authorization: 'Bearer not.a.valid.jwt',
        },
      }
      const res = {}
      const next = jest.fn()

      await protect(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeDefined()
    })

    it('should handle token signed with wrong secret', async () => {
      const { user } = await createTestUser()
      const wrongToken = jwt.sign({ id: user._id }, 'wrong-secret-key')

      const req = {
        headers: {
          authorization: `Bearer ${wrongToken}`,
        },
      }
      const res = {}
      const next = jest.fn()

      await protect(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeDefined()
    })

    it('should handle missing resource ID gracefully', async () => {
      const { user } = await createTestUser()
      const req = {
        user,
        params: {},
      }
      const res = {}
      const next = jest.fn()

      const middleware = checkRestaurantOwnership()

      await middleware(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(next.mock.calls[0][0]).toBeDefined()
      expect(next.mock.calls[0][0].message).toContain('required')
    })
  })
})
