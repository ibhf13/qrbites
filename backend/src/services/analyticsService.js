
const logger = require('@utils/logger')

// In-memory storage for basic analytics (consider using Redis in production)
const analytics = {
    dailyStats: new Map(),
    monthlyStats: new Map(),
    realtimeMetrics: {
        totalUploads: 0,
        totalDeletes: 0,
        totalBytes: 0,
        avgFileSize: 0,
        popularFormats: new Map(),
        uploadErrors: 0,
        lastReset: new Date()
    }
}

/**
 * Log image-related events
 * @param {Object} eventData - Event information
 */
const logImageEvent = async (eventData) => {
    try {
        const today = new Date().toISOString().split('T')[0]
        const month = new Date().toISOString().slice(0, 7)

        // Update daily stats
        if (!analytics.dailyStats.has(today)) {
            analytics.dailyStats.set(today, {
                date: today,
                uploads: 0,
                deletes: 0,
                totalBytes: 0,
                formats: new Map(),
                errors: 0
            })
        }

        const dayStats = analytics.dailyStats.get(today)

        // Update monthly stats
        if (!analytics.monthlyStats.has(month)) {
            analytics.monthlyStats.set(month, {
                month: month,
                uploads: 0,
                deletes: 0,
                totalBytes: 0,
                formats: new Map(),
                errors: 0
            })
        }

        const monthStats = analytics.monthlyStats.get(month)

        // Process event
        switch (eventData.type) {
            case 'upload':
                dayStats.uploads++
                monthStats.uploads++
                analytics.realtimeMetrics.totalUploads++

                if (eventData.bytes) {
                    dayStats.totalBytes += eventData.bytes
                    monthStats.totalBytes += eventData.bytes
                    analytics.realtimeMetrics.totalBytes += eventData.bytes
                    analytics.realtimeMetrics.avgFileSize =
                        analytics.realtimeMetrics.totalBytes / analytics.realtimeMetrics.totalUploads
                }

                if (eventData.format) {
                    // Track format popularity
                    dayStats.formats.set(eventData.format, (dayStats.formats.get(eventData.format) || 0) + 1)
                    monthStats.formats.set(eventData.format, (monthStats.formats.get(eventData.format) || 0) + 1)
                    analytics.realtimeMetrics.popularFormats.set(
                        eventData.format,
                        (analytics.realtimeMetrics.popularFormats.get(eventData.format) || 0) + 1
                    )
                }

                if (eventData.notificationType === 'upload_error') {
                    dayStats.errors++
                    monthStats.errors++
                    analytics.realtimeMetrics.uploadErrors++
                }

                break

            case 'delete':
                dayStats.deletes++
                monthStats.deletes++
                analytics.realtimeMetrics.totalDeletes++
                break
        }

        // Cleanup old daily stats (keep only last 30 days)
        cleanupOldStats()

        logger.debug('Image event logged:', {
            type: eventData.type,
            publicId: eventData.publicId,
            date: today
        })

    } catch (error) {
        logger.error('Error logging image event:', error)
    }
}

/**
 * Update Cloudinary usage statistics
 * @param {string} type - Usage type (upload, transformation, etc.)
 * @param {number} amount - Usage amount
 */
const updateCloudinaryUsage = async (type, amount = 0) => {
    try {
        const today = new Date().toISOString().split('T')[0]

        if (!analytics.dailyStats.has(today)) {
            analytics.dailyStats.set(today, {
                date: today,
                uploads: 0,
                deletes: 0,
                totalBytes: 0,
                transformations: 0,
                bandwidth: 0,
                formats: new Map(),
                errors: 0
            })
        }

        const dayStats = analytics.dailyStats.get(today)

        switch (type) {
            case 'bandwidth':
                dayStats.bandwidth = (dayStats.bandwidth || 0) + amount
                break
            case 'transformation':
                dayStats.transformations = (dayStats.transformations || 0) + 1
                break
            case 'upload':
                // Already handled in logImageEvent
                break
        }

    } catch (error) {
        logger.error('Error updating Cloudinary usage:', error)
    }
}

