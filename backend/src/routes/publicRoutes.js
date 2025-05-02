const express = require('express')
const router = express.Router()
const publicController = require('@controllers/publicController')
const { validateRequest, validateParams } = require('@middlewares/validationMiddleware')
const {
    menuIdSchema,
    restaurantIdSchema,
    menuItemsQuerySchema
} = require('@validations/publicValidation')

// Public restaurant endpoint
router.get(
    '/restaurants/:restaurantId',
    validateParams(restaurantIdSchema),
    publicController.getPublicRestaurant
)

// Public menu endpoints
router.get(
    '/menus/:menuId',
    validateParams(menuIdSchema),
    publicController.getPublicMenu
)

router.get(
    '/menus/:menuId/items',
    validateParams(menuIdSchema),
    validateRequest(menuItemsQuerySchema, 'query'),
    publicController.getPublicMenuItems
)

router.get(
    '/complete-menu/:menuId',
    validateParams(menuIdSchema),
    publicController.getCompletePublicMenu
)

module.exports = router 