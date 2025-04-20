const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Menu = require('../../models/Menu');
const MenuItem = require('../../models/MenuItem');
const User = require('../../models/User');
const { mockMenus, mockMenuPayload } = require('../mocks/menuMocks');
const { mockMenuItems } = require('../mocks/menuItemMocks');
const { mockUsers } = require('../mocks/userMocks');
const { authenticatedRequest } = require('../utils/apiTestUtils');

describe('Menu Routes Integration Tests', () => {
  let user;
  let token;

  beforeEach(async () => {
    // Clear collections before each test
    await Menu.deleteMany({});
    await MenuItem.deleteMany({});
    await User.deleteMany({});

    // Create a test user
    user = await User.create(mockUsers[0]);
    token = user.getSignedJwtToken();
  });

  describe('Menu CRUD Operations', () => {
    it('should create a new menu', async () => {
      const menuData = {
        name: 'Test Menu',
        description: 'Test menu description'
      };

      const res = await authenticatedRequest(app, 'post', '/api/menus', { token, payload: menuData });

      if (res.status !== 201) {
        console.log('Menu creation error:', res.body);
      }

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', menuData.name);
      expect(res.body.data).toHaveProperty('description', menuData.description);
      expect(res.body.data).toHaveProperty('restaurant', user._id.toString());
    });

    it('should get all menus for a restaurant', async () => {
      // Create multiple menus
      const menus = await Promise.all(
        mockMenus.map(menu => Menu.create({ ...menu, restaurant: user._id }))
      );

      const res = await authenticatedRequest(app, 'get', '/api/menus', { token });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(menus.length);
      expect(res.body.data[0]).toHaveProperty('name', menus[0].name);
    });

    it('should get a single menu', async () => {
      const menu = await Menu.create({ ...mockMenus[0], restaurant: user._id });

      const res = await authenticatedRequest(app, 'get', `/api/menus/${menu._id}`, { token });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', menu.name);
      expect(res.body.data).toHaveProperty('_id', menu._id.toString());
    });

    it('should update a menu', async () => {
      const menu = await Menu.create({ ...mockMenus[0], restaurant: user._id });
      const updateData = { 
        name: 'Updated Menu Name',
        description: 'Updated description'
      };

      const res = await authenticatedRequest(app, 'put', `/api/menus/${menu._id}`, { token, payload: updateData });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', updateData.name);
      expect(res.body.data).toHaveProperty('description', updateData.description);
    });

    it('should delete a menu', async () => {
      const menu = await Menu.create({ ...mockMenus[0], restaurant: user._id });

      const res = await authenticatedRequest(app, 'delete', `/api/menus/${menu._id}`, { token });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({});

      // Verify menu was deleted
      const deletedMenu = await Menu.findById(menu._id);
      expect(deletedMenu).toBeNull();
    });
  });

  describe('Menu Sections', () => {
    let menu;

    beforeEach(async () => {
      menu = await Menu.create({ ...mockMenus[0], restaurant: user._id });
    });

    it('should add a section to a menu', async () => {
      const sectionData = { 
        name: 'Appetizers', 
        description: 'Start your meal right',
        order: 1
      };

      const res = await authenticatedRequest(app, 'post', `/api/menus/${menu._id}/sections`, { token, payload: sectionData });

      if (res.status !== 200) {
        console.log('Section creation error:', res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sections).toContainEqual(expect.objectContaining({
        name: sectionData.name,
        description: sectionData.description,
        order: sectionData.order
      }));
    });

    it('should update a section', async () => {
      // First add a section
      const section = await Menu.findByIdAndUpdate(
        menu._id,
        { $push: { sections: { name: 'Original Section', order: 1 } } },
        { new: true }
      );

      const updateData = { 
        name: 'Updated Section',
        description: 'Updated section description',
        order: 2
      };
      const res = await authenticatedRequest(
        app,
        'put',
        `/api/menus/${menu._id}/sections/${section.sections[0]._id}`,
        { token, payload: updateData }
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sections[0]).toHaveProperty('name', updateData.name);
      expect(res.body.data.sections[0]).toHaveProperty('description', updateData.description);
      expect(res.body.data.sections[0]).toHaveProperty('order', updateData.order);
    });

    it('should delete a section', async () => {
      // Create a fresh menu without sections
      const freshMenu = await Menu.create({
        name: 'Fresh Menu',
        description: 'A fresh menu for testing',
        restaurant: user._id
      });

      // Add a section to delete
      const updatedMenu = await Menu.findByIdAndUpdate(
        freshMenu._id,
        { $push: { sections: { name: 'Section to Delete', order: 1 } } },
        { new: true }
      );

      const res = await authenticatedRequest(
        app,
        'delete',
        `/api/menus/${freshMenu._id}/sections/${updatedMenu.sections[0]._id}`,
        { token }
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      // Verify section was deleted
      const finalMenu = await Menu.findById(freshMenu._id);
      expect(finalMenu.sections).toHaveLength(0);
    });
  });

  describe('Menu Items', () => {
    let menu;
    let section;

    beforeEach(async () => {
      menu = await Menu.create({ ...mockMenus[0], restaurant: user._id });
      // Add a section first
      const updatedMenu = await Menu.findByIdAndUpdate(
        menu._id,
        { $push: { sections: { name: 'Test Section', order: 1 } } },
        { new: true }
      );
      section = updatedMenu.sections[0];
    });

    it('should create a menu item', async () => {
      const itemData = {
        name: 'Test Item',
        description: 'Test item description',
        price: 9.99,
        section: section._id,
        isAvailable: true
      };

      const res = await authenticatedRequest(app, 'post', `/api/menus/${menu._id}/items`, { token, payload: itemData });

      if (res.status !== 201) {
        console.log('Menu item creation error:', res.body);
      }

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', itemData.name);
      expect(res.body.data).toHaveProperty('price', itemData.price);
      expect(res.body.data).toHaveProperty('section', section._id.toString());
    });

    it('should get all items for a menu', async () => {
      // Create multiple items
      const items = await Promise.all(
        mockMenuItems.map(item => MenuItem.create({ 
          ...item, 
          menu: menu._id, 
          restaurant: user._id,
          section: section._id
        }))
      );

      const res = await authenticatedRequest(app, 'get', `/api/menus/${menu._id}/items`, { token });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(items.length);
    });

    it('should update a menu item', async () => {
      const item = await MenuItem.create({ 
        ...mockMenuItems[0], 
        menu: menu._id, 
        restaurant: user._id,
        section: section._id
      });
      const updateData = { 
        name: 'Updated Item Name', 
        price: 15.99,
        description: 'Updated description',
        section: section._id
      };

      const res = await authenticatedRequest(app, 'put', `/api/menus/${menu._id}/items/${item._id}`, { token, payload: updateData });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', updateData.name);
      expect(res.body.data).toHaveProperty('price', updateData.price);
      expect(res.body.data).toHaveProperty('description', updateData.description);
    });

    it('should delete a menu item', async () => {
      const item = await MenuItem.create({ 
        ...mockMenuItems[0], 
        menu: menu._id, 
        restaurant: user._id,
        section: section._id
      });

      const res = await authenticatedRequest(app, 'delete', `/api/menus/${menu._id}/items/${item._id}`, { token });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({});

      // Verify item was deleted
      const deletedItem = await MenuItem.findById(item._id);
      expect(deletedItem).toBeNull();
    });

    it('should update item availability', async () => {
      const item = await MenuItem.create({ 
        ...mockMenuItems[0], 
        menu: menu._id, 
        restaurant: user._id,
        section: section._id
      });
      const updateData = { isAvailable: false };

      const res = await authenticatedRequest(
        app,
        'put',
        `/api/menus/${menu._id}/items/${item._id}/availability`,
        { token, payload: updateData }
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isAvailable', updateData.isAvailable);
    });
  });

  describe('Menu Publishing', () => {
    let menu;
    let section;

    beforeEach(async () => {
      menu = await Menu.create({ ...mockMenus[0], restaurant: user._id });
      // Add a section first
      const updatedMenu = await Menu.findByIdAndUpdate(
        menu._id,
        { $push: { sections: { name: 'Test Section', order: 1 } } },
        { new: true }
      );
      section = updatedMenu.sections[0];
    });

    it('should publish a menu', async () => {
      // Add a menu item first
      await MenuItem.create({ 
        ...mockMenuItems[0], 
        menu: menu._id, 
        restaurant: user._id,
        section: section._id
      });

      const res = await authenticatedRequest(app, 'put', `/api/menus/${menu._id}/publish`, { token });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isPublished', true);
    });

    it('should unpublish a menu', async () => {
      // First publish the menu
      await Menu.findByIdAndUpdate(menu._id, { isPublished: true });

      const res = await authenticatedRequest(app, 'put', `/api/menus/${menu._id}/unpublish`, { token });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isPublished', false);
    });
  });
}); 