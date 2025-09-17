
const NodeCache = require('node-cache')
const logger = require('@utils/logger')
const crypto = require('crypto')

// Cache layers with different TTL strategies
const caches = {
    // L1: Memory cache for frequently accessed data (5 minutes)
    memory: new NodeCache({
        stdTTL: 300,
        checkperiod: 60,
        useClones: false,
        maxKeys: 1000
    }),

    // L2: Application cache for medium-term data (30 minutes)
    application: new NodeCache({
        stdTTL: 1800,
        checkperiod: 120,
        useClones: false,
        maxKeys: 5000
    }),

    // L3: Long-term cache for static content (2 hours)
    longTerm: new NodeCache({
        stdTTL: 7200,
        checkperiod: 300,
        useClones: false,
        maxKeys: 10000
    })
}

// Cache statistics
const stats = {
    hits: { memory: 0, application: 0, longTerm: 0 },
    misses: { memory: 0, application: 0, longTerm: 0 },
    sets: { memory: 0, application: 0, longTerm: 0 },
    deletes: { memory: 0, application: 0, longTerm: 0 },
    size: { memory: 0, application: 0, longTerm: 0 }
}

/**
 * Cache key strategies for different data types
 */
const CacheStrategies = {
    // User-specific data
    USER: {
        key: (userId, suffix = '') => `user:${userId}${suffix ? ':' + suffix : ''}`,
        ttl: 300, // 5 minutes
        layer: 'memory'
    },

    // Restaurant data  
    RESTAURANT: {
        key: (restaurantId, suffix = '') => `restaurant:${restaurantId}${suffix ? ':' + suffix : ''}`,
        ttl: 1800, // 30 minutes
        layer: 'application'
    },

    // Menu data
    MENU: {
        key: (menuId, suffix = '') => `menu:${menuId}${suffix ? ':' + suffix : ''}`,
        ttl: 1800, // 30 minutes  
        layer: 'application'
    },

    // Menu item data
    MENU_ITEM: {
        key: (itemId, suffix = '') => `menuitem:${itemId}${suffix ? ':' + suffix : ''}`,
        ttl: 1800, // 30 minutes
        layer: 'application'
    },

    // Public data (restaurant listings, etc.)
    PUBLIC: {
        key: (resource, id = '', suffix = '') => `public:${resource}${id ? ':' + id : ''}${suffix ? ':' + suffix : ''}`,
        ttl: 3600, // 1 hour
        layer: 'application'
    },

    // Static content (images, QR codes)
    STATIC: {
        key: (type, id, suffix = '') => `static:${type}:${id}${suffix ? ':' + suffix : ''}`,
        ttl: 7200, // 2 hours
        layer: 'longTerm'
    },

    // API responses
    API: {
        key: (endpoint, params = {}) => {
            const paramString = Object.keys(params).length > 0 ?
                ':' + crypto.createHash('md5').update(JSON.stringify(params)).digest('hex') : ''
            return `api:${endpoint}${paramString}`
        },
        ttl: 600, // 10 minutes
        layer: 'application'
    },

    // Search results
    SEARCH: {
        key: (query, filters = {}) => {
            const queryHash = crypto.createHash('md5').update(query + JSON.stringify(filters)).digest('hex')
            return `search:${queryHash}`
        },
        ttl: 900, // 15 minutes
        layer: 'application'
    }
}

/**
 * Advanced cache manager with intelligent strategies
 */
class AdvancedCacheManager {

    /**
     * Get value from cache with fallthrough strategy
     */
    static async get(strategy, keyParams, options = {}) {
        const { fallback = null, refresh = false } = options
        const key = this.generateKey(strategy, keyParams)
        const layer = strategy.layer || 'application'

        try {
            // Force refresh if requested
            if (refresh) {
                stats.misses[layer]++
                return fallback ? await fallback() : null
            }

            // Try to get from specified layer first
            let value = caches[layer].get(key)

            if (value !== undefined) {
                stats.hits[layer]++
                logger.debug(`Cache HIT [${layer}]: ${key}`)

                // Promote to higher layer if frequently accessed
                this.promoteIfNeeded(key, value, layer)

                return value
            }

            // Try other layers in order of preference
            const layerOrder = this.getLayerFallbackOrder(layer)

            for (const fallbackLayer of layerOrder) {
                value = caches[fallbackLayer].get(key)
                if (value !== undefined) {
                    stats.hits[fallbackLayer]++
                    logger.debug(`Cache HIT [${fallbackLayer}]: ${key} (fallback)`)

                    // Copy to preferred layer
                    this.set(strategy, keyParams, value, { silent: true })

                    return value
                }
            }

            // Cache miss - try fallback function
            stats.misses[layer]++
            logger.debug(`Cache MISS [${layer}]: ${key}`)

            if (fallback) {
                const result = await fallback()
                if (result !== null && result !== undefined) {
                    this.set(strategy, keyParams, result, { silent: true })
                }
                return result
            }

            return null

        } catch (error) {
            logger.error(`Cache get error for key ${key}:`, error)
            return fallback ? await fallback() : null
        }
    }

