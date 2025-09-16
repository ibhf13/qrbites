const express = require('express')
const {
    getMyProfile,
    updateMyProfile,
    getUserProfile,
    getAllProfiles,
    updateUserProfile,
    deleteUserProfile,
    uploadProfilePicture,
    updatePrivacySettings
} = require('@controllers/profileController')
const { protect, restrictTo, optionalAuth } = require('@middlewares/authMiddleware')
const { validateRequest } = require('@middlewares/validationMiddleware')
const { updateProfileSchema, updateUserProfileSchema, privacySettingsSchema } = require('../validations/profileValidation')
const { upload } = require('@services/fileUploadService')

const router = express.Router()

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/', protect, getMyProfile)

/**
 * @route   PUT /api/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/', protect, validateRequest(updateProfileSchema), updateMyProfile)

/**
 * @route   POST /api/profile/picture
 * @desc    Upload profile picture
 * @access  Private
 */
router.post('/picture', protect, upload.single('profilePicture'), uploadProfilePicture)

/**
 * @route   PUT /api/profile/privacy
 * @desc    Update profile privacy settings
 * @access  Private
 */
router.put('/privacy', protect, validateRequest(privacySettingsSchema), updatePrivacySettings)

/**
 * @route   GET /api/profile/all
 * @desc    Get all profiles (admin only)
 * @access  Private/Admin
 */
router.get('/all', protect, restrictTo('admin'), getAllProfiles)

/**
 * @route   GET /api/profile/user/:userId
 * @desc    Get user profile by ID (public profiles or admin/owner)
 * @access  Public/Private (depending on profile privacy)
 */
router.get('/user/:userId', optionalAuth, getUserProfile)

/**
 * @route   PUT /api/profile/user/:userId
 * @desc    Update user profile by admin
 * @access  Private/Admin
 */
router.put('/user/:userId', protect, restrictTo('admin'), validateRequest(updateUserProfileSchema), updateUserProfile)

/**
 * @route   DELETE /api/profile/user/:userId
 * @desc    Delete user profile (admin only)
 * @access  Private/Admin
 */
router.delete('/user/:userId', protect, restrictTo('admin'), deleteUserProfile)

module.exports = router 