const Menu = require('../models/Menu');
const MenuItem = require('../models/MenuItem');
const logger = require('../utils/logger');

/**
 * @desc    Get all menus for the logged-in user
 * @route   GET /api/menus
 * @access  Private
 */
exports.getMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find({ restaurant: req.user.id });

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus
    });
  } catch (error) {
    logger.error('Error fetching menus:', error);
    next(error);
  }
};

/**
 * @desc    Get a single menu by ID
 * @route   GET /api/menus/:id
 * @access  Private
 */
exports.getMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);

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

    // Get menu items
    const items = await MenuItem.findByMenuId(menu._id);

    res.status(200).json({
      success: true,
      data: {
        ...menu.toObject(),
        items
      }
    });
  } catch (error) {
    logger.error('Error fetching menu:', error);
    next(error);
  }
};

/**
 * @desc    Create a new menu
 * @route   POST /api/menus
 * @access  Private
 */
exports.createMenu = async (req, res, next) => {
  try {
    // Add user to request body
    req.body.restaurant = req.user.id;

    // Create menu
    const menu = await Menu.create(req.body);

    res.status(201).json({
      success: true,
      data: menu
    });
  } catch (error) {
    logger.error('Error creating menu:', error);
    next(error);
  }
};

/**
 * @desc    Update a menu
 * @route   PUT /api/menus/:id
 * @access  Private
 */
exports.updateMenu = async (req, res, next) => {
  try {
    let menu = await Menu.findById(req.params.id);

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

    // Update menu
    menu = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (error) {
    logger.error('Error updating menu:', error);
    next(error);
  }
};

/**
 * @desc    Delete a menu
 * @route   DELETE /api/menus/:id
 * @access  Private
 */
exports.deleteMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);

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
        error: 'Not authorized to delete this menu'
      });
    }

    // Delete all menu items first
    await MenuItem.deleteMany({ menu: req.params.id });

    // Then delete the menu
    await menu.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('Error deleting menu:', error);
    next(error);
  }
};

/**
 * @desc    Add a section to a menu
 * @route   POST /api/menus/:id/sections
 * @access  Private
 */
exports.addSection = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);

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

    // Add section to menu
    menu.sections.push(req.body);
    await menu.save();

    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (error) {
    logger.error('Error adding section:', error);
    next(error);
  }
};

/**
 * @desc    Update a section in a menu
 * @route   PUT /api/menus/:id/sections/:sectionId
 * @access  Private
 */
exports.updateSection = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);

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

    // Find section index
    const sectionIndex = menu.sections.findIndex(
      section => section._id.toString() === req.params.sectionId
    );

    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    // Update section
    menu.sections[sectionIndex] = {
      ...menu.sections[sectionIndex].toObject(),
      ...req.body
    };

    await menu.save();

    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (error) {
    logger.error('Error updating section:', error);
    next(error);
  }
};

/**
 * @desc    Delete a section from a menu
 * @route   DELETE /api/menus/:id/sections/:sectionId
 * @access  Private
 */
exports.deleteSection = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);

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

    // Find section index
    const sectionIndex = menu.sections.findIndex(
      section => section._id.toString() === req.params.sectionId
    );

    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Section not found'
      });
    }

    // Check if there are menu items in this section
    const items = await MenuItem.find({
      menu: req.params.id,
      section: req.params.sectionId
    });

    if (items.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete section that contains items'
      });
    }

    // Remove section
    menu.sections.splice(sectionIndex, 1);
    await menu.save();

    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (error) {
    logger.error('Error deleting section:', error);
    next(error);
  }
};

/**
 * @desc    Publish a menu
 * @route   PUT /api/menus/:id/publish
 * @access  Private
 */
exports.publishMenu = async (req, res, next) => {
  try {
    let menu = await Menu.findById(req.params.id);

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
        error: 'Not authorized to publish this menu'
      });
    }

    // Check if menu has sections
    if (menu.sections.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot publish menu with no sections'
      });
    }

    // Check if menu has items
    const items = await MenuItem.find({ menu: req.params.id });
    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot publish menu with no items'
      });
    }

    // Update menu to published status
    menu.isPublished = true;
    await menu.save();

    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (error) {
    logger.error('Error publishing menu:', error);
    next(error);
  }
};

/**
 * @desc    Unpublish a menu
 * @route   PUT /api/menus/:id/unpublish
 * @access  Private
 */
exports.unpublishMenu = async (req, res, next) => {
  try {
    let menu = await Menu.findById(req.params.id);

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
        error: 'Not authorized to unpublish this menu'
      });
    }

    // Update menu to unpublished status
    menu.isPublished = false;
    await menu.save();

    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (error) {
    logger.error('Error unpublishing menu:', error);
    next(error);
  }
}; 