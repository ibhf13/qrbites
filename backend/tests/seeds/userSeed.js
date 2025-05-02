const bcrypt = require('bcryptjs')
const User = require('@models/userModel')
const userMock = require('../fixtures/mocks/userMock')
const logger = require('@utils/logger')

/**
 * Seed users into the database
 * @returns {Promise<Array>} - Array of created users
 */
const seedUsers = async () => {
    try {
        logger.info('Seeding users...')

        // Hash passwords for all users
        const userList = userMock.userList.map(user => ({
            ...user,
            // Use the already hashed password from the mock
            password: user.password
        }))

        // Create additional users with specific roles
        const ownerUser = {
            _id: userMock.userList[0]._id,
            name: 'Restaurant Owner',
            email: 'owner@example.com',
            password: await bcrypt.hash('Password123!', 10),
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const adminUser = {
            _id: userMock.userList[2]._id,
            name: 'System Admin',
            email: 'admin@example.com',
            password: await bcrypt.hash('Password123!', 10),
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
        }

        // Create users in database
        const users = await User.insertMany([
            ownerUser,
            adminUser,
            ...userList.slice(1, 2) // Add one more user from the mock data
        ])

        logger.success(`${users.length} users seeded successfully`)
        return users
    } catch (error) {
        logger.error('Error seeding users:', error)
        throw error
    }
}

module.exports = {
    seedUsers
} 