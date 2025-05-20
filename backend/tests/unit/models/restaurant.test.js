const Restaurant = require('@models/restaurant')
const User = require('@models/user')
const restaurantMock = require('@mocks/restaurantMock')

describe('Restaurant Model Test', () => {
  let userId

  beforeAll(async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123'
    })
    userId = user._id
  })

  it('should create & save restaurant successfully', async () => {
    const validRestaurant = new Restaurant({
      ...restaurantMock.validRestaurant,
      userId
    })
    const savedRestaurant = await validRestaurant.save()

    expect(savedRestaurant._id).toBeDefined()
    expect(savedRestaurant.name).toBe(restaurantMock.validRestaurant.name)
    expect(savedRestaurant.userId).toBe(userId)
    expect(savedRestaurant.contact).toBeDefined()
    expect(savedRestaurant.location).toBeDefined()
    expect(savedRestaurant.hours).toBeDefined()
  })

  it('should fail to save restaurant without required fields', async () => {
    const restaurantWithoutRequiredField = new Restaurant({
      userId,
      description: 'Test description'
    })
    let err

    try {
      await restaurantWithoutRequiredField.save()
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
  })

  it('should fail to save restaurant with invalid data', async () => {
    const restaurantWithInvalidData = new Restaurant({
      ...restaurantMock.invalidRestaurant,
      userId
    })
    let err

    try {
      await restaurantWithInvalidData.save()
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
  })

  it('should update restaurant successfully', async () => {
    const restaurant = await Restaurant.create({
      ...restaurantMock.validRestaurant,
      userId
    })

    const updatedName = 'Updated Restaurant Name'
    restaurant.name = updatedName
    const updatedRestaurant = await restaurant.save()

    expect(updatedRestaurant.name).toBe(updatedName)
  })

  it('should validate contact information', async () => {
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      userId,
      contact: {
        phone: 'invalid-phone',
        email: 'invalid-email',
        website: 'invalid-url'
      },
      location: {
        street: '123 Test St',
        houseNumber: '123',
        city: 'Test City',
        zipCode: '12345',
      }
    })

    let err
    try {
      await restaurant.validate() // Only validate, don't save
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
  })

  it('should validate location information', async () => {
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      userId,
      contact: {
        phone: '+1234567890',
        email: 'restaurant@test.com',
        website: 'https://test-restaurant.com'
      },
      location: {
        street: '',
        houseNumber: '',
        city: '',
        zipCode: 'invalid',
      }
    })

    let err
    try {
      await restaurant.validate() // Only validate, don't save
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
  })
}) 