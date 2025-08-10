const Menu = require('@models/menu')
const logger = require('@utils/logger')
const fs = require('fs')
const path = require('path')
const { getFileUrl } = require('@services/fileUploadService')
const { generateMenuQRCode } = require('@services/qrCodeService')

/**
 * Enhanced menu seed data with diverse menus for different restaurants
 * Aligned with frontend Menu types and better categorization
 */
const enhancedMenuData = [
    // Italian Restaurant Menus
    {
        name: 'Lunch Menu',
        description: 'Daily lunch specials featuring fresh pasta, risotto, and seasonal Italian dishes. Available Monday to Friday, 11:30 AM - 2:30 PM.',
        categories: ['Antipasti', 'Primi Piatti', 'Secondi Piatti', 'Dolci'],
        isActive: true,
        restaurantIndex: 0 // Bella Vista Italian
    },
    {
        name: 'Dinner Menu',
        description: 'Evening menu showcasing our signature dishes and chef\'s specialties. Premium ingredients and traditional cooking methods.',
        categories: ['Antipasti', 'Pasta', 'Risotto', 'Carne', 'Pesce', 'Dolci', 'Vini'],
        isActive: true,
        restaurantIndex: 0 // Bella Vista Italian
    },
    {
        name: 'Wine & Aperitivo Menu',
        description: 'Curated selection of Italian wines and traditional aperitivo offerings. Perfect for evening socializing.',
        categories: ['Aperitivo', 'Vini Rossi', 'Vini Bianchi', 'Prosecco', 'Grappa'],
        isActive: true,
        restaurantIndex: 0 // Bella Vista Italian
    },

    // Japanese Restaurant Menus
    {
        name: 'Sushi & Sashimi Menu',
        description: 'Fresh daily selection of nigiri, sashimi, and specialty rolls. Featuring premium fish flown in daily.',
        categories: ['Nigiri', 'Sashimi', 'Maki Rolls', 'Specialty Rolls', 'Temaki'],
        isActive: true,
        restaurantIndex: 1 // Tokyo Fusion
    },
    {
        name: 'Hot Kitchen Menu',
        description: 'Ramen, teriyaki, tempura, and other hot Japanese dishes. Comfort food with a modern twist.',
        categories: ['Ramen', 'Udon', 'Teriyaki', 'Tempura', 'Donburi', 'Yakitori'],
        isActive: true,
        restaurantIndex: 1 // Tokyo Fusion
    },
    {
        name: 'Lunch Bento',
        description: 'Traditional bento boxes with miso soup and side dishes. Perfect for a quick, balanced lunch.',
        categories: ['Chicken Bento', 'Beef Bento', 'Fish Bento', 'Vegetarian Bento', 'Sides'],
        isActive: true,
        restaurantIndex: 1 // Tokyo Fusion
    },

    // Mexican Restaurant Menus
    {
        name: 'Tacos & Antojitos',
        description: 'Street-style tacos and traditional Mexican snacks. House-made tortillas and authentic seasonings.',
        categories: ['Tacos', 'Quesadillas', 'Nachos', 'Antojitos', 'Salsas'],
        isActive: true,
        restaurantIndex: 2 // El Corazón Mexican Cantina
    },
    {
        name: 'Main Dishes',
        description: 'Hearty Mexican entrées including enchiladas, fajitas, and traditional specialties from across Mexico.',
        categories: ['Enchiladas', 'Fajitas', 'Burritos', 'Mole', 'Mariscos', 'Carnes'],
        isActive: true,
        restaurantIndex: 2 // El Corazón Mexican Cantina
    },
    {
        name: 'Tequila & Cocktails',
        description: 'Premium tequilas, mezcals, and signature cocktails. Over 100 agave spirits to choose from.',
        categories: ['Tequila Blanco', 'Tequila Reposado', 'Tequila Añejo', 'Mezcal', 'Cocktails', 'Margaritas'],
        isActive: true,
        restaurantIndex: 2 // El Corazón Mexican Cantina
    },

    // Vegetarian Restaurant Menus
    {
        name: 'All Day Menu',
        description: 'Fresh, seasonal plant-based dishes from breakfast through dinner. Locally sourced, organic ingredients.',
        categories: ['Breakfast', 'Salads', 'Mains', 'Bowls', 'Smoothies', 'Desserts'],
        isActive: true,
        restaurantIndex: 3 // The Green Garden Bistro
    },
    {
        name: 'Seasonal Specials',
        description: 'Limited-time offerings featuring the best seasonal produce. Menu changes monthly based on harvest.',
        categories: ['Seasonal Starters', 'Seasonal Mains', 'Seasonal Desserts', 'Fresh Juices'],
        isActive: true,
        restaurantIndex: 3 // The Green Garden Bistro
    },

    // French Restaurant Menus
    {
        name: 'Menu du Jour',
        description: 'Daily changing menu featuring classic French dishes with seasonal ingredients. Three-course options available.',
        categories: ['Entrées', 'Plats Principaux', 'Fromages', 'Desserts'],
        isActive: true,
        restaurantIndex: 4 // Brasserie Le Petit Paris
    },
    {
        name: 'Carte des Vins',
        description: 'Carefully curated French wine list featuring both renowned and boutique vintages from all major regions.',
        categories: ['Champagne', 'Bourgogne', 'Bordeaux', 'Loire', 'Rhône', 'Alsace'],
        isActive: true,
        restaurantIndex: 4 // Brasserie Le Petit Paris
    },

    // Indian Restaurant Menus
    {
        name: 'North Indian Specialties',
        description: 'Traditional dishes from Northern India including tandoor specialties, biryanis, and rich curries.',
        categories: ['Tandoor', 'Biryanis', 'Curries', 'Dal', 'Naan & Breads', 'Raita'],
        isActive: true,
        restaurantIndex: 5 // Curry Palace Indian
    },
    {
        name: 'South Indian Classics',
        description: 'Authentic South Indian cuisine featuring dosas, idli, sambar, and coconut-based curries.',
        categories: ['Dosas', 'Idli & Vada', 'Sambar & Rasam', 'Coconut Curries', 'Rice Dishes'],
        isActive: true,
        restaurantIndex: 5 // Curry Palace Indian
    },
    {
        name: 'Lunch Thali',
        description: 'Traditional Indian lunch platters with a variety of dishes, rice, bread, and dessert.',
        categories: ['Vegetarian Thali', 'Non-Veg Thali', 'Regional Thali', 'Sweet Lassi'],
        isActive: true,
        restaurantIndex: 5 // Curry Palace Indian
    }
]

