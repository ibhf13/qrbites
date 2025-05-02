const mongoose = require('mongoose')

const userMockEnhanced = {
    validUser: {
        _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c90'),
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        role: 'owner'
    },
    adminUser: {
        _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c91'),
        email: 'admin@example.com',
        password: 'hashedPassword123',
        name: 'Admin User',
        role: 'admin'
    },
    regularUser: {
        _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c92'),
        email: 'regular@example.com',
        password: 'hashedPassword123',
        name: 'Regular User',
        role: 'owner'
    }
}

module.exports = userMockEnhanced 