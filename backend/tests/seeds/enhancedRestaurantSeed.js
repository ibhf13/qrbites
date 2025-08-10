const Restaurant = require('@models/restaurant')
const logger = require('@utils/logger')
const fs = require('fs')
const path = require('path')
const { getFileUrl } = require('@services/fileUploadService')

/**
 * Enhanced restaurant seed data with diverse restaurants
 * Aligned with frontend Restaurant types
 */
const enhancedRestaurantData = [
    {
        name: 'Bella Vista Italian',
        description: 'Authentic Italian cuisine in the heart of Frankfurt. Family-owned restaurant serving traditional recipes passed down through generations.',
        contact: {
            phone: '+49 69 12345671',
            email: 'info@bellavista.de',
            website: 'https://bellavista-frankfurt.de'
        },
        location: {
            street: 'Goethestraße',
            houseNumber: '15',
            city: 'Frankfurt am Main',
            zipCode: '60313'
        },
        cuisineType: ['Italian', 'Mediterranean'],
        hours: [
            { day: 0, open: '12:00', close: '22:00', closed: false }, // Sunday
            { day: 1, open: '11:30', close: '14:30', closed: false }, // Monday (lunch only)
            { day: 2, open: '11:30', close: '23:00', closed: false }, // Tuesday
            { day: 3, open: '11:30', close: '23:00', closed: false }, // Wednesday
            { day: 4, open: '11:30', close: '23:00', closed: false }, // Thursday
            { day: 5, open: '11:30', close: '24:00', closed: false }, // Friday
            { day: 6, open: '12:00', close: '24:00', closed: false }  // Saturday
        ],
        isActive: true
    },
    {
        name: 'Tokyo Fusion',
        description: 'Modern Japanese cuisine with a contemporary twist. Fresh sushi, ramen, and innovative fusion dishes in a sleek setting.',
        contact: {
            phone: '+49 30 98765432',
            email: 'contact@tokyofusion.de',
            website: 'https://tokyo-fusion-berlin.de'
        },
        location: {
            street: 'Friedrichstraße',
            houseNumber: '88',
            city: 'Berlin',
            zipCode: '10117'
        },
        cuisineType: ['Japanese', 'Asian', 'Fusion'],
        hours: [
            { day: 0, open: '17:00', close: '22:00', closed: false }, // Sunday
            { day: 1, closed: true }, // Monday closed
            { day: 2, open: '12:00', close: '15:00', closed: false }, // Tuesday (lunch only)
            { day: 3, open: '12:00', close: '22:30', closed: false }, // Wednesday
            { day: 4, open: '12:00', close: '22:30', closed: false }, // Thursday
            { day: 5, open: '12:00', close: '23:30', closed: false }, // Friday
            { day: 6, open: '17:00', close: '23:30', closed: false }  // Saturday
        ],
        isActive: true
    },
    {
        name: 'El Corazón Mexican Cantina',
        description: 'Vibrant Mexican restaurant offering authentic flavors from across Mexico. Fresh ingredients, house-made tortillas, and an extensive tequila selection.',
        contact: {
            phone: '+49 89 55443322',
            email: 'hola@elcorazon.de',
            website: 'https://elcorazon-munich.de'
        },
        location: {
            street: 'Marienplatz',
            houseNumber: '3',
            city: 'München',
            zipCode: '80331'
        },
        cuisineType: ['Mexican', 'Latin American'],
        hours: [
            { day: 0, open: '16:00', close: '23:00', closed: false }, // Sunday
            { day: 1, open: '17:00', close: '23:00', closed: false }, // Monday
            { day: 2, open: '17:00', close: '23:00', closed: false }, // Tuesday
            { day: 3, open: '17:00', close: '23:00', closed: false }, // Wednesday
            { day: 4, open: '17:00', close: '24:00', closed: false }, // Thursday
            { day: 5, open: '17:00', close: '01:00', closed: false }, // Friday
            { day: 6, open: '16:00', close: '01:00', closed: false }  // Saturday
        ],
        isActive: true
    },
    {
        name: 'The Green Garden Bistro',
        description: 'Farm-to-table vegetarian and vegan cuisine. Organic, locally-sourced ingredients crafted into delicious plant-based dishes.',
        contact: {
            phone: '+49 40 77889900',
            email: 'info@greengarden.de',
            website: 'https://greengarden-hamburg.de'
        },
        location: {
            street: 'Reeperbahn',
            houseNumber: '125',
            city: 'Hamburg',
            zipCode: '20359'
        },
        cuisineType: ['Vegetarian', 'Vegan', 'Healthy'],
        hours: [
            { day: 0, open: '10:00', close: '20:00', closed: false }, // Sunday
            { day: 1, open: '08:00', close: '21:00', closed: false }, // Monday
            { day: 2, open: '08:00', close: '21:00', closed: false }, // Tuesday
            { day: 3, open: '08:00', close: '21:00', closed: false }, // Wednesday
            { day: 4, open: '08:00', close: '21:00', closed: false }, // Thursday
            { day: 5, open: '08:00', close: '22:00', closed: false }, // Friday
            { day: 6, open: '09:00', close: '22:00', closed: false }  // Saturday
        ],
        isActive: true
    },
    {
        name: 'Brasserie Le Petit Paris',
        description: 'Classic French brasserie serving traditional dishes with a modern presentation. Extensive wine list featuring French vintages.',
        contact: {
            phone: '+49 69 33221144',
            email: 'bonjour@petitparis.de',
            website: 'https://petitparis-frankfurt.de'
        },
        location: {
            street: 'Kaiserstraße',
            houseNumber: '67',
            city: 'Frankfurt am Main',
            zipCode: '60329'
        },
        cuisineType: ['French', 'European'],
        hours: [
            { day: 0, closed: true }, // Sunday closed
            { day: 1, open: '11:00', close: '22:00', closed: false }, // Monday
            { day: 2, open: '11:00', close: '22:00', closed: false }, // Tuesday
            { day: 3, open: '11:00', close: '22:00', closed: false }, // Wednesday
            { day: 4, open: '11:00', close: '22:30', closed: false }, // Thursday
            { day: 5, open: '11:00', close: '23:00', closed: false }, // Friday
            { day: 6, open: '18:00', close: '23:00', closed: false }  // Saturday (dinner only)
        ],
        isActive: true
    },
    {
        name: 'Curry Palace Indian',
        description: 'Authentic Indian restaurant featuring regional specialties from across India. Traditional spices and cooking methods in a warm, welcoming atmosphere.',
        contact: {
            phone: '+49 221 66554433',
            email: 'namaste@currypalace.de',
            website: 'https://currypalace-cologne.de'
        },
        location: {
            street: 'Hohe Straße',
            houseNumber: '45',
            city: 'Köln',
            zipCode: '50667'
        },
        cuisineType: ['Indian', 'Asian', 'Spicy'],
        hours: [
            { day: 0, open: '17:00', close: '22:30', closed: false }, // Sunday
            { day: 1, open: '11:30', close: '14:30', closed: false }, // Monday (lunch only)
            { day: 2, open: '11:30', close: '22:30', closed: false }, // Tuesday
            { day: 3, open: '11:30', close: '22:30', closed: false }, // Wednesday
            { day: 4, open: '11:30', close: '22:30', closed: false }, // Thursday
            { day: 5, open: '11:30', close: '23:00', closed: false }, // Friday
            { day: 6, open: '17:00', close: '23:00', closed: false }  // Saturday
        ],
        isActive: true
    }
]

