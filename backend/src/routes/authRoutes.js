const express = require('express')
const {
    register,
    login,
    getMe,
    changePassword
} = require('@controllers/authController')
const {
    registerSchema,
    loginSchema,
    changePasswordSchema
} = require('../validations/authValidation')
const { validateRequest } = require('@middlewares/validationMiddleware')
const { protect } = require('@middlewares/authMiddleware')
const { authLimiter, createUserLimiter } = require('@middlewares/rateLimitMiddleware')

const router = express.Router()

// Public routes with rate limiting
router.post('/register', createUserLimiter, validateRequest(registerSchema), register)
router.post('/login', authLimiter, validateRequest(loginSchema), login)

// Protected routes
router.get('/me', protect, getMe)
router.put('/password', protect, validateRequest(changePasswordSchema), changePassword)

module.exports = router 