const mongoose = require('mongoose')
const userMockEnhanced = require('./userMockEnhanced')

const restaurantMockEnhanced = {
    validRestaurant: {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        name: 'Test Restaurant',
        description: 'A test restaurant for unit testing',
        location: {
            street: '123 Test St',
            houseNumber: '123',
            city: 'Test City',
            zipCode: '12345',
        },
        phone: '+1234567890',
        email: 'restaurant@test.com',
        userId: userMockEnhanced.validUser._id
    },
    secondRestaurant: {
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        name: 'Second Restaurant',
        description: 'Another test restaurant',
        location: {
            street: '456 Other St',
            houseNumber: '456',
            city: 'Other City',
            zipCode: '54321',
        },
        phone: '+0987654321',
        email: 'other@test.com',
        userId: userMockEnhanced.regularUser._id
    }
}

module.exports = restaurantMockEnhanced 