
require('dotenv').config()
require('module-alias/register')
require('../aliases')

const mongoose = require('mongoose')
const logger = require('../src/utils/logger')

// Import all models to ensure they're registered
const User = require('../src/models/user')
const Restaurant = require('../src/models/restaurant')
const Menu = require('../src/models/menu')
const MenuItem = require('../src/models/menuItem')
const Profile = require('../src/models/profile')

/**
 * Database optimization strategies and index management
 */
class DatabaseOptimizer {

    constructor() {
        this.optimizations = []
        this.indexCreationResults = []
        this.queryAnalysis = []
    }

    /**
     * Initialize database connection
     */
    async connect() {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                bufferCommands: false,
                bufferMaxEntries: 0
            })

            logger.info('✅ Connected to MongoDB for optimization')
            return true

        } catch (error) {
            logger.error('❌ Failed to connect to MongoDB:', error)
            return false
        }
    }

    /**
     * Create optimized indexes for all collections
     */
    async createOptimizedIndexes() {
        logger.info('🔍 Creating optimized database indexes...')

        const indexDefinitions = {
            // User collection indexes
            users: [
                { fields: { email: 1 }, options: { unique: true, name: 'idx_users_email' } },
                { fields: { createdAt: 1 }, options: { name: 'idx_users_created' } },
                { fields: { isActive: 1 }, options: { name: 'idx_users_active' } },
                { fields: { role: 1 }, options: { name: 'idx_users_role' } },
                { fields: { email: 1, isActive: 1 }, options: { name: 'idx_users_email_active' } }
            ],

            // Profile collection indexes
            profiles: [
                { fields: { userId: 1 }, options: { unique: true, name: 'idx_profiles_user' } },
                { fields: { firstName: 1, lastName: 1 }, options: { name: 'idx_profiles_name' } },
                { fields: { phone: 1 }, options: { sparse: true, name: 'idx_profiles_phone' } }
            ],

            // Restaurant collection indexes
            restaurants: [
                { fields: { ownerId: 1 }, options: { name: 'idx_restaurants_owner' } },
                { fields: { slug: 1 }, options: { unique: true, sparse: true, name: 'idx_restaurants_slug' } },
                { fields: { isActive: 1 }, options: { name: 'idx_restaurants_active' } },
                { fields: { featured: 1 }, options: { name: 'idx_restaurants_featured' } },
                { fields: { cuisine: 1 }, options: { name: 'idx_restaurants_cuisine' } },
                { fields: { 'location.coordinates': '2dsphere' }, options: { name: 'idx_restaurants_location' } },
                { fields: { name: 'text', description: 'text' }, options: { name: 'idx_restaurants_text_search' } },
                { fields: { createdAt: 1 }, options: { name: 'idx_restaurants_created' } },
                { fields: { updatedAt: 1 }, options: { name: 'idx_restaurants_updated' } },
                { fields: { ownerId: 1, isActive: 1 }, options: { name: 'idx_restaurants_owner_active' } },
                { fields: { isActive: 1, featured: 1 }, options: { name: 'idx_restaurants_active_featured' } },
                { fields: { cuisine: 1, isActive: 1 }, options: { name: 'idx_restaurants_cuisine_active' } }
            ],

            // Menu collection indexes
            menus: [
                { fields: { restaurantId: 1 }, options: { name: 'idx_menus_restaurant' } },
                { fields: { isActive: 1 }, options: { name: 'idx_menus_active' } },
                { fields: { createdAt: 1 }, options: { name: 'idx_menus_created' } },
                { fields: { restaurantId: 1, isActive: 1 }, options: { name: 'idx_menus_restaurant_active' } },
                { fields: { name: 'text', description: 'text' }, options: { name: 'idx_menus_text_search' } }
            ],

            // MenuItem collection indexes
            menuitems: [
                { fields: { menuId: 1 }, options: { name: 'idx_menuitems_menu' } },
                { fields: { category: 1 }, options: { name: 'idx_menuitems_category' } },
                { fields: { price: 1 }, options: { name: 'idx_menuitems_price' } },
                { fields: { isAvailable: 1 }, options: { name: 'idx_menuitems_available' } },
                { fields: { createdAt: 1 }, options: { name: 'idx_menuitems_created' } },
                { fields: { menuId: 1, isAvailable: 1 }, options: { name: 'idx_menuitems_menu_available' } },
                { fields: { menuId: 1, category: 1 }, options: { name: 'idx_menuitems_menu_category' } },
                { fields: { price: 1, isAvailable: 1 }, options: { name: 'idx_menuitems_price_available' } },
                { fields: { name: 'text', description: 'text' }, options: { name: 'idx_menuitems_text_search' } }
            ]
        }

        // Create indexes for each collection
        for (const [collectionName, indexes] of Object.entries(indexDefinitions)) {
            logger.info(`\n📊 Creating indexes for ${collectionName}...`)

            try {
                const collection = mongoose.connection.db.collection(collectionName)

                for (const indexDef of indexes) {
                    try {
                        const result = await collection.createIndex(indexDef.fields, indexDef.options)

                        this.indexCreationResults.push({
                            collection: collectionName,
                            index: indexDef.options.name,
                            fields: indexDef.fields,
                            status: 'created',
                            result
                        })

                        logger.info(`  ✅ ${indexDef.options.name}: ${JSON.stringify(indexDef.fields)}`)

                    } catch (error) {
                        if (error.code === 85) { // Index already exists
                            logger.info(`  ⏭️  ${indexDef.options.name}: already exists`)
                        } else {
                            logger.error(`  ❌ ${indexDef.options.name}: ${error.message}`)
                            this.indexCreationResults.push({
                                collection: collectionName,
                                index: indexDef.options.name,
                                status: 'error',
                                error: error.message
                            })
                        }
                    }
                }

            } catch (error) {
                logger.error(`Failed to create indexes for ${collectionName}:`, error)
            }
        }

        logger.info('\n✅ Index creation completed')
    }

    /**
     * Analyze query performance and suggest optimizations
     */
    async analyzeQueryPerformance() {
        logger.info('🔍 Analyzing query performance...')

        try {
            // Enable profiling for slow queries
            await mongoose.connection.db.runCommand({
                profile: 2,
                slowms: 100, // Profile queries slower than 100ms
                sampleRate: 0.5 // Sample 50% of queries
            })

            // Analyze common query patterns
            const analyses = [
                {
                    name: 'Restaurant queries by owner',
                    collection: 'restaurants',
                    pipeline: [
                        { $match: { ownerId: { $exists: true } } },
                        { $group: { _id: '$ownerId', count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 10 }
                    ]
                },
                {
                    name: 'Menu items by restaurant popularity',
                    collection: 'menuitems',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'menus',
                                localField: 'menuId',
                                foreignField: '_id',
                                as: 'menu'
                            }
                        },
                        { $unwind: '$menu' },
                        { $group: { _id: '$menu.restaurantId', itemCount: { $sum: 1 } } },
                        { $sort: { itemCount: -1 } },
                        { $limit: 10 }
                    ]
                },
                {
                    name: 'User activity patterns',
                    collection: 'users',
                    pipeline: [
                        {
                            $group: {
                                _id: {
                                    month: { $month: '$createdAt' },
                                    year: { $year: '$createdAt' }
                                },
                                registrations: { $sum: 1 }
                            }
                        },
                        { $sort: { '_id.year': -1, '_id.month': -1 } },
                        { $limit: 12 }
                    ]
                }
            ]

            for (const analysis of analyses) {
                try {
                    const collection = mongoose.connection.db.collection(analysis.collection)
                    const results = await collection.aggregate(analysis.pipeline).toArray()

                    this.queryAnalysis.push({
                        name: analysis.name,
                        collection: analysis.collection,
                        results: results.slice(0, 5), // Top 5 results
                        timestamp: new Date()
                    })

                    logger.info(`  📈 ${analysis.name}: ${results.length} results`)

                } catch (error) {
                    logger.error(`Analysis failed for ${analysis.name}:`, error)
                }
            }

        } catch (error) {
            logger.error('Query performance analysis failed:', error)
        }
    }

    /**
     * Optimize collection settings and configurations
     */
    async optimizeCollectionSettings() {
        logger.info('⚙️  Optimizing collection settings...')

        const collections = ['users', 'restaurants', 'menus', 'menuitems', 'profiles']

        for (const collectionName of collections) {
            try {
                const collection = mongoose.connection.db.collection(collectionName)

                // Get collection stats
                const stats = await collection.stats()

                this.optimizations.push({
                    collection: collectionName,
                    documentCount: stats.count,
                    avgDocumentSize: stats.avgObjSize,
                    indexCount: stats.nindexes,
                    totalIndexSize: stats.totalIndexSize,
                    storageSize: stats.storageSize,
                    timestamp: new Date()
                })

                logger.info(`  📊 ${collectionName}: ${stats.count} docs, ${stats.nindexes} indexes`)

                // Check for potential optimizations
                if (stats.avgObjSize > 16 * 1024) { // 16KB average
                    logger.warn(`    ⚠️  Large average document size: ${Math.round(stats.avgObjSize / 1024)}KB`)
                }

                if (stats.totalIndexSize > stats.storageSize * 0.5) { // Indexes > 50% of data size
                    logger.warn(`    ⚠️  Index overhead is high: ${Math.round(stats.totalIndexSize / stats.storageSize * 100)}%`)
                }

            } catch (error) {
                logger.error(`Failed to get stats for ${collectionName}:`, error)
            }
        }
    }

    /**
     * Create TTL indexes for temporary data
     */
    async createTTLIndexes() {
        logger.info('⏰ Creating TTL (Time-To-Live) indexes...')

        const ttlIndexes = [
            {
                collection: 'sessions',
                field: 'expiresAt',
                expireAfterSeconds: 0, // Use field value
                name: 'idx_sessions_ttl'
            },
            {
                collection: 'passwordresets',
                field: 'expiresAt',
                expireAfterSeconds: 0,
                name: 'idx_passwordresets_ttl'
            },
            {
                collection: 'emailverifications',
                field: 'createdAt',
                expireAfterSeconds: 24 * 60 * 60, // 24 hours
                name: 'idx_emailverifications_ttl'
            },
            {
                collection: 'auditlogs',
                field: 'createdAt',
                expireAfterSeconds: 90 * 24 * 60 * 60, // 90 days
                name: 'idx_auditlogs_ttl'
            }
        ]

        for (const ttlIndex of ttlIndexes) {
            try {
                // Check if collection exists
                const collections = await mongoose.connection.db.listCollections({ name: ttlIndex.collection }).toArray()

                if (collections.length === 0) {
                    logger.info(`  ⏭️  Collection ${ttlIndex.collection} doesn't exist, skipping TTL index`)
                    continue
                }

                const collection = mongoose.connection.db.collection(ttlIndex.collection)

                await collection.createIndex(
                    { [ttlIndex.field]: 1 },
                    {
                        expireAfterSeconds: ttlIndex.expireAfterSeconds,
                        name: ttlIndex.name
                    }
                )

                logger.info(`  ✅ ${ttlIndex.name}: expires after ${ttlIndex.expireAfterSeconds || 'field value'}s`)

            } catch (error) {
                if (error.code !== 85) { // Not "index already exists"
                    logger.error(`  ❌ Failed to create TTL index ${ttlIndex.name}:`, error.message)
                }
            }
        }
    }

    /**
     * Validate and repair data integrity
     */
    async validateDataIntegrity() {
        logger.info('🔍 Validating data integrity...')

        const validations = [
            {
                name: 'Orphaned menus (restaurant not found)',
                check: async () => {
                    const pipeline = [
                        {
                            $lookup: {
                                from: 'restaurants',
                                localField: 'restaurantId',
                                foreignField: '_id',
                                as: 'restaurant'
                            }
                        },
                        { $match: { restaurant: { $size: 0 } } },
                        { $count: 'orphanedMenus' }
                    ]

                    const result = await mongoose.connection.db.collection('menus').aggregate(pipeline).toArray()
                    return result[0]?.orphanedMenus || 0
                }
            },
            {
                name: 'Orphaned menu items (menu not found)',
                check: async () => {
                    const pipeline = [
                        {
                            $lookup: {
                                from: 'menus',
                                localField: 'menuId',
                                foreignField: '_id',
                                as: 'menu'
                            }
                        },
                        { $match: { menu: { $size: 0 } } },
                        { $count: 'orphanedMenuItems' }
                    ]

                    const result = await mongoose.connection.db.collection('menuitems').aggregate(pipeline).toArray()
                    return result[0]?.orphanedMenuItems || 0
                }
            },
            {
                name: 'Users without profiles',
                check: async () => {
                    const pipeline = [
                        {
                            $lookup: {
                                from: 'profiles',
                                localField: '_id',
                                foreignField: 'userId',
                                as: 'profile'
                            }
                        },
                        { $match: { profile: { $size: 0 } } },
                        { $count: 'usersWithoutProfiles' }
                    ]

                    const result = await mongoose.connection.db.collection('users').aggregate(pipeline).toArray()
                    return result[0]?.usersWithoutProfiles || 0
                }
            },
            {
                name: 'Invalid email formats',
                check: async () => {
                    const count = await mongoose.connection.db.collection('users').countDocuments({
                        email: { $not: { $regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ } }
                    })
                    return count
                }
            }
        ]

        const integrityResults = []

        for (const validation of validations) {
            try {
                const result = await validation.check()
                integrityResults.push({
                    name: validation.name,
                    issues: result,
                    status: result > 0 ? 'warning' : 'ok'
                })

                if (result > 0) {
                    logger.warn(`  ⚠️  ${validation.name}: ${result} issues found`)
                } else {
                    logger.info(`  ✅ ${validation.name}: OK`)
                }

            } catch (error) {
                logger.error(`  ❌ ${validation.name}: ${error.message}`)
                integrityResults.push({
                    name: validation.name,
                    status: 'error',
                    error: error.message
                })
            }
        }

        return integrityResults
    }

    /**
     * Generate optimization report
     */
    generateOptimizationReport() {
        const report = {
            timestamp: new Date(),
            optimizations: this.optimizations,
            indexes: this.indexCreationResults,
            queryAnalysis: this.queryAnalysis,
            summary: {
                totalCollections: this.optimizations.length,
                totalIndexes: this.indexCreationResults.filter(r => r.status === 'created').length,
                indexErrors: this.indexCreationResults.filter(r => r.status === 'error').length,
                recommendations: []
            }
        }

        // Generate recommendations
        this.optimizations.forEach(opt => {
            if (opt.avgDocumentSize > 16 * 1024) {
                report.summary.recommendations.push({
                    type: 'performance',
                    collection: opt.collection,
                    message: `Consider breaking down large documents in ${opt.collection}`,
                    priority: 'medium'
                })
            }

            if (opt.totalIndexSize > opt.storageSize * 0.5) {
                report.summary.recommendations.push({
                    type: 'storage',
                    collection: opt.collection,
                    message: `High index overhead in ${opt.collection} - review unused indexes`,
                    priority: 'low'
                })
            }
        })

        return report
    }

    /**
     * Run complete optimization suite
     */
    async runOptimization(options = {}) {
        const {
            createIndexes = true,
            analyzeQueries = true,
            optimizeSettings = true,
            createTTL = true,
            validateIntegrity = true,
            generateReport = true
        } = options

        logger.info('🚀 Starting comprehensive database optimization...\n')

        try {
            if (createIndexes) {
                await this.createOptimizedIndexes()
            }

            if (analyzeQueries) {
                await this.analyzeQueryPerformance()
            }

            if (optimizeSettings) {
                await this.optimizeCollectionSettings()
            }

            if (createTTL) {
                await this.createTTLIndexes()
            }

            if (validateIntegrity) {
                await this.validateDataIntegrity()
            }

            if (generateReport) {
                const report = this.generateOptimizationReport()

                logger.info('\n📊 OPTIMIZATION SUMMARY')
                logger.info('='.repeat(50))
                logger.info(`Collections optimized: ${report.summary.totalCollections}`)
                logger.info(`Indexes created: ${report.summary.totalIndexes}`)
                logger.info(`Index errors: ${report.summary.indexErrors}`)
                logger.info(`Recommendations: ${report.summary.recommendations.length}`)

                if (report.summary.recommendations.length > 0) {
                    logger.info('\n💡 RECOMMENDATIONS:')
                    report.summary.recommendations.forEach((rec, index) => {
                        logger.info(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`)
                    })
                }

                // Save report to file
                const fs = require('fs')
                const path = require('path')
                const reportPath = path.join(process.cwd(), `database-optimization-report-${Date.now()}.json`)
                fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
                logger.info(`\n📋 Detailed report saved: ${reportPath}`)

                return report
            }

        } catch (error) {
            logger.error('❌ Optimization failed:', error)
            throw error
        } finally {
            await mongoose.connection.close()
            logger.info('\n✅ Database optimization completed')
        }
    }
}

// CLI Interface
const main = async () => {
    const args = process.argv.slice(2)

    const options = {
        createIndexes: !args.includes('--skip-indexes'),
        analyzeQueries: !args.includes('--skip-analysis'),
        optimizeSettings: !args.includes('--skip-settings'),
        createTTL: !args.includes('--skip-ttl'),
        validateIntegrity: !args.includes('--skip-validation'),
        generateReport: !args.includes('--skip-report')
    }

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
QrBites Database Optimization Tool

Usage: node scripts/optimizeDatabase.js [options]

Options:
  --skip-indexes      Skip index creation
  --skip-analysis     Skip query analysis
  --skip-settings     Skip collection optimization
  --skip-ttl          Skip TTL index creation
  --skip-validation   Skip data integrity validation
  --skip-report       Skip report generation
  --help, -h          Show this help message

Examples:
  # Full optimization
  node scripts/optimizeDatabase.js
  
  # Only create indexes
  node scripts/optimizeDatabase.js --skip-analysis --skip-settings --skip-validation
  
  # Quick check without modifications
  node scripts/optimizeDatabase.js --skip-indexes --skip-ttl
`)
        process.exit(0)
    }

    const optimizer = new DatabaseOptimizer()

    if (await optimizer.connect()) {
        await optimizer.runOptimization(options)
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Script failed:', error)
        process.exit(1)
    })
}

module.exports = { DatabaseOptimizer }