const mongoose = require('mongoose')
const Restaurant = require('../restaurant')
const User = require('@modules/users/models/user')
const { createTestUser } = require('../../../../../__tests__/helpers/testHelpers')
const { restaurantFactory } = require('../../../../../__tests__/helpers/factories')

describe('Restaurant Model', () => {
  let testUser

  beforeEach(async () => {
    const result = await createTestUser()
    testUser = result.user
  })

  describe('Schema Validation', () => {
    it('should create a valid restaurant with required fields', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: {
          phone: '+12345678901',
          email: 'test@restaurant.com',
        },
        location: {
          address: '123 Main St',
          city: 'Test City',
          state: 'TC',
          zipCode: '12345',
          country: 'Test Country',
        },
      }

      const restaurant = await Restaurant.create(restaurantData)

      expect(restaurant._id).toBeDefined()
      expect(restaurant.name).toBe(restaurantData.name)
      expect(restaurant.userId.toString()).toBe(testUser._id.toString())
      expect(restaurant.isActive).toBe(true)
      expect(restaurant.createdAt).toBeDefined()
      expect(restaurant.updatedAt).toBeDefined()
    })

    it('should require restaurant name', async () => {
      const restaurantData = {
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      await expect(Restaurant.create(restaurantData)).rejects.toThrow()
    })

    it('should require userId', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      await expect(Restaurant.create(restaurantData)).rejects.toThrow()
    })

    it('should require contact information', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      await expect(Restaurant.create(restaurantData)).rejects.toThrow()
    })

    it('should require location information', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
      }

      await expect(Restaurant.create(restaurantData)).rejects.toThrow()
    })

    it('should enforce minimum name length of 3 characters', async () => {
      const restaurantData = {
        name: 'AB',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      await expect(Restaurant.create(restaurantData)).rejects.toThrow()
    })

    it('should enforce maximum name length of 50 characters', async () => {
      const restaurantData = {
        name: 'A'.repeat(51),
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      await expect(Restaurant.create(restaurantData)).rejects.toThrow()
    })

    it('should enforce maximum description length of 500 characters', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        description: 'A'.repeat(501),
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      await expect(Restaurant.create(restaurantData)).rejects.toThrow()
    })

    it('should trim restaurant name', async () => {
      const restaurantData = {
        name: '  Test Restaurant  ',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.name).toBe('Test Restaurant')
    })

    it('should default isActive to true', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.isActive).toBe(true)
    })

    it('should accept isActive as false', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        isActive: false,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.isActive).toBe(false)
    })

    it('should default logoUrl to null', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.logoUrl).toBeNull()
    })

    it('should accept logoUrl', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        logoUrl: 'https://example.com/logo.png',
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.logoUrl).toBe('https://example.com/logo.png')
    })
  })

  describe('Contact Schema Validation', () => {
    it('should validate phone number format', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: {
          phone: 'invalid-phone',
        },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      await expect(Restaurant.create(restaurantData)).rejects.toThrow()
    })

    it('should accept valid international phone numbers', async () => {
      const phoneNumbers = ['+12345678901', '+441234567890', '+8613812345678']

      for (const phone of phoneNumbers) {
        const restaurantData = {
          name: `Restaurant ${phone}`,
          userId: testUser._id,
          contact: { phone },
          location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
        }

        const restaurant = await Restaurant.create(restaurantData)
        expect(restaurant.contact.phone).toBe(phone)
      }
    })

    it('should validate email format', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: {
          phone: '+12345678901',
          email: 'invalid-email',
        },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      await expect(Restaurant.create(restaurantData)).rejects.toThrow()
    })

    it('should accept valid email addresses', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: {
          phone: '+12345678901',
          email: 'valid@example.com',
        },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.contact.email).toBe('valid@example.com')
    })

    it('should accept website URL', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: {
          phone: '+12345678901',
          website: 'https://restaurant.com',
        },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.contact.website).toBe('https://restaurant.com')
    })
  })

  describe('Hours Schema Validation', () => {
    it('should accept valid hours', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
        hours: [
          { day: 0, open: '09:00', close: '17:00', closed: false },
          { day: 1, open: '09:00', close: '17:00', closed: false },
        ],
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.hours).toHaveLength(2)
      expect(restaurant.hours[0].day).toBe(0)
    })

    it('should require day field in hours', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
        hours: [{ open: '09:00', close: '17:00' }],
      }

      await expect(Restaurant.create(restaurantData)).rejects.toThrow()
    })

    it('should enforce day range 0-6', async () => {
      const invalidDays = [-1, 7, 10]

      for (const day of invalidDays) {
        const restaurantData = {
          name: `Restaurant ${day}`,
          userId: testUser._id,
          contact: { phone: '+12345678901' },
          location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
          hours: [{ day, open: '09:00', close: '17:00' }],
        }

        await expect(Restaurant.create(restaurantData)).rejects.toThrow()
      }
    })

    it('should validate time format HH:MM', async () => {
      const invalidTimes = ['25:00', '12:60', '9:00', 'invalid']

      for (const time of invalidTimes) {
        const restaurantData = {
          name: `Restaurant ${time}`,
          userId: testUser._id,
          contact: { phone: '+12345678901' },
          location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
          hours: [{ day: 0, open: time, close: '17:00' }],
        }

        await expect(Restaurant.create(restaurantData)).rejects.toThrow()
      }
    })

    it('should default closed to false', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
        hours: [{ day: 0, open: '09:00', close: '17:00' }],
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.hours[0].closed).toBe(false)
    })

    it('should accept closed as true', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
        hours: [{ day: 0, closed: true }],
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.hours[0].closed).toBe(true)
    })

    it('should default hours to empty array', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.hours).toEqual([])
    })
  })

  describe('Virtual Fields', () => {
    it('should have menus virtual field configured', () => {
      const virtuals = Restaurant.schema.virtuals
      expect(virtuals.menus).toBeDefined()
    })

    it('should configure menus virtual with correct ref', () => {
      const menusVirtual = Restaurant.schema.virtuals.menus
      expect(menusVirtual.options.ref).toBe('Menu')
      expect(menusVirtual.options.localField).toBe('_id')
      expect(menusVirtual.options.foreignField).toBe('restaurantId')
    })

    it('should include virtuals in JSON output', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      const restaurantJSON = restaurant.toJSON()

      expect(restaurantJSON).toHaveProperty('id')
    })
  })

  describe('Relationship with User', () => {
    it('should reference User model correctly', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      const populatedRestaurant = await Restaurant.findById(restaurant._id).populate('userId')

      expect(populatedRestaurant.userId._id.toString()).toBe(testUser._id.toString())
      expect(populatedRestaurant.userId.email).toBe(testUser.email)
    })

    it('should reject invalid userId', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: 'invalid-id',
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      await expect(Restaurant.create(restaurantData)).rejects.toThrow()
    })
  })

  describe('Timestamps', () => {
    it('should automatically set createdAt', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.createdAt).toBeDefined()
      expect(restaurant.createdAt).toBeInstanceOf(Date)
    })

    it('should automatically set updatedAt', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.updatedAt).toBeDefined()
      expect(restaurant.updatedAt).toBeInstanceOf(Date)
    })

    it('should update updatedAt on modification', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      const originalUpdatedAt = restaurant.updatedAt

      await new Promise(resolve => setTimeout(resolve, 10))

      restaurant.name = 'Updated Restaurant'
      await restaurant.save()

      expect(restaurant.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in name', async () => {
      const restaurantData = {
        name: "O'Brien's Restaurant & Bar",
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.name).toBe("O'Brien's Restaurant & Bar")
    })

    it('should handle unicode characters in description', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        description: 'Serving delicious 🍕 pizza and 🍝 pasta',
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.description).toContain('🍕')
    })

    it('should handle multiple hours for same day', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        userId: testUser._id,
        contact: { phone: '+12345678901' },
        location: { address: '123 Main St', city: 'City', state: 'ST', zipCode: '12345', country: 'Country' },
        hours: [
          { day: 0, open: '09:00', close: '12:00' },
          { day: 0, open: '17:00', close: '22:00' },
        ],
      }

      const restaurant = await Restaurant.create(restaurantData)
      expect(restaurant.hours).toHaveLength(2)
      expect(restaurant.hours.filter(h => h.day === 0)).toHaveLength(2)
    })
  })
})

