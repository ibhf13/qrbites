
const logger = require('@utils/logger')
const { cloudinary } = require('./cloudinaryService')

// Health check intervals and thresholds
const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds
const ALERT_THRESHOLDS = {
    errorRate: 5, // 5% error rate triggers alert
    responseTime: 2000, // 2 seconds average response time
    memoryUsage: 90, // 90% memory usage
    diskUsage: 85, // 85% disk usage
    cloudinaryQuota: 90, // 90% of Cloudinary quota
    dbConnections: 80 // 80% of database connections
}

// System metrics storage
const systemMetrics = {
    requests: {
        total: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0,
        recentResponses: []
    },
    resources: {
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: { usage: 0 },
        connections: { active: 0, max: 100 }
    },
    cloudinary: {
        usage: {},
        lastChecked: null,
        quotaWarning: false
    },
    database: {
        connections: 0,
        queryTime: [],
        lastHealth: null
    },
    alerts: [],
    uptime: process.uptime(),
    startTime: new Date()
}

/**
 * Initialize monitoring service
 */
const initializeMonitoring = () => {
    logger.info('🔍 Initializing monitoring service...')

    // Start health checks
    startHealthChecks()

    // Setup process monitoring
    setupProcessMonitoring()

    // Setup cleanup intervals
    setupCleanupTasks()

    logger.info('✅ Monitoring service initialized')
}

/**
 * Start periodic health checks
 */
const startHealthChecks = () => {
    setInterval(async () => {
        try {
            await performHealthCheck()
        } catch (error) {
            logger.error('Health check failed:', error)
        }
    }, HEALTH_CHECK_INTERVAL)

    // Initial health check
    performHealthCheck()
}

/**
 * Perform comprehensive health check
 */
const performHealthCheck = async () => {
    const healthStatus = {
        timestamp: new Date(),
        status: 'healthy',
        checks: {},
        warnings: [],
        errors: []
    }

    try {
        // Check database connectivity
        healthStatus.checks.database = await checkDatabaseHealth()

        // Check Cloudinary status
        healthStatus.checks.cloudinary = await checkCloudinaryHealth()

        // Check system resources
        healthStatus.checks.system = checkSystemResources()

        // Check API performance
        healthStatus.checks.api = checkAPIPerformance()

        // Evaluate overall health
        const overallStatus = evaluateOverallHealth(healthStatus.checks)
        healthStatus.status = overallStatus.status
        healthStatus.warnings = overallStatus.warnings
        healthStatus.errors = overallStatus.errors

        // Store health status
        systemMetrics.lastHealthCheck = healthStatus

        // Trigger alerts if needed
        await processAlerts(healthStatus)

        logger.debug('Health check completed:', {
            status: healthStatus.status,
            warnings: healthStatus.warnings.length,
            errors: healthStatus.errors.length
        })

    } catch (error) {
        logger.error('Health check error:', error)
        healthStatus.status = 'critical'
        healthStatus.errors.push(`Health check failed: ${error.message}`)
    }

    return healthStatus
}

/**
 * Check database health
 */
const checkDatabaseHealth = async () => {
    const mongoose = require('mongoose')

    const check = {
        status: 'healthy',
        responseTime: 0,
        connections: 0,
        errors: []
    }

    try {
        const startTime = Date.now()

        // Simple ping to database
        await mongoose.connection.db.admin().ping()

        check.responseTime = Date.now() - startTime
        check.connections = mongoose.connections.length

        // Check connection state
        if (mongoose.connection.readyState !== 1) {
            check.status = 'unhealthy'
            check.errors.push('Database not connected')
        }

        // Check response time
        if (check.responseTime > 1000) {
            check.status = 'degraded'
            check.errors.push('Slow database response')
        }

        systemMetrics.database.lastHealth = new Date()

    } catch (error) {
        check.status = 'critical'
        check.errors.push(error.message)
    }

    return check
}

/**
 * Check Cloudinary service health
 */
