const Profile = require('@models/profile')
const User = require('@models/user')
const profileMock = require('../fixtures/mocks/profileMock')
const logger = require('@utils/logger')

/**
 * Seed profiles into the database
 * @returns {Promise<Array>} - Array of created profiles
 */
const seedProfiles = async () => {
    try {
        logger.info('Seeding profiles...')

        // Get existing users to link profiles to
        const users = await User.find({}).limit(3)

        if (users.length < 3) {
            throw new Error('Need at least 3 users in database to seed profiles')
        }

        // Create profiles for existing users
        const profilesData = [
            {
                userId: users[0]._id,
                firstName: 'John',
                lastName: 'Doe',
                displayName: 'johndoe',
                phone: '+1234567890',
                bio: 'Restaurant owner and food enthusiast',
                location: {
                    street: 'Hauptstraße',
                    houseNumber: '123',
                    city: 'Berlin',
                    zipCode: '10115'
                },
                preferences: {
                    language: 'en',
                    timezone: 'America/New_York',
                    notifications: {
                        email: true,
                        sms: false,
                        push: true
                    }
                },
                socialLinks: {
                    website: 'https://johndoe.com',
                    twitter: '@johndoe',
                    instagram: '@johndoe'
                },
                isPublic: true,
                isVerified: false
            },
            {
                userId: users[1]._id,
                firstName: 'Jane',
                lastName: 'Smith',
                displayName: 'janesmith',
                phone: '+0987654321',
                bio: 'Food blogger and restaurant reviewer',
                location: {
                    street: 'Eichenallee',
                    houseNumber: '456',
                    city: 'München',
                    zipCode: '80331'
                },
                preferences: {
                    language: 'en',
                    timezone: 'America/Los_Angeles',
                    notifications: {
                        email: true,
                        sms: true,
                        push: false
                    }
                },
                socialLinks: {
                    website: 'https://janesmith.blog',
                    instagram: '@janesmith_food'
                },
                isPublic: true,
                isVerified: true
            },
            {
                userId: users[2]._id,
                firstName: 'Admin',
                lastName: 'User',
                displayName: 'admin',
                bio: 'System administrator',
                preferences: {
                    language: 'en',
                    timezone: 'UTC',
                    notifications: {
                        email: true,
                        sms: false,
                        push: true
                    }
                },
                isPublic: false,
                isVerified: true
            }
        ]

        // Create profiles in database
        const profiles = await Profile.insertMany(profilesData)

        logger.success(`${profiles.length} profiles seeded successfully`)
        return profiles
    } catch (error) {
        logger.error('Error seeding profiles:', error)
        throw error
    }
}

/**
 * Clean up profiles from database
 */
const cleanupProfiles = async () => {
    try {
        await Profile.deleteMany({})
        logger.info('Profiles cleaned up successfully')
    } catch (error) {
        logger.error('Error cleaning up profiles:', error)
        throw error
    }
}

module.exports = {
    seedProfiles,
    cleanupProfiles
} 