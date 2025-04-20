const mongoose = require('mongoose');
const Menu = require('../../../models/Menu');
const MenuItem = require('../../../models/MenuItem');
const { setupTestEnv } = require('../../setup');

describe('Menu Model', () => {
  beforeAll(async () => {
    setupTestEnv();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await Menu.deleteMany({});
    await MenuItem.deleteMany({});
  });

  describe('Menu Schema', () => {
    it('should create a menu with valid fields', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId(),
        sections: [
          { name: 'Main Course' },
          { name: 'Desserts' }
        ]
      });

      expect(menu.name).toBe('Test Menu');
      expect(menu.sections).toHaveLength(2);
      expect(menu.sections[0].name).toBe('Main Course');
      expect(menu.sections[1].name).toBe('Desserts');
    });

    it('should not create a menu without required fields', async () => {
      try {
        await Menu.create({});
        fail('Should have thrown validation error');
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it('should not allow duplicate menu names for same restaurant', async () => {
      const restaurantId = new mongoose.Types.ObjectId();
      
      await Menu.create({
        name: 'Test Menu',
        restaurant: restaurantId
      });

      try {
        await Menu.create({
          name: 'Test Menu',
          restaurant: restaurantId
        });
        fail('Should have thrown duplicate key error');
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it('should allow same menu name for different restaurants', async () => {
      const restaurant1 = new mongoose.Types.ObjectId();
      const restaurant2 = new mongoose.Types.ObjectId();

      await Menu.create({
        name: 'Test Menu',
        restaurant: restaurant1
      });

      const menu2 = await Menu.create({
        name: 'Test Menu',
        restaurant: restaurant2
      });

      expect(menu2.name).toBe('Test Menu');
    });

    it('should enforce maximum length for menu name', async () => {
      try {
        await Menu.create({
          name: 'a'.repeat(101), // 101 characters exceeds the 100 max length
          restaurant: new mongoose.Types.ObjectId()
        });
        fail('Should have thrown validation error for name length');
      } catch (err) {
        expect(err.errors.name).toBeDefined();
        expect(err.errors.name.message).toBe('Menu name cannot be more than 100 characters');
      }
    });

    it('should enforce maximum length for description', async () => {
      try {
        await Menu.create({
          name: 'Test Menu',
          description: 'a'.repeat(501), // 501 characters exceeds the 500 max length
          restaurant: new mongoose.Types.ObjectId()
        });
        fail('Should have thrown validation error for description length');
      } catch (err) {
        expect(err.errors.description).toBeDefined();
        expect(err.errors.description.message).toBe('Description cannot be more than 500 characters');
      }
    });
  });

  describe('Menu Methods', () => {
    it('should find menu by restaurant ID', async () => {
      const restaurantId = new mongoose.Types.ObjectId();

      await Menu.create([
        {
          name: 'Menu 1',
          restaurant: restaurantId
        },
        {
          name: 'Menu 2',
          restaurant: restaurantId
        }
      ]);

      const menus = await Menu.findByRestaurantId(restaurantId);
      expect(menus).toHaveLength(2);
    });

    it('should add section to menu', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId(),
        sections: [{ name: 'Main Course' }]
      });

      await menu.addSection({ name: 'Desserts' });
      const updatedMenu = await Menu.findById(menu._id);
      
      expect(updatedMenu.sections).toHaveLength(2);
      expect(updatedMenu.sections[1].name).toBe('Desserts');
    });

    it('should not add duplicate section', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId(),
        sections: [{ name: 'Main Course' }]
      });

      try {
        await menu.addSection({ name: 'Main Course' });
        fail('Should have thrown error for duplicate section');
      } catch (err) {
        expect(err.message).toBe('Section with this name already exists');
        const updatedMenu = await Menu.findById(menu._id);
        expect(updatedMenu.sections).toHaveLength(1);
      }
    });

    it('should remove section from menu', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId(),
        sections: [
          { name: 'Main Course' },
          { name: 'Desserts' }
        ]
      });

      await menu.removeSection({ name: 'Main Course' });
      const updatedMenu = await Menu.findById(menu._id);
      
      expect(updatedMenu.sections).toHaveLength(1);
      expect(updatedMenu.sections[0].name).not.toBe('Main Course');
    });

    it('should throw error when removing non-existent section', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId(),
        sections: [{ name: 'Main Course' }]
      });

      try {
        await menu.removeSection({ name: 'Non-existent Section' });
        fail('Should have thrown error for non-existent section');
      } catch (err) {
        expect(err.message).toBe('Section not found');
      }
    });
  });

  describe('Menu Virtuals and Middleware', () => {
    it('should update updatedAt field on save', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });
      
      const originalUpdatedAt = menu.updatedAt;
      
      // Force a small delay to ensure timestamps differ
      await new Promise(resolve => setTimeout(resolve, 10));
      
      menu.name = 'Updated Menu Name';
      await menu.save();
      
      expect(menu.updatedAt).not.toEqual(originalUpdatedAt);
    });

    it('should create virtual items field with related menu items', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId(),
        sections: [{ name: 'Main Course' }]
      });

      // Create some menu items related to this menu
      await MenuItem.create([
        {
          name: 'Burger',
          price: 9.99,
          menu: menu._id,
          section: 'Main Course'
        },
        {
          name: 'Fries',
          price: 4.99,
          menu: menu._id,
          section: 'Main Course'
        }
      ]);

      // Fetch menu with populated items
      const populatedMenu = await Menu.findById(menu._id).populate('items');

      expect(populatedMenu.items).toBeDefined();
      expect(populatedMenu.items).toHaveLength(2);
      expect(populatedMenu.items[0].name).toBe('Burger');
      expect(populatedMenu.items[1].name).toBe('Fries');
    });
  });

  describe('Menu Static Methods', () => {
    it('should get menu with populated items using getWithItems', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId(),
        sections: [{ name: 'Test Section' }]
      });

      await MenuItem.create([
        {
          name: 'Pizza',
          price: 12.99,
          menu: menu._id,
          section: 'Test Section'
        },
        {
          name: 'Salad',
          price: 7.99,
          menu: menu._id,
          section: 'Test Section'
        }
      ]);

      const populatedMenu = await Menu.getWithItems(menu._id);
      
      expect(populatedMenu.items).toBeDefined();
      expect(populatedMenu.items).toHaveLength(2);
    });

    it('should get published menu by ID', async () => {
      // Create published menu
      const publishedMenu = await Menu.create({
        name: 'Published Menu',
        restaurant: new mongoose.Types.ObjectId(),
        isPublished: true
      });

      // Create unpublished menu
      await Menu.create({
        name: 'Unpublished Menu',
        restaurant: new mongoose.Types.ObjectId(),
        isPublished: false
      });

      const foundMenu = await Menu.getPublishedMenuById(publishedMenu._id);
      expect(foundMenu).toBeDefined();
      expect(foundMenu.name).toBe('Published Menu');

      // Try to get unpublished menu
      const unpublishedMenu = await Menu.findOne({ isPublished: false });
      const result = await Menu.getPublishedMenuById(unpublishedMenu._id);
      expect(result).toBeNull();
    });

    it('should increment scan count', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId(),
        scanCount: 5
      });

      const updatedMenu = await Menu.incrementScanCount(menu._id);
      
      expect(updatedMenu.scanCount).toBe(6);
      
      // Verify in database
      const menuFromDb = await Menu.findById(menu._id);
      expect(menuFromDb.scanCount).toBe(6);
    });

    it('should return null when incrementing scan count for non-existent menu', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const result = await Menu.incrementScanCount(nonExistentId);
      
      expect(result).toBeNull();
    });
  });
}); 