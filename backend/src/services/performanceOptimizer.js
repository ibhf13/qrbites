const logger = require('@utils/logger')
const { AdvancedCacheManager } = require('./advancedCachingService')
const compression = require('compression')

/**
 * Performance optimization utilities and middleware
 */
class PerformanceOptimizer {

    constructor() {
        this.metrics = {
            requests: new Map(),
            queries: new Map(),
            slowOperations: [],
            optimizations: new Map()
        }

        this.thresholds = {
            slowQuery: 100, // ms
            slowRequest: 1000, // ms
            memoryWarning: 80, // percentage
            cacheHitRateWarning: 70 // percentage
        }

        this.startTime = Date.now()
    }

    /**
     * Initialize performance monitoring and optimizations
     */
    initialize() {
        logger.info('🚀 Initializing performance optimizer...')

        // Start periodic optimization tasks
        this.setupPeriodicTasks()

        // Setup process monitoring
        this.setupProcessMonitoring()

        // Initialize compression middleware
        this.setupCompression()

        logger.info('✅ Performance optimizer initialized')
    }

    /**
     * Request performance monitoring middleware
     */
    requestMonitoringMiddleware() {
        return (req, res, next) => {
            const start = process.hrtime.bigint()
            const startMemory = process.memoryUsage()

            // Store request info
            const requestId = this.generateRequestId()
            req.performanceId = requestId

            // Override res.end to capture metrics
            const originalEnd = res.end
            res.end = (chunk, encoding) => {
                const end = process.hrtime.bigint()
                const endMemory = process.memoryUsage()

                const responseTime = Number(end - start) / 1000000 // Convert to ms
                const memoryDelta = endMemory.heapUsed - startMemory.heapUsed

                // Record metrics
                this.recordRequest({
                    requestId,
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    responseTime,
                    memoryDelta,
                    userAgent: req.get('User-Agent'),
                    contentLength: res.get('Content-Length') || 0,
                    timestamp: new Date()
                })

                // Add performance headers
                res.set({
                    'X-Response-Time': `${responseTime}ms`,
                    'X-Request-ID': requestId
                })

                // Warn on slow requests
                if (responseTime > this.thresholds.slowRequest) {
                    logger.warn(`🐌 Slow request detected: ${req.method} ${req.path} - ${responseTime}ms`)
                }

                originalEnd.call(res, chunk, encoding)
            }

            next()
        }
    }

    /**
     * Database query performance monitoring
     */
    queryMonitoringMiddleware() {
        const mongoose = require('mongoose')

        // Hook into mongoose query execution
        mongoose.set('debug', (collectionName, method, query, doc, options) => {
            if (process.env.NODE_ENV !== 'production') {
                const start = Date.now()

                // Monitor query execution time
                const originalExec = query.exec
                if (originalExec) {
                    query.exec = async function () {
                        const result = await originalExec.apply(this, arguments)
                        const executionTime = Date.now() - start

                        // Record slow queries
                        if (executionTime > this.thresholds.slowQuery) {
                            this.recordSlowQuery({
                                collection: collectionName,
                                method,
                                query: JSON.stringify(query),
                                executionTime,
                                timestamp: new Date()
                            })
                        }

                        return result
                    }.bind(this)
                }
            }
        })
    }

    /**
     * Automatic image optimization middleware
     */
    imageOptimizationMiddleware() {
        return async (req, res, next) => {
            // Skip if no file upload
            if (!req.file && !req.files) {
                return next()
            }

            try {
                const files = req.files ? Object.values(req.files).flat() : [req.file]

                for (const file of files) {
                    if (file && this.isImageFile(file)) {
                        // Optimize image before processing
                        const optimized = await this.optimizeImage(file)

                        if (optimized) {
                            // Replace original with optimized version
                            file.buffer = optimized.buffer
                            file.size = optimized.size

                            logger.info(`📸 Image optimized: ${file.originalname} (${this.formatBytes(file.size)} saved)`)
                        }
                    }
                }

                next()

            } catch (error) {
                logger.error('Image optimization error:', error)
                next() // Continue without optimization
            }
        }
    }

    /**
     * Response compression and optimization
     */
    setupCompression() {
        return compression({
            level: 6, // Good balance between compression ratio and speed
            threshold: 1024, // Only compress responses > 1KB
            filter: (req, res) => {
                // Don't compress images (already compressed)
                if (res.get('Content-Type')?.startsWith('image/')) {
                    return false
                }

                // Compress JSON, HTML, CSS, JS
                return compression.filter(req, res)
            }
        })
    }

    /**
     * Database connection optimization
     */
    optimizeDatabaseConnection() {
        const mongoose = require('mongoose')

        // Optimize mongoose settings
        mongoose.set('bufferCommands', false)
        mongoose.set('bufferMaxEntries', 0)

        // Connection pooling
        const connectionOptions = {
            maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
            minPoolSize: 2,
            maxIdleTimeMS: 30000,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
            bufferMaxEntries: 0
        }

        logger.info('🗄️  Database connection optimized', connectionOptions)
        return connectionOptions
    }

