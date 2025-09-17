require('dotenv').config()
require('module-alias/register')
require('../aliases')

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const { uploadBuffer, deleteImage } = require('../src/services/cloudinaryService')
const logger = require('../src/utils/logger')

// Import models
const User = require('../src/models/user')
const Restaurant = require('../src/models/restaurant')
const Menu = require('../src/models/menu')
const MenuItem = require('../src/models/menuItem')
const Profile = require('../src/models/profile')

// Migration statistics
const stats = {
    totalFiles: 0,
    migrated: 0,
    failed: 0,
    skipped: 0,
    errors: []
}

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ Connected to MongoDB')
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error)
        process.exit(1)
    }
}

// Check if file exists locally
const fileExists = (filePath) => {
    try {
        return fs.existsSync(filePath)
    } catch (error) {
        return false
    }
}

// Get file buffer from local path
const getFileBuffer = async (localPath) => {
    try {
        const fullPath = path.join(process.cwd(), localPath.replace(/^\//, ''))
        if (!fileExists(fullPath)) {
            throw new Error(`File not found: ${fullPath}`)
        }
        return fs.readFileSync(fullPath)
    } catch (error) {
        throw error
    }
}

// Migrate a single file to Cloudinary
const migrateFile = async (localUrl, type, entityId, entityName = '') => {
    try {
        stats.totalFiles++

        // Skip if already a Cloudinary URL
        if (!localUrl || localUrl.includes('cloudinary.com') || localUrl.includes('res.cloudinary.com')) {
            stats.skipped++
            logger.info(`⏭️  Skipping already migrated file: ${entityName}`)
            return { url: localUrl, publicId: extractPublicIdFromUrl(localUrl) }
        }

        // Get file buffer
        const buffer = await getFileBuffer(localUrl)

        // Generate public ID
        const publicId = `${type}_${entityId}_${Date.now()}`

        // Upload to Cloudinary
        const result = await uploadBuffer(buffer, {
            folder: `qrbites/${type}s`,
            publicId,
            tags: ['migration', type, entityId.toString()]
        })

        stats.migrated++
        logger.success(`✅ Migrated: ${entityName} -> ${result.publicId}`)

        return {
            url: result.url,
            publicId: result.publicId,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
        }

    } catch (error) {
        stats.failed++
        stats.errors.push({
            file: localUrl,
            entity: entityName,
            error: error.message
        })
        logger.error(`❌ Failed to migrate ${entityName}:`, error.message)
        return null
    }
}

// Extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null

    try {
        const regex = /\/(?:v\d+\/)?([^\.]+)/
        const match = url.match(regex)
        return match ? match[1] : null
    } catch (error) {
        return null
    }
}

// Migrate restaurant images
const migrateRestaurants = async (dryRun = false) => {
    logger.info('🏪 Starting restaurant image migration...')

    const restaurants = await Restaurant.find({
        $or: [
            { logo: { $exists: true, $ne: null } },
            { banner: { $exists: true, $ne: null } },
            { 'gallery.0': { $exists: true } }
        ]
    })

    logger.info(`Found ${restaurants.length} restaurants with images`)

    for (const restaurant of restaurants) {
        logger.info(`\n🔄 Processing: ${restaurant.name}`)

        // Migrate logo
        if (restaurant.logo) {
            const result = await migrateFile(
                restaurant.logo,
                'restaurant',
                restaurant._id,
                `${restaurant.name} (logo)`
            )

            if (result && !dryRun) {
                restaurant.logo = result.url
                restaurant.logoPublicId = result.publicId
            }
        }

        // Migrate banner
        if (restaurant.banner) {
            const result = await migrateFile(
                restaurant.banner,
                'restaurant',
                restaurant._id,
                `${restaurant.name} (banner)`
            )

            if (result && !dryRun) {
                restaurant.banner = result.url
                restaurant.bannerPublicId = result.publicId
            }
        }

        // Migrate gallery images
        if (restaurant.gallery && restaurant.gallery.length > 0) {
            const migratedGallery = []

            for (let i = 0; i < restaurant.gallery.length; i++) {
                const galleryItem = restaurant.gallery[i]
                const imageUrl = typeof galleryItem === 'string' ? galleryItem : galleryItem.url

                if (imageUrl) {
                    const result = await migrateFile(
                        imageUrl,
                        'restaurant',
                        restaurant._id,
                        `${restaurant.name} (gallery ${i + 1})`
                    )

                    if (result) {
                        migratedGallery.push({
                            url: result.url,
                            publicId: result.publicId,
                            width: result.width,
                            height: result.height,
                            caption: galleryItem.caption || ''
                        })
                    }
                }
            }

            if (migratedGallery.length > 0 && !dryRun) {
                restaurant.gallery = migratedGallery
            }
        }

        // Save restaurant if not dry run
        if (!dryRun) {
            await restaurant.save()
            logger.info(`💾 Updated restaurant: ${restaurant.name}`)
        }
    }
}

// Migrate menu images
const migrateMenus = async (dryRun = false) => {
    logger.info('📋 Starting menu image migration...')

    const menus = await Menu.find({
        image: { $exists: true, $ne: null }
    }).populate('restaurantId', 'name')

    logger.info(`Found ${menus.length} menus with images`)

    for (const menu of menus) {
        const restaurantName = menu.restaurantId ? menu.restaurantId.name : 'Unknown'

        const result = await migrateFile(
            menu.image,
            'menu',
            menu._id,
            `${restaurantName} - ${menu.name}`
        )

        if (result && !dryRun) {
            menu.image = result.url
            menu.imagePublicId = result.publicId
            await menu.save()
            logger.info(`💾 Updated menu: ${menu.name}`)
        }
    }
}

// Migrate menu item images
const migrateMenuItems = async (dryRun = false) => {
    logger.info('🍕 Starting menu item image migration...')

    const menuItems = await MenuItem.find({
        image: { $exists: true, $ne: null }
    }).populate({
        path: 'menuId',
        populate: { path: 'restaurantId', select: 'name' }
    })

    logger.info(`Found ${menuItems.length} menu items with images`)

    for (const menuItem of menuItems) {
        const restaurantName = menuItem.menuId?.restaurantId?.name || 'Unknown'
        const menuName = menuItem.menuId?.name || 'Unknown Menu'

        const result = await migrateFile(
            menuItem.image,
            'menuItem',
            menuItem._id,
            `${restaurantName} - ${menuName} - ${menuItem.name}`
        )

        if (result && !dryRun) {
            menuItem.image = result.url
            menuItem.imagePublicId = result.publicId
            await menuItem.save()
            logger.info(`💾 Updated menu item: ${menuItem.name}`)
        }
    }
}

// Migrate profile avatars
const migrateProfiles = async (dryRun = false) => {
    logger.info('👤 Starting profile avatar migration...')

    const profiles = await Profile.find({
        avatar: { $exists: true, $ne: null }
    }).populate('userId', 'email')

    logger.info(`Found ${profiles.length} profiles with avatars`)

    for (const profile of profiles) {
        const userEmail = profile.userId ? profile.userId.email : 'Unknown'

        const result = await migrateFile(
            profile.avatar,
            'profile',
            profile._id,
            `Profile: ${userEmail}`
        )

        if (result && !dryRun) {
            profile.avatar = result.url
            profile.avatarPublicId = result.publicId
            await profile.save()
            logger.info(`💾 Updated profile: ${userEmail}`)
        }
    }
}

// Cleanup old local files (optional)
const cleanupLocalFiles = async (confirm = false) => {
    if (!confirm) {
        logger.warn('⚠️  Cleanup requires explicit confirmation. Use --cleanup-confirm flag.')
        return
    }

    logger.info('🧹 Starting local file cleanup...')

    const uploadsDir = path.join(process.cwd(), 'uploads')

    if (!fs.existsSync(uploadsDir)) {
        logger.info('No uploads directory found. Nothing to clean up.')
        return
    }

    try {
        // Get all subdirectories
        const subdirs = fs.readdirSync(uploadsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)

        let cleanedFiles = 0

        for (const subdir of subdirs) {
            const subdirPath = path.join(uploadsDir, subdir)
            const files = fs.readdirSync(subdirPath)

            for (const file of files) {
                const filePath = path.join(subdirPath, file)
                fs.unlinkSync(filePath)
                cleanedFiles++
            }

            // Remove empty directory
            fs.rmdirSync(subdirPath)
        }

        // Remove uploads directory if empty
        const remainingContents = fs.readdirSync(uploadsDir)
        if (remainingContents.length === 0) {
            fs.rmdirSync(uploadsDir)
        }

        logger.success(`🗑️  Cleaned up ${cleanedFiles} local files`)

    } catch (error) {
        logger.error('Error during cleanup:', error)
    }
}

// Generate migration report
const generateReport = () => {
    logger.info('\n📊 Migration Report:')
    logger.info('='.repeat(50))
    logger.info(`Total files processed: ${stats.totalFiles}`)
    logger.info(`✅ Successfully migrated: ${stats.migrated}`)
    logger.info(`⏭️  Skipped (already migrated): ${stats.skipped}`)
    logger.info(`❌ Failed: ${stats.failed}`)

    if (stats.errors.length > 0) {
        logger.info('\n❌ Errors:')
        stats.errors.forEach((error, index) => {
            logger.error(`${index + 1}. ${error.entity}: ${error.error}`)
        })
    }

    const successRate = stats.totalFiles > 0 ? ((stats.migrated / stats.totalFiles) * 100).toFixed(2) : 0
    logger.info(`\n📈 Success Rate: ${successRate}%`)

    // Save detailed report to file
    const reportPath = path.join(process.cwd(), 'migration-report.json')
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        stats,
        errors: stats.errors
    }, null, 2))

    logger.info(`📋 Detailed report saved to: ${reportPath}`)
}

