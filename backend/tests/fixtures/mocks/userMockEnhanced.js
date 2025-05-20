const mongoose = require('mongoose')

const userMockEnhanced = {
    validUser: {
        _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c90'),
        email: 'test@example.com',
        password: 'hashedPassword123',
        role: 'user',
        isActive: true
    },
    adminUser: {
        _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c91'),
        email: 'admin@example.com',
        password: 'hashedPassword123',
        role: 'admin',
        isActive: true
    },
    regularUser: {
        _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c92'),
        email: 'regular@example.com',
        password: 'hashedPassword123',
        role: 'user',
        isActive: true
    }
}

module.exports = userMockEnhanced 