    /**
     * Memory usage optimization
     */
    optimizeMemoryUsage() {
        // Force garbage collection if available
        if (global.gc) {
            global.gc()
            logger.debug('🧹 Manual garbage collection triggered')
        }

        // Monitor memory usage
        const usage = process.memoryUsage()
        const percentage = (usage.heapUsed / usage.heapTotal) * 100

        if (percentage > this.thresholds.memoryWarning) {
            logger.warn(`⚠️  High memory usage: ${percentage.toFixed(2)}%`)

            // Clear old cache entries if memory is high
            this.optimizeCacheUsage()
        }

        return {
            heapUsed: this.formatBytes(usage.heapUsed),
            heapTotal: this.formatBytes(usage.heapTotal),
            percentage: percentage.toFixed(2) + '%'
        }
    }

    /**
     * Cache usage optimization
     */
    optimizeCacheUsage() {
        const cacheStats = AdvancedCacheManager.getStats()

        // Clear cache if hit rate is too low
        if (parseFloat(cacheStats.hitRate) < this.thresholds.cacheHitRateWarning) {
            logger.warn(`📊 Low cache hit rate: ${cacheStats.hitRate}%`)

            // Implement cache warming for frequently accessed data
            this.warmFrequentlyAccessedData()
        }

        // Clear expired entries
        this.cleanupExpiredCache()
    }

