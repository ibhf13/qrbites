const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { protect, restrictTo, checkOwnership } = require('@middlewares/authMiddleware')
const User = require('@models/userModel')
const { unauthorized, forbidden } = require('@utils/errorUtils')
const logger = require('@utils/logger')

// Mock dependencies
jest.mock('jsonwebtoken')
jest.mock('@models/userModel')
jest.mock('@utils/errorUtils')
jest.mock('@utils/logger')

describe('Authentication Middleware', () => {
    let req, res, next

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks()

        // Mock request, response and next function
        req = {
            headers: {
                authorization: 'Bearer valid-token'
            },
            params: {
                id: '60d21b4667d0d8992e610c70'
            }
        }

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        next = jest.fn()

        // Mock error utils
        unauthorized.mockImplementation(msg => new Error(msg))
        forbidden.mockImplementation(msg => new Error(msg))
    })

    describe('protect', () => {
        it('should call next with unauthorized error if no token provided', async () => {
            // Setup request without token
            req.headers.authorization = undefined

            await protect(req, res, next)

            expect(unauthorized).toHaveBeenCalledWith('Not authorized, no token')
            expect(next).toHaveBeenCalledWith(expect.any(Error))
            expect(jwt.verify).not.toHaveBeenCalled()
        })

        it('should verify token and set user in request object', async () => {
            // Mock jwt verify return value
            const mockDecoded = { id: '60d21b4667d0d8992e610c60' }
            jwt.verify.mockReturnValue(mockDecoded)

            // Mock user find
            const mockUser = {
                _id: '60d21b4667d0d8992e610c60',
                name: 'Test User',
                email: 'test@example.com',
                role: 'user',
                isActive: true
            }
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            })

            await protect(req, res, next)

            expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET)
            expect(User.findById).toHaveBeenCalledWith(mockDecoded.id)
            expect(req.user).toEqual(mockUser)
            expect(next).toHaveBeenCalled()
            expect(next.mock.calls[0].length).toBe(0) // Called with no arguments
        })

        it('should call next with unauthorized error if user not found', async () => {
            // Mock jwt verify return value
            jwt.verify.mockReturnValue({ id: '60d21b4667d0d8992e610c60' })

            // Mock user not found
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            })

            await protect(req, res, next)

            expect(unauthorized).toHaveBeenCalledWith('User not found')
            expect(next).toHaveBeenCalledWith(expect.any(Error))
        })

        it('should call next with unauthorized error if user account is disabled', async () => {
            // Mock jwt verify return value
            jwt.verify.mockReturnValue({ id: '60d21b4667d0d8992e610c60' })

            // Mock disabled user
            const mockUser = {
                _id: '60d21b4667d0d8992e610c60',
                name: 'Test User',
                email: 'test@example.com',
                role: 'user',
                isActive: false
            }
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            })

            await protect(req, res, next)

            expect(unauthorized).toHaveBeenCalledWith('User account is disabled')
            expect(next).toHaveBeenCalledWith(expect.any(Error))
        })

        it('should handle JWT verification errors', async () => {
            // Mock JWT verification error
            const jwtError = new Error('Invalid token')
            jwtError.name = 'JsonWebTokenError'
            jwt.verify.mockImplementation(() => {
                throw jwtError
            })

            await protect(req, res, next)

            expect(logger.error).toHaveBeenCalled()
            expect(unauthorized).toHaveBeenCalledWith('Invalid token')
            expect(next).toHaveBeenCalledWith(expect.any(Error))
        })

        it('should handle token expiration errors', async () => {
            // Mock token expiration error
            const expiredError = new Error('Token expired')
            expiredError.name = 'TokenExpiredError'
            jwt.verify.mockImplementation(() => {
                throw expiredError
            })

            await protect(req, res, next)

            expect(logger.error).toHaveBeenCalled()
            expect(unauthorized).toHaveBeenCalledWith('Token expired')
            expect(next).toHaveBeenCalledWith(expect.any(Error))
        })

        it('should handle unexpected errors', async () => {
            // Mock unexpected error
            const unexpectedError = new Error('Database error')
            jwt.verify.mockImplementation(() => {
                throw unexpectedError
            })

            await protect(req, res, next)

            expect(logger.error).toHaveBeenCalled()
            expect(next).toHaveBeenCalledWith(unexpectedError)
        })
    })

    describe('restrictTo', () => {
        beforeEach(() => {
            // Setup authenticated user
            req.user = {
                _id: '60d21b4667d0d8992e610c60',
                name: 'Test User',
                email: 'test@example.com',
                role: 'user'
            }
        })

        it('should call next if user role is allowed', () => {
            const middleware = restrictTo('user', 'admin')
            middleware(req, res, next)

            expect(next).toHaveBeenCalled()
            expect(next.mock.calls[0].length).toBe(0) // Called with no arguments
        })

        it('should call next with forbidden error if user role is not allowed', () => {
            const middleware = restrictTo('admin')
            middleware(req, res, next)

            expect(logger.warn).toHaveBeenCalled()
            expect(forbidden).toHaveBeenCalledWith('Not authorized to access this route')
            expect(next).toHaveBeenCalledWith(expect.any(Error))
        })

        it('should call next with unauthorized error if user is not authenticated', () => {
            req.user = undefined
            const middleware = restrictTo('user', 'admin')
            middleware(req, res, next)

            expect(unauthorized).toHaveBeenCalledWith('User not authenticated')
            expect(next).toHaveBeenCalledWith(expect.any(Error))
        })
    })

    describe('checkOwnership', () => {
        beforeEach(() => {
            // Setup authenticated user
            req.user = {
                _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c60'),
                name: 'Test User',
                email: 'test@example.com',
                role: 'user'
            }
        })

        it('should skip checks for admin users', async () => {
            req.user.role = 'admin'
            const getResourceUserId = jest.fn()

            const middleware = checkOwnership(getResourceUserId)
            await middleware(req, res, next)

            expect(getResourceUserId).not.toHaveBeenCalled()
            expect(next).toHaveBeenCalled()
            expect(next.mock.calls[0].length).toBe(0) // Called with no arguments
        })

        it('should allow access if user owns the resource', async () => {
            const getResourceUserId = jest.fn().mockResolvedValue(
                new mongoose.Types.ObjectId('60d21b4667d0d8992e610c60')
            )

            const middleware = checkOwnership(getResourceUserId)
            await middleware(req, res, next)

            expect(getResourceUserId).toHaveBeenCalledWith(req)
            expect(next).toHaveBeenCalled()
            expect(next.mock.calls[0].length).toBe(0) // Called with no arguments
        })

        it('should deny access if user does not own the resource', async () => {
            const getResourceUserId = jest.fn().mockResolvedValue(
                new mongoose.Types.ObjectId('60d21b4667d0d8992e610c61') // Different ID
            )

            const middleware = checkOwnership(getResourceUserId)
            await middleware(req, res, next)

            expect(getResourceUserId).toHaveBeenCalledWith(req)
            expect(logger.warn).toHaveBeenCalled()
            expect(forbidden).toHaveBeenCalledWith('Not authorized to access this resource')
            expect(next).toHaveBeenCalledWith(expect.any(Error))
        })

        it('should handle case when resource is not found', async () => {
            const getResourceUserId = jest.fn().mockResolvedValue(null)

            const middleware = checkOwnership(getResourceUserId)
            await middleware(req, res, next)

            expect(getResourceUserId).toHaveBeenCalledWith(req)
            expect(forbidden).toHaveBeenCalledWith('Resource not found or permission denied')
            expect(next).toHaveBeenCalledWith(expect.any(Error))
        })

        it('should handle unexpected errors', async () => {
            const unexpectedError = new Error('Database error')
            const getResourceUserId = jest.fn().mockRejectedValue(unexpectedError)

            const middleware = checkOwnership(getResourceUserId)
            await middleware(req, res, next)

            expect(getResourceUserId).toHaveBeenCalledWith(req)
            expect(next).toHaveBeenCalledWith(unexpectedError)
        })
    })
}) 