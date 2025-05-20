const mongoose = require('mongoose')

const userMock = {
  validUser: {
    email: 'user@test.com',
    password: 'Password123!',
    role: 'user'
  },

  validAdmin: {
    email: 'admin@test.com',
    password: 'AdminPass123!',
    role: 'admin'
  },

  invalidUser: {
    email: 'invalid-email',
    password: '123', // too short
    role: 'invalid-role'
  },

  updateUserData: {
    email: 'updated@test.com',
    role: 'user'
  },

  userList: [
    {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c60'),
      email: 'john@example.com',
      password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1dXGQTK5CWsZzAQNmrpjihGpdRoGO', // hashed 'Password123!'
      role: 'user',
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c61'),
      email: 'jane@example.com',
      password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1dXGQTK5CWsZzAQNmrpjihGpdRoGO', // hashed 'Password123!'
      role: 'user',
      isActive: true,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02')
    },
    {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c62'),
      email: 'admin@example.com',
      password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1dXGQTK5CWsZzAQNmrpjihGpdRoGO', // hashed 'Password123!'
      role: 'admin',
      isActive: true,
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03')
    }
  ]
}

module.exports = userMock 