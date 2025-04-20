const mongoose = require('mongoose');
const { 
  getMenus, getMenu, createMenu, updateMenu, deleteMenu,
  addSection, updateSection, deleteSection,
  publishMenu, unpublishMenu
} = require('@controllers/menuController');
const Menu = require('@models/Menu');
const MenuItem = require('@models/MenuItem');
const menuController = require('@controllers/menuController');
const { mockRequestResponse } = require('@tests/utils/testHelpers');
const { mockMenus, mockMenuPayload } = require('@tests/mocks/menuMocks');

// Mock the models
jest.mock('@models/Menu');
jest.mock('@models/MenuItem');
jest.mock('@utils/logger');

describe('Menu Controller', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getMenus', () => {
    it('should get all menus for the logged-in user', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId().toString();
      const { req, res, next } = mockRequestResponse({
        user: { id: userId }
      });

      // Mock Menu.find to return sample menus
      Menu.find.mockResolvedValue(mockMenus);

      // Execute
      await getMenus(req, res, next);

      // Assert
      expect(Menu.find).toHaveBeenCalledWith({ restaurant: userId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: mockMenus.length,
        data: mockMenus
      });
    });

    it('should handle errors and call next', async () => {
      // Setup
      const error = new Error('Database error');
      const { req, res, next } = mockRequestResponse({
        user: { id: 'userId' }
      });

      // Mock Menu.find to throw an error
      Menu.find.mockRejectedValue(error);

      // Execute
      await getMenus(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should return empty array when user has no menus', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId().toString();
      const { req, res, next } = mockRequestResponse({
        user: { id: userId }
      });

      // Mock Menu.find to return empty array
      Menu.find.mockResolvedValue([]);

      // Execute
      await getMenus(req, res, next);

      // Assert
      expect(Menu.find).toHaveBeenCalledWith({ restaurant: userId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });
  });

  describe('getMenu', () => {
    it('should get a single menu by ID', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockMenu = {
        ...mockMenus[0], 
        restaurant: userId,
        toObject: jest.fn().mockReturnValue(mockMenus[0])
      };
      const mockItems = [{ name: 'Item 1' }, { name: 'Item 2' }];
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);
      // Mock MenuItem.findByMenuId to return items
      MenuItem.findByMenuId.mockResolvedValue(mockItems);

      // Execute
      await getMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(MenuItem.findByMenuId).toHaveBeenCalledWith(mockMenu._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          ...mockMenu.toObject(),
          items: mockItems
        }
      });
    });

    it('should return 404 if menu is not found', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const { req, res, next } = mockRequestResponse({
        user: { id: 'userId' },
        params: { id: menuId }
      });

      // Mock Menu.findById to return null
      Menu.findById.mockResolvedValue(null);

      // Execute
      await getMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Menu not found'
      });
    });

    it('should return 403 if user does not own the menu', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockMenu = {
        ...mockMenus[0],
        restaurant: ownerId
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId, role: 'user' },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a menu owned by someone else
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await getMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this menu'
      });
    });

    it('should allow admin to access any menu', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const adminId = new mongoose.Types.ObjectId().toString();
      const mockMenu = {
        ...mockMenus[0], 
        restaurant: ownerId,
        toObject: jest.fn().mockReturnValue(mockMenus[0])
      };
      const mockItems = [{ name: 'Item 1' }, { name: 'Item 2' }];
      
      const { req, res, next } = mockRequestResponse({
        user: { id: adminId, role: 'admin' },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);
      // Mock MenuItem.findByMenuId to return items
      MenuItem.findByMenuId.mockResolvedValue(mockItems);

      // Execute
      await getMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createMenu', () => {
    it('should create a new menu', async () => {
      // Setup
      const userId = new mongoose.Types.ObjectId().toString();
      const createdMenu = {
        ...mockMenuPayload,
        _id: new mongoose.Types.ObjectId(),
        restaurant: userId
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        body: mockMenuPayload
      });

      // Mock Menu.create to return a new menu
      Menu.create.mockResolvedValue(createdMenu);

      // Execute
      await createMenu(req, res, next);

      // Assert
      expect(Menu.create).toHaveBeenCalledWith({
        ...mockMenuPayload,
        restaurant: userId
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdMenu
      });
    });

    it('should handle errors during menu creation', async () => {
      // Setup
      const error = new Error('Validation error');
      const userId = new mongoose.Types.ObjectId().toString();
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        body: mockMenuPayload
      });

      // Mock Menu.create to throw an error
      Menu.create.mockRejectedValue(error);

      // Execute
      await createMenu(req, res, next);

      // Assert
      expect(Menu.create).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle validation errors with specific error message', async () => {
      // Setup
      const validationError = new Error('Name is required');
      validationError.name = 'ValidationError';
      
      const userId = new mongoose.Types.ObjectId().toString();
      const invalidPayload = { ...mockMenuPayload };
      delete invalidPayload.name; // Make payload invalid
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        body: invalidPayload
      });

      // Mock Menu.create to throw a validation error
      Menu.create.mockRejectedValue(validationError);

      // Execute
      await createMenu(req, res, next);

      // Assert
      expect(Menu.create).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(validationError);
    });
  });

  describe('updateMenu', () => {
    it('should update an existing menu', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockMenu = {
        ...mockMenus[0], 
        restaurant: userId
      };
      const updateData = { name: 'Updated Menu Name' };
      const updatedMenu = { ...mockMenu, ...updateData };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId },
        body: updateData
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);
      // Mock Menu.findByIdAndUpdate to return updated menu
      Menu.findByIdAndUpdate.mockResolvedValue(updatedMenu);

      // Execute
      await updateMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(Menu.findByIdAndUpdate).toHaveBeenCalledWith(
        menuId,
        updateData,
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedMenu
      });
    });

    it('should return 404 if menu to update is not found', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const { req, res, next } = mockRequestResponse({
        user: { id: 'userId' },
        params: { id: menuId },
        body: { name: 'New Name' }
      });

      // Mock Menu.findById to return null
      Menu.findById.mockResolvedValue(null);

      // Execute
      await updateMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Menu not found'
      });
    });

    it('should return 403 if user does not own the menu', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockMenu = {
        ...mockMenus[0],
        restaurant: ownerId
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId, role: 'user' },
        params: { id: menuId },
        body: { name: 'New Name' }
      });

      // Mock Menu.findById to return a menu owned by someone else
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await updateMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to update this menu'
      });
    });
  });

  describe('deleteMenu', () => {
    it('should delete a menu and its items', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockMenu = {
        ...mockMenus[0], 
        restaurant: userId,
        deleteOne: jest.fn().mockResolvedValue({ acknowledged: true })
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);
      // Mock MenuItem.deleteMany 
      MenuItem.deleteMany.mockResolvedValue({ deletedCount: 5 });

      // Execute
      await deleteMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(MenuItem.deleteMany).toHaveBeenCalledWith({ menu: menuId });
      expect(mockMenu.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {}
      });
    });

    it('should return 404 if menu to delete is not found', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const { req, res, next } = mockRequestResponse({
        user: { id: 'userId' },
        params: { id: menuId }
      });

      // Mock Menu.findById to return null
      Menu.findById.mockResolvedValue(null);

      // Execute
      await deleteMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Menu not found'
      });
    });

    it('should return 403 if user does not own the menu', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockMenu = {
        ...mockMenus[0],
        restaurant: ownerId
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId, role: 'user' },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a menu owned by someone else
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await deleteMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to delete this menu'
      });
    });

    it('should handle database errors during deletion', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const error = new Error('Database connection error');
      const mockMenu = {
        ...mockMenus[0], 
        restaurant: userId,
        deleteOne: jest.fn().mockRejectedValue(error)
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);
      // Mock MenuItem.deleteMany 
      MenuItem.deleteMany.mockResolvedValue({ deletedCount: 5 });

      // Execute
      await deleteMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(mockMenu.deleteOne).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('addSection', () => {
    it('should add a section to a menu', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const sectionData = { name: 'New Section', description: 'New section description' };
      const mockMenu = {
        ...mockMenus[0], 
        restaurant: userId,
        sections: [...mockMenus[0].sections],
        save: jest.fn().mockResolvedValue(true)
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId },
        body: sectionData
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await addSection(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(mockMenu.sections.length).toBe(mockMenus[0].sections.length + 1);
      expect(mockMenu.sections[mockMenu.sections.length - 1]).toEqual(sectionData);
      expect(mockMenu.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMenu
      });
    });

    it('should return 404 if menu not found', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const sectionData = { name: 'New Section', description: 'New section description' };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId },
        body: sectionData
      });

      // Mock Menu.findById to return null
      Menu.findById.mockResolvedValue(null);

      // Execute
      await addSection(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Menu not found'
      });
    });
    
    it('should return 403 if user does not own the menu', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const sectionData = { name: 'New Section', description: 'New section description' };
      const mockMenu = {
        ...mockMenus[0],
        restaurant: ownerId
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId, role: 'user' },
        params: { id: menuId },
        body: sectionData
      });

      // Mock Menu.findById to return a menu owned by someone else
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await addSection(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to update this menu'
      });
    });
    
    it('should handle error on save', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const sectionData = { name: 'New Section', description: 'New section description' };
      const error = new Error('Save error');
      const mockMenu = {
        ...mockMenus[0], 
        restaurant: userId,
        sections: [...mockMenus[0].sections],
        save: jest.fn().mockRejectedValue(error)
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId },
        body: sectionData
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await addSection(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(mockMenu.sections.length).toBe(mockMenus[0].sections.length + 1);
      expect(mockMenu.save).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('publishMenu', () => {
    it('should publish a menu if it has sections and items', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockMenu = {
        ...mockMenus[0], 
        restaurant: userId,
        isPublished: false,
        save: jest.fn().mockImplementation(function() {
          this.isPublished = true;
          return this;
        })
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);
      // Mock MenuItem.find to return items
      MenuItem.find.mockResolvedValue([{ name: 'Item 1' }]);

      // Execute
      await publishMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(MenuItem.find).toHaveBeenCalledWith({ menu: menuId });
      expect(mockMenu.save).toHaveBeenCalled();
      expect(mockMenu.isPublished).toBe(true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMenu
      });
    });

    it('should return 400 if menu has no sections', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockMenu = {
        ...mockMenus[0], 
        restaurant: userId,
        sections: [],
        isPublished: false
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a menu with no sections
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await publishMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Cannot publish menu with no sections'
      });
    });

    it('should return 400 if menu has no items', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockMenu = {
        ...mockMenus[0], 
        restaurant: userId,
        isPublished: false
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);
      // Mock MenuItem.find to return empty array
      MenuItem.find.mockResolvedValue([]);

      // Execute
      await publishMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(MenuItem.find).toHaveBeenCalledWith({ menu: menuId });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Cannot publish menu with no items'
      });
    });

    it('should return 404 if menu not found', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId }
      });

      // Mock Menu.findById to return null
      Menu.findById.mockResolvedValue(null);

      // Execute
      await publishMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Menu not found'
      });
    });

    it('should return 403 if user is not authorized', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockMenu = {
        ...mockMenus[0],
        restaurant: ownerId,
        isPublished: false
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId, role: 'user' },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a menu owned by someone else
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await publishMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to publish this menu'
      });
    });

    it('should handle save errors', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const error = new Error('Save error');
      
      const mockMenu = {
        ...mockMenus[0], 
        restaurant: userId,
        isPublished: false,
        save: jest.fn().mockRejectedValue(error)
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);
      // Mock MenuItem.find to return items
      MenuItem.find.mockResolvedValue([{ name: 'Item 1' }]);

      // Execute
      await publishMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(MenuItem.find).toHaveBeenCalledWith({ menu: menuId });
      expect(mockMenu.save).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should return 400 if menu has no items when publishing', async () => {
      // Setup
      const req = {
        params: { id: 'menu123' },
        user: { id: 'user123', role: 'owner' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      // Mock finding a menu with sections but no items
      Menu.findById = jest.fn().mockResolvedValue({
        _id: 'menu123',
        restaurant: 'user123',
        sections: [{ _id: 'section123', name: 'Appetizers' }],
        save: jest.fn().mockResolvedValue({})
      });

      // Mock no items found - using find instead of countDocuments
      MenuItem.find = jest.fn().mockResolvedValue([]);

      // Execute
      await menuController.publishMenu(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Cannot publish menu with no items'
        })
      );
    });
  });

  describe('unpublishMenu', () => {
    it('should unpublish a menu', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockMenu = {
        ...mockMenus[0], 
        restaurant: userId,
        isPublished: true,
        save: jest.fn().mockImplementation(function() {
          this.isPublished = false;
          return this;
        })
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a published menu
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await unpublishMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(mockMenu.save).toHaveBeenCalled();
      expect(mockMenu.isPublished).toBe(false);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMenu
      });
    });

    it('should return 404 if menu not found', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId }
      });

      // Mock Menu.findById to return null
      Menu.findById.mockResolvedValue(null);

      // Execute
      await unpublishMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Menu not found'
      });
    });

    it('should return 403 if user is not authorized', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockMenu = {
        ...mockMenus[0],
        restaurant: ownerId,
        isPublished: true
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId, role: 'user' },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a menu owned by someone else
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await unpublishMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to unpublish this menu'
      });
    });

    it('should handle save errors', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const error = new Error('Save error');
      
      const mockMenu = {
        ...mockMenus[0], 
        restaurant: userId,
        isPublished: true,
        save: jest.fn().mockRejectedValue(error)
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId }
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await unpublishMenu(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(mockMenu.save).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateSection', () => {
    it('should update a section in a menu', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const sectionId = mockMenus[0].sections[0]._id.toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: 'Updated Section Name' };
      
      const mockMenu = {
        ...mockMenus[0],
        restaurant: userId,
        sections: mockMenus[0].sections.map(section => ({
          ...section,
          toObject: jest.fn().mockReturnValue(section)
        })),
        save: jest.fn().mockResolvedValue(true)
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId, sectionId },
        body: updateData
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await updateSection(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(mockMenu.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMenu
      });
    });

    it('should return 404 if section is not found', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const nonExistentSectionId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: 'Updated Section Name' };
      
      const mockMenu = {
        ...mockMenus[0],
        restaurant: userId,
        sections: mockMenus[0].sections
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId, sectionId: nonExistentSectionId },
        body: updateData
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await updateSection(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Section not found'
      });
    });

    it('should handle save errors when updating a section', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const sectionId = mockMenus[0].sections[0]._id.toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const updateData = { name: 'Updated Section Name' };
      const error = new Error('Save error');
      
      const mockMenu = {
        ...mockMenus[0],
        restaurant: userId,
        sections: mockMenus[0].sections.map(section => ({
          ...section,
          toObject: jest.fn().mockReturnValue(section)
        })),
        save: jest.fn().mockRejectedValue(error)
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId, sectionId },
        body: updateData
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await updateSection(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(mockMenu.save).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteSection', () => {
    it('should delete a section from a menu', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const sectionId = mockMenus[0].sections[0]._id.toString();
      const userId = new mongoose.Types.ObjectId().toString();
      
      const mockMenu = {
        ...mockMenus[0],
        restaurant: userId,
        sections: [...mockMenus[0].sections],
        save: jest.fn().mockResolvedValue(true)
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId, sectionId }
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);
      // Mock MenuItem.find to return empty array (no items in section)
      MenuItem.find.mockResolvedValue([]);

      // Execute
      await deleteSection(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(MenuItem.find).toHaveBeenCalledWith({
        menu: menuId,
        section: sectionId
      });
      expect(mockMenu.save).toHaveBeenCalled();
      expect(mockMenu.sections.find(s => s._id.toString() === sectionId)).toBeUndefined();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMenu
      });
    });

    it('should return 400 if section contains items', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const sectionId = mockMenus[0].sections[0]._id.toString();
      const userId = new mongoose.Types.ObjectId().toString();
      
      const mockMenu = {
        ...mockMenus[0],
        restaurant: userId,
        sections: [...mockMenus[0].sections]
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId, sectionId }
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);
      // Mock MenuItem.find to return items (section has items)
      MenuItem.find.mockResolvedValue([{ name: 'Item 1' }]);

      // Execute
      await deleteSection(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(MenuItem.find).toHaveBeenCalledWith({
        menu: menuId,
        section: sectionId
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Cannot delete section that contains items'
      });
    });

    it('should return 404 if menu not found', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const sectionId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId, sectionId }
      });

      // Mock Menu.findById to return null
      Menu.findById.mockResolvedValue(null);

      // Execute
      await deleteSection(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Menu not found'
      });
    });
    
    it('should return 403 if user does not own the menu', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const sectionId = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      
      const mockMenu = {
        ...mockMenus[0],
        restaurant: ownerId,
        sections: [...mockMenus[0].sections]
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId, role: 'user' },
        params: { id: menuId, sectionId }
      });

      // Mock Menu.findById to return a menu owned by someone else
      Menu.findById.mockResolvedValue(mockMenu);

      // Execute
      await deleteSection(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to update this menu'
      });
    });
    
    it('should handle save errors during section deletion', async () => {
      // Setup
      const menuId = new mongoose.Types.ObjectId().toString();
      const sectionId = mockMenus[0].sections[0]._id.toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const error = new Error('Save error');
      
      const mockMenu = {
        ...mockMenus[0],
        restaurant: userId,
        sections: [...mockMenus[0].sections],
        save: jest.fn().mockRejectedValue(error)
      };
      
      const { req, res, next } = mockRequestResponse({
        user: { id: userId },
        params: { id: menuId, sectionId }
      });

      // Mock Menu.findById to return a menu
      Menu.findById.mockResolvedValue(mockMenu);
      // Mock MenuItem.find to return empty array (no items in section)
      MenuItem.find.mockResolvedValue([]);

      // Execute
      await deleteSection(req, res, next);

      // Assert
      expect(Menu.findById).toHaveBeenCalledWith(menuId);
      expect(MenuItem.find).toHaveBeenCalledWith({
        menu: menuId,
        section: sectionId
      });
      expect(mockMenu.save).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

describe('Additional edge cases', () => {
  it('should handle database errors during menu update', async () => {
    // Setup
    const { req, res, next } = mockRequestResponse({
      params: { id: 'menu123' },
      user: { id: 'user123', role: 'owner' },
      body: { name: 'Updated Menu' }
    });

    // Mock finding a menu
    Menu.findById = jest.fn().mockResolvedValue({
      _id: 'menu123',
      restaurant: 'user123'
    });

    // Mock database error during update
    Menu.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'));

    // Execute
    await menuController.updateMenu(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle authorization when admin updates a menu', async () => {
    // Setup
    const { req, res, next } = mockRequestResponse({
      params: { id: 'menu123' },
      user: { id: 'admin123', role: 'admin' },
      body: { name: 'Admin Updated Menu' }
    });

    // Mock finding a menu owned by another user
    Menu.findById = jest.fn().mockResolvedValue({
      _id: 'menu123',
      restaurant: 'user123'
    });

    // Mock successful update
    Menu.findByIdAndUpdate = jest.fn().mockResolvedValue({
      _id: 'menu123',
      name: 'Admin Updated Menu'
    });

    // Execute
    await menuController.updateMenu(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.any(Object)
      })
    );
  });

  it('should validate menu has items before publishing', async () => {
    // Setup
    const { req, res, next } = mockRequestResponse({
      params: { id: 'menu123' },
      user: { id: 'user123', role: 'owner' }
    });

    // Mock finding a menu with sections but no items
    Menu.findById = jest.fn().mockResolvedValue({
      _id: 'menu123',
      restaurant: 'user123',
      sections: [{ _id: 'section123', name: 'Appetizers' }],
      save: jest.fn().mockResolvedValue({})
    });

    // Mock no items found - using find instead of countDocuments
    MenuItem.find = jest.fn().mockResolvedValue([]);

    // Execute
    await menuController.publishMenu(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Cannot publish menu with no items'
      })
    );
  });

  it('should handle errors during unpublishMenu save operation', async () => {
    // Setup
    const { req, res, next } = mockRequestResponse({
      params: { id: 'menu123' },
      user: { id: 'user123', role: 'owner' }
    });

    // Mock finding a menu with save error
    const saveMock = jest.fn().mockRejectedValue(new Error('Save failed'));
    Menu.findById = jest.fn().mockResolvedValue({
      _id: 'menu123',
      restaurant: 'user123',
      isPublished: true,
      save: saveMock
    });

    // Execute
    await menuController.unpublishMenu(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
  
  it('should allow admin to delete any menu', async () => {
    // Setup
    const req = {
      params: { id: 'menu123' },
      user: { id: 'admin123', role: 'admin' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    // Mock finding a menu owned by another user with deleteOne method
    Menu.findById = jest.fn().mockResolvedValue({
      _id: 'menu123',
      restaurant: 'user123',
      deleteOne: jest.fn().mockResolvedValue({}) // Add the deleteOne method
    });
    
    // Mock deletion of related items
    MenuItem.deleteMany = jest.fn().mockResolvedValue({});

    // Execute
    await menuController.deleteMenu(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: {}
      })
    );
    expect(MenuItem.deleteMany).toHaveBeenCalledWith({ menu: 'menu123' });
  });
});