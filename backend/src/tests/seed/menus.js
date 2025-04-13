const Menu = require('../../models/Menu');
const MenuItem = require('../../models/MenuItem');
const User = require('../../models/User');
const { getUserByEmail } = require('./users');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

/**
 * Seed menus for testing
 */
const seedMenus = async () => {
  try {
    // Get a user to own the menus
    const owner = await getUserByEmail('john@example.com');
    
    if (!owner) {
      logger.error('User not found for seeding menus');
      return;
    }
    
    // Clear existing menus and menu items
    await Menu.deleteMany({});
    await MenuItem.deleteMany({});
    
    // Create sample menus
    const lunchMenu = await Menu.create({
      name: 'Lunch Menu',
      description: 'Our delicious lunch options',
      restaurant: owner._id,
      isPublished: true,
      sections: [
        {
          name: 'Appetizers',
          description: 'Start with something light',
          order: 1
        },
        {
          name: 'Main Courses',
          description: 'Hearty lunch entrees',
          order: 2
        },
        {
          name: 'Desserts',
          description: 'Sweet treats',
          order: 3
        }
      ]
    });
    
    const dinnerMenu = await Menu.create({
      name: 'Dinner Menu',
      description: 'Evening dining options',
      restaurant: owner._id,
      isPublished: false,
      sections: [
        {
          name: 'Starters',
          description: 'Begin your evening meal',
          order: 1
        },
        {
          name: 'Entrees',
          description: 'Main dinner selections',
          order: 2
        },
        {
          name: 'Sides',
          description: 'Accompaniments',
          order: 3
        },
        {
          name: 'Desserts',
          description: 'Finish with something sweet',
          order: 4
        }
      ]
    });
    
    // Add items to lunch menu
    await MenuItem.create([
      {
        name: 'Caesar Salad',
        description: 'Romaine lettuce with Caesar dressing and croutons',
        price: 8.99,
        section: lunchMenu.sections[0]._id,
        menu: lunchMenu._id,
        isAvailable: true,
        order: 1
      },
      {
        name: 'Tomato Soup',
        description: 'Creamy tomato soup with basil',
        price: 6.99,
        section: lunchMenu.sections[0]._id,
        menu: lunchMenu._id,
        isAvailable: true,
        order: 2
      },
      {
        name: 'Grilled Chicken Sandwich',
        description: 'Grilled chicken with lettuce, tomato, and mayo on ciabatta',
        price: 12.99,
        section: lunchMenu.sections[1]._id,
        menu: lunchMenu._id,
        isAvailable: true,
        order: 1
      },
      {
        name: 'Pasta Primavera',
        description: 'Penne pasta with seasonal vegetables',
        price: 13.99,
        section: lunchMenu.sections[1]._id,
        menu: lunchMenu._id,
        isAvailable: true,
        order: 2
      },
      {
        name: 'Chocolate Brownie',
        description: 'Warm chocolate brownie with vanilla ice cream',
        price: 6.99,
        section: lunchMenu.sections[2]._id,
        menu: lunchMenu._id,
        isAvailable: false,
        order: 1
      }
    ]);
    
    // Add items to dinner menu
    await MenuItem.create([
      {
        name: 'Shrimp Cocktail',
        description: 'Chilled shrimp with cocktail sauce',
        price: 14.99,
        section: dinnerMenu.sections[0]._id,
        menu: dinnerMenu._id,
        isAvailable: true,
        order: 1
      },
      {
        name: 'Bruschetta',
        description: 'Toasted bread with tomatoes, garlic, and basil',
        price: 9.99,
        section: dinnerMenu.sections[0]._id,
        menu: dinnerMenu._id,
        isAvailable: true,
        order: 2
      },
      {
        name: 'Filet Mignon',
        description: '8oz filet with red wine reduction',
        price: 34.99,
        section: dinnerMenu.sections[1]._id,
        menu: dinnerMenu._id,
        isAvailable: true,
        order: 1
      },
      {
        name: 'Salmon',
        description: 'Grilled salmon with lemon butter sauce',
        price: 28.99,
        section: dinnerMenu.sections[1]._id,
        menu: dinnerMenu._id,
        isAvailable: true,
        order: 2
      },
      {
        name: 'Roasted Potatoes',
        description: 'Herb-roasted baby potatoes',
        price: 5.99,
        section: dinnerMenu.sections[2]._id,
        menu: dinnerMenu._id,
        isAvailable: true,
        order: 1
      },
      {
        name: 'Cheesecake',
        description: 'New York style cheesecake with berry compote',
        price: 8.99,
        section: dinnerMenu.sections[3]._id,
        menu: dinnerMenu._id,
        isAvailable: true,
        order: 1
      }
    ]);
    
    logger.success('Menus and menu items seeded successfully');
  } catch (error) {
    logger.error('Error seeding menus:', error);
  }
};

/**
 * Get menu by name
 */
const getMenuByName = async (name) => {
  return await Menu.findOne({ name });
};

module.exports = {
  seedMenus,
  getMenuByName
}; 