/**
 * Get analytics dashboard data
 * @param {string} period - Time period (day, week, month)
 * @returns {Object} Dashboard data
 */
const getDashboardData = async (period = 'week') => {
    try {
        const now = new Date()
        let startDate, endDate

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
                break
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                endDate = now
                break
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                break
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                endDate = now
        }

        // Aggregate data for the period
        const periodData = aggregateDataForPeriod(startDate, endDate)

        // Get top formats
        const topFormats = getTopFormats(period)

        // Calculate trends
        const trends = calculateTrends(period)

        return {
            period,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            summary: {
                totalUploads: periodData.uploads,
                totalDeletes: periodData.deletes,
                totalBytes: periodData.totalBytes,
                avgFileSize: periodData.uploads > 0 ? periodData.totalBytes / periodData.uploads : 0,
                errorRate: periodData.uploads > 0 ? (periodData.errors / periodData.uploads) * 100 : 0
            },
            topFormats,
            trends,
            realtime: {
                ...analytics.realtimeMetrics,
                popularFormats: Object.fromEntries(analytics.realtimeMetrics.popularFormats)
            },
            dailyBreakdown: getDailyBreakdown(startDate, endDate)
        }

    } catch (error) {
        logger.error('Error getting dashboard data:', error)
        throw error
    }
}

/**
 * Get performance metrics
 * @returns {Object} Performance metrics
 */
const getPerformanceMetrics = async () => {
    try {
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const todayStats = analytics.dailyStats.get(today) || {}
        const yesterdayStats = analytics.dailyStats.get(yesterday) || {}

        // Calculate performance metrics
        const metrics = {
            uploadSuccess: {
                today: todayStats.uploads - (todayStats.errors || 0),
                yesterday: yesterdayStats.uploads - (yesterdayStats.errors || 0),
                successRate: todayStats.uploads > 0 ?
                    ((todayStats.uploads - (todayStats.errors || 0)) / todayStats.uploads) * 100 : 100
            },
            avgFileSize: {
                today: todayStats.uploads > 0 ? todayStats.totalBytes / todayStats.uploads : 0,
                yesterday: yesterdayStats.uploads > 0 ? yesterdayStats.totalBytes / yesterdayStats.uploads : 0
            },
            totalStorage: analytics.realtimeMetrics.totalBytes,
            compressionSavings: calculateCompressionSavings()
        }

        return metrics

    } catch (error) {
        logger.error('Error getting performance metrics:', error)
        throw error
    }
}

/**
 * Export analytics data
 * @param {string} format - Export format (json, csv)
 * @param {string} period - Time period
 * @returns {Object|string} Exported data
 */
const exportAnalytics = async (format = 'json', period = 'month') => {
    try {
        const dashboardData = await getDashboardData(period)

        if (format === 'csv') {
            return convertAnalyticsToCSV(dashboardData)
        }

        return {
            exportedAt: new Date().toISOString(),
            format,
            period,
            data: dashboardData
        }

    } catch (error) {
        logger.error('Error exporting analytics:', error)
        throw error
    }
}

/**
 * Reset analytics data (admin function)
 */
const resetAnalytics = async () => {
    try {
        analytics.dailyStats.clear()
        analytics.monthlyStats.clear()
        analytics.realtimeMetrics = {
            totalUploads: 0,
            totalDeletes: 0,
            totalBytes: 0,
            avgFileSize: 0,
            popularFormats: new Map(),
            uploadErrors: 0,
            lastReset: new Date()
        }

        logger.info('Analytics data reset')
        return { success: true, resetAt: new Date() }

    } catch (error) {
        logger.error('Error resetting analytics:', error)
        throw error
    }
}

// Helper functions

const cleanupOldStats = () => {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const cutoffString = cutoffDate.toISOString().split('T')[0]

    for (const [date] of analytics.dailyStats) {
        if (date < cutoffString) {
            analytics.dailyStats.delete(date)
        }
    }

    // Keep only last 12 months for monthly stats
    const cutoffMonth = new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000)
    const cutoffMonthString = cutoffMonth.toISOString().slice(0, 7)

    for (const [month] of analytics.monthlyStats) {
        if (month < cutoffMonthString) {
            analytics.monthlyStats.delete(month)
        }
    }
}

