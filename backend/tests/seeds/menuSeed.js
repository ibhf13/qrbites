const Menu = require('@models/menuModel')
const menuMock = require('../fixtures/mocks/menuMockEnhanced')
const logger = require('@utils/logger')
const fs = require('fs')
const path = require('path')
const { getFileUrl } = require('@services/fileUploadService')
const { generateMenuQRCode } = require('@services/qrCodeService')

/**
 * Seed menus into the database
 * @param {Array} restaurants - Array of seeded restaurants
 * @returns {Promise<Array>} - Array of created menus
 */
const seedMenus = async (restaurants) => {
    try {
        logger.info('Seeding menus...')

        if (!restaurants || restaurants.length === 0) {
            throw new Error('No restaurants provided for menu seeding')
        }

        // Prepare menu data
        const menuData = [
            {
                _id: menuMock.menuList[0]._id,
                name: 'Lunch Menu',
                description: 'Special lunch offerings available daily from 11am to 2pm',
                categories: ['Appetizers', 'Main Course', 'Desserts'],
                restaurantId: restaurants[0]._id,
                isActive: true,
                imageUrl: getFileUrl('menu1.jpg', 'menu'),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: menuMock.menuList[1]._id,
                name: 'Dinner Menu',
                description: 'Evening dining options available from 5pm to 10pm',
                categories: ['Starters', 'Entrees', 'Sides', 'Desserts'],
                restaurantId: restaurants[0]._id,
                isActive: true,
                imageUrl: getFileUrl('menu2.jpg', 'menu'),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Brunch Menu',
                description: 'Weekend brunch specialties from 9am to 1pm, Saturday and Sunday only',
                categories: ['Breakfast', 'Brunch Specials', 'Drinks'],
                restaurantId: restaurants[1]._id,
                isActive: true,
                imageUrl: getFileUrl('menu3.jpg', 'menu'),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]

        // Copy test image to uploads directory (simulate image upload)
        const testImagePath = path.join(process.cwd(), 'tests/testData/test-menu.jpg')
        const uploadsDir = path.join(process.cwd(), 'uploads/menus')

        // Ensure uploads directory exists
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }

        // Copy the test image multiple times with different names
        try {
            ['menu1.jpg', 'menu2.jpg', 'menu3.jpg'].forEach(filename => {
                const destPath = path.join(uploadsDir, filename)
                fs.copyFileSync(testImagePath, destPath)
            })
        } catch (err) {
            logger.warn('Error copying test images (non-critical):', err.message)
        }

        // Create menus in database
        const createdMenus = await Menu.create(menuData)

        // Generate QR codes for all menus
        for (const menu of createdMenus) {
            try {
                const qrCodeUrl = await generateMenuQRCode(menu._id, menu.restaurantId)
                menu.qrCodeUrl = qrCodeUrl
                await menu.save()
            } catch (err) {
                logger.warn(`Error generating QR code for menu ${menu._id} (non-critical):`, err.message)
            }
        }

        logger.success(`${createdMenus.length} menus seeded successfully`)
        return createdMenus
    } catch (error) {
        logger.error('Error seeding menus:', error)
        throw error
    }
}

module.exports = {
    seedMenus
} 