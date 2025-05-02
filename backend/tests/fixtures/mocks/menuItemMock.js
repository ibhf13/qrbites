const mongoose = require('mongoose')

const menuItemMock = {
  validMenuItem: {
    name: 'Test Item',
    description: 'A test menu item for unit testing',
    price: 9.99,
    category: 'Main Course',
    isAvailable: true,
    allergens: ['Gluten', 'Dairy'],
    nutritionalInfo: {
      calories: 450,
      protein: 20,
      carbs: 30,
      fat: 15
    },
    ingredients: ['Flour', 'Eggs', 'Milk', 'Cheese']
  },
  invalidMenuItem: {
    name: 'A', // too short
    description: 'A'.repeat(1001), // too long
    price: 'not-a-number',
    category: 123, // not a string
    isAvailable: 'not-a-boolean',
    allergens: 'not-an-array'
  },
  updateMenuItemData: {
    name: 'Updated Item Name',
    description: 'Updated description for the test item',
    price: 12.99,
    isAvailable: false
  },
  menuItemList: [
    {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610d00'),
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and basil',
      price: 10.99,
      category: 'Pizza',
      menuId: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
      isAvailable: true,
      allergens: ['Gluten', 'Dairy'],
      ingredients: ['Flour', 'Tomato Sauce', 'Mozzarella', 'Basil'],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610d01'),
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
      price: 8.99,
      category: 'Salad',
      menuId: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
      isAvailable: true,
      allergens: ['Gluten', 'Dairy', 'Eggs'],
      ingredients: ['Romaine Lettuce', 'Caesar Dressing', 'Croutons', 'Parmesan'],
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02')
    },
    {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610d02'),
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
      price: 7.99,
      category: 'Dessert',
      menuId: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
      isAvailable: true,
      allergens: ['Gluten', 'Dairy', 'Eggs'],
      ingredients: ['Ladyfingers', 'Mascarpone', 'Coffee', 'Cocoa Powder'],
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03')
    }
  ]
}

module.exports = menuItemMock 