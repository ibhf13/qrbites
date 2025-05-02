const mongoose = require('mongoose')

const userMock = {
  validUser: {
    name: 'Test User',
    email: 'user@test.com',
    password: 'Password123!',
    role: 'user'
  },

  validAdmin: {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'AdminPass123!',
    role: 'admin'
  },

  invalidUser: {
    name: 'A', // too short
    email: 'invalid-email',
    password: '123', // too short
    role: 'invalid-role'
  },

  updateUserData: {
    name: 'Updated User Name',
    email: 'updated@test.com'
  },

  userList: [
    {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c60'),
      name: 'John Doe',
      email: 'john@example.com',
      password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1dXGQTK5CWsZzAQNmrpjihGpdRoGO', // hashed 'Password123!'
      role: 'user',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c61'),
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1dXGQTK5CWsZzAQNmrpjihGpdRoGO', // hashed 'Password123!'
      role: 'user',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02')
    },
    {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c62'),
      name: 'Admin User',
      email: 'admin@example.com',
      password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1dXGQTK5CWsZzAQNmrpjihGpdRoGO', // hashed 'Password123!'
      role: 'admin',
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03')
    }
  ]
}

module.exports = userMock 