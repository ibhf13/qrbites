const express = require('express')
const router = express.Router()
const publicController = require('@controllers/publicController')
const { validateParams } = require('@middlewares/validationMiddleware')
const { menuIdSchema } = require('@validations/publicValidation')

router.get('/:menuId', validateParams(menuIdSchema), publicController.redirectToMenu)

module.exports = router 