const checkCloudinaryHealth = async () => {
    const check = {
        status: 'healthy',
        usage: {},
        quotaWarnings: [],
        errors: []
    }

    try {
        // Get current usage statistics
        const usage = await cloudinary.api.usage()
        check.usage = usage

        systemMetrics.cloudinary.usage = usage
        systemMetrics.cloudinary.lastChecked = new Date()

        // Check quota thresholds
        const quotaChecks = [
            { name: 'storage', current: usage.storage.usage, limit: usage.storage.limit },
            { name: 'bandwidth', current: usage.bandwidth.usage, limit: usage.bandwidth.limit },
            { name: 'transformations', current: usage.transformations.usage, limit: usage.transformations.limit }
        ]

        quotaChecks.forEach(quota => {
            const percentage = (quota.current / quota.limit) * 100

            if (percentage >= ALERT_THRESHOLDS.cloudinaryQuota) {
                check.status = 'degraded'
                check.quotaWarnings.push(`${quota.name} usage at ${percentage.toFixed(1)}%`)
                systemMetrics.cloudinary.quotaWarning = true
            }
        })

        // Test upload capability with small test image
        const testResult = await cloudinary.uploader.upload(
            'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
            {
                folder: 'qrbites/health-check',
                public_id: `health_check_${Date.now()}`,
                overwrite: true
            }
        )

        // Cleanup test image
        await cloudinary.uploader.destroy(testResult.public_id)

    } catch (error) {
        check.status = 'critical'
        check.errors.push(`Cloudinary error: ${error.message}`)
    }

    return check
}

/**
 * Check system resources
 */
const checkSystemResources = () => {
    const check = {
        status: 'healthy',
        memory: {},
        cpu: {},
        warnings: []
    }

    try {
        // Memory usage
        const memUsage = process.memoryUsage()
        check.memory = {
            used: memUsage.heapUsed,
            total: memUsage.heapTotal,
            external: memUsage.external,
            percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
        }

        systemMetrics.resources.memory = check.memory

        // Check memory threshold
        if (check.memory.percentage > ALERT_THRESHOLDS.memoryUsage) {
            check.status = 'degraded'
            check.warnings.push(`High memory usage: ${check.memory.percentage.toFixed(1)}%`)
        }

        // CPU usage (approximate)
        const cpuUsage = process.cpuUsage()
        check.cpu = {
            user: cpuUsage.user,
            system: cpuUsage.system
        }

        systemMetrics.resources.cpu = check.cpu

    } catch (error) {
        check.status = 'degraded'
        check.warnings.push(`Resource check error: ${error.message}`)
    }

    return check
}

/**
 * Check API performance metrics
 */
const checkAPIPerformance = () => {
    const check = {
        status: 'healthy',
        requests: systemMetrics.requests.total,
        errorRate: 0,
        avgResponseTime: systemMetrics.requests.avgResponseTime,
        warnings: []
    }

    try {
        // Calculate error rate
        if (systemMetrics.requests.total > 0) {
            check.errorRate = (systemMetrics.requests.failed / systemMetrics.requests.total) * 100
        }

        // Check error rate threshold
        if (check.errorRate > ALERT_THRESHOLDS.errorRate) {
            check.status = 'degraded'
            check.warnings.push(`High error rate: ${check.errorRate.toFixed(2)}%`)
        }

        // Check response time threshold
        if (check.avgResponseTime > ALERT_THRESHOLDS.responseTime) {
            check.status = 'degraded'
            check.warnings.push(`Slow response time: ${check.avgResponseTime}ms`)
        }

    } catch (error) {
        check.status = 'degraded'
        check.warnings.push(`Performance check error: ${error.message}`)
    }

    return check
}

/**
 * Evaluate overall system health
 */
const evaluateOverallHealth = (checks) => {
    const result = {
        status: 'healthy',
        warnings: [],
        errors: []
    }

    let healthyCount = 0
    let degradedCount = 0
    let criticalCount = 0

    Object.values(checks).forEach(check => {
        switch (check.status) {
            case 'healthy':
                healthyCount++
                break
            case 'degraded':
                degradedCount++
                result.warnings.push(...(check.warnings || []))
                result.warnings.push(...(check.quotaWarnings || []))
                break
            case 'critical':
            case 'unhealthy':
                criticalCount++
                result.errors.push(...(check.errors || []))
                break
        }
    })

    // Determine overall status
    if (criticalCount > 0) {
        result.status = 'critical'
    } else if (degradedCount > 1) {
        result.status = 'degraded'
    } else if (degradedCount === 1) {
        result.status = 'warning'
    }

    return result
}

