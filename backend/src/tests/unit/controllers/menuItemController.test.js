const mongoose = require('mongoose');
const Menu = require('../../../models/Menu');
const MenuItem = require('../../../models/MenuItem');
const menuItemController = require('../../../controllers/menuItemController');

// Mock the models
jest.mock('../../../models/Menu');
jest.mock('../../../models/MenuItem');
jest.mock('../../../utils/logger');

describe('Menu Item Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock request
    mockReq = {
      params: {},
      body: {},
      user: {
        id: 'user123',
        role: 'restaurant'
      }
    };

    // Setup mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Setup mock next function
    mockNext = jest.fn();
  });

  describe('getMenuItems', () => {
    it('should return menu items for a valid menu', async () => {
      const mockMenu = {
        _id: 'menu123',
        restaurant: 'user123',
        sections: []
      };
      const mockItems = [
        { _id: 'item1', name: 'Item 1' },
        { _id: 'item2', name: 'Item 2' }
      ];

      Menu.findById.mockResolvedValue(mockMenu);
      MenuItem.findByMenuId.mockResolvedValue(mockItems);

      mockReq.params.menuId = 'menu123';

      await menuItemController.getMenuItems(mockReq, mockRes, mockNext);

      expect(Menu.findById).toHaveBeenCalledWith('menu123');
      expect(MenuItem.findByMenuId).toHaveBeenCalledWith('menu123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockItems
      });
    });

    it('should return 404 if menu not found', async () => {
      Menu.findById.mockResolvedValue(null);
      mockReq.params.menuId = 'nonexistent';

      await menuItemController.getMenuItems(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Menu not found'
      });
    });

    it('should return 403 if user not authorized', async () => {
      const mockMenu = {
        _id: 'menu123',
        restaurant: 'otheruser',
        sections: []
      };

      Menu.findById.mockResolvedValue(mockMenu);
      mockReq.params.menuId = 'menu123';

      await menuItemController.getMenuItems(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this menu'
      });
    });
  });

  describe('getSectionItems', () => {
    it('should return items for a valid section', async () => {
      const mockMenu = {
        _id: 'menu123',
        restaurant: 'user123',
        sections: [{ _id: 'section123' }]
      };
      const mockItems = [
        { _id: 'item1', name: 'Item 1', section: 'section123' },
        { _id: 'item2', name: 'Item 2', section: 'section123' }
      ];

      Menu.findById.mockResolvedValue(mockMenu);
      MenuItem.findBySection.mockResolvedValue(mockItems);

      mockReq.params.menuId = 'menu123';
      mockReq.params.sectionId = 'section123';

      await menuItemController.getSectionItems(mockReq, mockRes, mockNext);

      expect(Menu.findById).toHaveBeenCalledWith('menu123');
      expect(MenuItem.findBySection).toHaveBeenCalledWith('menu123', 'section123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockItems
      });
    });

    it('should return 404 if section not found', async () => {
      const mockMenu = {
        _id: 'menu123',
        restaurant: 'user123',
        sections: [{ _id: 'section123' }]
      };

      Menu.findById.mockResolvedValue(mockMenu);
      mockReq.params.menuId = 'menu123';
      mockReq.params.sectionId = 'nonexistent';

      await menuItemController.getSectionItems(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Section not found'
      });
    });
  });

  describe('getMenuItem', () => {
    it('should return a single menu item', async () => {
      const mockItem = {
        _id: 'item123',
        menu: 'menu123',
        name: 'Test Item'
      };
      const mockMenu = {
        _id: 'menu123',
        restaurant: 'user123'
      };

      MenuItem.findById.mockResolvedValue(mockItem);
      Menu.findById.mockResolvedValue(mockMenu);

      mockReq.params.menuId = 'menu123';
      mockReq.params.id = 'item123';

      await menuItemController.getMenuItem(mockReq, mockRes, mockNext);

      expect(MenuItem.findById).toHaveBeenCalledWith('item123');
      expect(Menu.findById).toHaveBeenCalledWith('menu123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockItem
      });
    });

    it('should return 404 if item not found', async () => {
      MenuItem.findById.mockResolvedValue(null);
      mockReq.params.menuId = 'menu123';
      mockReq.params.id = 'nonexistent';

      await menuItemController.getMenuItem(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Menu item not found'
      });
    });
  });

  describe('createMenuItem', () => {
    it('should create a new menu item', async () => {
      const mockMenu = {
        _id: 'menu123',
        restaurant: 'user123',
        sections: [{ _id: 'section123' }]
      };
      const mockNewItem = {
        _id: 'newitem123',
        menu: 'menu123',
        section: 'section123',
        name: 'New Item'
      };

      Menu.findById.mockResolvedValue(mockMenu);
      MenuItem.create.mockResolvedValue(mockNewItem);

      mockReq.params.menuId = 'menu123';
      mockReq.body = {
        section: 'section123',
        name: 'New Item'
      };

      await menuItemController.createMenuItem(mockReq, mockRes, mockNext);

      expect(Menu.findById).toHaveBeenCalledWith('menu123');
      expect(MenuItem.create).toHaveBeenCalledWith({
        ...mockReq.body,
        menu: 'menu123'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockNewItem
      });
    });

    it('should return 404 if section not found', async () => {
      const mockMenu = {
        _id: 'menu123',
        restaurant: 'user123',
        sections: [{ _id: 'section123' }]
      };

      Menu.findById.mockResolvedValue(mockMenu);
      mockReq.params.menuId = 'menu123';
      mockReq.body = {
        section: 'nonexistent',
        name: 'New Item'
      };

      await menuItemController.createMenuItem(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Section not found'
      });
    });
  });

  describe('updateMenuItem', () => {
    it('should update an existing menu item', async () => {
      const mockItem = {
        _id: 'item123',
        menu: 'menu123',
        section: 'section123',
        name: 'Old Name'
      };
      const mockMenu = {
        _id: 'menu123',
        restaurant: 'user123',
        sections: [{ _id: 'section123' }]
      };
      const mockUpdatedItem = {
        ...mockItem,
        name: 'New Name'
      };

      MenuItem.findById.mockResolvedValue(mockItem);
      Menu.findById.mockResolvedValue(mockMenu);
      MenuItem.findByIdAndUpdate.mockResolvedValue(mockUpdatedItem);

      mockReq.params.menuId = 'menu123';
      mockReq.params.id = 'item123';
      mockReq.body = {
        name: 'New Name'
      };

      await menuItemController.updateMenuItem(mockReq, mockRes, mockNext);

      expect(MenuItem.findByIdAndUpdate).toHaveBeenCalledWith(
        'item123',
        { name: 'New Name' },
        { new: true, runValidators: true }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedItem
      });
    });

    it('should return 404 if item not found', async () => {
      MenuItem.findById.mockResolvedValue(null);
      mockReq.params.menuId = 'menu123';
      mockReq.params.id = 'nonexistent';

      await menuItemController.updateMenuItem(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Menu item not found'
      });
    });
  });

  describe('deleteMenuItem', () => {
    it('should delete an existing menu item', async () => {
      const mockItem = {
        _id: 'item123',
        menu: 'menu123',
        deleteOne: jest.fn()
      };
      const mockMenu = {
        _id: 'menu123',
        restaurant: 'user123'
      };

      MenuItem.findById.mockResolvedValue(mockItem);
      Menu.findById.mockResolvedValue(mockMenu);

      mockReq.params.menuId = 'menu123';
      mockReq.params.id = 'item123';

      await menuItemController.deleteMenuItem(mockReq, mockRes, mockNext);

      expect(mockItem.deleteOne).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {}
      });
    });

    it('should return 404 if item not found', async () => {
      MenuItem.findById.mockResolvedValue(null);
      mockReq.params.menuId = 'menu123';
      mockReq.params.id = 'nonexistent';

      await menuItemController.deleteMenuItem(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Menu item not found'
      });
    });
  });

  describe('updateAvailability', () => {
    it('should update item availability', async () => {
      const mockItem = {
        _id: 'item123',
        menu: 'menu123',
        isAvailable: false,
        save: jest.fn().mockResolvedValue({ ...this, isAvailable: true })
      };
      const mockMenu = {
        _id: 'menu123',
        restaurant: 'user123'
      };

      MenuItem.findById.mockResolvedValue(mockItem);
      Menu.findById.mockResolvedValue(mockMenu);

      mockReq.params.menuId = 'menu123';
      mockReq.params.id = 'item123';
      mockReq.body = {
        isAvailable: true
      };

      await menuItemController.updateAvailability(mockReq, mockRes, mockNext);

      expect(mockItem.isAvailable).toBe(true);
      expect(mockItem.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ isAvailable: true })
      });
    });

    it('should return 404 if item not found', async () => {
      MenuItem.findById.mockResolvedValue(null);
      mockReq.params.menuId = 'menu123';
      mockReq.params.id = 'nonexistent';

      await menuItemController.updateAvailability(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Menu item not found'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors in getMenuItems', async () => {
      const error = new Error('Database error');
      Menu.findById.mockRejectedValue(error);

      mockReq.params.menuId = 'menu123';

      await menuItemController.getMenuItems(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle database errors in getSectionItems', async () => {
      const error = new Error('Database error');
      Menu.findById.mockRejectedValue(error);

      mockReq.params.menuId = 'menu123';
      mockReq.params.sectionId = 'section123';

      await menuItemController.getSectionItems(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle database errors in getMenuItem', async () => {
      const error = new Error('Database error');
      MenuItem.findById.mockRejectedValue(error);

      mockReq.params.menuId = 'menu123';
      mockReq.params.id = 'item123';

      await menuItemController.getMenuItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle database errors in createMenuItem', async () => {
      const error = new Error('Database error');
      Menu.findById.mockResolvedValue({
        _id: 'menu123',
        restaurant: 'user123',
        sections: [{ _id: 'section123' }]
      });
      MenuItem.create.mockRejectedValue(error);

      mockReq.params.menuId = 'menu123';
      mockReq.body = {
        section: 'section123',
        name: 'New Item'
      };

      await menuItemController.createMenuItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle database errors in updateMenuItem', async () => {
      const error = new Error('Database error');
      MenuItem.findById.mockResolvedValue({
        _id: 'item123',
        menu: 'menu123'
      });
      Menu.findById.mockResolvedValue({
        _id: 'menu123',
        restaurant: 'user123'
      });
      MenuItem.findByIdAndUpdate.mockRejectedValue(error);

      mockReq.params.menuId = 'menu123';
      mockReq.params.id = 'item123';
      mockReq.body = {
        name: 'Updated Name'
      };

      await menuItemController.updateMenuItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle database errors in deleteMenuItem', async () => {
      const error = new Error('Database error');
      MenuItem.findById.mockResolvedValue({
        _id: 'item123',
        menu: 'menu123',
        deleteOne: jest.fn().mockRejectedValue(error)
      });
      Menu.findById.mockResolvedValue({
        _id: 'menu123',
        restaurant: 'user123'
      });

      mockReq.params.menuId = 'menu123';
      mockReq.params.id = 'item123';

      await menuItemController.deleteMenuItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle database errors in updateAvailability', async () => {
      const error = new Error('Database error');
      MenuItem.findById.mockResolvedValue({
        _id: 'item123',
        menu: 'menu123',
        isAvailable: false,
        save: jest.fn().mockRejectedValue(error)
      });
      Menu.findById.mockResolvedValue({
        _id: 'menu123',
        restaurant: 'user123'
      });

      mockReq.params.menuId = 'menu123';
      mockReq.params.id = 'item123';
      mockReq.body = {
        isAvailable: true
      };

      await menuItemController.updateAvailability(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
}); 