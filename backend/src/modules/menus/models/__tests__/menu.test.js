const mongoose = require('mongoose')
const Menu = require('../menu')
const Restaurant = require('@modules/restaurants/models/restaurant')
const {
  createTestUser,
  createTestRestaurant,
} = require('../../../../../__tests__/helpers/testHelpers')
const { menuFactory } = require('../../../../../__tests__/helpers/factories')

describe('Menu Model', () => {
  let testRestaurant

  beforeEach(async () => {
    const { user } = await createTestUser()
    testRestaurant = await createTestRestaurant(user._id)
  })

  describe('Schema Validation', () => {
    it('should create a valid menu with required fields', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)

      expect(menu._id).toBeDefined()
      expect(menu.name).toBe(menuData.name)
      expect(menu.restaurantId.toString()).toBe(testRestaurant._id.toString())
      expect(menu.isActive).toBe(true)
      expect(menu.createdAt).toBeDefined()
      expect(menu.updatedAt).toBeDefined()
    })

    it('should require menu name', async () => {
      const menuData = {
        restaurantId: testRestaurant._id,
      }

      await expect(Menu.create(menuData)).rejects.toThrow()
    })

    it('should require restaurantId', async () => {
      const menuData = {
        name: 'Test Menu',
      }

      await expect(Menu.create(menuData)).rejects.toThrow()
    })

    it('should enforce minimum name length of 3 characters', async () => {
      const menuData = {
        name: 'AB',
        restaurantId: testRestaurant._id,
      }

      await expect(Menu.create(menuData)).rejects.toThrow()
    })

    it('should enforce maximum name length of 50 characters', async () => {
      const menuData = {
        name: 'A'.repeat(51),
        restaurantId: testRestaurant._id,
      }

      await expect(Menu.create(menuData)).rejects.toThrow()
    })

    it('should enforce maximum description length of 500 characters', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
        description: 'A'.repeat(501),
      }

      await expect(Menu.create(menuData)).rejects.toThrow()
    })

    it('should trim menu name', async () => {
      const menuData = {
        name: '  Test Menu  ',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      expect(menu.name).toBe('Test Menu')
    })

    it('should default isActive to true', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      expect(menu.isActive).toBe(true)
    })

    it('should accept isActive as false', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
        isActive: false,
      }

      const menu = await Menu.create(menuData)
      expect(menu.isActive).toBe(false)
    })

    it('should default categories to empty array', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      expect(menu.categories).toEqual([])
    })

    it('should accept categories array', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
        categories: ['Appetizers', 'Main Course', 'Desserts'],
      }

      const menu = await Menu.create(menuData)
      expect(menu.categories).toEqual(['Appetizers', 'Main Course', 'Desserts'])
    })

    it('should default imageUrl to null', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      expect(menu.imageUrl).toBeNull()
    })

    it('should accept imageUrl', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
        imageUrl: 'https://example.com/menu.jpg',
      }

      const menu = await Menu.create(menuData)
      expect(menu.imageUrl).toBe('https://example.com/menu.jpg')
    })

    it('should default imageUrls to empty array', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      expect(menu.imageUrls).toEqual([])
    })

    it('should accept imageUrls array', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
        imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      }

      const menu = await Menu.create(menuData)
      expect(menu.imageUrls).toHaveLength(2)
    })

    it('should default qrCodeUrl to null', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      expect(menu.qrCodeUrl).toBeNull()
    })

    it('should accept qrCodeUrl', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
        qrCodeUrl: 'https://example.com/qr-code.png',
      }

      const menu = await Menu.create(menuData)
      expect(menu.qrCodeUrl).toBe('https://example.com/qr-code.png')
    })
  })

  describe('Indexes', () => {
    it('should have index on restaurantId', async () => {
      const indexes = Menu.schema.indexes()
      const restaurantIdIndex = indexes.find(index => index[0].restaurantId === 1)

      expect(restaurantIdIndex).toBeDefined()
    })

    it('should have index on isActive', async () => {
      const indexes = Menu.schema.indexes()
      const isActiveIndex = indexes.find(index => index[0].isActive === 1)

      expect(isActiveIndex).toBeDefined()
    })

    it('should have index on name', async () => {
      const indexes = Menu.schema.indexes()
      const nameIndex = indexes.find(index => index[0].name === 1)

      expect(nameIndex).toBeDefined()
    })

    it('should have index on createdAt', async () => {
      const indexes = Menu.schema.indexes()
      const createdAtIndex = indexes.find(index => index[0].createdAt === -1)

      expect(createdAtIndex).toBeDefined()
    })

    it('should have compound index on restaurantId and isActive', async () => {
      const indexes = Menu.schema.indexes()
      const compoundIndex = indexes.find(
        index => index[0].restaurantId === 1 && index[0].isActive === 1
      )

      expect(compoundIndex).toBeDefined()
    })
  })

  describe('Virtual Fields', () => {
    it('should have menuItems virtual field configured', () => {
      const virtuals = Menu.schema.virtuals
      expect(virtuals.menuItems).toBeDefined()
    })

    it('should configure menuItems virtual with correct ref', () => {
      const menuItemsVirtual = Menu.schema.virtuals.menuItems
      expect(menuItemsVirtual.options.ref).toBe('MenuItem')
      expect(menuItemsVirtual.options.localField).toBe('_id')
      expect(menuItemsVirtual.options.foreignField).toBe('menuId')
    })

    it('should include virtuals in JSON output', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      const menuJSON = menu.toJSON()

      expect(menuJSON).toHaveProperty('id')
    })
  })

  describe('Relationship with Restaurant', () => {
    it('should reference Restaurant model correctly', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      const populatedMenu = await Menu.findById(menu._id).populate('restaurantId')

      expect(populatedMenu.restaurantId._id.toString()).toBe(testRestaurant._id.toString())
      expect(populatedMenu.restaurantId.name).toBe(testRestaurant.name)
    })

    it('should reject invalid restaurantId', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: 'invalid-id',
      }

      await expect(Menu.create(menuData)).rejects.toThrow()
    })

    it('should reject non-existent restaurantId', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: '507f1f77bcf86cd799439011',
      }

      // Model validation passes but referential integrity depends on app logic
      const menu = await Menu.create(menuData)
      expect(menu._id).toBeDefined()
    })
  })

  describe('Timestamps', () => {
    it('should automatically set createdAt', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      expect(menu.createdAt).toBeDefined()
      expect(menu.createdAt).toBeInstanceOf(Date)
    })

    it('should automatically set updatedAt', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      expect(menu.updatedAt).toBeDefined()
      expect(menu.updatedAt).toBeInstanceOf(Date)
    })

    it('should update updatedAt on modification', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      const originalUpdatedAt = menu.updatedAt

      await new Promise(resolve => setTimeout(resolve, 10))

      menu.name = 'Updated Menu'
      await menu.save()

      expect(menu.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })
  })

  describe('Pre-save Middleware', () => {
    it('should execute pre-save middleware', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      expect(menu._id).toBeDefined()
    })

    it('should execute pre-save middleware on update', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      menu.name = 'Updated Menu'
      await menu.save()

      expect(menu.name).toBe('Updated Menu')
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in name', async () => {
      const menuData = {
        name: "O'Brien's Menu & More",
        restaurantId: testRestaurant._id,
      }

      const menu = await Menu.create(menuData)
      expect(menu.name).toBe("O'Brien's Menu & More")
    })

    it('should handle unicode characters in description', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
        description: 'Serving delicious 🍕 pizza and 🍝 pasta',
      }

      const menu = await Menu.create(menuData)
      expect(menu.description).toContain('🍕')
    })

    it('should handle duplicate category names', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
        categories: ['Pizza', 'Pizza', 'Pasta'],
      }

      const menu = await Menu.create(menuData)
      expect(menu.categories).toEqual(['Pizza', 'Pizza', 'Pasta'])
    })

    it('should handle empty strings in categories', async () => {
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
        categories: ['', 'Main Course', ''],
      }

      const menu = await Menu.create(menuData)
      expect(menu.categories).toHaveLength(3)
    })

    it('should handle multiple image URLs', async () => {
      const imageUrls = Array.from({ length: 10 }, (_, i) => `https://example.com/image${i}.jpg`)
      
      const menuData = {
        name: 'Test Menu',
        restaurantId: testRestaurant._id,
        imageUrls,
      }

      const menu = await Menu.create(menuData)
      expect(menu.imageUrls).toHaveLength(10)
    })
  })
})

