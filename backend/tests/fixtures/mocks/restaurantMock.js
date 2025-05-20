const mongoose = require('mongoose')

const restaurantMock = {
  validRestaurant: {
    name: 'Test Restaurant',
    description: 'A test restaurant for unit testing',
    cuisineType: ['Italian', 'Mediterranean'],
    contact: {
      phone: '+1234567890',
      email: 'contact@testrestaurant.com',
      website: 'https://testrestaurant.com'
    },
    location: {
      street: 'Teststraße',
      houseNumber: '123',
      city: 'Frankfurt',
      zipCode: '60311'
    },
    hours: [
      {
        day: 0, // Sunday
        open: '10:00',
        close: '21:00',
        closed: false
      },
      {
        day: 1, // Monday
        open: '09:00',
        close: '22:00',
        closed: false
      },
      {
        day: 2, // Tuesday
        open: '09:00',
        close: '22:00',
        closed: false
      },
      {
        day: 3, // Wednesday
        open: '09:00',
        close: '22:00',
        closed: false
      },
      {
        day: 4, // Thursday
        open: '09:00',
        close: '22:00',
        closed: false
      },
      {
        day: 5, // Friday
        open: '09:00',
        close: '23:00',
        closed: false
      },
      {
        day: 6, // Saturday
        open: '10:00',
        close: '23:00',
        closed: false
      }
    ],
    isActive: true
  },
  invalidRestaurant: {
    name: 'A', // too short
    contact: {
      phone: 'not-a-phone',
      email: 'invalid-email',
      website: 'invalid-website'
    },
    location: {
      street: '',
      houseNumber: '',
      city: '',
      zipCode: 'invalid123' // invalid German postal code
    },
    description: 'A'.repeat(1001) // too long
  },
  updateRestaurantData: {
    name: 'Updated Restaurant Name',
    contact: {
      phone: '+0987654321'
    },
    location: {
      street: 'Neue Straße',
      houseNumber: '456',
      city: 'Stuttgart'
    },
    isActive: false
  },
  restaurantList: [
    {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c70'),
      name: 'Italian Bistro',
      contact: {
        phone: '+1234567891',
        email: 'contact@italianbistro.com'
      },
      location: {
        street: 'Italienische Straße',
        houseNumber: '123',
        city: 'Dresden',
        zipCode: '01067'
      },
      cuisineType: ['Italian'],
      userId: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c60'),
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c71'),
      name: 'Sushi Palace',
      contact: {
        phone: '+1234567892',
        email: 'contact@sushipalace.com'
      },
      location: {
        street: 'Japanische Allee',
        houseNumber: '456',
        city: 'Düsseldorf',
        zipCode: '40213'
      },
      cuisineType: ['Japanese', 'Asian'],
      userId: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c60'),
      isActive: true,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02')
    },
    {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c72'),
      name: 'Taco Heaven',
      contact: {
        phone: '+1234567893',
        email: 'contact@tacoheaven.com'
      },
      location: {
        street: 'Mexikanischer Boulevard',
        houseNumber: '789',
        city: 'Hannover',
        zipCode: '30159'
      },
      cuisineType: ['Mexican'],
      userId: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c61'),
      isActive: true,
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03')
    }
  ]
}

module.exports = restaurantMock 