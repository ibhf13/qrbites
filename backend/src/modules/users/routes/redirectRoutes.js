const express = require('express')
const router = express.Router()
const { validateParams } = require('@commonMiddlewares/validationMiddleware')
const { menuIdSchema } = require('@commonValidation/publicValidation')

const publicController = require('../controllers/publicController')

router.get('/:menuId', validateParams(menuIdSchema), publicController.redirectToMenu)

module.exports = router
