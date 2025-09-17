const { cloudinary, deleteImages } = require('@services/cloudinaryService')
const ImageProcessingService = require('@services/imageProcessingService')
const { asyncHandler, badRequest, notFound } = require('@utils/errorUtils')
const logger = require('@utils/logger')

// Import models for reference checking
const Restaurant = require('@models/restaurant')
const Menu = require('@models/menu')
const MenuItem = require('@models/menuItem')
const Profile = require('@models/profile')

/**
 * Get comprehensive image statistics
 */
const getImageStats = asyncHandler(async (req, res) => {
    try {
        // Get Cloudinary usage statistics
        const usage = await cloudinary.api.usage()

        // Get resource counts by type
        const [
            restaurantImages,
            menuImages,
            menuItemImages,
            profileImages,
            qrCodeImages
        ] = await Promise.all([
            cloudinary.search.expression('folder:qrbites/restaurants').execute(),
            cloudinary.search.expression('folder:qrbites/menus').execute(),
            cloudinary.search.expression('folder:qrbites/menu-items').execute(),
            cloudinary.search.expression('folder:qrbites/profiles').execute(),
            cloudinary.search.expression('folder:qrbites/qrcodes').execute()
        ])

        // Database counts for reference
        const dbCounts = await Promise.all([
            Restaurant.countDocuments({ $or: [{ logo: { $exists: true } }, { banner: { $exists: true } }] }),
            Menu.countDocuments({ image: { $exists: true } }),
            MenuItem.countDocuments({ image: { $exists: true } }),
            Profile.countDocuments({ avatar: { $exists: true } })
        ])

        const stats = {
            cloudinaryUsage: {
                plan: usage.plan,
                credits: usage.credits,
                creditUsagePercent: (usage.credits.usage / usage.credits.limit) * 100,
                storage: {
                    used: usage.storage.usage,
                    limit: usage.storage.limit,
                    usagePercent: (usage.storage.usage / usage.storage.limit) * 100
                },
                bandwidth: {
                    used: usage.bandwidth.usage,
                    limit: usage.bandwidth.limit,
                    usagePercent: (usage.bandwidth.usage / usage.bandwidth.limit) * 100
                },
                transformations: {
                    used: usage.transformations.usage,
                    limit: usage.transformations.limit,
                    usagePercent: (usage.transformations.usage / usage.transformations.limit) * 100
                }
            },
            imagesByType: {
                restaurants: {
                    cloudinary: restaurantImages.total_count,
                    database: dbCounts[0],
                    difference: restaurantImages.total_count - dbCounts[0]
                },
                menus: {
                    cloudinary: menuImages.total_count,
                    database: dbCounts[1],
                    difference: menuImages.total_count - dbCounts[1]
                },
                menuItems: {
                    cloudinary: menuItemImages.total_count,
                    database: dbCounts[2],
                    difference: menuItemImages.total_count - dbCounts[2]
                },
                profiles: {
                    cloudinary: profileImages.total_count,
                    database: dbCounts[3],
                    difference: profileImages.total_count - dbCounts[3]
                },
                qrCodes: {
                    cloudinary: qrCodeImages.total_count
                }
            },
            summary: {
                totalImages: restaurantImages.total_count + menuImages.total_count +
                    menuItemImages.total_count + profileImages.total_count + qrCodeImages.total_count,
                orphanedImages: Math.max(0,
                    (restaurantImages.total_count - dbCounts[0]) +
                    (menuImages.total_count - dbCounts[1]) +
                    (menuItemImages.total_count - dbCounts[2]) +
                    (profileImages.total_count - dbCounts[3])
                )
            }
        }

        res.json({
            success: true,
            data: stats
        })

    } catch (error) {
        logger.error('Error getting image stats:', error)
        throw error
    }
})

/**
 * Find orphaned images (in Cloudinary but not referenced in database)
 */
const findOrphanedImages = asyncHandler(async (req, res) => {
    const { type, limit = 50, cursor } = req.query

    try {
        // Build search expression
        let searchExpression = 'resource_type:image'

        if (type && type !== 'all') {
            searchExpression += ` AND folder:qrbites/${type}*`
        } else {
            searchExpression += ' AND folder:qrbites/*'
        }

        // Execute search
        const searchOptions = {
            expression: searchExpression,
            sort_by: [['created_at', 'desc']],
            max_results: parseInt(limit)
        }

        if (cursor) {
            searchOptions.next_cursor = cursor
        }

        const cloudinaryResults = await cloudinary.search.execute(searchOptions)

        // Check which images are not referenced in database
        const orphanedImages = []

        for (const image of cloudinaryResults.resources) {
            const publicId = image.public_id

            // Check if image is referenced in any model
            const isReferenced = await Promise.all([
                Restaurant.exists({
                    $or: [
                        { logoPublicId: publicId },
                        { bannerPublicId: publicId },
                        { 'gallery.publicId': publicId }
                    ]
                }),
                Menu.exists({ imagePublicId: publicId }),
                MenuItem.exists({ imagePublicId: publicId }),
                Profile.exists({ avatarPublicId: publicId })
            ])

            // If not referenced anywhere, it's orphaned
            if (!isReferenced.some(Boolean)) {
                orphanedImages.push({
                    publicId: image.public_id,
                    url: image.secure_url,
                    format: image.format,
                    width: image.width,
                    height: image.height,
                    bytes: image.bytes,
                    createdAt: image.created_at,
                    folder: image.folder,
                    tags: image.tags
                })
            }
        }

        res.json({
            success: true,
            data: {
                orphanedImages,
                totalFound: orphanedImages.length,
                nextCursor: cloudinaryResults.next_cursor,
                hasMore: !!cloudinaryResults.next_cursor
            }
        })

    } catch (error) {
        logger.error('Error finding orphaned images:', error)
        throw error
    }
})