    /**
     * Set value in cache
     */
    static set(strategy, keyParams, value, options = {}) {
        const { ttl = strategy.ttl, silent = false } = options
        const key = this.generateKey(strategy, keyParams)
        const layer = strategy.layer || 'application'

        try {
            caches[layer].set(key, value, ttl)
            stats.sets[layer]++
            stats.size[layer] = caches[layer].getStats().keys

            if (!silent) {
                logger.debug(`Cache SET [${layer}]: ${key} (TTL: ${ttl}s)`)
            }

            return true

        } catch (error) {
            logger.error(`Cache set error for key ${key}:`, error)
            return false
        }
    }

    /**
     * Delete from cache with pattern support
     */
    static delete(strategy, keyParams, options = {}) {
        const { pattern = false, allLayers = false } = options
        const key = this.generateKey(strategy, keyParams)
        const layer = strategy.layer || 'application'

        try {
            const layersToProcess = allLayers ? Object.keys(caches) : [layer]
            let deletedCount = 0

            layersToProcess.forEach(targetLayer => {
                if (pattern) {
                    // Delete all keys matching pattern
                    const keys = caches[targetLayer].keys()
                    const matchingKeys = keys.filter(k => k.includes(key))

                    matchingKeys.forEach(k => {
                        caches[targetLayer].del(k)
                        deletedCount++
                    })
                } else {
                    // Delete specific key
                    if (caches[targetLayer].del(key)) {
                        deletedCount++
                    }
                }

                stats.deletes[targetLayer] += deletedCount
                stats.size[targetLayer] = caches[targetLayer].getStats().keys
            })

            logger.debug(`Cache DELETE [${allLayers ? 'all' : layer}]: ${key} (${deletedCount} keys)`)
            return deletedCount > 0

        } catch (error) {
            logger.error(`Cache delete error for key ${key}:`, error)
            return false
        }
    }

    /**
     * Invalidate related cache entries
     */
    static invalidateRelated(resource, resourceId, options = {}) {
        const { cascade = true } = options

        try {
            const patterns = this.getInvalidationPatterns(resource, resourceId)
            let totalDeleted = 0

            patterns.forEach(pattern => {
                Object.keys(caches).forEach(layer => {
                    const keys = caches[layer].keys()
                    const matchingKeys = keys.filter(key =>
                        key.includes(pattern) ||
                        (cascade && this.shouldCascadeInvalidate(key, resource, resourceId))
                    )

                    matchingKeys.forEach(key => {
                        caches[layer].del(key)
                        totalDeleted++
                    })
                })
            })

            logger.info(`Cache invalidation: ${totalDeleted} entries for ${resource}:${resourceId}`)
            return totalDeleted

        } catch (error) {
            logger.error(`Cache invalidation error:`, error)
            return 0
        }
    }

    /**
     * Warm cache with frequently accessed data
     */
    static async warmCache(warmupStrategies) {
        logger.info('🔥 Starting cache warmup...')

        const results = {
            successful: 0,
            failed: 0,
            total: warmupStrategies.length
        }

        for (const warmupStrategy of warmupStrategies) {
            try {
                const { strategy, keyParams, dataLoader } = warmupStrategy
                const data = await dataLoader()

                if (data !== null && data !== undefined) {
                    this.set(strategy, keyParams, data, { silent: true })
                    results.successful++
                } else {
                    results.failed++
                }

            } catch (error) {
                logger.error('Cache warmup error:', error)
                results.failed++
            }
        }

        logger.info(`🔥 Cache warmup completed: ${results.successful}/${results.total} successful`)
        return results
    }

