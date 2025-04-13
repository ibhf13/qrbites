const express = require('express');
const {
  getMenus,
  getMenu,
  createMenu,
  updateMenu,
  deleteMenu,
  addSection,
  updateSection,
  deleteSection,
  publishMenu,
  unpublishMenu
} = require('../controllers/menuController');

const {
  getMenuItems,
  getSectionItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateAvailability
} = require('../controllers/menuItemController');

const { protect } = require('../middleware/auth');
const { validate, menuSchema, sectionSchema, menuItemSchema } = require('../middleware/validator');

const router = express.Router();

// Protect all routes
router.use(protect);

// Menu routes
router.route('/')
  .get(getMenus)
  .post(validate(menuSchema), createMenu);

router.route('/:id')
  .get(getMenu)
  .put(validate(menuSchema), updateMenu)
  .delete(deleteMenu);

// Section routes
router.route('/:id/sections')
  .post(validate(sectionSchema), addSection);

router.route('/:id/sections/:sectionId')
  .put(validate(sectionSchema), updateSection)
  .delete(deleteSection);

// Menu item routes
router.route('/:menuId/items')
  .get(getMenuItems)
  .post(validate(menuItemSchema), createMenuItem);

router.route('/:menuId/items/:id')
  .get(getMenuItem)
  .put(validate(menuItemSchema), updateMenuItem)
  .delete(deleteMenuItem);

// Section items route
router.route('/:menuId/sections/:sectionId/items')
  .get(getSectionItems);

// Menu item availability route
router.route('/:menuId/items/:id/availability')
  .put(updateAvailability);

// Menu publish/unpublish routes
router.route('/:id/publish')
  .put(publishMenu);

router.route('/:id/unpublish')
  .put(unpublishMenu);

module.exports = router; 