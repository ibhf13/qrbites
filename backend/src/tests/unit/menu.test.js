const Menu = require('../../models/Menu');
const mongoose = require('mongoose');

describe('Menu model', () => {
  describe('Menu schema', () => {
    it('should create a menu with valid fields', async () => {
      // Create a mock ObjectId for the restaurant
      const restaurantId = new mongoose.Types.ObjectId();

      const menuData = {
        name: 'Test Menu',
        description: 'Test Description',
        restaurant: restaurantId,
        sections: [
          {
            name: 'Test Section',
            description: 'Test Section Description',
            order: 1
          }
        ]
      };
      
      const menu = new Menu(menuData);
      await menu.validate();
      
      expect(menu).toHaveProperty('_id');
      expect(menu.name).toBe(menuData.name);
      expect(menu.description).toBe(menuData.description);
      expect(menu.restaurant).toEqual(restaurantId);
      expect(menu.isPublished).toBe(false); // Default value
      expect(menu.sections).toHaveLength(1);
      expect(menu.sections[0].name).toBe(menuData.sections[0].name);
      expect(menu.sections[0].order).toBe(menuData.sections[0].order);
    });
    
    it('should not create a menu without required fields', async () => {
      const invalidMenu = new Menu({
        description: 'Missing required fields'
      });
      
      let error;
      try {
        await invalidMenu.validate();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.restaurant).toBeDefined();
    });
    
    it('should update the updatedAt field on save', async () => {
      // Create a mock ObjectId for the restaurant
      const restaurantId = new mongoose.Types.ObjectId();
      
      const menu = new Menu({
        name: 'Update Test Menu',
        description: 'Testing updatedAt field',
        restaurant: restaurantId
      });
      
      // Mock Date.now to return a fixed value
      const originalNow = Date.now;
      const fixedDate = new Date('2023-01-01').getTime();
      Date.now = jest.fn().mockReturnValue(fixedDate);
      
      // Set initial dates
      menu.createdAt = fixedDate;
      menu.updatedAt = fixedDate;
      
      // Change Date.now to return a later time
      const laterDate = new Date('2023-01-02').getTime();
      Date.now = jest.fn().mockReturnValue(laterDate);
      
      // Trigger pre-save middleware by calling save
      await menu.save();
      
      // Restore original Date.now
      Date.now = originalNow;
      
      expect(menu.updatedAt.getTime()).toBe(laterDate);
      expect(menu.createdAt.getTime()).toBe(fixedDate);
    });
  });
  
  describe('Menu virtuals', () => {
    it('should have items virtual', () => {
      const menuSchema = Menu.schema;
      expect(menuSchema.virtuals.items).toBeDefined();
    });
  });
  
  describe('Menu statics', () => {
    it('should have getWithItems static method', () => {
      expect(typeof Menu.getWithItems).toBe('function');
    });
    
    it('should have getPublishedMenuById static method', () => {
      expect(typeof Menu.getPublishedMenuById).toBe('function');
    });
    
    it('should have incrementScanCount static method', () => {
      expect(typeof Menu.incrementScanCount).toBe('function');
    });
  });
}); 