    /**
     * Get cache statistics and health metrics
     */
    static getStats() {
        const totalHits = Object.values(stats.hits).reduce((a, b) => a + b, 0)
        const totalMisses = Object.values(stats.misses).reduce((a, b) => a + b, 0)
        const hitRate = totalHits / (totalHits + totalMisses) * 100

        return {
            hitRate: isNaN(hitRate) ? 0 : hitRate.toFixed(2),
            totalRequests: totalHits + totalMisses,
            stats,
            layers: Object.keys(caches).map(layer => ({
                name: layer,
                stats: caches[layer].getStats(),
                hitRate: stats.hits[layer] / (stats.hits[layer] + stats.misses[layer]) * 100 || 0
            })),
            memory: {
                nodeCache: Object.keys(caches).reduce((acc, layer) => {
                    acc[layer] = caches[layer].getStats()
                    return acc
                }, {}),
                process: process.memoryUsage()
            }
        }
    }

    /**
     * Clear all caches
     */
    static clearAll() {
        Object.keys(caches).forEach(layer => {
            caches[layer].flushAll()
            stats.hits[layer] = 0
            stats.misses[layer] = 0
            stats.sets[layer] = 0
            stats.deletes[layer] = 0
            stats.size[layer] = 0
        })

        logger.info('🧹 All caches cleared')
    }

    // Private helper methods

    static generateKey(strategy, keyParams) {
        if (typeof strategy.key === 'function') {
            return strategy.key(...(Array.isArray(keyParams) ? keyParams : [keyParams]))
        }
        return strategy.key
    }

    static getLayerFallbackOrder(preferredLayer) {
        const allLayers = ['memory', 'application', 'longTerm']
        return allLayers.filter(layer => layer !== preferredLayer)
    }

    static promoteIfNeeded(key, value, currentLayer) {
        // Simple promotion logic - could be enhanced with access frequency tracking
        if (currentLayer === 'longTerm' && Math.random() < 0.1) { // 10% chance
            caches.application.set(key, value, 1800)
            logger.debug(`Cache PROMOTE: ${key} from ${currentLayer} to application`)
        }
    }

    static getInvalidationPatterns(resource, resourceId) {
        const patterns = [`${resource}:${resourceId}`]

        // Add resource-specific invalidation patterns
        switch (resource) {
            case 'restaurant':
                patterns.push(`menu:${resourceId}`, `public:restaurants:${resourceId}`)
                break
            case 'menu':
                patterns.push(`menuitem:${resourceId}`, `api:menus`)
                break
            case 'user':
                patterns.push(`api:users:${resourceId}`)
                break
        }

        return patterns
    }

    static shouldCascadeInvalidate(key, resource, resourceId) {
        // Define cascade invalidation rules
        const cascadeRules = {
            restaurant: ['menu', 'menuitem', 'public'],
            menu: ['menuitem'],
            user: ['restaurant']
        }

        const cascadeTargets = cascadeRules[resource] || []
        return cascadeTargets.some(target => key.startsWith(target))
    }
}

/**
 * Middleware for automatic API response caching
 */
const cacheMiddleware = (strategy, keyGenerator, options = {}) => {
    return async (req, res, next) => {
        const {
            condition = () => true,
            varyBy = [],
            skipMethods = ['POST', 'PUT', 'DELETE', 'PATCH']
        } = options

        // Skip caching for certain methods
        if (skipMethods.includes(req.method)) {
            return next()
        }

        // Check condition
        if (!condition(req)) {
            return next()
        }

        try {
            // Generate cache key
            const keyParams = typeof keyGenerator === 'function' ? keyGenerator(req) : keyGenerator
            const varyParams = varyBy.reduce((acc, field) => {
                acc[field] = req.headers[field] || req.query[field] || req.body?.[field]
                return acc
            }, {})

            const fullKeyParams = { ...keyParams, ...varyParams }

            // Try to get from cache
            const cached = await AdvancedCacheManager.get(strategy, fullKeyParams)

            if (cached) {
                res.setHeader('X-Cache', 'HIT')
                res.setHeader('X-Cache-Layer', strategy.layer)
                return res.json(cached)
            }

            // Cache miss - capture response
            const originalJson = res.json
            res.json = function (data) {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    AdvancedCacheManager.set(strategy, fullKeyParams, data)
                    res.setHeader('X-Cache', 'MISS')
                }

                originalJson.call(this, data)
            }

            next()

        } catch (error) {
            logger.error('Cache middleware error:', error)
            next()
        }
    }
}

