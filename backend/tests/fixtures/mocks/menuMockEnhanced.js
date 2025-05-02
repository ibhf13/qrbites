const mongoose = require('mongoose')

const menuMockEnhanced = {
    validMenu: {
        name: 'Test Menu',
        description: 'A test menu for unit testing',
        isActive: true,
        categories: ['Appetizers', 'Main Course', 'Desserts'],
        restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')
    },
    validMenuWithoutCategories: {
        name: 'Breakfast Menu',
        description: 'Morning breakfast options',
        isActive: true,
        restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')
    },
    invalidMenu: {
        name: 'A', // too short
        description: 'A'.repeat(501), // too long
        isActive: 'not-a-boolean', // invalid boolean
        categories: 123, // not an array
        restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')
    },
    updateMenuData: {
        name: 'Updated Menu Name',
        description: 'Updated description',
        isActive: false,
        categories: ['Breakfast', 'Brunch']
    },
    menuList: [
        {
            _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
            name: 'Lunch Menu',
            description: 'Lunch options',
            isActive: true,
            categories: ['Appetizers', 'Main Course'],
            restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
        },
        {
            _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c86'),
            name: 'Dinner Menu',
            description: 'Dinner options',
            isActive: true,
            categories: ['Main Course', 'Desserts'],
            restaurantId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
            createdAt: new Date('2023-01-02'),
            updatedAt: new Date('2023-01-02')
        }
    ]
}

module.exports = menuMockEnhanced 