/**
 * Clean up orphaned images
 */
const cleanupOrphanedImages = asyncHandler(async (req, res) => {
    const { publicIds, confirmDeletion } = req.body

    if (!confirmDeletion) {
        throw badRequest('confirmDeletion must be true to proceed with cleanup')
    }

    if (!Array.isArray(publicIds) || publicIds.length === 0) {
        throw badRequest('publicIds array is required and must not be empty')
    }

    try {
        // Double-check that images are indeed orphaned before deletion
        const safeToDelete = []

        for (const publicId of publicIds) {
            const isReferenced = await Promise.all([
                Restaurant.exists({
                    $or: [
                        { logoPublicId: publicId },
                        { bannerPublicId: publicId },
                        { 'gallery.publicId': publicId }
                    ]
                }),
                Menu.exists({ imagePublicId: publicId }),
                MenuItem.exists({ imagePublicId: publicId }),
                Profile.exists({ avatarPublicId: publicId })
            ])

            if (!isReferenced.some(Boolean)) {
                safeToDelete.push(publicId)
            } else {
                logger.warn(`Image ${publicId} is referenced and will not be deleted`)
            }
        }

        // Delete the confirmed orphaned images
        const deleteResults = await deleteImages(safeToDelete)

        const summary = {
            requested: publicIds.length,
            safeToDelete: safeToDelete.length,
            actuallyDeleted: deleteResults.filter(r => r.success).length,
            errors: deleteResults.filter(r => !r.success)
        }

        logger.info(`Orphaned image cleanup completed:`, summary)

        res.json({
            success: true,
            message: 'Orphaned image cleanup completed',
            data: summary
        })

    } catch (error) {
        logger.error('Error cleaning up orphaned images:', error)
        throw error
    }
})

/**
 * Get detailed image information
 */
const getImageDetails = asyncHandler(async (req, res) => {
    const { publicId } = req.params

    if (!publicId) {
        throw badRequest('Public ID is required')
    }

    try {
        // Get detailed information from Cloudinary
        const analytics = await ImageProcessingService.getAdvancedAnalytics(publicId)

        // Find database references
        const references = await findImageReferences(publicId)

        res.json({
            success: true,
            data: {
                ...analytics,
                references
            }
        })

    } catch (error) {
        if (error.http_code === 404) {
            throw notFound('Image not found')
        }
        logger.error('Error getting image details:', error)
        throw error
    }
})

/**
 * Optimize images in bulk
 */
const optimizeImages = asyncHandler(async (req, res) => {
    const { type, limit = 10 } = req.body

    try {
        // Find images to optimize based on criteria
        let searchExpression = 'resource_type:image AND bytes>500000' // > 500KB

        if (type && type !== 'all') {
            searchExpression += ` AND folder:qrbites/${type}*`
        }

        const searchResults = await cloudinary.search
            .expression(searchExpression)
            .sort_by('bytes', 'desc')
            .max_results(limit)
            .execute()

        // Process images for optimization
        const optimizationResults = await ImageProcessingService.batchProcess(
            searchResults.resources.map(r => r.public_id),
            async (publicId) => {
                // Create optimized version
                const optimizedUrl = ImageProcessingService.generateImageVariations(publicId, {
                    entityType: 'general'
                })

                return {
                    publicId,
                    originalSize: searchResults.resources.find(r => r.public_id === publicId).bytes,
                    optimizedUrls: optimizedUrl
                }
            },
            {
                concurrency: 3,
                onProgress: (processed, total) => {
                    logger.info(`Optimization progress: ${processed}/${total}`)
                }
            }
        )

        const successful = optimizationResults.filter(r => r.success)
        const failed = optimizationResults.filter(r => !r.success)

        res.json({
            success: true,
            message: 'Bulk optimization completed',
            data: {
                processed: optimizationResults.length,
                successful: successful.length,
                failed: failed.length,
                results: successful.map(r => r.result),
                errors: failed.map(r => ({ publicId: r.publicId, error: r.error }))
            }
        })

    } catch (error) {
        logger.error('Error optimizing images:', error)
        throw error
    }
})

/**
 * Generate image reports
 */
