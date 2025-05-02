const errorUtils = require('@utils/errorUtils')
const errorMiddleware = require('@middlewares/errorMiddleware')
const logger = require('@utils/logger')

// Mock dependencies
jest.mock('@utils/logger')
jest.mock('@services/errorLogService', () => ({
    logApiError: jest.fn()
}))

describe('Error Utils Tests', () => {
    let req, res, next

    beforeEach(() => {
        req = {
            originalUrl: '/api/test',
            method: 'GET',
            body: {},
            user: { id: 'user-id' }
        }
        res = {
            status: jest.fn(() => res),
            json: jest.fn(() => res)
        }
        next = jest.fn()
        jest.clearAllMocks()
    })

    describe('asyncHandler', () => {
        it('should pass error to next if function throws', async () => {
            const error = new Error('Test error')
            const asyncFn = jest.fn(() => Promise.reject(error))
            const wrappedFn = errorUtils.asyncHandler(asyncFn)

            await wrappedFn(req, res, next)

            expect(asyncFn).toHaveBeenCalledWith(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })

        it('should resolve normally if function succeeds', async () => {
            const asyncFn = jest.fn(() => Promise.resolve())
            const wrappedFn = errorUtils.asyncHandler(asyncFn)

            await wrappedFn(req, res, next)

            expect(asyncFn).toHaveBeenCalledWith(req, res, next)
            expect(next).not.toHaveBeenCalled()
        })
    })

    describe('errorHandlerMiddleware', () => {
        it('should handle validation errors', () => {
            const error = new Error('Validation error')
            error.name = 'ValidationError'
            error.errors = {
                name: { message: 'Name is required' },
                email: { message: 'Invalid email' }
            }

            errorMiddleware.errorHandlerMiddleware(error, req, res, next)

            expect(res.status).toHaveBeenCalledWith(422)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: expect.any(String)
            }))
        })

        it('should handle JWT errors', () => {
            const error = new Error('Invalid token')
            error.name = 'JsonWebTokenError'

            errorMiddleware.errorHandlerMiddleware(error, req, res, next)

            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: 'Invalid token'
            }))
        })

        it('should handle expired JWT errors', () => {
            const error = new Error('jwt expired')
            error.name = 'TokenExpiredError'

            errorMiddleware.errorHandlerMiddleware(error, req, res, next)

            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: 'Token expired'
            }))
        })

        it('should handle custom errors with status code', () => {
            const error = new Error('Custom error')
            error.statusCode = 403

            errorMiddleware.errorHandlerMiddleware(error, req, res, next)

            expect(res.status).toHaveBeenCalledWith(403)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: 'Custom error'
            }))
        })

        it('should handle server errors in production', () => {
            const originalEnv = process.env.NODE_ENV
            process.env.NODE_ENV = 'production'

            const error = new Error('Server error')

            errorMiddleware.errorHandlerMiddleware(error, req, res, next)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: 'Server error'
            }))

            process.env.NODE_ENV = originalEnv
        })

        it('should show stack trace in development mode', () => {
            const originalEnv = process.env.NODE_ENV
            process.env.NODE_ENV = 'development'

            const error = new Error('Server error')
            error.stack = 'Error stack trace'

            errorMiddleware.errorHandlerMiddleware(error, req, res, next)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: 'Server error',
                stack: 'Error stack trace'
            }))

            process.env.NODE_ENV = originalEnv
        })
    })

    describe('Error creator functions', () => {
        it('should create a NotFoundError', () => {
            const message = 'Resource not found'
            const error = errorUtils.notFound(message)

            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(message)
            expect(error.statusCode).toBe(404)
        })

        it('should create a BadRequestError', () => {
            const message = 'Bad request'
            const error = errorUtils.badRequest(message)

            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(message)
            expect(error.statusCode).toBe(400)
        })

        it('should create an UnauthorizedError', () => {
            const message = 'Not authorized'
            const error = errorUtils.unauthorized(message)

            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(message)
            expect(error.statusCode).toBe(401)
        })

        it('should create a ForbiddenError', () => {
            const message = 'Forbidden'
            const error = errorUtils.forbidden(message)

            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(message)
            expect(error.statusCode).toBe(403)
        })

        it('should create a ConflictError', () => {
            const message = 'Conflict'
            const error = errorUtils.conflict(message)

            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(message)
            expect(error.statusCode).toBe(409)
        })

        it('should create a ServerError', () => {
            const message = 'Server error'
            const error = errorUtils.serverError(message)

            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(message)
            expect(error.statusCode).toBe(500)
        })

        it('should accept details in error creators', () => {
            const details = { field: 'email', reason: 'duplicate' }
            const error = errorUtils.conflict('Conflict error', details)

            expect(error.details).toEqual(details)
        })

        it('should create errors with createError helper', () => {
            const message = 'Custom error'
            const statusCode = 418
            const details = { reason: 'I am a teapot' }

            const error = errorUtils.createError(message, statusCode, details)

            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(message)
            expect(error.statusCode).toBe(statusCode)
            expect(error.details).toEqual(details)
        })
    })
}) 