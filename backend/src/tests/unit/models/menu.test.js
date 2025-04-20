const mongoose = require('mongoose');
const Menu = require('../../../models/Menu');
const { setupTestEnv } = require('../../setup');

describe('Menu Model', () => {
  beforeAll(async () => {
    setupTestEnv();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await Menu.deleteMany({});
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
  });
}); 