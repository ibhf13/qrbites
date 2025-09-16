const Profile = require('@models/profile')
const User = require('@models/user')
const {
    asyncHandler,
    badRequest,
    unauthorized,
    notFound,
    forbidden
} = require('@utils/errorUtils')
const { getFileUrl } = require('@services/fileUploadService')
const logger = require('@utils/logger')

/**
 * Get current user's profile
 * @route GET /api/profile
 * @access Private
 */
const getMyProfile = asyncHandler(async (req, res) => {
    let profile = await Profile.findOne({ userId: req.user._id })

    // Create profile if it doesn't exist
    if (!profile) {
        profile = await Profile.create({ userId: req.user._id })
        logger.info(`Profile created for user: ${req.user._id}`)
    }

    res.json({
        success: true,
        data: profile
    })
})

/**
 * Update current user's profile
 * @route PUT /api/profile
 * @access Private
 */
const updateMyProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id

    // Find existing profile or create new one
    let profile = await Profile.findOne({ userId })

    if (!profile) {
        // Create new profile with userId and request body
        profile = await Profile.create({
            userId,
            ...req.body
        })
        logger.info(`Profile created for user: ${userId}`)
    } else {
        // Update existing profile
        profile = await Profile.findOneAndUpdate(
            { userId },
            req.body,
            {
                new: true,
                runValidators: true
            }
        )
        logger.info(`Profile updated for user: ${userId}`)
    }

    res.json({
        success: true,
        data: profile
    })
})

/**
 * Get user profile by user ID (public profiles only or admin)
 * @route GET /api/profile/user/:userId
 * @access Public/Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const requestingUser = req.user

    const profile = await Profile.findOne({ userId }).populate('userId', 'email role isActive')

    if (!profile) {
        throw notFound('Profile not found')
    }

    // Check if profile is public or if user is admin or viewing own profile
    const canViewProfile =
        profile.isPublic ||
        (requestingUser && requestingUser.role === 'admin') ||
        (requestingUser && requestingUser._id.toString() === userId)

    if (!canViewProfile) {
        throw forbidden('This profile is private')
    }

    // Remove sensitive information for non-admin, non-owner viewers
    let profileData = profile.toObject()

    if (requestingUser && requestingUser.role !== 'admin' && requestingUser._id.toString() !== userId) {
        // Remove private information for public viewing
        delete profileData.phone
        delete profileData.location
        delete profileData.preferences
        delete profileData.socialLinks?.linkedin
    }

    logger.info(`Profile accessed: ${userId} by ${requestingUser?._id || 'anonymous'}`)

    res.json({
        success: true,
        data: profileData
    })
})

/**
 * Get all profiles (admin only)
 * @route GET /api/profile/all
 * @access Private/Admin
 */
const getAllProfiles = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build query filters
    const query = {}

    if (req.query.isPublic !== undefined) {
        query.isPublic = req.query.isPublic === 'true'
    }

    if (req.query.isVerified !== undefined) {
        query.isVerified = req.query.isVerified === 'true'
    }

    if (req.query.language) {
        query['preferences.language'] = req.query.language
    }

    if (req.query.search) {
        query.$or = [
            { firstName: { $regex: req.query.search, $options: 'i' } },
            { lastName: { $regex: req.query.search, $options: 'i' } },
            { displayName: { $regex: req.query.search, $options: 'i' } }
        ]
    }

    const profiles = await Profile.find(query)
        .populate('userId', 'email role isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

    const total = await Profile.countDocuments(query)

    logger.info(`Admin ${req.user._id} retrieved ${profiles.length} profiles`)

    res.json({
        success: true,
        data: profiles,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    })
})

/**
 * Update user profile by admin
 * @route PUT /api/profile/user/:userId
 * @access Private/Admin
 */
const updateUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
        throw notFound('User not found')
    }

    // Find or create profile
    let profile = await Profile.findOne({ userId })

    if (!profile) {
        profile = await Profile.create({
            userId,
            ...req.body
        })
        logger.info(`Profile created by admin for user: ${userId}`)
    } else {
        profile = await Profile.findOneAndUpdate(
            { userId },
            req.body,
            {
                new: true,
                runValidators: true
            }
        )
        logger.info(`Profile updated by admin for user: ${userId}`)
    }

    res.json({
        success: true,
        data: profile
    })
})

/**
 * Delete user profile (admin only)
 * @route DELETE /api/profile/user/:userId
 * @access Private/Admin
 */
const deleteUserProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const profile = await Profile.findOne({ userId })

    if (!profile) {
        throw notFound('Profile not found')
    }

    await profile.deleteOne()

    logger.warn(`Profile deleted by admin for user: ${userId}`)

    res.status(204).send()
})

/**
 * Upload profile picture
 * @route POST /api/profile/picture
 * @access Private
 */
const uploadProfilePicture = asyncHandler(async (req, res) => {
    const userId = req.user._id

    if (!req.file) {
        throw badRequest('Please upload an image')
    }

    // Generate absolute URL using the file upload service
    const profilePictureUrl = getFileUrl(req.file.filename, 'profile')

    // Update profile with new picture
    let profile = await Profile.findOne({ userId })

    if (!profile) {
        profile = await Profile.create({
            userId,
            profilePicture: profilePictureUrl
        })
    } else {
        profile = await Profile.findOneAndUpdate(
            { userId },
            { profilePicture: profilePictureUrl },
            { new: true, runValidators: true }
        )
    }

    logger.info(`Profile picture updated for user: ${userId}`)

    res.json({
        success: true,
        data: {
            profilePicture: profile.profilePicture
        }
    })
})

/**
 * Update profile privacy settings
 * @route PUT /api/profile/privacy
 * @access Private
 */
const updatePrivacySettings = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { isPublic } = req.body

    if (typeof isPublic !== 'boolean') {
        throw badRequest('isPublic must be a boolean value')
    }

    let profile = await Profile.findOne({ userId })

    if (!profile) {
        profile = await Profile.create({
            userId,
            isPublic
        })
    } else {
        profile = await Profile.findOneAndUpdate(
            { userId },
            { isPublic },
            { new: true, runValidators: true }
        )
    }

    logger.info(`Privacy settings updated for user: ${userId}`)

    res.json({
        success: true,
        data: {
            isPublic: profile.isPublic
        }
    })
})

module.exports = {
    getMyProfile,
    updateMyProfile,
    getUserProfile,
    getAllProfiles,
    updateUserProfile,
    deleteUserProfile,
    uploadProfilePicture,
    updatePrivacySettings
} 