const generateImageReport = asyncHandler(async (req, res) => {
    const { reportType = 'summary', format = 'json' } = req.query

    try {
        let report = {}

        switch (reportType) {
            case 'usage':
                report = await generateUsageReport()
                break
            case 'optimization':
                report = await generateOptimizationReport()
                break
            case 'errors':
                report = await generateErrorReport()
                break
            default:
                report = await generateSummaryReport()
        }

        if (format === 'csv') {
            // Convert to CSV format
            const csv = convertToCSV(report)
            res.setHeader('Content-Type', 'text/csv')
            res.setHeader('Content-Disposition', `attachment; filename="image-report-${reportType}.csv"`)
            return res.send(csv)
        }

        res.json({
            success: true,
            data: report
        })

    } catch (error) {
        logger.error('Error generating image report:', error)
        throw error
    }
})

// Helper function to find image references in database
const findImageReferences = async (publicId) => {
    const references = {
        restaurants: [],
        menus: [],
        menuItems: [],
        profiles: []
    }

    try {
        // Find restaurants
        const restaurants = await Restaurant.find({
            $or: [
                { logoPublicId: publicId },
                { bannerPublicId: publicId },
                { 'gallery.publicId': publicId }
            ]
        }).select('name logoPublicId bannerPublicId gallery')

        restaurants.forEach(restaurant => {
            const ref = { id: restaurant._id, name: restaurant.name, usedAs: [] }

            if (restaurant.logoPublicId === publicId) ref.usedAs.push('logo')
            if (restaurant.bannerPublicId === publicId) ref.usedAs.push('banner')
            if (restaurant.gallery?.some(g => g.publicId === publicId)) ref.usedAs.push('gallery')

            references.restaurants.push(ref)
        })

        // Find menus
        const menus = await Menu.find({ imagePublicId: publicId })
            .select('name restaurantId')
            .populate('restaurantId', 'name')

        references.menus = menus.map(menu => ({
            id: menu._id,
            name: menu.name,
            restaurant: menu.restaurantId?.name,
            usedAs: ['image']
        }))

        // Find menu items
        const menuItems = await MenuItem.find({ imagePublicId: publicId })
            .select('name menuId')
            .populate({
                path: 'menuId',
                select: 'name restaurantId',
                populate: { path: 'restaurantId', select: 'name' }
            })

        references.menuItems = menuItems.map(item => ({
            id: item._id,
            name: item.name,
            menu: item.menuId?.name,
            restaurant: item.menuId?.restaurantId?.name,
            usedAs: ['image']
        }))

        // Find profiles
        const profiles = await Profile.find({ avatarPublicId: publicId })
            .select('firstName lastName userId')
            .populate('userId', 'email')

        references.profiles = profiles.map(profile => ({
            id: profile._id,
            name: `${profile.firstName} ${profile.lastName}`.trim(),
            email: profile.userId?.email,
            usedAs: ['avatar']
        }))

    } catch (error) {
        logger.error('Error finding image references:', error)
    }

    return references
}

// Helper functions for reports
const generateUsageReport = async () => {
    const usage = await cloudinary.api.usage()
    return {
        reportType: 'usage',
        generatedAt: new Date(),
        usage
    }
}

const generateOptimizationReport = async () => {
    // Find large images that could be optimized
    const largeImages = await cloudinary.search
        .expression('resource_type:image AND bytes>1000000') // > 1MB
        .sort_by('bytes', 'desc')
        .max_results(100)
        .execute()

    return {
        reportType: 'optimization',
        generatedAt: new Date(),
        totalLargeImages: largeImages.total_count,
        images: largeImages.resources.map(img => ({
            publicId: img.public_id,
            url: img.secure_url,
            bytes: img.bytes,
            format: img.format,
            dimensions: `${img.width}x${img.height}`
        }))
    }
}

const generateErrorReport = async () => {
    // This would typically come from error logs or a separate error tracking system
    return {
        reportType: 'errors',
        generatedAt: new Date(),
        message: 'Error tracking not implemented yet'
    }
}

const generateSummaryReport = async () => {
    const usage = await cloudinary.api.usage()

    return {
        reportType: 'summary',
        generatedAt: new Date(),
        usage: {
            storage: usage.storage,
            bandwidth: usage.bandwidth,
            transformations: usage.transformations
        }
    }
}

// Helper function to convert report to CSV
const convertToCSV = (data) => {
    // Simple CSV conversion - you might want to use a library like 'csv-writer' for complex data
    if (data.images) {
        const headers = 'Public ID,URL,Size (bytes),Format,Dimensions\n'
        const rows = data.images.map(img =>
            `"${img.publicId}","${img.url}","${img.bytes}","${img.format}","${img.dimensions}"`
        ).join('\n')
        return headers + rows
    }

    return 'No CSV data available for this report type'
}

module.exports = {
    getImageStats,
    findOrphanedImages,
    cleanupOrphanedImages,
    getImageDetails,
    optimizeImages,
    generateImageReport
}