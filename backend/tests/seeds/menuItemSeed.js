const MenuItem = require('@models/menuItem')
const menuItemMock = require('../fixtures/mocks/menuItemMock')
const logger = require('@utils/logger')
const fs = require('fs')
const path = require('path')
const { getFileUrl } = require('@services/fileUploadService')

/**
 * Seed menu items into the database
 * @param {Array} menus - Array of seeded menus
 * @returns {Promise<Array>} - Array of created menu items
 */
const seedMenuItems = async (menus) => {
    try {
        logger.info('Seeding menu items...')

        if (!menus || menus.length === 0) {
            throw new Error('No menus provided for menu item seeding')
        }

        // Prepare menu item data - assign different menu items to different menus
        const lunchMenu = menus.find(menu => menu.name === 'Lunch Menu')
        const dinnerMenu = menus.find(menu => menu.name === 'Dinner Menu')
        const brunchMenu = menus.find(menu => menu.name === 'Brunch Menu')

        if (!lunchMenu || !dinnerMenu || !brunchMenu) {
            throw new Error('Required menus not found in seed data')
        }

        // Assign existing items from mock to different menus
        const menuItemsData = [
            // Lunch Menu Items
            {
                ...menuItemMock.menuItemList[0],
                menuId: lunchMenu._id,
                imageUrl: getFileUrl('menuitem1.jpg', 'menuItem')
            },
            {
                ...menuItemMock.menuItemList[1],
                menuId: lunchMenu._id,
                imageUrl: getFileUrl('menuitem2.jpg', 'menuItem')
            },

            // Dinner Menu Items
            {
                ...menuItemMock.menuItemList[2],
                menuId: dinnerMenu._id,
                imageUrl: getFileUrl('menuitem3.jpg', 'menuItem')
            },
            {
                name: 'Grilled Salmon',
                description: 'Fresh salmon fillet grilled to perfection with lemon herb butter',
                price: 18.99,
                category: 'Entrees',
                menuId: dinnerMenu._id,
                isAvailable: true,
                allergens: ['Fish'],
                imageUrl: getFileUrl('menuitem4.jpg', 'menuItem')
            },

            // Brunch Menu Items
            {
                name: 'Eggs Benedict',
                description: 'English muffin topped with ham, poached eggs, and hollandaise sauce',
                price: 12.99,
                category: 'Breakfast',
                menuId: brunchMenu._id,
                isAvailable: true,
                allergens: ['Eggs', 'Gluten'],
                imageUrl: getFileUrl('menuitem5.jpg', 'menuItem')
            },
            {
                name: 'Avocado Toast',
                description: 'Toasted sourdough with smashed avocado, cherry tomatoes, and microgreens',
                price: 9.99,
                category: 'Brunch Specials',
                menuId: brunchMenu._id,
                isAvailable: true,
                allergens: ['Gluten'],
                imageUrl: getFileUrl('menuitem6.jpg', 'menuItem')
            }
        ]

        // Copy test image to uploads directory (simulate image upload)
        const testImagePath = path.join(process.cwd(), 'tests/testData/test-menu.jpg')
        const uploadsDir = path.join(process.cwd(), 'uploads/menu-items')

        // Ensure uploads directory exists
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }

        // Copy the test image multiple times with different names
        try {
            ['menuitem1.jpg', 'menuitem2.jpg', 'menuitem3.jpg',
                'menuitem4.jpg', 'menuitem5.jpg', 'menuitem6.jpg'].forEach(filename => {
                    const destPath = path.join(uploadsDir, filename)
                    fs.copyFileSync(testImagePath, destPath)
                })
        } catch (err) {
            logger.warn('Error copying test images (non-critical):', err.message)
        }

        // Create menu items in database
        const createdMenuItems = await MenuItem.insertMany(menuItemsData)

        logger.success(`${createdMenuItems.length} menu items seeded successfully`)
        return createdMenuItems
    } catch (error) {
        logger.error('Error seeding menu items:', error)
        throw error
    }
}

module.exports = {
    seedMenuItems
} 