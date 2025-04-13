const express = require('express');
const { register, login, getMe, logout } = require('../controllers/authController');
const { validate, registrationSchema, loginSchema } = require('../middleware/validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register route
router.post('/register', validate(registrationSchema), register);

// Login route
router.post('/login', validate(loginSchema), login);

// Get current user route
router.get('/me', protect, getMe);

// Logout route
router.get('/logout', protect, logout);

module.exports = router; 