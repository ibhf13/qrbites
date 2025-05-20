const express = require('express')
const router = express.Router()
const publicController = require('@controllers/publicController')

router.get('/:menuId', publicController.redirectToMenu)

module.exports = router 