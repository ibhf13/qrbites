// Mock dependencies at the very top
jest.mock('@models/profile')
jest.mock('@models/user')
jest.mock('@utils/logger')
jest.mock('@services/fileUploadService')
jest.mock('@utils/sanitization', () => ({
    createSafeSearchQuery: jest.fn()
}))

// Mock asyncHandler to ensure proper execution
jest.mock('@utils/errorUtils', () => {
    const originalModule = jest.requireActual('@utils/errorUtils')
    return {
        ...originalModule,
        asyncHandler: (fn) => {
            return async (req, res, next) => {
                try {
                    await fn(req, res, next)
                } catch (error) {
                    next(error)
                }
            }
        }
    }
})

const mongoose = require('mongoose')
const Profile = require('@models/profile')
const User = require('@models/user')
const profileController = require('@controllers/profileController')
const profileMock = require('@mocks/profileMock')
const userMockEnhanced = require('@mocks/userMockEnhanced')
const { getFileUrl } = require('@services/fileUploadService')
const { createSafeSearchQuery } = require('@utils/sanitization')

describe('Profile Controller Tests', () => {
    let req, res, next

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks()

        // Mock request, response and next function
        req = {
            params: {},
            query: {},
            body: {},
            user: {
                _id: new mongoose.Types.ObjectId(),
                email: 'test@example.com',
                role: 'user'
            }
        }

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        }

        next = jest.fn()

        // Mock getFileUrl 
        getFileUrl.mockImplementation((filename, type) => {
            return `http://localhost:5000/uploads/${type}s/${filename}`
        })
    })

    describe('getMyProfile', () => {
        it('should return user profile', async () => {
            const mockProfile = { ...profileMock.validProfile }
            Profile.findOne = jest.fn().mockResolvedValue(mockProfile)

            await profileController.getMyProfile(req, res, next)

            expect(Profile.findOne).toHaveBeenCalledWith({ userId: req.user._id })
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockProfile
            })
        })

        it('should create profile if none exists', async () => {
            const newProfile = { userId: req.user._id }
            Profile.findOne = jest.fn().mockResolvedValue(null)
            Profile.create = jest.fn().mockResolvedValue(newProfile)

            await profileController.getMyProfile(req, res, next)

            expect(Profile.findOne).toHaveBeenCalledWith({ userId: req.user._id })
            expect(Profile.create).toHaveBeenCalledWith({ userId: req.user._id })
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: newProfile
            })
        })

        it('should handle errors properly', async () => {
            const error = new Error('Database error')
            Profile.findOne = jest.fn().mockRejectedValue(error)

            await profileController.getMyProfile(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })
    })

    describe('updateMyProfile', () => {
        it('should update existing profile', async () => {
            req.body = profileMock.updateProfileData

            const existingProfile = { ...profileMock.validProfile }
            const updatedProfile = { ...existingProfile, ...req.body }

            Profile.findOne = jest.fn().mockResolvedValue(existingProfile)
            Profile.findOneAndUpdate = jest.fn().mockResolvedValue(updatedProfile)

            await profileController.updateMyProfile(req, res, next)

            expect(Profile.findOne).toHaveBeenCalledWith({ userId: req.user._id })
            expect(Profile.findOneAndUpdate).toHaveBeenCalledWith(
                { userId: req.user._id },
                req.body,
                { new: true, runValidators: true }
            )
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedProfile
            })
        })

        it('should create new profile if none exists', async () => {
            req.body = profileMock.updateProfileData

            const newProfile = { userId: req.user._id, ...req.body }

            Profile.findOne = jest.fn().mockResolvedValue(null)
            Profile.create = jest.fn().mockResolvedValue(newProfile)

            await profileController.updateMyProfile(req, res, next)

            expect(Profile.findOne).toHaveBeenCalledWith({ userId: req.user._id })
            expect(Profile.create).toHaveBeenCalledWith({
                userId: req.user._id,
                ...req.body
            })
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: newProfile
            })
        })
    })

    describe('updatePrivacySettings', () => {
        it('should update privacy settings for existing profile', async () => {
            req.body = { isPublic: true }

            const existingProfile = { ...profileMock.validProfile }
            const updatedProfile = {
                ...existingProfile,
                isPublic: true
            }

            Profile.findOne = jest.fn().mockResolvedValue(existingProfile)
            Profile.findOneAndUpdate = jest.fn().mockResolvedValue(updatedProfile)

            await profileController.updatePrivacySettings(req, res, next)

            expect(Profile.findOne).toHaveBeenCalledWith({ userId: req.user._id })
            expect(Profile.findOneAndUpdate).toHaveBeenCalledWith(
                { userId: req.user._id },
                { isPublic: req.body.isPublic },
                { new: true, runValidators: true }
            )
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    isPublic: updatedProfile.isPublic
                }
            })
        })

        it('should create new profile if none exists', async () => {
            req.body = { isPublic: true }

            const newProfile = {
                userId: req.user._id,
                isPublic: true
            }

            Profile.findOne = jest.fn().mockResolvedValue(null)
            Profile.create = jest.fn().mockResolvedValue(newProfile)

            await profileController.updatePrivacySettings(req, res, next)

            expect(Profile.findOne).toHaveBeenCalledWith({ userId: req.user._id })
            expect(Profile.create).toHaveBeenCalledWith({
                userId: req.user._id,
                isPublic: req.body.isPublic
            })
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    isPublic: newProfile.isPublic
                }
            })
        })

        it('should return error for invalid isPublic value', async () => {
            req.body = { isPublic: 'not-boolean' }

            await profileController.updatePrivacySettings(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toBe('isPublic must be a boolean value')
            expect(calledError.statusCode).toBe(400)
        })
    })

    describe('getUserProfile', () => {
        it('should return public profile', async () => {
            req.params.userId = 'validUserId'

            const mockProfile = {
                ...profileMock.validPublicProfile,
                isPublic: true,
                toObject: jest.fn().mockReturnValue(profileMock.validPublicProfile)
            }

            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockProfile)
            }

            Profile.findOne = jest.fn().mockReturnValue(mockQuery)

            await profileController.getUserProfile(req, res, next)

            expect(Profile.findOne).toHaveBeenCalledWith({ userId: req.params.userId })
            expect(mockQuery.populate).toHaveBeenCalledWith('userId', 'email role isActive')
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: profileMock.validPublicProfile
            })
        })

        it('should return 404 if profile not found', async () => {
            req.params.userId = 'invalidUserId'

            const mockQuery = {
                populate: jest.fn().mockResolvedValue(null)
            }

            Profile.findOne = jest.fn().mockReturnValue(mockQuery)

            await profileController.getUserProfile(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toBe('Profile not found')
            expect(calledError.statusCode).toBe(404)
        })

        it('should deny access to private profile for non-authenticated user', async () => {
            req.params.userId = 'validUserId'
            req.user = null // Non-authenticated

            const mockProfile = {
                ...profileMock.validProfile,
                isPublic: false,
                toObject: jest.fn().mockReturnValue(profileMock.validProfile)
            }

            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockProfile)
            }

            Profile.findOne = jest.fn().mockReturnValue(mockQuery)

            await profileController.getUserProfile(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toBe('This profile is private')
            expect(calledError.statusCode).toBe(403)
        })
    })

    describe('getAllProfiles (Admin)', () => {
        beforeEach(() => {
            req.user.role = 'admin'
        })

        it('should return paginated profiles', async () => {
            req.query = { page: 1, limit: 10 }

            const mockProfiles = profileMock.profileList
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockProfiles)
            }

            Profile.find = jest.fn().mockReturnValue(mockQuery)
            Profile.countDocuments = jest.fn().mockResolvedValue(20)

            await profileController.getAllProfiles(req, res, next)

            expect(Profile.find).toHaveBeenCalledWith({})
            expect(mockQuery.populate).toHaveBeenCalledWith('userId', 'email role isActive')
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockProfiles,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 20,
                    pages: 2
                }
            })
        })

        it('should apply search filters', async () => {
            req.query = {
                page: 1,
                limit: 10,
                search: 'john',
                isPublic: 'true',
                isVerified: 'false',
                language: 'en'
            }

            // Mock the sanitization function
            const expectedSearchQueries = [
                { firstName: { $regex: 'john', $options: 'i' } },
                { lastName: { $regex: 'john', $options: 'i' } },
                { displayName: { $regex: 'john', $options: 'i' } }
            ]
            createSafeSearchQuery.mockReturnValue(expectedSearchQueries)

            const expectedQuery = {
                isPublic: true,
                isVerified: false,
                'preferences.language': 'en',
                $or: expectedSearchQueries
            }

            const mockProfiles = [profileMock.validProfile]
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockProfiles)
            }

            Profile.find = jest.fn().mockReturnValue(mockQuery)
            Profile.countDocuments = jest.fn().mockResolvedValue(1)

            await profileController.getAllProfiles(req, res, next)

            expect(createSafeSearchQuery).toHaveBeenCalledWith('john', ['firstName', 'lastName', 'displayName'])
            expect(Profile.find).toHaveBeenCalledWith(expectedQuery)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockProfiles,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    pages: 1
                }
            })
        })
    })

    describe('updateUserProfile (Admin)', () => {
        beforeEach(() => {
            req.user.role = 'admin'
        })

        it('should update user profile by admin', async () => {
            req.params.userId = 'validUserId'
            req.body = profileMock.updateProfileData

            const mockUser = { _id: 'validUserId', email: 'user@example.com' }
            const existingProfile = { ...profileMock.validProfile }
            const updatedProfile = { ...existingProfile, ...req.body }

            User.findById = jest.fn().mockResolvedValue(mockUser)
            Profile.findOne = jest.fn().mockResolvedValue(existingProfile)
            Profile.findOneAndUpdate = jest.fn().mockResolvedValue(updatedProfile)

            await profileController.updateUserProfile(req, res, next)

            expect(User.findById).toHaveBeenCalledWith('validUserId')
            expect(Profile.findOne).toHaveBeenCalledWith({ userId: 'validUserId' })
            expect(Profile.findOneAndUpdate).toHaveBeenCalledWith(
                { userId: 'validUserId' },
                req.body,
                { new: true, runValidators: true }
            )
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedProfile
            })
        })

        it('should create profile if user exists but has no profile', async () => {
            req.params.userId = 'validUserId'
            req.body = profileMock.updateProfileData

            const mockUser = { _id: 'validUserId', email: 'user@example.com' }
            const newProfile = { userId: 'validUserId', ...req.body }

            User.findById = jest.fn().mockResolvedValue(mockUser)
            Profile.findOne = jest.fn().mockResolvedValue(null)
            Profile.create = jest.fn().mockResolvedValue(newProfile)

            await profileController.updateUserProfile(req, res, next)

            expect(User.findById).toHaveBeenCalledWith('validUserId')
            expect(Profile.create).toHaveBeenCalledWith({
                userId: 'validUserId',
                ...req.body
            })
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: newProfile
            })
        })

        it('should return 404 if user not found', async () => {
            req.params.userId = 'invalidUserId'

            User.findById = jest.fn().mockResolvedValue(null)

            await profileController.updateUserProfile(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toBe('User not found')
            expect(calledError.statusCode).toBe(404)
        })
    })

    describe('deleteUserProfile (Admin)', () => {
        beforeEach(() => {
            req.user.role = 'admin'
        })

        it('should delete user profile', async () => {
            req.params.userId = 'validUserId'

            const mockProfile = {
                ...profileMock.validProfile,
                deleteOne: jest.fn().mockResolvedValue()
            }

            Profile.findOne = jest.fn().mockResolvedValue(mockProfile)

            await profileController.deleteUserProfile(req, res, next)

            expect(Profile.findOne).toHaveBeenCalledWith({ userId: 'validUserId' })
            expect(mockProfile.deleteOne).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(204)
            expect(res.send).toHaveBeenCalled()
        })

        it('should return 404 if profile not found', async () => {
            req.params.userId = 'invalidUserId'

            Profile.findOne = jest.fn().mockResolvedValue(null)

            await profileController.deleteUserProfile(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toBe('Profile not found')
            expect(calledError.statusCode).toBe(404)
        })
    })

    describe('uploadProfilePicture', () => {
        it('should upload profile picture', async () => {
            req.file = {
                filename: 'test-image.jpg'
            }

            const profilePictureUrl = 'http://localhost:5000/uploads/profiles/test-image.jpg'

            const existingProfile = { ...profileMock.validProfile }
            const updatedProfile = {
                ...existingProfile,
                profilePicture: profilePictureUrl
            }

            Profile.findOne = jest.fn().mockResolvedValue(existingProfile)
            Profile.findOneAndUpdate = jest.fn().mockResolvedValue(updatedProfile)

            await profileController.uploadProfilePicture(req, res, next)

            expect(Profile.findOneAndUpdate).toHaveBeenCalledWith(
                { userId: req.user._id },
                { profilePicture: profilePictureUrl },
                { new: true, runValidators: true }
            )
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    profilePicture: updatedProfile.profilePicture
                }
            })
        })

        it('should create profile if none exists', async () => {
            req.file = {
                filename: 'test-image.jpg'
            }

            const profilePictureUrl = 'http://localhost:5000/uploads/profiles/test-image.jpg'

            const newProfile = {
                userId: req.user._id,
                profilePicture: profilePictureUrl
            }

            Profile.findOne = jest.fn().mockResolvedValue(null)
            Profile.create = jest.fn().mockResolvedValue(newProfile)

            await profileController.uploadProfilePicture(req, res, next)

            expect(Profile.create).toHaveBeenCalledWith({
                userId: req.user._id,
                profilePicture: profilePictureUrl
            })
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    profilePicture: newProfile.profilePicture
                }
            })
        })

        it('should return error if no file uploaded', async () => {
            req.file = null

            await profileController.uploadProfilePicture(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toBe('Please upload an image')
            expect(calledError.statusCode).toBe(400)
        })
    })
}) 