/**
 * Seed enhanced menus into the database
 * @param {Array} restaurants - Array of seeded restaurants
 * @returns {Promise<Array>} - Array of created menus
 */
const seedEnhancedMenus = async (restaurants) => {
    try {
        logger.info('Seeding enhanced menus...')

        if (!restaurants || restaurants.length === 0) {
            throw new Error('No restaurants provided for menu seeding')
        }

        // Prepare menu data with proper restaurant assignments
        const menuData = enhancedMenuData.map((menu, index) => {
            const restaurant = restaurants[menu.restaurantIndex] || restaurants[0]

            return {
                ...menu,
                restaurantId: restaurant._id,
                imageUrl: getFileUrl(`menu-${index + 1}.jpg`, 'menu'),
                createdAt: new Date(Date.now() - (enhancedMenuData.length - index) * 12 * 60 * 60 * 1000),
                updatedAt: new Date()
            }
        })

        // Remove restaurantIndex as it's not part of the schema
        menuData.forEach(menu => delete menu.restaurantIndex)

        // Create uploads directory
        const uploadsDir = path.join(process.cwd(), 'uploads/menus')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }

        // Copy test images for menus (simulate image uploads)
        const testMenuImagePath = path.join(process.cwd(), 'tests/fixtures/images/test-menu.jpg')
        const testImagePath = path.join(process.cwd(), 'tests/fixtures/images/test-image.jpg')

        try {
            for (let i = 1; i <= menuData.length; i++) {
                const menuImagePath = path.join(uploadsDir, `menu-${i}.jpg`)

                if (fs.existsSync(testMenuImagePath)) {
                    fs.copyFileSync(testMenuImagePath, menuImagePath)
                } else if (fs.existsSync(testImagePath)) {
                    fs.copyFileSync(testImagePath, menuImagePath)
                }
            }
        } catch (err) {
            logger.warn('Error copying test images (non-critical):', err.message)
        }

        // Create menus in database
        const createdMenus = await Menu.create(menuData)

        // Generate QR codes for all menus
        let qrCodeCount = 0
        for (const menu of createdMenus) {
            try {
                const qrCodeUrl = await generateMenuQRCode(menu._id, menu.restaurantId)
                menu.qrCodeUrl = qrCodeUrl
                await menu.save()
                qrCodeCount++
            } catch (err) {
                logger.warn(`Error generating QR code for menu ${menu._id} (non-critical):`, err.message)
            }
        }

        logger.success(`${createdMenus.length} enhanced menus seeded successfully`)
        logger.info(`${qrCodeCount} QR codes generated successfully`)

        // Log the created menus for verification
        const menusByRestaurant = {}
        createdMenus.forEach(menu => {
            const restaurant = restaurants.find(r => r._id.toString() === menu.restaurantId.toString())
            const restaurantName = restaurant ? restaurant.name : 'Unknown Restaurant'

            if (!menusByRestaurant[restaurantName]) {
                menusByRestaurant[restaurantName] = []
            }
            menusByRestaurant[restaurantName].push(menu.name)
        })

        Object.entries(menusByRestaurant).forEach(([restaurantName, menus]) => {
            logger.info(`${restaurantName}: ${menus.join(', ')}`)
        })

        return createdMenus
    } catch (error) {
        logger.error('Error seeding enhanced menus:', error)
        throw error
    }
}

module.exports = {
    seedEnhancedMenus,
    enhancedMenuData
}