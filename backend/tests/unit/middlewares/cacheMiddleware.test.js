const NodeCache = require('node-cache')
const logger = require('@utils/logger')

// Mock dependencies
jest.mock('node-cache')
jest.mock('@utils/logger')

// We need to mock the NodeCache instance before importing the middleware
const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn()
}

// Mock NodeCache constructor
NodeCache.mockImplementation(() => mockCache)

// Import the module after setting up mocks
const { cacheMiddleware, clearCache } = require('@middlewares/cacheMiddleware')

describe('Cache Middleware', () => {
    let req, res, next

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks()

        // Set up request, response, and next function mocks
        req = {
            method: 'GET',
            originalUrl: '/api/public/menus/123',
            url: '/api/public/menus/123'
        }

        // Create a mock json function that can be spied on
        const jsonMock = jest.fn().mockReturnThis()

        res = {
            json: jsonMock
        }

        next = jest.fn()

        // Set up mock keys for clearCache tests
        mockCache.keys.mockReturnValue([
            '/api/public/menus/123',
            '/api/public/menus/456',
            '/api/public/restaurants/789'
        ])
    })

    describe('cacheMiddleware', () => {
        it('should call next() for non-GET requests', () => {
            req.method = 'POST'

            const middleware = cacheMiddleware()
            middleware(req, res, next)

            expect(next).toHaveBeenCalled()
            expect(mockCache.get).not.toHaveBeenCalled()
        })

        it('should return cached response if available', () => {
            const cachedData = {
                success: true,
                data: { name: 'Test Menu' }
            }

            mockCache.get.mockReturnValue(cachedData)

            const middleware = cacheMiddleware()
            middleware(req, res, next)

            expect(res.json).toHaveBeenCalledWith({
                ...cachedData,
                cached: true
            })
            expect(next).not.toHaveBeenCalled()
            expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('Cache hit'))
        })

        it('should continue request if cache is missed', () => {
            // Cache miss
            mockCache.get.mockReturnValue(null)

            const middleware = cacheMiddleware()
            middleware(req, res, next)

            expect(next).toHaveBeenCalled()
            // The json function is replaced, not called
            expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('Cache miss'))
        })

        it('should override res.json to cache successful responses', () => {
            // Cache miss to continue with request
            mockCache.get.mockReturnValue(null)

            const middleware = cacheMiddleware(300) // 5 minutes TTL
            middleware(req, res, next)

            // The middleware should have replaced res.json with a wrapped version
            // Let's capture what res.json was replaced with
            const wrappedJson = res.json

            // Simulate successful response
            const responseBody = {
                success: true,
                data: { name: 'Test Menu' }
            }

            // Call the wrapped json function
            wrappedJson(responseBody)

            // Verify cache was set
            expect(mockCache.set).toHaveBeenCalledWith(
                req.originalUrl,
                responseBody,
                300
            )
            expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('Caching response'))
        })

        it('should not cache unsuccessful responses', () => {
            // Cache miss to continue with request
            mockCache.get.mockReturnValue(null)

            const middleware = cacheMiddleware()
            middleware(req, res, next)

            // The middleware should have replaced res.json with a wrapped version
            const wrappedJson = res.json

            // Simulate error response
            const errorResponse = {
                success: false,
                error: 'Not found'
            }

            // Call the wrapped json function
            wrappedJson(errorResponse)

            // Verify cache was not set
            expect(mockCache.set).not.toHaveBeenCalled()
        })

        it('should use default TTL if not specified', () => {
            // Cache miss to continue with request
            mockCache.get.mockReturnValue(null)

            const middleware = cacheMiddleware() // Default TTL
            middleware(req, res, next)

            // The middleware should have replaced res.json with a wrapped version
            const wrappedJson = res.json

            // Simulate successful response
            const responseBody = {
                success: true,
                data: { name: 'Test Menu' }
            }

            // Call the wrapped json function
            wrappedJson(responseBody)

            // Verify cache was set with default TTL (600)
            expect(mockCache.set).toHaveBeenCalledWith(
                req.originalUrl,
                responseBody,
                600
            )
        })
    })

    describe('clearCache', () => {
        it('should clear cache entries matching pattern', () => {
            clearCache('/api/public/menus')

            // Should delete two keys matching the pattern
            expect(mockCache.del).toHaveBeenCalledTimes(2)
            expect(mockCache.del).toHaveBeenCalledWith('/api/public/menus/123')
            expect(mockCache.del).toHaveBeenCalledWith('/api/public/menus/456')
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Cleared 2 cache entries'))
        })

        it('should not delete when no keys match pattern', () => {
            // Mock empty cache keys
            mockCache.keys.mockReturnValue(['/api/public/restaurants/789'])

            clearCache('/api/menus/not-found')

            expect(mockCache.del).not.toHaveBeenCalled()
        })
    })
}) 