const aggregateDataForPeriod = (startDate, endDate) => {
    const result = {
        uploads: 0,
        deletes: 0,
        totalBytes: 0,
        errors: 0,
        formats: new Map()
    }

    for (const [date, stats] of analytics.dailyStats) {
        const statDate = new Date(date)
        if (statDate >= startDate && statDate <= endDate) {
            result.uploads += stats.uploads || 0
            result.deletes += stats.deletes || 0
            result.totalBytes += stats.totalBytes || 0
            result.errors += stats.errors || 0

            // Merge formats
            if (stats.formats) {
                for (const [format, count] of stats.formats) {
                    result.formats.set(format, (result.formats.get(format) || 0) + count)
                }
            }
        }
    }

    return result
}

const getTopFormats = (period) => {
    const formatCounts = new Map()

    const cutoffDate = new Date(Date.now() - (period === 'day' ? 1 : period === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000)
    const cutoffString = cutoffDate.toISOString().split('T')[0]

    for (const [date, stats] of analytics.dailyStats) {
        if (date >= cutoffString && stats.formats) {
            for (const [format, count] of stats.formats) {
                formatCounts.set(format, (formatCounts.get(format) || 0) + count)
            }
        }
    }

    return Array.from(formatCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([format, count]) => ({ format, count }))
}

const calculateTrends = (period) => {
    const days = period === 'day' ? 1 : period === 'week' ? 7 : 30
    const previousPeriodStart = new Date(Date.now() - 2 * days * 24 * 60 * 60 * 1000)
    const currentPeriodStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const currentData = aggregateDataForPeriod(currentPeriodStart, new Date())
    const previousData = aggregateDataForPeriod(previousPeriodStart, currentPeriodStart)

    const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
    }

    return {
        uploads: calculateChange(currentData.uploads, previousData.uploads),
        deletes: calculateChange(currentData.deletes, previousData.deletes),
        storage: calculateChange(currentData.totalBytes, previousData.totalBytes),
        errors: calculateChange(currentData.errors, previousData.errors)
    }
}

const getDailyBreakdown = (startDate, endDate) => {
    const breakdown = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0]
        const stats = analytics.dailyStats.get(dateString) || {
            uploads: 0,
            deletes: 0,
            totalBytes: 0,
            errors: 0
        }

        breakdown.push({
            date: dateString,
            ...stats,
            formats: stats.formats ? Object.fromEntries(stats.formats) : {}
        })

        currentDate.setDate(currentDate.getDate() + 1)
    }

    return breakdown
}

const calculateCompressionSavings = () => {
    // This would require tracking original vs optimized file sizes
    // For now, return a placeholder calculation
    const totalOptimized = analytics.realtimeMetrics.totalBytes
    const estimatedOriginalSize = totalOptimized * 1.3 // Assume 30% compression on average

    return {
        originalEstimate: estimatedOriginalSize,
        optimized: totalOptimized,
        savings: estimatedOriginalSize - totalOptimized,
        savingsPercent: ((estimatedOriginalSize - totalOptimized) / estimatedOriginalSize) * 100
    }
}

const convertAnalyticsToCSV = (data) => {
    const { dailyBreakdown } = data

    const headers = 'Date,Uploads,Deletes,Total Bytes,Errors,JPG,PNG,GIF,WebP\n'
    const rows = dailyBreakdown.map(day => {
        const formats = day.formats || {}
        return [
            day.date,
            day.uploads || 0,
            day.deletes || 0,
            day.totalBytes || 0,
            day.errors || 0,
            formats.jpg || 0,
            formats.png || 0,
            formats.gif || 0,
            formats.webp || 0
        ].join(',')
    }).join('\n')

    return headers + rows
}

module.exports = {
    logImageEvent,
    updateCloudinaryUsage,
    getDashboardData,
    getPerformanceMetrics,
    exportAnalytics,
    resetAnalytics
}