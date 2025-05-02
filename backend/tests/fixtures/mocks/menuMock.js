const menuMock = {
  validMenu: {
    name: 'Test Menu',
    description: 'A test menu for unit testing',
    isActive: true,
    categories: ['Appetizers', 'Main Course', 'Desserts'],
  },
  invalidMenu: {
    name: 'A', // too short
    description: 'A'.repeat(501), // too long
    isActive: 'not-a-boolean', // invalid boolean
    categories: 123 // not an array
  }
};

module.exports = menuMock; 