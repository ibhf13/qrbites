const express = require('express')
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    deactivateAccount
} = require('@controllers/userController')
const { protect, restrictTo } = require('@middlewares/authMiddleware')
const { validateRequest } = require('@middlewares/validationMiddleware')
const { updateUserSchema } = require('../validations/userValidation')

const router = express.Router()

// All routes require authentication
router.use(protect)

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filtering
 * @access  Private/Admin
 */
router.get('/', restrictTo('admin'), getUsers)

/**
 * @route   DELETE /api/users/account
 * @desc    Deactivate current user's account
 * @access  Private
 */
router.delete('/account', deactivateAccount)

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (own profile or admin)
 * @access  Private
 */
router.get('/:id', getUserById)

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID (own profile or admin)
 * @access  Private
 */
router.put('/:id', validateRequest(updateUserSchema), updateUser)

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user account (admin only)
 * @access  Private/Admin
 */
router.delete('/:id', restrictTo('admin'), deleteUser)

module.exports = router 