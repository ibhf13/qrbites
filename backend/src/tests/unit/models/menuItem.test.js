const mongoose = require('mongoose');
const MenuItem = require('../../../models/MenuItem');
const Menu = require('../../../models/Menu');
const { setupTestEnv } = require('../../setup');

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
  });
}); 