const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('@models/user')
const authController = require('@controllers/authController')
const userMock = require('@mocks/userMockEnhanced')
const { unauthorized, badRequest, notFound } = require('@utils/errorUtils')

// Mock dependencies - Fix JWT token generation
jest.mock('jsonwebtoken')
jwt.sign = jest.fn().mockReturnValue('mocked-jwt-token')

jest.mock('bcryptjs', () => ({
    compare: jest.fn()
}))

jest.mock('@models/user')

jest.mock('@utils/logger', () => ({
    success: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
}))

// Mock the asyncHandler to make testing easier
jest.mock('@utils/errorUtils', () => {
    const originalModule = jest.requireActual('@utils/errorUtils')
    return {
        ...originalModule,
        asyncHandler: fn => async (req, res, next) => {
            try {
                return await fn(req, res, next)
            } catch (error) {
                next(error)
            }
        },
        unauthorized: jest.fn(msg => new Error(msg)),
        badRequest: jest.fn(msg => new Error(msg)),
        notFound: jest.fn(msg => new Error(msg))
    }
})

describe('Auth Controller Tests', () => {
    let req, res, next

    // Setup mock req and res objects
    beforeEach(() => {
        res = {
            status: jest.fn(() => res),
            json: jest.fn(() => res)
        }
        req = {
            params: {},
            query: {},
            body: {}
        }
        next = jest.fn()

        // Reset JWT mock for each test
        jwt.sign.mockClear()
        jwt.sign.mockReturnValue('mocked-jwt-token')
    })

    // Reset all mocks after each test
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('register', () => {
        it('should register a new user', async () => {
            req.body = {
                email: 'new@example.com',
                password: 'Password123'
            }

            // Mock User.findOne to return null (user doesn't exist)
            User.findOne = jest.fn().mockResolvedValue(null)

            // Mock User.create to return a new user
            const createdUser = {
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                role: 'user'
            }
            User.create = jest.fn().mockResolvedValue(createdUser)

            await authController.register(req, res, next)

            expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email })
            expect(User.create).toHaveBeenCalledWith({
                email: req.body.email,
                password: req.body.password
            })
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: createdUser._id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            )
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    _id: createdUser._id,
                    email: createdUser.email,
                    role: createdUser.role,
                    token: 'mocked-jwt-token'
                }
            })
        })

        it('should return 400 if user already exists', async () => {
            req.body = {
                email: 'existing@example.com',
                password: 'Password123'
            }

            // Mock User.findOne to return an existing user
            User.findOne = jest.fn().mockResolvedValue({ email: req.body.email })

            await authController.register(req, res, next)

            expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email })
            expect(badRequest).toHaveBeenCalledWith('User already exists')
            expect(next).toHaveBeenCalled()
            expect(User.create).not.toHaveBeenCalled()
        })
    })

    describe('login', () => {
        it('should login a user with valid credentials', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'Password123'
            }

            // Mock User.findOne to return a user
            const user = {
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                role: 'user',
                isActive: true,
                comparePassword: jest.fn().mockResolvedValue(true)
            }
            User.findOne = jest.fn().mockResolvedValue(user)

            await authController.login(req, res, next)

            expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email })
            expect(user.comparePassword).toHaveBeenCalledWith(req.body.password)
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            )
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    token: 'mocked-jwt-token'
                }
            })
        })

        it('should return 401 if user not found', async () => {
            req.body = {
                email: 'nonexistent@example.com',
                password: 'Password123'
            }

            // Mock User.findOne to return null
            User.findOne = jest.fn().mockResolvedValue(null)

            await authController.login(req, res, next)

            expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email })
            expect(unauthorized).toHaveBeenCalledWith('Invalid credentials')
            expect(next).toHaveBeenCalled()
        })

        it('should return 401 if password is incorrect', async () => {
            req.body = {
                email: 'test@example.com',
                password: 'WrongPassword'
            }

            // Mock User.findOne to return a user
            const user = {
                email: req.body.email,
                comparePassword: jest.fn().mockResolvedValue(false)
            }
            User.findOne = jest.fn().mockResolvedValue(user)

            await authController.login(req, res, next)

            expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email })
            expect(user.comparePassword).toHaveBeenCalledWith(req.body.password)
            expect(unauthorized).toHaveBeenCalledWith('Invalid credentials')
            expect(next).toHaveBeenCalled()
        })

        it('should return 401 if user account is disabled', async () => {
            req.body = {
                email: 'disabled@example.com',
                password: 'Password123'
            }

            // Mock User.findOne to return an inactive user
            const user = {
                email: req.body.email,
                isActive: false,
                comparePassword: jest.fn().mockResolvedValue(true)
            }
            User.findOne = jest.fn().mockResolvedValue(user)

            await authController.login(req, res, next)

            expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email })
            expect(user.comparePassword).toHaveBeenCalledWith(req.body.password)
            expect(unauthorized).toHaveBeenCalledWith('Account is disabled')
            expect(next).toHaveBeenCalled()
        })
    })

    describe('getMe', () => {
        it('should return the current user profile', async () => {
            // Set req.user as it would be set by auth middleware
            req.user = { _id: userMock.validUser._id }

            // Mock User.findById with populate
            const userWithProfile = {
                _id: userMock.validUser._id,
                email: userMock.validUser.email,
                role: userMock.validUser.role,
                isActive: userMock.validUser.isActive,
                profile: null // No profile yet
            }

            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(userWithProfile)
            }

            User.findById = jest.fn().mockReturnValue(mockQuery)

            await authController.getMe(req, res, next)

            expect(User.findById).toHaveBeenCalledWith(req.user._id)
            expect(mockQuery.select).toHaveBeenCalledWith('-password')
            expect(mockQuery.populate).toHaveBeenCalledWith('profile')
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: userWithProfile
            })
        })
    })

    describe('changePassword', () => {
        it('should change password for authenticated user', async () => {
            req.user = { _id: userMock.validUser._id }
            req.body = {
                currentPassword: 'CurrentPassword123',
                newPassword: 'NewPassword123'
            }

            // Mock User.findById to return a user
            const user = {
                email: 'test@example.com',
                comparePassword: jest.fn().mockResolvedValue(true),
                save: jest.fn().mockResolvedValue(true)
            }
            User.findById = jest.fn().mockResolvedValue(user)

            await authController.changePassword(req, res, next)

            expect(User.findById).toHaveBeenCalledWith(req.user._id)
            expect(user.comparePassword).toHaveBeenCalledWith(req.body.currentPassword)
            expect(user.password).toBe(req.body.newPassword)
            expect(user.save).toHaveBeenCalled()
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Password updated successfully'
            })
        })

        it('should return 404 if user not found', async () => {
            req.user = { _id: userMock.validUser._id }
            req.body = {
                currentPassword: 'CurrentPassword123',
                newPassword: 'NewPassword123'
            }

            // Mock User.findById to return null
            User.findById = jest.fn().mockResolvedValue(null)

            await authController.changePassword(req, res, next)

            expect(User.findById).toHaveBeenCalledWith(req.user._id)
            expect(notFound).toHaveBeenCalledWith('User not found')
            expect(next).toHaveBeenCalled()
        })

        it('should return 400 if current password is incorrect', async () => {
            req.user = { _id: userMock.validUser._id }
            req.body = {
                currentPassword: 'WrongPassword',
                newPassword: 'NewPassword123'
            }

            // Mock User.findById to return a user
            const user = {
                comparePassword: jest.fn().mockResolvedValue(false),
                save: jest.fn()
            }
            User.findById = jest.fn().mockResolvedValue(user)

            await authController.changePassword(req, res, next)

            expect(User.findById).toHaveBeenCalledWith(req.user._id)
            expect(user.comparePassword).toHaveBeenCalledWith(req.body.currentPassword)
            expect(badRequest).toHaveBeenCalledWith('Current password is incorrect')
            expect(next).toHaveBeenCalled()
            expect(user.save).not.toHaveBeenCalled()
        })
    })
}) 