/**
 * Process and send alerts based on health status
 */
const processAlerts = async (healthStatus) => {
    try {
        const now = new Date()
        const alertsToSend = []

        // Check for critical status
        if (healthStatus.status === 'critical') {
            alertsToSend.push({
                level: 'critical',
                message: 'System critical health detected',
                details: healthStatus.errors,
                timestamp: now
            })
        }

        // Check for performance degradation
        if (healthStatus.status === 'degraded') {
            alertsToSend.push({
                level: 'warning',
                message: 'System performance degraded',
                details: healthStatus.warnings,
                timestamp: now
            })
        }

        // Check specific thresholds
        if (systemMetrics.cloudinary.quotaWarning) {
            alertsToSend.push({
                level: 'warning',
                message: 'Cloudinary quota threshold exceeded',
                details: healthStatus.checks.cloudinary?.quotaWarnings || [],
                timestamp: now
            })
        }

        // Send alerts
        for (const alert of alertsToSend) {
            await sendAlert(alert)
            systemMetrics.alerts.push(alert)
        }

        // Cleanup old alerts (keep last 100)
        if (systemMetrics.alerts.length > 100) {
            systemMetrics.alerts = systemMetrics.alerts.slice(-100)
        }

    } catch (error) {
        logger.error('Error processing alerts:', error)
    }
}

/**
 * Send alert notification
 */
const sendAlert = async (alert) => {
    try {
        logger.error(`🚨 ALERT [${alert.level.toUpperCase()}]: ${alert.message}`, {
            details: alert.details,
            timestamp: alert.timestamp
        })

        // Here you could integrate with external alerting services:
        // - Email notifications
        // - Slack webhooks
        // - PagerDuty
        // - Discord webhooks
        // - SMS alerts

        // Example webhook notification (uncomment and configure)
        /*
        if (process.env.ALERT_WEBHOOK_URL) {
          await fetch(process.env.ALERT_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `🚨 QrBites Alert: ${alert.message}`,
              attachments: [{
                color: alert.level === 'critical' ? 'danger' : 'warning',
                fields: [
                  { title: 'Level', value: alert.level, short: true },
                  { title: 'Time', value: alert.timestamp.toISOString(), short: true },
                  { title: 'Details', value: alert.details.join('\n'), short: false }
                ]
              }]
            })
          });
        }
        */

    } catch (error) {
        logger.error('Failed to send alert:', error)
    }
}

/**
 * Record API request metrics
 */
const recordRequest = (req, res, responseTime, error = null) => {
    systemMetrics.requests.total++

    if (error) {
        systemMetrics.requests.failed++
    } else {
        systemMetrics.requests.successful++
    }

    // Update average response time
    systemMetrics.requests.recentResponses.push(responseTime)

    // Keep only last 1000 responses for average calculation
    if (systemMetrics.requests.recentResponses.length > 1000) {
        systemMetrics.requests.recentResponses.shift()
    }

    // Calculate new average
    systemMetrics.requests.avgResponseTime = systemMetrics.requests.recentResponses.reduce((a, b) => a + b, 0) / systemMetrics.requests.recentResponses.length
}

/**
 * Get current system metrics
 */
const getSystemMetrics = () => {
    return {
        ...systemMetrics,
        uptime: process.uptime(),
        timestamp: new Date()
    }
}

/**
 * Get health status
 */
const getHealthStatus = async () => {
    if (systemMetrics.lastHealthCheck &&
        (Date.now() - systemMetrics.lastHealthCheck.timestamp.getTime()) < HEALTH_CHECK_INTERVAL * 2) {
        return systemMetrics.lastHealthCheck
    }

    return await performHealthCheck()
}

/**
 * Setup process monitoring
 */
