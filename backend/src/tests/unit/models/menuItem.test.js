const mongoose = require('mongoose');
const MenuItem = require('@models/MenuItem');
const Menu = require('@models/Menu');
const { setupTestEnv } = require('@tests/setup');

describe('MenuItem Model', () => {
  beforeAll(async () => {
    setupTestEnv();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await MenuItem.deleteMany({});
    await Menu.deleteMany({});
  });

  describe('MenuItem Schema', () => {
    it('should create a menu item with valid fields', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      const menuItem = await MenuItem.create({
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
        section: 'Main Course',
        menu: menu._id
      });

      expect(menuItem.name).toBe('Test Item');
      expect(menuItem.description).toBe('Test Description');
      expect(menuItem.price).toBe(10.99);
      expect(menuItem.section).toBe('Main Course');
      expect(menuItem.menu.toString()).toBe(menu._id.toString());
    });

    it('should not create a menu item without required fields', async () => {
      try {
        await MenuItem.create({});
        fail('Should have thrown validation error');
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it('should not allow negative price', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      try {
        await MenuItem.create({
          name: 'Test Item',
          price: -10.99,
          section: 'Main Course',
          menu: menu._id
        });
        fail('Should have thrown validation error');
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it('should validate currency format', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      try {
        await MenuItem.create({
          name: 'Test Item',
          price: 10.99,
          currency: 'INVALID',
          section: 'Main Course',
          menu: menu._id
        });
        fail('Should have thrown validation error');
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it('should set default values', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      const menuItem = await MenuItem.create({
        name: 'Test Item',
        price: 10.99,
        section: 'Main Course',
        menu: menu._id
      });

      expect(menuItem.currency).toBe('USD');
      expect(menuItem.isAvailable).toBe(true);
    });

    it('should enforce maximum length for name field', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      try {
        await MenuItem.create({
          name: 'a'.repeat(101), // Exceeds 100 character limit
          price: 10.99,
          section: 'Main Course',
          menu: menu._id
        });
        fail('Should have thrown validation error');
      } catch (err) {
        expect(err).toBeDefined();
        expect(err.errors.name).toBeDefined();
      }
    });

    it('should enforce maximum length for description field', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      try {
        await MenuItem.create({
          name: 'Test Item',
          description: 'a'.repeat(501), // Exceeds 500 character limit
          price: 10.99,
          section: 'Main Course',
          menu: menu._id
        });
        fail('Should have thrown validation error');
      } catch (err) {
        expect(err).toBeDefined();
        expect(err.errors.description).toBeDefined();
      }
    });

    it('should save and retrieve tags correctly', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      const menuItem = await MenuItem.create({
        name: 'Test Item',
        price: 10.99,
        section: 'Main Course',
        menu: menu._id,
        tags: ['spicy', 'popular', 'new']
      });

      const fetchedItem = await MenuItem.findById(menuItem._id);
      expect(fetchedItem.tags).toHaveLength(3);
      expect(fetchedItem.tags).toContain('spicy');
      expect(fetchedItem.tags).toContain('popular');
      expect(fetchedItem.tags).toContain('new');
    });

    it('should save and retrieve nutritional info correctly', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      const menuItem = await MenuItem.create({
        name: 'Test Item',
        price: 10.99,
        section: 'Main Course',
        menu: menu._id,
        nutritionalInfo: {
          calories: 450,
          allergens: ['nuts', 'dairy'],
          dietary: ['vegetarian']
        }
      });

      const fetchedItem = await MenuItem.findById(menuItem._id);
      expect(fetchedItem.nutritionalInfo.calories).toBe(450);
      expect(fetchedItem.nutritionalInfo.allergens).toContain('nuts');
      expect(fetchedItem.nutritionalInfo.allergens).toContain('dairy');
      expect(fetchedItem.nutritionalInfo.dietary).toContain('vegetarian');
    });
  });

  describe('MenuItem Methods', () => {
    it('should find items by menu ID', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      await MenuItem.create([
        {
          name: 'Item 1',
          price: 10.99,
          section: 'Main Course',
          menu: menu._id
        },
        {
          name: 'Item 2',
          price: 15.99,
          section: 'Main Course',
          menu: menu._id
        }
      ]);

      const items = await MenuItem.findByMenuId(menu._id);
      expect(items).toHaveLength(2);
    });

    it('should find items by section', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      await MenuItem.create([
        {
          name: 'Item 1',
          price: 10.99,
          section: 'Main Course',
          menu: menu._id
        },
        {
          name: 'Item 2',
          price: 15.99,
          section: 'Desserts',
          menu: menu._id
        }
      ]);

      const items = await MenuItem.findBySection(menu._id, 'Main Course');
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('Item 1');
    });

    it('should find available items by menu ID', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      await MenuItem.create([
        {
          name: 'Available Item',
          price: 10.99,
          section: 'Main Course',
          menu: menu._id,
          isAvailable: true
        },
        {
          name: 'Unavailable Item',
          price: 15.99,
          section: 'Main Course',
          menu: menu._id,
          isAvailable: false
        }
      ]);

      const items = await MenuItem.findAvailableByMenuId(menu._id);
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('Available Item');
    });

    it('should sort items by section and order', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      await MenuItem.create([
        {
          name: 'Appetizer 2',
          price: 7.99,
          section: 'Appetizers',
          menu: menu._id,
          order: 2
        },
        {
          name: 'Main Course 1',
          price: 15.99,
          section: 'Main Course',
          menu: menu._id,
          order: 1
        },
        {
          name: 'Appetizer 1',
          price: 8.99,
          section: 'Appetizers',
          menu: menu._id,
          order: 1
        },
        {
          name: 'Main Course 2',
          price: 18.99,
          section: 'Main Course',
          menu: menu._id,
          order: 2
        }
      ]);

      const items = await MenuItem.findByMenuId(menu._id);
      expect(items).toHaveLength(4);
      expect(items[0].name).toBe('Appetizer 1');
      expect(items[1].name).toBe('Appetizer 2');
      expect(items[2].name).toBe('Main Course 1');
      expect(items[3].name).toBe('Main Course 2');
    });

    it('should sort items by order within a section', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      await MenuItem.create([
        {
          name: 'Item 3',
          price: 10.99,
          section: 'Main Course',
          menu: menu._id,
          order: 3
        },
        {
          name: 'Item 1',
          price: 15.99,
          section: 'Main Course',
          menu: menu._id,
          order: 1
        },
        {
          name: 'Item 2',
          price: 12.99,
          section: 'Main Course',
          menu: menu._id,
          order: 2
        }
      ]);

      const items = await MenuItem.findBySection(menu._id, 'Main Course');
      expect(items).toHaveLength(3);
      expect(items[0].name).toBe('Item 1');
      expect(items[1].name).toBe('Item 2');
      expect(items[2].name).toBe('Item 3');
    });
  });

  describe('MenuItem Middleware', () => {
    it('should update the updatedAt field when saving an item', async () => {
      const menu = await Menu.create({
        name: 'Test Menu',
        restaurant: new mongoose.Types.ObjectId()
      });

      const menuItem = await MenuItem.create({
        name: 'Test Item',
        price: 10.99,
        section: 'Main Course',
        menu: menu._id
      });

      const originalUpdatedAt = menuItem.updatedAt;
      
      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      menuItem.name = 'Updated Test Item';
      await menuItem.save();
      
      expect(menuItem.updatedAt).not.toEqual(originalUpdatedAt);
      expect(menuItem.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
}); 