const bcrypt = require('bcrypt');
const User = require('../../models/User');
const logger = require('../../utils/logger');
const { mockUsers } = require('../mock/userMocks');

/**
 * Seed users to database
 * @param {Boolean} clearExisting - Whether to clear existing users
 * @returns {Promise<Array>} Array of created users
 */
const seedUsers = async (clearExisting = true) => {
  try {
    // Clear existing users if requested
    if (clearExisting) {
      logger.info('Clearing existing users');
      await User.deleteMany({});
    }
    
    // Hash passwords before seeding
    const usersWithHashedPasswords = await Promise.all(
      mockUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );
    
    // Insert users with hashed passwords
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    
    logger.success(`${createdUsers.length} users seeded successfully`);
    return createdUsers;
  } catch (error) {
    logger.error('Error seeding users:', error);
    throw error;
  }
};

/**
 * Get user by email (for testing)
 * @param {String} email - Email to search for
 * @returns {Promise<Object>} User document
 */
const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

/**
 * Get user by ID (for testing)
 * @param {String} id - User ID to search for
 * @returns {Promise<Object>} User document
 */
const getUserById = async (id) => {
  return await User.findById(id);
};

module.exports = {
  seedUsers,
  getUserByEmail,
  getUserById
};