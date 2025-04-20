const Menu = require('../../models/Menu');
const MenuItem = require('../../models/MenuItem');
const logger = require('../../utils/logger');
const { getUserByEmail } = require('./userSeeds');
const { mockMenus } = require('../mock/menuMocks');
const { mockMenuItems } = require('../mock/menuItemMocks');

/**
 * Seed menus and menu items to database
 * @param {Boolean} clearExisting - Whether to clear existing menus
 * @returns {Promise<Object>} Object containing created menus and items
 */
const seedMenus = async (clearExisting = true) => {
  try {
    // Get a user to own the menus
    const owner = await getUserByEmail('john@example.com');
    
    if (!owner) {
      logger.error('User not found for seeding menus. Make sure to run seedUsers first.');
      throw new Error('User not found for seeding menus');
    }
    
    // Clear existing menus and menu items if requested
    if (clearExisting) {
      logger.info('Clearing existing menus and menu items');
      await Menu.deleteMany({});
      await MenuItem.deleteMany({});
    }
    
    // Create menus with owner ID
    const menusToCreate = mockMenus.map(menu => ({
      ...menu,
      restaurant: owner._id
    }));
    
    // Insert menus
    const createdMenus = await Menu.insertMany(menusToCreate);
    logger.success(`${createdMenus.length} menus seeded successfully`);
    
    // Create menu items, associating them with the created menus
    const itemsToCreate = [];
    
    // Process items for each menu
    for (const menu of createdMenus) {
      const itemsForThisMenu = mockMenuItems.filter(item => {
        // Find the mock menu this item belongs to
        const mockMenu = mockMenus.find(m => m.name === menu.name);
        return mockMenu && item.menu === mockMenu._id;
      });
      
      // Map items to use the real menu and section IDs
      const mappedItems = itemsForThisMenu.map(item => {
        // Find the matching section in the real menu
        const mockMenu = mockMenus.find(m => m.name === menu.name);
        const mockSection = mockMenu.sections.find(s => s._id === item.section);
        
        // Find the corresponding section in the real menu
        const realSection = menu.sections.find(s => s.name === mockSection.name);
        
        return {
          ...item,
          menu: menu._id,
          section: realSection._id
        };
      });
      
      itemsToCreate.push(...mappedItems);
    }
    
    // Insert menu items
    const createdItems = await MenuItem.insertMany(itemsToCreate);
    logger.success(`${createdItems.length} menu items seeded successfully`);
    
    return { menus: createdMenus, items: createdItems };
  } catch (error) {
    logger.error('Error seeding menus:', error);
    throw error;
  }
};

/**
 * Get menu by name
 * @param {String} name - Menu name to search for
 * @returns {Promise<Object>} Menu document
 */
const getMenuByName = async (name) => {
  return await Menu.findOne({ name });
};

/**
 * Get menu by ID
 * @param {String} id - Menu ID to search for
 * @returns {Promise<Object>} Menu document
 */
const getMenuById = async (id) => {
  return await Menu.findById(id);
};

module.exports = {
  seedMenus,
  getMenuByName,
  getMenuById
};