const mongoose = require('mongoose')
const logger = require('@utils/logger')
const User = require('@models/user')
const Restaurant = require('@models/restaurant')
const Menu = require('@models/menu')
const MenuItem = require('@models/menuItem')
const { seedUsers } = require('./userSeed')
const { seedEnhancedRestaurants } = require('./enhancedRestaurantSeed')
const { seedEnhancedMenus } = require('./enhancedMenuSeed')
const { seedMenuItems } = require('./menuItemSeed')

/**
 * Seed all enhanced data into the database
 * @param {boolean} clearExisting - Whether to clear existing data before seeding
 * @returns {Promise<Object>} - Object containing seeded data references
 */
const seedEnhancedDatabase = async (clearExisting = true) => {
    try {
        logger.info('Starting enhanced database seeding...')

        // Clear all existing data if requested
        if (clearExisting) {
            logger.info('Clearing existing data...')
            await Promise.all([
                User.deleteMany({}),
                Restaurant.deleteMany({}),
                Menu.deleteMany({}),
                MenuItem.deleteMany({})
            ])
            logger.success('Existing data cleared')
        }

        // Seed all data with enhanced datasets
        logger.info('Creating users...')
        const users = await seedUsers()

        logger.info('Creating enhanced restaurants...')
        const restaurants = await seedEnhancedRestaurants(users)

        logger.info('Creating enhanced menus...')
        const menus = await seedEnhancedMenus(restaurants)

        logger.info('Creating menu items...')
        const menuItems = await seedMenuItems(menus)

        logger.success('Enhanced database seeding completed successfully')

        // Log summary statistics
        logger.info('=== SEEDING SUMMARY ===')
        logger.info(`👥 Users: ${users.length}`)
        logger.info(`🏪 Restaurants: ${restaurants.length}`)
        logger.info(`📋 Menus: ${menus.length}`)
        logger.info(`🍽️  Menu Items: ${menuItems.length}`)
        logger.info('=====================')

        // Return references to all seeded data
        return {
            users,
            restaurants,
            menus,
            menuItems
        }
    } catch (error) {
        logger.error('Error seeding enhanced database:', error)
        throw error
    }
}

/**
 * Close database connection
 */
const closeConnection = async () => {
    try {
        await mongoose.connection.close()
        logger.info('Database connection closed')
    } catch (error) {
        logger.error('Error closing database connection:', error)
    }
}

module.exports = {
    seedEnhancedDatabase,
    closeConnection
}