const bcrypt = require('bcrypt');
const User = require('../../models/User');
const logger = require('../../utils/logger');

/**
 * Sample users for testing
 */
const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    restaurantName: 'John\'s Restaurant',
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    restaurantName: 'Jane\'s Bistro',
    role: 'user'
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    restaurantName: 'Admin Restaurant',
    role: 'admin'
  }
];

/**
 * Seed users to database
 */
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    
    // Hash passwords before seeding
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );
    
    // Insert users with hashed passwords
    await User.insertMany(usersWithHashedPasswords);
    
    logger.success('Users seeded successfully');
  } catch (error) {
    logger.error('Error seeding users:', error);
  }
};

/**
 * Get user by email (for testing)
 */
const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

module.exports = {
  users,
  seedUsers,
  getUserByEmail
}; 