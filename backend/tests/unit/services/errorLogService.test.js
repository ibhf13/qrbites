const { logError, logApiError, logDatabaseError } = require('@services/errorLogService')
const logger = require('@utils/logger')

// Mock logger
jest.mock('@utils/logger')

describe('Error Log Service', () => {
    let mockError
    let originalNodeEnv

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks()

        // Save original NODE_ENV
        originalNodeEnv = process.env.NODE_ENV

        // Create mock error
        mockError = new Error('Test error')
        mockError.name = 'TestError'
        mockError.stack = 'Error: Test error\n    at Test.function'
    })

    afterEach(() => {
        // Restore NODE_ENV
        process.env.NODE_ENV = originalNodeEnv
    })

    describe('logError', () => {
        it('should log error details with timestamp', () => {
            logError(mockError)

            expect(logger.error).toHaveBeenCalledWith(
                'Application error',
                expect.objectContaining({
                    timestamp: expect.any(String),
                    name: 'TestError',
                    message: 'Test error',
                    stack: expect.stringContaining('Error: Test error'),
                    statusCode: 500
                })
            )
        })

        it('should include custom context in the log', () => {
            const context = {
                userId: '123456',
                action: 'create_menu',
                resourceId: '789012'
            }

            logError(mockError, context)

            expect(logger.error).toHaveBeenCalledWith(
                'Application error',
                expect.objectContaining({
                    userId: '123456',
                    action: 'create_menu',
                    resourceId: '789012'
                })
            )
        })

        it('should use provided status code if available', () => {
            mockError.statusCode = 400

            logError(mockError)

            expect(logger.error).toHaveBeenCalledWith(
                'Application error',
                expect.objectContaining({
                    statusCode: 400
                })
            )
        })

        it('should handle production environment logging', () => {
            // Set NODE_ENV to production
            process.env.NODE_ENV = 'production'

            // In this test, we're just verifying it doesn't throw errors
            // In a real scenario, we'd mock and verify external service calls
            expect(() => logError(mockError)).not.toThrow()
        })
    })

    describe('logApiError', () => {
        it('should log API request details with error', () => {
            const req = {
                path: '/api/menus',
                method: 'POST',
                query: { fields: 'name,price' },
                params: { id: '123' },
                body: { name: 'Test Menu' },
                ip: '127.0.0.1',
                user: { _id: 'user123' }
            }

            logApiError(mockError, req)

            expect(logger.error).toHaveBeenCalledWith(
                'Application error',
                expect.objectContaining({
                    path: '/api/menus',
                    method: 'POST',
                    query: { fields: 'name,price' },
                    params: { id: '123' },
                    body: { name: 'Test Menu' },
                    ip: '127.0.0.1',
                    user: 'user123'
                })
            )
        })

        it('should handle unauthenticated requests', () => {
            const req = {
                path: '/api/public/menus',
                method: 'GET',
                query: {},
                params: {},
                ip: '127.0.0.1',
                user: null
            }

            logApiError(mockError, req)

            expect(logger.error).toHaveBeenCalledWith(
                'Application error',
                expect.objectContaining({
                    user: 'unauthenticated'
                })
            )
        })

        it('should omit body for GET requests', () => {
            const req = {
                path: '/api/menus',
                method: 'GET',
                query: {},
                params: {},
                body: { shouldBeOmitted: true },
                ip: '127.0.0.1',
                user: null
            }

            logApiError(mockError, req)

            const loggedData = logger.error.mock.calls[0][1]
            expect(loggedData.body).toBeUndefined()
        })
    })

    describe('logDatabaseError', () => {
        it('should log database operation details with error', () => {
            const operation = 'findById'
            const query = { _id: '123456', conditions: { isActive: true } }

            logDatabaseError(mockError, operation, query)

            expect(logger.error).toHaveBeenCalledWith(
                'Application error',
                expect.objectContaining({
                    operation: 'findById',
                    query: expect.objectContaining({
                        _id: '123456',
                        conditions: { isActive: true }
                    })
                })
            )
        })
    })
}) 