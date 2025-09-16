const express = require('express')
const router = express.Router()
const publicController = require('@controllers/publicController')
const { validateRequest, validateParams, validateQuery } = require('@middlewares/validationMiddleware')
const {
    menuIdSchema,
    restaurantIdSchema,
    menuItemsQuerySchema
} = require('@validations/publicValidation')

router.get(
    '/restaurants/:restaurantId',
    validateParams(restaurantIdSchema),
    publicController.getPublicRestaurant
)

router.get(
    '/menus/:menuId',
    validateParams(menuIdSchema),
    publicController.getPublicMenu
)

router.get(
    '/menus/:menuId/items',
    validateParams(menuIdSchema),
    validateQuery(menuItemsQuerySchema),
    publicController.getPublicMenuItems
)

router.get(
    '/complete-menu/:menuId',
    validateParams(menuIdSchema),
    publicController.getCompletePublicMenu
)

module.exports = router 