const express = require('express')
const router = express.Router()
const { validateParams, validateQuery } = require('@commonMiddlewares/validationMiddleware')
const {
  menuIdSchema,
  restaurantIdSchema,
  menuItemsQuerySchema,
} = require('@commonValidation/publicValidation')
const {
  publicMenuLimiter,
  publicRestaurantLimiter,
  completeMenuLimiter,
} = require('@commonMiddlewares/rateLimitMiddleware')
const { cacheMiddleware } = require('@commonMiddlewares/cacheMiddleware')

const publicController = require('../controllers/publicController')

router.get(
  '/restaurants/:restaurantId',
  publicRestaurantLimiter,
  cacheMiddleware(3600), // Cache for 1 hour
  validateParams(restaurantIdSchema),
  publicController.getPublicRestaurant
)

router.get(
  '/menus/:menuId',
  publicMenuLimiter,
  cacheMiddleware(1800), // Cache for 30 minutes
  validateParams(menuIdSchema),
  publicController.getPublicMenu
)

router.get(
  '/menus/:menuId/items',
  publicMenuLimiter,
  cacheMiddleware(900), // Cache for 15 minutes
  validateParams(menuIdSchema),
  validateQuery(menuItemsQuerySchema),
  publicController.getPublicMenuItems
)

router.get(
  '/complete-menu/:menuId',
  completeMenuLimiter, // Strictest limit for expensive operation
  cacheMiddleware(1800),
  validateParams(menuIdSchema),
  publicController.getCompletePublicMenu
)

module.exports = router
