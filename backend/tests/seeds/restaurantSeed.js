const Restaurant = require('@models/restaurant')
const restaurantMock = require('../fixtures/mocks/restaurantMock')
const logger = require('@utils/logger')
const fs = require('fs')
const path = require('path')
const { getFileUrl } = require('@services/fileUploadService')

/**
 * Seed restaurants into the database
 * @param {Array} users - Array of seeded users
 * @returns {Promise<Array>} - Array of created restaurants
 */
const seedRestaurants = async (users) => {
    try {
        logger.info('Seeding restaurants...')

        // Get owner and admin users
        const ownerUser = users.find(user => user.email === 'owner@example.com')
        const adminUser = users.find(user => user.role === 'admin')

        if (!ownerUser || !adminUser) {
            throw new Error('Required users not found in seed data')
        }

        // Prepare restaurant data
        const restaurants = [
            {
                ...restaurantMock.restaurantList[0],
                userId: ownerUser._id,
                imageUrl: getFileUrl('restaurant1.jpg', 'restaurant')
            },
            {
                ...restaurantMock.restaurantList[1],
                userId: ownerUser._id,
                imageUrl: getFileUrl('restaurant2.jpg', 'restaurant')
            },
            {
                ...restaurantMock.restaurantList[2],
                userId: users[2]._id, // Use the third user
                imageUrl: getFileUrl('restaurant3.jpg', 'restaurant')
            }
        ]

        // Copy test image to uploads directory (simulate image upload)
        const testImagePath = path.join(process.cwd(), 'tests/testData/test-menu.jpg')
        const uploadsDir = path.join(process.cwd(), 'uploads/restaurants')

        // Ensure uploads directory exists
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }

        // Copy the test image multiple times with different names
        try {
            ['restaurant1.jpg', 'restaurant2.jpg', 'restaurant3.jpg'].forEach(filename => {
                const destPath = path.join(uploadsDir, filename)
                fs.copyFileSync(testImagePath, destPath)
            })
        } catch (err) {
            logger.warn('Error copying test images (non-critical):', err.message)
        }

        // Create restaurants in database
        const createdRestaurants = await Restaurant.insertMany(restaurants)

        logger.success(`${createdRestaurants.length} restaurants seeded successfully`)
        return createdRestaurants
    } catch (error) {
        logger.error('Error seeding restaurants:', error)
        throw error
    }
}

module.exports = {
    seedRestaurants
} 