/**
 * Seed enhanced restaurants into the database
 * @param {Array} users - Array of seeded users
 * @returns {Promise<Array>} - Array of created restaurants
 */
const seedEnhancedRestaurants = async (users) => {
    try {
        logger.info('Seeding enhanced restaurants...')

        if (!users || users.length < 3) {
            throw new Error('Not enough users provided for restaurant seeding')
        }

        // Assign restaurants to different users
        const restaurants = enhancedRestaurantData.map((restaurant, index) => ({
            ...restaurant,
            userId: users[index % users.length]._id,
            logoUrl: getFileUrl(`restaurant-${index + 1}.jpg`, 'restaurant'),
            bannerImage: getFileUrl(`banner-${index + 1}.jpg`, 'restaurant'),
            createdAt: new Date(Date.now() - (enhancedRestaurantData.length - index) * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
        }))

        // Create uploads directory structure
        const uploadsDir = path.join(process.cwd(), 'uploads/restaurants')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }

        // Copy test images for restaurants (simulate image uploads)
        const testImagePath = path.join(process.cwd(), 'tests/fixtures/images/test-image.jpg')
        const testMenuImagePath = path.join(process.cwd(), 'tests/fixtures/images/test-menu.jpg')

        try {
            // Create logo images
            for (let i = 1; i <= restaurants.length; i++) {
                const logoPath = path.join(uploadsDir, `restaurant-${i}.jpg`)
                const bannerPath = path.join(uploadsDir, `banner-${i}.jpg`)

                if (fs.existsSync(testImagePath)) {
                    fs.copyFileSync(testImagePath, logoPath)
                } else if (fs.existsSync(testMenuImagePath)) {
                    fs.copyFileSync(testMenuImagePath, logoPath)
                }

                if (fs.existsSync(testMenuImagePath)) {
                    fs.copyFileSync(testMenuImagePath, bannerPath)
                } else if (fs.existsSync(testImagePath)) {
                    fs.copyFileSync(testImagePath, bannerPath)
                }
            }
        } catch (err) {
            logger.warn('Error copying test images (non-critical):', err.message)
        }

        // Create restaurants in database
        const createdRestaurants = await Restaurant.insertMany(restaurants)

        logger.success(`${createdRestaurants.length} enhanced restaurants seeded successfully`)

        // Log the created restaurants for verification
        createdRestaurants.forEach(restaurant => {
            logger.info(`Created restaurant: ${restaurant.name} in ${restaurant.location.city}`)
        })

        return createdRestaurants
    } catch (error) {
        logger.error('Error seeding enhanced restaurants:', error)
        throw error
    }
}

module.exports = {
    seedEnhancedRestaurants,
    enhancedRestaurantData
}