const setupProcessMonitoring = () => {
    // Monitor uncaught exceptions
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error)
        systemMetrics.alerts.push({
            level: 'critical',
            message: 'Uncaught Exception',
            details: [error.message, error.stack],
            timestamp: new Date()
        })
    })

    // Monitor unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection:', reason)
        systemMetrics.alerts.push({
            level: 'critical',
            message: 'Unhandled Promise Rejection',
            details: [String(reason)],
            timestamp: new Date()
        })
    })

    // Monitor memory usage
    setInterval(() => {
        const usage = process.memoryUsage()
        const percentage = (usage.heapUsed / usage.heapTotal) * 100

        if (percentage > ALERT_THRESHOLDS.memoryUsage) {
            logger.warn(`High memory usage: ${percentage.toFixed(1)}%`)
        }
    }, 60000) // Check every minute
}

/**
 * Setup cleanup tasks
 */
const setupCleanupTasks = () => {
    // Cleanup old metrics every hour
    setInterval(() => {
        // Reset request counters daily
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
        if (systemMetrics.startTime.getTime() < oneDayAgo) {
            systemMetrics.requests.total = 0
            systemMetrics.requests.successful = 0
            systemMetrics.requests.failed = 0
            systemMetrics.requests.recentResponses = []
            systemMetrics.startTime = new Date()
        }
    }, 3600000) // Every hour
}

/**
 * Express middleware for request monitoring
 */
const requestMonitoringMiddleware = (req, res, next) => {
    const startTime = Date.now()

    // Override res.end to capture response time
    const originalEnd = res.end
    res.end = function (...args) {
        const responseTime = Date.now() - startTime
        const error = res.statusCode >= 400 ? new Error(`HTTP ${res.statusCode}`) : null

        recordRequest(req, res, responseTime, error)
        originalEnd.apply(this, args)
    }

    next()
}

/**
 * Generate monitoring report
 */
const generateMonitoringReport = async (period = '24h') => {
    try {
        const healthStatus = await getHealthStatus()
        const metrics = getSystemMetrics()

        return {
            reportType: 'monitoring',
            period,
            generatedAt: new Date(),
            health: healthStatus,
            metrics: {
                requests: metrics.requests,
                resources: metrics.resources,
                uptime: metrics.uptime,
                alerts: metrics.alerts.slice(-10) // Last 10 alerts
            },
            cloudinary: metrics.cloudinary,
            database: metrics.database,
            recommendations: generateRecommendations(metrics, healthStatus)
        }

    } catch (error) {
        logger.error('Error generating monitoring report:', error)
        throw error
    }
}

/**
 * Generate system recommendations based on metrics
 */
const generateRecommendations = (metrics, health) => {
    const recommendations = []

    // Memory recommendations
    if (metrics.resources.memory.percentage > 80) {
        recommendations.push({
            type: 'performance',
            priority: 'high',
            message: 'Consider optimizing memory usage or upgrading server resources',
            details: `Current memory usage: ${metrics.resources.memory.percentage.toFixed(1)}%`
        })
    }

    // Error rate recommendations
    const errorRate = metrics.requests.total > 0 ?
        (metrics.requests.failed / metrics.requests.total) * 100 : 0

    if (errorRate > 2) {
        recommendations.push({
            type: 'reliability',
            priority: 'high',
            message: 'High error rate detected - investigate failed requests',
            details: `Current error rate: ${errorRate.toFixed(2)}%`
        })
    }

    // Cloudinary recommendations
    if (metrics.cloudinary.usage && metrics.cloudinary.usage.storage) {
        const storageUsage = (metrics.cloudinary.usage.storage.usage / metrics.cloudinary.usage.storage.limit) * 100

        if (storageUsage > 75) {
            recommendations.push({
                type: 'cost',
                priority: 'medium',
                message: 'Cloudinary storage usage is high - consider cleanup or upgrade',
                details: `Current storage usage: ${storageUsage.toFixed(1)}%`
            })
        }
    }

    // Performance recommendations
    if (metrics.requests.avgResponseTime > 1000) {
        recommendations.push({
            type: 'performance',
            priority: 'medium',
            message: 'Average response time is high - optimize database queries and caching',
            details: `Current avg response time: ${metrics.requests.avgResponseTime}ms`
        })
    }

    return recommendations
}

module.exports = {
    initializeMonitoring,
    performHealthCheck,
    getSystemMetrics,
    getHealthStatus,
    recordRequest,
    requestMonitoringMiddleware,
    generateMonitoringReport,
    systemMetrics,
    ALERT_THRESHOLDS
}