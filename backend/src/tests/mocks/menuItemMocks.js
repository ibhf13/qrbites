// Mock menu item data for testing
const mockMenuItems = [
  {
    _id: '60d0fe4f5311236168a109e1',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing',
    price: 8.99,
    section: '60d0fe4f5311236168a109d4', // Appetizers section
    isAvailable: true,
    allergens: ['dairy'],
    dietaryInfo: ['vegetarian'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02')
  },
  {
    _id: '60d0fe4f5311236168a109e2',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with seasonal vegetables',
    price: 18.99,
    section: '60d0fe4f5311236168a109d5', // Main Courses section
    isAvailable: true,
    allergens: ['fish'],
    dietaryInfo: ['gluten-free'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02')
  },
  {
    _id: '60d0fe4f5311236168a109e3',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with vanilla ice cream',
    price: 6.99,
    section: '60d0fe4f5311236168a109d6', // Desserts section
    isAvailable: true,
    allergens: ['dairy', 'eggs', 'gluten'],
    dietaryInfo: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02')
  }
];

// Mock menu item creation payload
const mockMenuItemPayload = {
  name: 'New Item',
  description: 'A new menu item',
  price: 12.99,
  section: '60d0fe4f5311236168a109d4', // Appetizers section
  isAvailable: true,
  allergens: [],
  dietaryInfo: []
};

// Mock menu item response
const mockMenuItemResponse = {
  success: true,
  data: {
    _id: '60d0fe4f5311236168a109e4',
    name: 'New Item',
    description: 'A new menu item',
    price: 12.99,
    section: '60d0fe4f5311236168a109d4',
    isAvailable: true,
    allergens: [],
    dietaryInfo: [],
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-01-05')
  }
};

// Mock not found response
const mockNotFoundResponse = {
  success: false,
  error: 'Menu item not found'
};

// Mock unauthorized response
const mockUnauthorizedResponse = {
  success: false,
  error: 'Not authorized to access this menu item'
};

module.exports = {
  mockMenuItems,
  mockMenuItemPayload,
  mockMenuItemResponse,
  mockNotFoundResponse,
  mockUnauthorizedResponse
};
