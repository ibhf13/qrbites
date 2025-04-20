const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const { protect } = require('@middleware/auth');
const menuRoutes = require('@routes/menuRoutes');
const {
  getMenus, getMenu, createMenu, updateMenu, deleteMenu,
  addSection, updateSection, deleteSection,
  publishMenu, unpublishMenu
} = require('@controllers/menuController');
const {
  getMenuItems, getSectionItems, getMenuItem,
  createMenuItem, updateMenuItem, deleteMenuItem,
  updateAvailability
} = require('@controllers/menuItemController');

// Mock middleware and controllers
jest.mock('@middleware/auth');
jest.mock('@controllers/menuController');
jest.mock('@controllers/menuItemController');

describe('Menu Routes', () => {
  let app;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock the protect middleware to pass authentication
    protect.mockImplementation((req, res, next) => {
      req.user = { id: 'mockUserId', role: 'user' };
      next();
    });

    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/menus', menuRoutes);
  });

  describe('Route definitions', () => {
    it('should define all required menu routes', async () => {
      // Get the routes defined in the Express router
      const routes = menuRoutes.stack
        .filter(layer => layer.route)
        .map(layer => {
          return {
            path: layer.route.path,
            methods: Object.keys(layer.route.methods)
          };
        });

      // Check if all expected routes are defined
      const expectedRoutes = [
        { path: '/', methods: ['get', 'post'] },
        { path: '/:id', methods: ['get', 'put', 'delete'] },
        { path: '/:id/sections', methods: ['post'] },
        { path: '/:id/sections/:sectionId', methods: ['put', 'delete'] },
        { path: '/:menuId/items', methods: ['get', 'post'] },
        { path: '/:menuId/items/:id', methods: ['get', 'put', 'delete'] },
        { path: '/:menuId/sections/:sectionId/items', methods: ['get'] },
        { path: '/:menuId/items/:id/availability', methods: ['put'] },
        { path: '/:id/publish', methods: ['put'] },
        { path: '/:id/unpublish', methods: ['put'] }
      ];

      expectedRoutes.forEach(expected => {
        const route = routes.find(r => r.path === expected.path);
        expect(route).toBeDefined();
        expected.methods.forEach(method => {
          expect(route.methods).toContain(method);
        });
      });
    });

    it('should use authentication middleware', async () => {
      // Setup mock response
      getMenus.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      // Make a request to any route to trigger the middleware
      await request(app).get('/api/menus');
      
      // Check that protect middleware is applied
      expect(protect).toHaveBeenCalled();
    });
  });

  describe('Menu CRUD routes', () => {
    it('GET /api/menus should call getMenus controller', async () => {
      // Setup mock response
      getMenus.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      // Make request to the route
      await request(app).get('/api/menus');

      // Verify controller was called
      expect(getMenus).toHaveBeenCalled();
    });

    it('POST /api/menus should call createMenu controller', async () => {
      // Setup mock data and response
      const menuData = { name: 'Test Menu', description: 'Test Description' };
      createMenu.mockImplementation((req, res) => {
        res.status(201).json({ success: true, data: { ...menuData, _id: 'newMenuId' } });
      });
      
      // Make request to the route
      await request(app)
        .post('/api/menus')
        .send(menuData);

      // Verify controller was called with correct data
      expect(createMenu).toHaveBeenCalled();
      const req = createMenu.mock.calls[0][0];
      expect(req.body).toEqual(menuData);
    });

    it('GET /api/menus/:id should call getMenu controller', async () => {
      // Setup mock
      const menuId = new mongoose.Types.ObjectId().toString();
      getMenu.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: { _id: menuId } });
      });
      
      // Make request to the route
      await request(app).get(`/api/menus/${menuId}`);

      // Verify controller was called with correct ID
      expect(getMenu).toHaveBeenCalled();
      const req = getMenu.mock.calls[0][0];
      expect(req.params.id).toBe(menuId);
    });

    it('PUT /api/menus/:id should call updateMenu controller', async () => {
      // Setup mock
      const menuId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: 'Updated Menu' };
      updateMenu.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: { _id: menuId, ...updateData } });
      });
      
      // Make request to the route
      await request(app)
        .put(`/api/menus/${menuId}`)
        .send(updateData);

      // Verify controller was called with correct data
      expect(updateMenu).toHaveBeenCalled();
      const req = updateMenu.mock.calls[0][0];
      expect(req.params.id).toBe(menuId);
      expect(req.body).toEqual(updateData);
    });

    it('DELETE /api/menus/:id should call deleteMenu controller', async () => {
      // Setup mock
      const menuId = new mongoose.Types.ObjectId().toString();
      deleteMenu.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: {} });
      });
      
      // Make request to the route
      await request(app).delete(`/api/menus/${menuId}`);

      // Verify controller was called with correct ID
      expect(deleteMenu).toHaveBeenCalled();
      const req = deleteMenu.mock.calls[0][0];
      expect(req.params.id).toBe(menuId);
    });
  });

  describe('Section routes', () => {
    it('POST /api/menus/:id/sections should call addSection controller', async () => {
      // Setup mock
      const menuId = new mongoose.Types.ObjectId().toString();
      const sectionData = { name: 'New Section', description: 'New section description' };
      addSection.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: { sections: [sectionData] } });
      });
      
      // Make request to the route
      await request(app)
        .post(`/api/menus/${menuId}/sections`)
        .send(sectionData);

      // Verify controller was called with correct data
      expect(addSection).toHaveBeenCalled();
      const req = addSection.mock.calls[0][0];
      expect(req.params.id).toBe(menuId);
      expect(req.body).toEqual(sectionData);
    });

    it('PUT /api/menus/:id/sections/:sectionId should call updateSection controller', async () => {
      // Setup mock
      const menuId = new mongoose.Types.ObjectId().toString();
      const sectionId = new mongoose.Types.ObjectId().toString();
      const sectionData = { name: 'Updated Section' };
      updateSection.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: { sections: [{ _id: sectionId, ...sectionData }] } });
      });
      
      // Make request to the route
      await request(app)
        .put(`/api/menus/${menuId}/sections/${sectionId}`)
        .send(sectionData);

      // Verify controller was called with correct data
      expect(updateSection).toHaveBeenCalled();
      const req = updateSection.mock.calls[0][0];
      expect(req.params.id).toBe(menuId);
      expect(req.params.sectionId).toBe(sectionId);
      expect(req.body).toEqual(sectionData);
    });

    it('DELETE /api/menus/:id/sections/:sectionId should call deleteSection controller', async () => {
      // Setup mock
      const menuId = new mongoose.Types.ObjectId().toString();
      const sectionId = new mongoose.Types.ObjectId().toString();
      deleteSection.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: { sections: [] } });
      });
      
      // Make request to the route
      await request(app).delete(`/api/menus/${menuId}/sections/${sectionId}`);

      // Verify controller was called with correct IDs
      expect(deleteSection).toHaveBeenCalled();
      const req = deleteSection.mock.calls[0][0];
      expect(req.params.id).toBe(menuId);
      expect(req.params.sectionId).toBe(sectionId);
    });
  });

  describe('Menu Item routes', () => {
    it('GET /api/menus/:menuId/items should call getMenuItems controller', async () => {
      // Setup mock
      const menuId = new mongoose.Types.ObjectId().toString();
      getMenuItems.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });
      
      // Make request to the route
      await request(app).get(`/api/menus/${menuId}/items`);

      // Verify controller was called with correct ID
      expect(getMenuItems).toHaveBeenCalled();
      const req = getMenuItems.mock.calls[0][0];
      expect(req.params.menuId).toBe(menuId);
    });

    it('GET /api/menus/:menuId/sections/:sectionId/items should call getSectionItems controller', async () => {
      // Setup mock
      const menuId = new mongoose.Types.ObjectId().toString();
      const sectionId = new mongoose.Types.ObjectId().toString();
      getSectionItems.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });
      
      // Make request to the route
      await request(app).get(`/api/menus/${menuId}/sections/${sectionId}/items`);

      // Verify controller was called with correct IDs
      expect(getSectionItems).toHaveBeenCalled();
      const req = getSectionItems.mock.calls[0][0];
      expect(req.params.menuId).toBe(menuId);
      expect(req.params.sectionId).toBe(sectionId);
    });

    it('POST /api/menus/:menuId/items should call createMenuItem controller', async () => {
      // Setup mock
      const menuId = new mongoose.Types.ObjectId().toString();
      const itemData = {
        name: 'New Item',
        price: 9.99,
        section: '6805017f0a3e8c44976e7fd5'
      };
      
      createMenuItem.mockImplementation((req, res) => {
        res.status(201).json({ success: true, data: { ...itemData, _id: 'newItemId' } });
      });
      
      // Make request to the route
      await request(app)
        .post(`/api/menus/${menuId}/items`)
        .send(itemData);

      // Verify controller was called with correct data
      expect(createMenuItem).toHaveBeenCalled();
      const req = createMenuItem.mock.calls[0][0];
      expect(req.params.menuId).toBe(menuId);
      expect(req.body).toEqual({
        ...itemData,
        currency: 'USD',
        isAvailable: true,
        order: 0
      });
    });

    it('PUT /api/menus/:menuId/items/:id/availability should call updateAvailability controller', async () => {
      // Setup mock
      const menuId = new mongoose.Types.ObjectId().toString();
      const itemId = new mongoose.Types.ObjectId().toString();
      const availabilityData = { isAvailable: true };
      updateAvailability.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: { _id: itemId, isAvailable: true } });
      });
      
      // Make request to the route
      await request(app)
        .put(`/api/menus/${menuId}/items/${itemId}/availability`)
        .send(availabilityData);

      // Verify controller was called with correct data
      expect(updateAvailability).toHaveBeenCalled();
      const req = updateAvailability.mock.calls[0][0];
      expect(req.params.menuId).toBe(menuId);
      expect(req.params.id).toBe(itemId);
      expect(req.body).toEqual(availabilityData);
    });
  });

  describe('Menu publish/unpublish routes', () => {
    it('PUT /api/menus/:id/publish should call publishMenu controller', async () => {
      // Setup mock
      const menuId = new mongoose.Types.ObjectId().toString();
      publishMenu.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: { _id: menuId, isPublished: true } });
      });
      
      // Make request to the route
      await request(app).put(`/api/menus/${menuId}/publish`);

      // Verify controller was called with correct ID
      expect(publishMenu).toHaveBeenCalled();
      const req = publishMenu.mock.calls[0][0];
      expect(req.params.id).toBe(menuId);
    });

    it('PUT /api/menus/:id/unpublish should call unpublishMenu controller', async () => {
      // Setup mock
      const menuId = new mongoose.Types.ObjectId().toString();
      unpublishMenu.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: { _id: menuId, isPublished: false } });
      });
      
      // Make request to the route
      await request(app).put(`/api/menus/${menuId}/unpublish`);

      // Verify controller was called with correct ID
      expect(unpublishMenu).toHaveBeenCalled();
      const req = unpublishMenu.mock.calls[0][0];
      expect(req.params.id).toBe(menuId);
    });
  });
});
