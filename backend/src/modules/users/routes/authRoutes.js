const express = require('express')
const { validateRequest } = require('@commonMiddlewares/validationMiddleware')
const { protect } = require('@commonMiddlewares/authMiddleware')
const { authLimiter, createUserLimiter } = require('@commonMiddlewares/rateLimitMiddleware')

const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require('../validations/authValidation')
const { register, login, getMe, changePassword } = require('../controllers/authController')

const router = express.Router()

router.post('/register', createUserLimiter, validateRequest(registerSchema), register)
router.post('/login', authLimiter, validateRequest(loginSchema), login)

router.get('/me', protect, getMe)
router.put('/password', protect, validateRequest(changePasswordSchema), changePassword)

module.exports = router
