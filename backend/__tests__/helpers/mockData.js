/**
 * Predefined mock data for testing
 * Use these for consistent test data across different test files
 */

const mockUsers = {
  validUser: {
    email: 'valid.user@example.com',
    password: 'ValidPassword123!',
    name: 'Valid User',
    role: 'user',
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    name: 'Admin User',
    role: 'admin',
  },
  inactiveUser: {
    email: 'inactive@example.com',
    password: 'InactivePassword123!',
    name: 'Inactive User',
    isActive: false,
  },
}

const mockRestaurants = {
  validRestaurant: {
    name: 'The Golden Fork',
    description: 'Fine dining experience with contemporary cuisine',
    contact: {
      phone: '+14155550123',
      email: 'contact@goldenfork.com',
      website: 'https://goldenfork.com',
    },
    location: {
      street: '456 Restaurant Row',
      houseNumber: '12',
      city: 'San Francisco',
      zipCode: '94102',
    },
    hours: [],
    isActive: true,
  },
  italianRestaurant: {
    name: 'Bella Italia',
    description: 'Authentic Italian cuisine',
    contact: {
      phone: '+12125550456',
      email: 'info@bellaitalia.com',
    },
    location: {
      street: '789 Italian Street',
      houseNumber: '5A',
      city: 'New York',
      zipCode: '10001',
    },
    hours: [],
    isActive: true,
  },
}

const mockMenus = {
  dinnerMenu: {
    name: 'Dinner Menu',
    description: 'Our exquisite dinner selections',
    isActive: true,
  },
  lunchMenu: {
    name: 'Lunch Menu',
    description: 'Light and delicious lunch options',
    isActive: true,
  },
  brunchMenu: {
    name: 'Weekend Brunch',
    description: 'Special weekend brunch menu',
    isActive: false,
  },
}

const mockMenuItems = {
  steak: {
    name: 'Grilled Ribeye Steak',
    description: 'Premium 16oz ribeye, perfectly grilled',
    price: 45.99,
    category: 'Main Course',
    isAvailable: true,
    allergens: [],
    dietary: ['gluten-free'],
    spicyLevel: 0,
  },
  pasta: {
    name: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta with bacon and cream',
    price: 18.99,
    category: 'Pasta',
    isAvailable: true,
    allergens: ['dairy', 'eggs', 'gluten'],
    dietary: [],
  },
  salad: {
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan and croutons',
    price: 12.99,
    category: 'Appetizer',
    isAvailable: true,
    allergens: ['dairy', 'gluten'],
    dietary: ['vegetarian'],
  },
  dessert: {
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center',
    price: 9.99,
    category: 'Dessert',
    isAvailable: false,
    allergens: ['dairy', 'eggs', 'gluten'],
    dietary: ['vegetarian'],
  },
}

const mockCredentials = {
  valid: {
    email: 'test@example.com',
    password: 'TestPassword123!',
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
  malformed: {
    email: 'not-an-email',
    password: '123',
  },
}

const mockFiles = {
  validImage: {
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024 * 100, // 100KB
    buffer: Buffer.from('fake-image-data'),
  },
  invalidImage: {
    fieldname: 'image',
    originalname: 'test-file.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024 * 100,
    buffer: Buffer.from('fake-pdf-data'),
  },
  largeImage: {
    fieldname: 'image',
    originalname: 'large-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024 * 1024 * 10, // 10MB
    buffer: Buffer.from('fake-large-image-data'),
  },
}

const mockValidationErrors = {
  invalidEmail: {
    email: 'not-an-email',
    password: 'ValidPassword123!',
    name: 'Test User',
  },
  shortPassword: {
    email: 'test@example.com',
    password: '12345',
    name: 'Test User',
  },
  missingRequired: {
    email: 'test@example.com',
    // missing password
  },
}

const mockQRData = {
  menuUrl: 'http://localhost:5000/r/menu-id?restaurant=restaurant-id',
  qrCodeUrl: 'https://test.cloudinary.com/qr-code.png',
  publicId: 'qr-codes/test-qr-code',
}

module.exports = {
  mockUsers,
  mockRestaurants,
  mockMenus,
  mockMenuItems,
  mockCredentials,
  mockFiles,
  mockValidationErrors,
  mockQRData,
}

