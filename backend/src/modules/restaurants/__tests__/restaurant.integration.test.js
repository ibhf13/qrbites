const request = require('supertest')
const app = require('@app')
const Restaurant = require('@modules/restaurants/models/restaurant')
const Menu = require('@modules/menus/models/menu')
const MenuItem = require('@modules/menuItems/models/menuItem')
const {
  createTestUser,
  createTestAdmin,
  createTestRestaurant,
  createTestMenu,
  createTestMenuItem,
  assertSuccessResponse,
  assertPaginationResponse,
} = require('../../../../__tests__/helpers/testHelpers')

describe('Restaurant Integration Tests', () => {
  describe('GET /api/restaurants', () => {
    it('should get all restaurants for authenticated user', async () => {
      const { user, token } = await createTestUser()
      await createTestRestaurant(user._id, { name: 'Restaurant 1' })
      await createTestRestaurant(user._id, { name: 'Restaurant 2' })

      const response = await request(app)
        .get('/api/restaurants')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      assertPaginationResponse(response)
      expect(response.body.data).toHaveLength(2)
    })

    it('should not show other users restaurants', async () => {
      const { user: user1, token: token1 } = await createTestUser()
      const { user: user2 } = await createTestUser()

      await createTestRestaurant(user1._id, { name: 'User 1 Restaurant' })
      await createTestRestaurant(user2._id, { name: 'User 2 Restaurant' })

      const response = await request(app)
        .get('/api/restaurants')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].name).toBe('User 1 Restaurant')
    })

    it('should show all restaurants for admin', async () => {
      const { user: user1 } = await createTestUser()
      const { user: user2 } = await createTestUser()
      const { user: admin, token: adminToken } = await createTestAdmin()

      await createTestRestaurant(user1._id)
      await createTestRestaurant(user2._id)
      await createTestRestaurant(admin._id)

      const response = await request(app)
        .get('/api/restaurants')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body.data.length).toBeGreaterThanOrEqual(3)
    })

    it('should support pagination', async () => {
      const { user, token } = await createTestUser()

      // Create 15 restaurants
      for (let i = 0; i < 15; i++) {
        await createTestRestaurant(user._id, { name: `Restaurant ${i}` })
      }

      const response = await request(app)
        .get('/api/restaurants?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.data).toHaveLength(10)
      expect(response.body.pagination.page).toBe(1)
      expect(response.body.pagination.total).toBe(15)
      expect(response.body.pagination.pages).toBe(2)
    })

    it('should support search by name', async () => {
      const { user, token } = await createTestUser()
      await createTestRestaurant(user._id, { name: 'Pizza Palace' })
      await createTestRestaurant(user._id, { name: 'Burger Joint' })

      const response = await request(app)
        .get('/api/restaurants?name=Pizza')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].name).toBe('Pizza Palace')
    })

    it('should support sorting', async () => {
      const { user, token } = await createTestUser()
      await createTestRestaurant(user._id, { name: 'Zebra Restaurant' })
      await createTestRestaurant(user._id, { name: 'Apple Restaurant' })

      const response = await request(app)
        .get('/api/restaurants?sortBy=name&order=asc')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.data[0].name).toBe('Apple Restaurant')
      expect(response.body.data[1].name).toBe('Zebra Restaurant')
    })

    it('should require authentication', async () => {
      await request(app).get('/api/restaurants').expect(401)
    })
  })

  describe('GET /api/restaurants/:id', () => {
    it('should get restaurant by id for owner', async () => {
      const { user, token } = await createTestUser()
      const restaurant = await createTestRestaurant(user._id)

      const response = await request(app)
        .get(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      assertSuccessResponse(response)
      expect(response.body.data._id).toBe(restaurant._id.toString())
      expect(response.body.data.name).toBe(restaurant.name)
    })

    it('should not allow non-owner to get restaurant', async () => {
      const { user: owner } = await createTestUser()
      const { user: other, token: otherToken } = await createTestUser()
      const restaurant = await createTestRestaurant(owner._id)

      await request(app)
        .get(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)
    })

    it('should allow admin to get any restaurant', async () => {
      const { user: owner } = await createTestUser()
      const { user: admin, token: adminToken } = await createTestAdmin()
      const restaurant = await createTestRestaurant(owner._id)

      const response = await request(app)
        .get(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body.data._id).toBe(restaurant._id.toString())
    })

    it('should return 404 for non-existent restaurant', async () => {
      const { token } = await createTestUser()

      await request(app)
        .get('/api/restaurants/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
    })

    it('should require authentication', async () => {
      const { user } = await createTestUser()
      const restaurant = await createTestRestaurant(user._id)

      await request(app).get(`/api/restaurants/${restaurant._id}`).expect(401)
    })
  })

  describe('POST /api/restaurants', () => {
    it('should create restaurant with valid data', async () => {
      const { token } = await createTestUser()
      const restaurantData = {
        name: 'New Restaurant',
        description: 'A great place to eat',
        contact: {
          phone: '+12345678901',
          email: 'contact@restaurant.com',
        },
        location: {
          street: '123 Main St',
          houseNumber: '1A',
          city: 'Test City',
          zipCode: '12345',
        },
        hours: [
          { day: 0, closed: true },
          { day: 1, closed: false, open: '09:00', close: '22:00' },
          { day: 2, closed: false, open: '09:00', close: '22:00' },
          { day: 3, closed: false, open: '09:00', close: '22:00' },
          { day: 4, closed: false, open: '09:00', close: '22:00' },
          { day: 5, closed: false, open: '09:00', close: '23:00' },
          { day: 6, closed: false, open: '10:00', close: '23:00' },
        ],
      }

      const response = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${token}`)
        .send(restaurantData)
        .expect(201)

      assertSuccessResponse(response)
      expect(response.body.data.name).toBe(restaurantData.name)
      expect(response.body.data.description).toBe(restaurantData.description)
      expect(response.body.data.contact.phone).toBe(restaurantData.contact.phone)
    })

    it('should reject restaurant with invalid data', async () => {
      const { token } = await createTestUser()
      const invalidData = {
        name: 'AB', // Too short
        contact: { phone: '+12345678901' },
        location: { city: 'City', zipCode: '12345' },
      }

      const response = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)

      expect([400, 422]).toContain(response.status)
    })

    it('should require authentication', async () => {
      const restaurantData = {
        name: 'New Restaurant',
        contact: { phone: '+12345678901' },
        location: { city: 'City', zipCode: '12345' },
      }

      await request(app).post('/api/restaurants').send(restaurantData).expect(401)
    })

    it('should automatically assign userId from authenticated user', async () => {
      const { user, token } = await createTestUser()
      const restaurantData = {
        name: 'New Restaurant',
        description: 'A new restaurant',
        contact: {
          phone: '+12345678901',
          email: 'test@example.com',
        },
        location: {
          street: '123 Main St',
          houseNumber: '1',
          city: 'City',
          zipCode: '12345',
        },
        hours: [
          { day: 0, closed: true },
          { day: 1, closed: false, open: '09:00', close: '22:00' },
          { day: 2, closed: false, open: '09:00', close: '22:00' },
          { day: 3, closed: false, open: '09:00', close: '22:00' },
          { day: 4, closed: false, open: '09:00', close: '22:00' },
          { day: 5, closed: false, open: '09:00', close: '23:00' },
          { day: 6, closed: false, open: '10:00', close: '23:00' },
        ],
      }

      const response = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${token}`)
        .send(restaurantData)
        .expect(201)

      // Verify the restaurant was created with correct userId
      const restaurant = await Restaurant.findById(response.body.data._id)
      expect(restaurant.userId.toString()).toBe(user._id.toString())
    })
  })

  describe('PUT /api/restaurants/:id', () => {
    it('should update restaurant with valid data', async () => {
      const { user, token } = await createTestUser()
      const restaurant = await createTestRestaurant(user._id)

      const updateData = {
        name: 'Updated Restaurant Name',
        description: 'Updated description',
      }

      const response = await request(app)
        .put(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200)

      assertSuccessResponse(response)
      expect(response.body.data.name).toBe(updateData.name)
      expect(response.body.data.description).toBe(updateData.description)
    })

    it('should not allow non-owner to update restaurant', async () => {
      const { user: owner } = await createTestUser()
      const { user: other, token: otherToken } = await createTestUser()
      const restaurant = await createTestRestaurant(owner._id)

      await request(app)
        .put(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Hacked Name' })
        .expect(403)
    })

    it('should allow admin to update any restaurant', async () => {
      const { user: owner } = await createTestUser()
      const { user: admin, token: adminToken } = await createTestAdmin()
      const restaurant = await createTestRestaurant(owner._id)

      const response = await request(app)
        .put(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Admin Updated Name' })
        .expect(200)

      expect(response.body.data.name).toBe('Admin Updated Name')
    })

    it('should reject invalid updates', async () => {
      const { user, token } = await createTestUser()
      const restaurant = await createTestRestaurant(user._id)

      await request(app)
        .put(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'A' }) // Too short
        .expect(422)
    })

    it('should require authentication', async () => {
      const { user } = await createTestUser()
      const restaurant = await createTestRestaurant(user._id)

      await request(app)
        .put(`/api/restaurants/${restaurant._id}`)
        .send({ name: 'New Name' })
        .expect(401)
    })
  })

  describe('DELETE /api/restaurants/:id', () => {
    it('should delete restaurant and cascade delete menus and menu items', async () => {
      const { user, token } = await createTestUser()
      const restaurant = await createTestRestaurant(user._id)
      const menu = await createTestMenu(restaurant._id)
      const menuItem = await createTestMenuItem(menu._id)

      await request(app)
        .delete(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      // Verify restaurant is deleted
      const deletedRestaurant = await Restaurant.findById(restaurant._id)
      expect(deletedRestaurant).toBeNull()

      // Verify menus are deleted
      const deletedMenu = await Menu.findById(menu._id)
      expect(deletedMenu).toBeNull()

      // Verify menu items are deleted
      const deletedMenuItem = await MenuItem.findById(menuItem._id)
      expect(deletedMenuItem).toBeNull()
    })

    it('should not allow non-owner to delete restaurant', async () => {
      const { user: owner } = await createTestUser()
      const { user: other, token: otherToken } = await createTestUser()
      const restaurant = await createTestRestaurant(owner._id)

      await request(app)
        .delete(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)

      // Verify restaurant still exists
      const existingRestaurant = await Restaurant.findById(restaurant._id)
      expect(existingRestaurant).not.toBeNull()
    })

    it('should allow admin to delete any restaurant', async () => {
      const { user: owner } = await createTestUser()
      const { user: admin, token: adminToken } = await createTestAdmin()
      const restaurant = await createTestRestaurant(owner._id)

      await request(app)
        .delete(`/api/restaurants/${restaurant._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204)

      const deletedRestaurant = await Restaurant.findById(restaurant._id)
      expect(deletedRestaurant).toBeNull()
    })

    it('should require authentication', async () => {
      const { user } = await createTestUser()
      const restaurant = await createTestRestaurant(user._id)

      await request(app).delete(`/api/restaurants/${restaurant._id}`).expect(401)
    })
  })

  describe('Multi-User Restaurant Isolation', () => {
    it('should maintain complete isolation between users', async () => {
      const { user: user1, token: token1 } = await createTestUser()
      const { user: user2, token: token2 } = await createTestUser()

      const restaurant1 = await createTestRestaurant(user1._id, {
        name: 'User 1 Restaurant',
      })
      const restaurant2 = await createTestRestaurant(user2._id, {
        name: 'User 2 Restaurant',
      })

      // User 1 can see their own restaurant
      const user1Response = await request(app)
        .get('/api/restaurants')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200)

      expect(user1Response.body.data).toHaveLength(1)
      expect(user1Response.body.data[0]._id).toBe(restaurant1._id.toString())

      // User 2 can see their own restaurant
      const user2Response = await request(app)
        .get('/api/restaurants')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200)

      expect(user2Response.body.data).toHaveLength(1)
      expect(user2Response.body.data[0]._id).toBe(restaurant2._id.toString())

      // User 1 cannot access User 2's restaurant
      await request(app)
        .get(`/api/restaurants/${restaurant2._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(403)

      // User 2 cannot access User 1's restaurant
      await request(app)
        .get(`/api/restaurants/${restaurant1._id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403)
    })
  })

  describe('Complete Restaurant Lifecycle', () => {
    it('should handle full CRUD lifecycle', async () => {
      const { user, token } = await createTestUser()

      // Create
      const createData = {
        name: 'Lifecycle Restaurant',
        description: 'Initial description',
        contact: {
          phone: '+12345678901',
          email: 'test@restaurant.com',
        },
        location: {
          street: '123 Main St',
          houseNumber: '1',
          city: 'City',
          zipCode: '12345',
        },
        hours: [
          { day: 0, closed: true },
          { day: 1, closed: false, open: '09:00', close: '22:00' },
          { day: 2, closed: false, open: '09:00', close: '22:00' },
          { day: 3, closed: false, open: '09:00', close: '22:00' },
          { day: 4, closed: false, open: '09:00', close: '22:00' },
          { day: 5, closed: false, open: '09:00', close: '23:00' },
          { day: 6, closed: false, open: '10:00', close: '23:00' },
        ],
      }

      const createResponse = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${token}`)
        .send(createData)
        .expect(201)

      const restaurantId = createResponse.body.data._id

      // Read
      const getResponse = await request(app)
        .get(`/api/restaurants/${restaurantId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(getResponse.body.data.name).toBe(createData.name)

      // Update
      const updateData = {
        name: 'Updated Lifecycle Restaurant',
        description: 'Updated description',
      }

      const updateResponse = await request(app)
        .put(`/api/restaurants/${restaurantId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200)

      expect(updateResponse.body.data.name).toBe(updateData.name)

      // Delete
      await request(app)
        .delete(`/api/restaurants/${restaurantId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      // Verify deletion
      await request(app)
        .get(`/api/restaurants/${restaurantId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
    })
  })
})

