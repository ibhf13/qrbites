const mongoose = require('mongoose')
const userMockEnhanced = require('./userMockEnhanced')

const restaurantMockEnhanced = {
    validRestaurant: {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        name: 'Test Restaurant',
        description: 'A test restaurant for unit testing',
        address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'Test Country'
        },
        phone: '+1234567890',
        email: 'restaurant@test.com',
        userId: userMockEnhanced.validUser._id
    },
    secondRestaurant: {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        name: 'Second Restaurant',
        description: 'Another test restaurant',
        address: {
            street: '456 Other St',
            city: 'Other City',
            state: 'Other State',
            zipCode: '54321',
            country: 'Other Country'
        },
        phone: '+0987654321',
        email: 'other@test.com',
        userId: userMockEnhanced.regularUser._id
    }
}

module.exports = restaurantMockEnhanced 