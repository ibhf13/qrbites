// Mock menu data for testing
const mockMenus = [
  {
    _id: '60d0fe4f5311236168a109d1',
    name: 'Lunch Menu',
    description: 'Our delicious lunch options',
    restaurant: '60d0fe4f5311236168a109ca', // John Doe's ID
    isPublished: true,
    sections: [
      {
        _id: '60d0fe4f5311236168a109d4',
        name: 'Appetizers',
        description: 'Start with something light',
        order: 1
      },
      {
        _id: '60d0fe4f5311236168a109d5',
        name: 'Main Courses',
        description: 'Hearty lunch entrees',
        order: 2
      },
      {
        _id: '60d0fe4f5311236168a109d6',
        name: 'Desserts',
        description: 'Sweet treats',
        order: 3
      }
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02')
  },
  {
    _id: '60d0fe4f5311236168a109d2',
    name: 'Dinner Menu',
    description: 'Evening dining options',
    restaurant: '60d0fe4f5311236168a109ca', // John Doe's ID
    isPublished: false,
    sections: [
      {
        _id: '60d0fe4f5311236168a109d7',
        name: 'Starters',
        description: 'Begin your evening meal',
        order: 1
      },
      {
        _id: '60d0fe4f5311236168a109d8',
        name: 'Entrees',
        description: 'Main dinner selections',
        order: 2
      }
    ],
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-04')
  }
];

// Mock menu creation payload
const mockMenuPayload = {
  name: 'Brunch Menu',
  description: 'Weekend brunch specialties',
  sections: [
    {
      name: 'Breakfast Items',
      description: 'Morning favorites',
      order: 1
    }
  ]
};

// Mock menu response
const mockMenuResponse = {
  success: true,
  data: {
    _id: '60d0fe4f5311236168a109d3',
    name: 'Brunch Menu',
    description: 'Weekend brunch specialties',
    restaurant: '60d0fe4f5311236168a109ca',
    isPublished: false,
    sections: [
      {
        _id: '60d0fe4f5311236168a109d9',
        name: 'Breakfast Items',
        description: 'Morning favorites',
        order: 1
      }
    ],
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-01-05')
  }
};

// Mock section payload
const mockSectionPayload = {
  name: 'Beverages',
  description: 'Refreshing drink options',
  order: 3
};

// Mock not found response
const mockNotFoundResponse = {
  success: false,
  error: 'Menu not found'
};

// Mock unauthorized response
const mockUnauthorizedResponse = {
  success: false,
  error: 'Not authorized to access this menu'
};

module.exports = {
  mockMenus,
  mockMenuPayload,
  mockMenuResponse,
  mockSectionPayload,
  mockNotFoundResponse,
  mockUnauthorizedResponse
};
