const Menu = require('../models/Menu');
const MenuItem = require('../models/MenuItem');
const logger = require('../utils/logger');

/**
 * @desc    Get all items for a menu
 * @route   GET /api/menus/:menuId/items
 * @access  Private
 */
exports.getMenuItems = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.menuId);

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: 'Menu not found'
      });
    }

    // Check if user owns the menu
    if (menu.restaurant.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this menu'
      });
    }

    const items = await MenuItem.findByMenuId(req.params.menuId);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    logger.error('Error fetching menu items:', error);
    next(error);
  }
};

/**
 * @desc    Get all items for a section
 * @route   GET /api/menus/:menuId/sections/:sectionId/items
 * @access  Private
 */
exports.getSectionItems = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.menuId);

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: 'Menu not found'
      });
    }

    // Check if user owns the menu
    if (menu.restaurant.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this menu'
      });
    }

    // Check if section exists
    const sectionExists = menu.sections.some(
      section => section._id.toString() === req.params.sectionId
    );

    if (!sectionExists) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    const items = await MenuItem.findBySection(
      req.params.menuId,
      req.params.sectionId
    );

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    logger.error('Error fetching section items:', error);
    next(error);
  }
};

/**
 * @desc    Get a single menu item
 * @route   GET /api/menus/:menuId/items/:id
 * @access  Private
 */
exports.getMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    // Check if item belongs to the specified menu
    if (item.menu.toString() !== req.params.menuId) {
      return res.status(400).json({
        success: false,
        error: 'Menu item does not belong to this menu'
      });
    }

    // Check if user owns the menu
    const menu = await Menu.findById(req.params.menuId);
    if (menu.restaurant.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this menu'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    logger.error('Error fetching menu item:', error);
    next(error);
  }
};

/**
 * @desc    Create a new menu item
 * @route   POST /api/menus/:menuId/items
 * @access  Private
 */
exports.createMenuItem = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.menuId);

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: 'Menu not found'
      });
    }

    // Check if user owns the menu
    if (menu.restaurant.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this menu'
      });
    }

    // Check if section exists
    const sectionExists = menu.sections.some(
      section => section._id.toString() === req.body.section
    );

    if (!sectionExists) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    // Add menu ID to request body
    req.body.menu = req.params.menuId;

    // Create menu item
    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    logger.error('Error creating menu item:', error);
    next(error);
  }
};

/**
 * @desc    Update a menu item
 * @route   PUT /api/menus/:menuId/items/:id
 * @access  Private
 */
exports.updateMenuItem = async (req, res, next) => {
  try {
    let item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    // Check if item belongs to the specified menu
    if (item.menu.toString() !== req.params.menuId) {
      return res.status(400).json({
        success: false,
        error: 'Menu item does not belong to this menu'
      });
    }

    // Check if user owns the menu
    const menu = await Menu.findById(req.params.menuId);
    if (menu.restaurant.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this menu'
      });
    }

    // If section is being changed, check if new section exists
    if (req.body.section && req.body.section !== item.section) {
      const sectionExists = menu.sections.some(
        section => section._id.toString() === req.body.section
      );

      if (!sectionExists) {
        return res.status(404).json({
          success: false,
          error: 'Section not found'
        });
      }
    }

    // Update menu item
    item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    logger.error('Error updating menu item:', error);
    next(error);
  }
};

/**
 * @desc    Delete a menu item
 * @route   DELETE /api/menus/:menuId/items/:id
 * @access  Private
 */
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    // Check if item belongs to the specified menu
    if (item.menu.toString() !== req.params.menuId) {
      return res.status(400).json({
        success: false,
        error: 'Menu item does not belong to this menu'
      });
    }

    // Check if user owns the menu
    const menu = await Menu.findById(req.params.menuId);
    if (menu.restaurant.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this menu'
      });
    }

    await item.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('Error deleting menu item:', error);
    next(error);
  }
};

/**
 * @desc    Update menu item availability
 * @route   PUT /api/menus/:menuId/items/:id/availability
 * @access  Private
 */
exports.updateAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }

    // Check if item belongs to the specified menu
    if (item.menu.toString() !== req.params.menuId) {
      return res.status(400).json({
        success: false,
        error: 'Menu item does not belong to this menu'
      });
    }

    // Check if user owns the menu
    const menu = await Menu.findById(req.params.menuId);
    if (menu.restaurant.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this menu'
      });
    }

    // Update availability
    item.isAvailable = req.body.isAvailable;
    await item.save();

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    logger.error('Error updating menu item availability:', error);
    next(error);
  }
}; 