/**
 * Specialized cache implementations
 */
const SpecializedCaches = {

    // Image URL cache with Cloudinary optimization
    images: {
        async get(publicId, transformations = {}) {
            const key = `image:${publicId}:${crypto.createHash('md5').update(JSON.stringify(transformations)).digest('hex')}`
            return await AdvancedCacheManager.get(CacheStrategies.STATIC, [publicId, 'transformed'], {
                fallback: async () => {
                    const { generateUrl } = require('./cloudinaryService')
                    return generateUrl(publicId, transformations)
                }
            })
        }
    },

    // User session cache
    sessions: {
        async get(userId) {
            return await AdvancedCacheManager.get(CacheStrategies.USER, [userId, 'session'])
        },

        set(userId, sessionData) {
            return AdvancedCacheManager.set(CacheStrategies.USER, [userId, 'session'], sessionData, { ttl: 3600 })
        },

        delete(userId) {
            return AdvancedCacheManager.delete(CacheStrategies.USER, [userId, 'session'])
        }
    },

    // Restaurant data with intelligent invalidation
    restaurants: {
        async get(restaurantId, include = []) {
            const suffix = include.length > 0 ? include.sort().join(',') : ''
            return await AdvancedCacheManager.get(CacheStrategies.RESTAURANT, [restaurantId, suffix])
        },

        set(restaurantId, data, include = []) {
            const suffix = include.length > 0 ? include.sort().join(',') : ''
            return AdvancedCacheManager.set(CacheStrategies.RESTAURANT, [restaurantId, suffix], data)
        },

        invalidate(restaurantId) {
            return AdvancedCacheManager.invalidateRelated('restaurant', restaurantId, { cascade: true })
        }
    },

    // Search results with query optimization
    search: {
        async get(query, filters = {}, pagination = {}) {
            const searchKey = [query, { ...filters, ...pagination }]
            return await AdvancedCacheManager.get(CacheStrategies.SEARCH, searchKey)
        },

        set(query, filters, pagination, results) {
            const searchKey = [query, { ...filters, ...pagination }]
            return AdvancedCacheManager.set(CacheStrategies.SEARCH, searchKey, results)
        },

        invalidatePattern(pattern) {
            return AdvancedCacheManager.delete(CacheStrategies.SEARCH, [pattern], { pattern: true, allLayers: true })
        }
    }
}

/**
 * Cache warming strategies for common data
 */
const getCacheWarmupStrategies = () => [
    {
        strategy: CacheStrategies.PUBLIC,
        keyParams: ['restaurants', 'featured'],
        dataLoader: async () => {
            const Restaurant = require('@models/restaurant')
            return await Restaurant.find({ featured: true }).limit(10).lean()
        }
    },
    {
        strategy: CacheStrategies.PUBLIC,
        keyParams: ['stats', 'global'],
        dataLoader: async () => {
            const Restaurant = require('@models/restaurant')
            const Menu = require('@models/menu')
            const MenuItem = require('@models/menuItem')

            return {
                restaurants: await Restaurant.countDocuments(),
                menus: await Menu.countDocuments(),
                menuItems: await MenuItem.countDocuments(),
                timestamp: new Date()
            }
        }
    }
]

// Initialize cache event listeners
Object.keys(caches).forEach(layer => {
    caches[layer].on('set', (key, value) => {
        logger.debug(`Cache [${layer}] SET: ${key}`)
    })

    caches[layer].on('del', (key, value) => {
        logger.debug(`Cache [${layer}] DEL: ${key}`)
    })

    caches[layer].on('expired', (key, value) => {
        logger.debug(`Cache [${layer}] EXPIRED: ${key}`)
    })
})

module.exports = {
    AdvancedCacheManager,
    CacheStrategies,
    SpecializedCaches,
    cacheMiddleware,
    getCacheWarmupStrategies,
    getStats: () => AdvancedCacheManager.getStats(),
    clearAll: () => AdvancedCacheManager.clearAll()
}