    /**
     * Image optimization using Sharp (if available)
     */
    async optimizeImage(file) {
        try {
            // Only optimize if Sharp is available
            const sharp = require('sharp')

            const { buffer, mimetype } = file
            let optimized

            if (mimetype.includes('jpeg') || mimetype.includes('jpg')) {
                optimized = await sharp(buffer)
                    .jpeg({ quality: 85, progressive: true })
                    .resize(2048, 2048, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .toBuffer()
            } else if (mimetype.includes('png')) {
                optimized = await sharp(buffer)
                    .png({ quality: 85, progressive: true })
                    .resize(2048, 2048, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .toBuffer()
            } else if (mimetype.includes('webp')) {
                optimized = await sharp(buffer)
                    .webp({ quality: 85 })
                    .resize(2048, 2048, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .toBuffer()
            }

            if (optimized && optimized.length < buffer.length) {
                return {
                    buffer: optimized,
                    size: optimized.length,
                    saved: buffer.length - optimized.length
                }
            }

            return null

        } catch (error) {
            // Sharp not available or optimization failed
            logger.debug('Image optimization not available:', error.message)
            return null
        }
    }

    /**
     * API response optimization
     */
    optimizeApiResponse() {
        return (req, res, next) => {
            const originalJson = res.json

            res.json = function (data) {
                // Optimize response data
                const optimized = this.optimizeResponseData(data)

                // Add performance headers
                res.set({
                    'Cache-Control': this.getCacheControlHeader(req),
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY'
                })

                originalJson.call(this, optimized)
            }.bind(this)

            next()
        }
    }

    /**
     * Generate performance report
     */
    generatePerformanceReport() {
        const uptime = Date.now() - this.startTime
        const memoryUsage = this.optimizeMemoryUsage()
        const cacheStats = AdvancedCacheManager.getStats()

        // Calculate average response times by route
        const routeStats = this.calculateRouteStatistics()

        // Get slow operations
        const slowOperations = this.getSlowOperations()

        return {
            reportType: 'performance',
            generatedAt: new Date(),
            uptime: this.formatTime(uptime),
            memory: memoryUsage,
            cache: cacheStats,
            routes: routeStats,
            slowOperations,
            recommendations: this.generateOptimizationRecommendations(),
            metrics: {
                totalRequests: this.getTotalRequests(),
                averageResponseTime: this.getAverageResponseTime(),
                errorRate: this.getErrorRate(),
                throughput: this.getThroughput()
            }
        }
    }

    // Private helper methods

    generateRequestId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }

    recordRequest(requestData) {
        const key = `${requestData.method}:${requestData.path}`

        if (!this.metrics.requests.has(key)) {
            this.metrics.requests.set(key, [])
        }

        const requests = this.metrics.requests.get(key)
        requests.push(requestData)

        // Keep only last 1000 requests per route
        if (requests.length > 1000) {
            requests.shift()
        }
    }

    recordSlowQuery(queryData) {
        this.metrics.slowOperations.push({
            type: 'database',
            ...queryData
        })

        // Keep only last 100 slow operations
        if (this.metrics.slowOperations.length > 100) {
            this.metrics.slowOperations.shift()
        }

        logger.warn(`🐌 Slow query detected: ${queryData.collection}.${queryData.method} - ${queryData.executionTime}ms`)
    }

    isImageFile(file) {
        const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        return imageTypes.includes(file.mimetype)
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)

        if (hours > 0) return `${hours}h ${minutes % 60}m`
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`
        return `${seconds}s`
    }

    optimizeResponseData(data) {
        // Remove null/undefined values from response
        if (typeof data === 'object' && data !== null) {
            return this.removeEmptyValues(data)
        }
        return data
    }

    removeEmptyValues(obj) {
        if (Array.isArray(obj)) {
            return obj.map(item => this.removeEmptyValues(item))
        }

        if (typeof obj === 'object' && obj !== null) {
            const cleaned = {}
            for (const [key, value] of Object.entries(obj)) {
                if (value !== null && value !== undefined && value !== '') {
                    cleaned[key] = this.removeEmptyValues(value)
                }
            }
            return cleaned
        }

        return obj
    }

    getCacheControlHeader(req) {
        // Different cache strategies based on route
        if (req.path.includes('/public/')) {
            return 'public, max-age=3600' // 1 hour
        }

        if (req.path.includes('/uploads/')) {
            return 'public, max-age=86400' // 24 hours
        }

        if (req.method === 'GET') {
            return 'private, max-age=300' // 5 minutes
        }

        return 'no-cache'
    }

    calculateRouteStatistics() {
        const stats = {}

        this.metrics.requests.forEach((requests, route) => {
            const responseTimes = requests.map(r => r.responseTime)
            const errorCount = requests.filter(r => r.statusCode >= 400).length

            stats[route] = {
                totalRequests: requests.length,
                averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
                minResponseTime: Math.min(...responseTimes),
                maxResponseTime: Math.max(...responseTimes),
                errorCount,
                errorRate: (errorCount / requests.length) * 100
            }
        })

        return stats
    }

    getSlowOperations() {
        return this.metrics.slowOperations
            .sort((a, b) => b.executionTime - a.executionTime)
            .slice(0, 10)
    }

    generateOptimizationRecommendations() {
        const recommendations = []

        // Memory optimization
        const memUsage = process.memoryUsage()
        const memPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100

        if (memPercentage > 80) {
            recommendations.push({
                type: 'memory',
                priority: 'high',
                message: 'High memory usage detected',
                suggestion: 'Consider implementing object pooling or increasing cache cleanup frequency'
            })
        }

        // Cache optimization
        const cacheStats = AdvancedCacheManager.getStats()
        if (parseFloat(cacheStats.hitRate) < 70) {
            recommendations.push({
                type: 'cache',
                priority: 'medium',
                message: 'Low cache hit rate',
                suggestion: 'Review caching strategies and implement cache warming'
            })
        }

        // Database optimization
        const slowQueries = this.metrics.slowOperations.filter(op => op.type === 'database')
        if (slowQueries.length > 10) {
            recommendations.push({
                type: 'database',
                priority: 'high',
                message: 'Multiple slow database queries detected',
                suggestion: 'Add database indexes and optimize query patterns'
            })
        }

        return recommendations
    }

    setupPeriodicTasks() {
        // Memory cleanup every 5 minutes
        setInterval(() => {
            this.optimizeMemoryUsage()
        }, 5 * 60 * 1000)

        // Cache optimization every 10 minutes
        setInterval(() => {
            this.optimizeCacheUsage()
        }, 10 * 60 * 1000)

        // Performance report every hour
        setInterval(() => {
            const report = this.generatePerformanceReport()
            logger.info('📊 Performance Report:', {
                averageResponseTime: report.metrics.averageResponseTime,
                memoryUsage: report.memory.percentage,
                cacheHitRate: report.cache.hitRate,
                recommendations: report.recommendations.length
            })
        }, 60 * 60 * 1000)
    }

    setupProcessMonitoring() {
        process.on('warning', (warning) => {
            logger.warn('Process warning:', warning)
        })

        // Monitor event loop delay
        const { performance, PerformanceObserver } = require('perf_hooks')

        const obs = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry) => {
                if (entry.duration > 100) { // > 100ms delay
                    logger.warn(`🔄 Event loop delay: ${entry.duration}ms`)
                }
            })
        })

        obs.observe({ entryTypes: ['measure'] })
    }

    getTotalRequests() {
        let total = 0
        this.metrics.requests.forEach(requests => {
            total += requests.length
        })
        return total
    }

    getAverageResponseTime() {
        let totalTime = 0
        let totalRequests = 0

        this.metrics.requests.forEach(requests => {
            requests.forEach(request => {
                totalTime += request.responseTime
                totalRequests++
            })
        })

        return totalRequests > 0 ? totalTime / totalRequests : 0
    }

    getErrorRate() {
        let totalErrors = 0
        let totalRequests = 0

        this.metrics.requests.forEach(requests => {
            requests.forEach(request => {
                if (request.statusCode >= 400) totalErrors++
                totalRequests++
            })
        })

        return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0
    }

    getThroughput() {
        const uptime = (Date.now() - this.startTime) / 1000 // seconds
        const totalRequests = this.getTotalRequests()
        return uptime > 0 ? totalRequests / uptime : 0
    }

    warmFrequentlyAccessedData() {
        // Implement cache warming logic
        logger.info('🔥 Warming frequently accessed cache data...')
    }

    cleanupExpiredCache() {
        // Cleanup logic handled by NodeCache automatically
        logger.debug('🧹 Cache cleanup completed')
    }
}

// Export singleton instance
const performanceOptimizer = new PerformanceOptimizer()

module.exports = {
    PerformanceOptimizer,
    performanceOptimizer
}