// Main migration function
const runMigration = async (options = {}) => {
    const {
        dryRun = false,
        types = ['restaurants', 'menus', 'menuItems', 'profiles'],
        cleanup = false,
        cleanupConfirm = false
    } = options

    logger.info('🚀 Starting QrBites to Cloudinary Migration')
    logger.info(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`)
    logger.info(`Types: ${types.join(', ')}`)

    try {
        await connectDB()

        // Run migrations based on specified types
        if (types.includes('restaurants')) {
            await migrateRestaurants(dryRun)
        }

        if (types.includes('menus')) {
            await migrateMenus(dryRun)
        }

        if (types.includes('menuItems')) {
            await migrateMenuItems(dryRun)
        }

        if (types.includes('profiles')) {
            await migrateProfiles(dryRun)
        }

        // Cleanup local files if requested
        if (cleanup) {
            await cleanupLocalFiles(cleanupConfirm)
        }

        generateReport()

        if (dryRun) {
            logger.info('\n🔍 This was a DRY RUN. No changes were made to the database.')
            logger.info('Run without --dry-run flag to perform actual migration.')
        } else {
            logger.success('\n🎉 Migration completed!')
        }

    } catch (error) {
        logger.error('Migration failed:', error)
        process.exit(1)
    } finally {
        await mongoose.connection.close()
    }
}

// CLI interface
const main = async () => {
    const args = process.argv.slice(2)

    const options = {
        dryRun: args.includes('--dry-run'),
        cleanup: args.includes('--cleanup'),
        cleanupConfirm: args.includes('--cleanup-confirm'),
        types: ['restaurants', 'menus', 'menuItems', 'profiles']
    }

    // Parse specific types if provided
    const typesIndex = args.indexOf('--types')
    if (typesIndex !== -1 && args[typesIndex + 1]) {
        options.types = args[typesIndex + 1].split(',')
    }

    // Show help
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
QrBites Cloudinary Migration Script

Usage: node scripts/migrateToCloudinary.js [options]

Options:
  --dry-run              Run without making changes (preview mode)
  --types TYPE1,TYPE2    Specify which types to migrate (restaurants,menus,menuItems,profiles)
  --cleanup              Remove local files after successful migration
  --cleanup-confirm      Required flag to confirm file cleanup
  --help, -h             Show this help message

Examples:
  # Dry run to preview what will be migrated
  node scripts/migrateToCloudinary.js --dry-run
  
  # Migrate only restaurants and menus
  node scripts/migrateToCloudinary.js --types restaurants,menus
  
  # Full migration with local file cleanup
  node scripts/migrateToCloudinary.js --cleanup --cleanup-confirm
  
  # Dry run with specific types
  node scripts/migrateToCloudinary.js --dry-run --types restaurants
`)
        process.exit(0)
    }

    await runMigration(options)
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Script failed:', error)
        process.exit(1)
    })
}

module.exports = {
    runMigration,
    migrateFile,
    stats
}