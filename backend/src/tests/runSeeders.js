require('dotenv').config();
const mongoose = require('mongoose');
const { seedUsers } = require('./seed/users');
const { seedMenus } = require('./seed/menus');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB and seed data
 */
const runSeeders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connected');
    
    // Run seeders
    await seedUsers();
    await seedMenus();
    
    // Disconnect
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
    
    logger.success('All data seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeders
runSeeders(); 