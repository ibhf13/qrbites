const jwt = require('jsonwebtoken')
const User = require('@modules/users/models/user')
const Restaurant = require('@modules/restaurants/models/restaurant')
const Menu = require('@modules/menus/models/menu')
const MenuItem = require('@modules/menuItems/models/menuItem')

/**
 * Generate a JWT token for a user
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
const generateToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

/**
 * Create a test user and return user with token
 * @param {Object} userData - User data
 * @returns {Promise<{user: Object, token: string}>}
 */
const createTestUser = async (userData = {}) => {
  const defaultData = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User',
    role: 'user',
    isActive: true,
  }

  const user = await User.create({ ...defaultData, ...userData })
  const token = generateToken(user._id)

  return { user, token }
}

/**
 * Create a test admin user and return user with token
 * @param {Object} userData - User data
 * @returns {Promise<{user: Object, token: string}>}
 */
const createTestAdmin = async (userData = {}) => {
  return createTestUser({ ...userData, role: 'admin' })
}

/**
 * Create a test restaurant
 * @param {string} userId - Owner user ID
 * @param {Object} restaurantData - Restaurant data
 * @returns {Promise<Object>} Restaurant document
 */
const createTestRestaurant = async (userId, restaurantData = {}) => {
  const defaultData = {
    name: `Test Restaurant ${Date.now()}`,
    userId,
    description: 'A test restaurant',
    contact: {
      phone: '+15550100',
      email: `restaurant-${Date.now()}@example.com`,
      website: 'https://example.com',
    },
    location: {
      street: '123 Test St',
      houseNumber: '1A',
      city: 'Test City',
      zipCode: '12345',
    },
    hours: [],
    isActive: true,
  }

  return Restaurant.create({ ...defaultData, ...restaurantData })
}

/**
 * Create a test menu
 * @param {string} restaurantId - Restaurant ID
 * @param {Object} menuData - Menu data
 * @returns {Promise<Object>} Menu document
 */
const createTestMenu = async (restaurantId, menuData = {}) => {
  const defaultData = {
    name: `Test Menu ${Date.now()}`,
    restaurantId,
    description: 'Test menu description',
  }

  return Menu.create({ ...defaultData, ...menuData })
}

/**
 * Create a test menu item
 * @param {string} menuId - Menu ID
 * @param {Object} itemData - Menu item data
 * @returns {Promise<Object>} Menu item document
 */
const createTestMenuItem = async (menuId, itemData = {}) => {
  const defaultData = {
    name: `Test Item ${Date.now()}`,
    menuId,
    description: 'Test item description',
    price: 9.99,
    category: 'Test Category',
  }

  return MenuItem.create({ ...defaultData, ...itemData })
}

/**
 * Clean up all test data
 */
const cleanupDatabase = async () => {
  await User.deleteMany({})
  await Restaurant.deleteMany({})
  await Menu.deleteMany({})
  await MenuItem.deleteMany({})
}

/**
 * Create a complete test setup with user, restaurant, menu, and menu item
 * @returns {Promise<Object>} Test data objects
 */
const createCompleteTestSetup = async () => {
  const { user, token } = await createTestUser()
  const restaurant = await createTestRestaurant(user._id)
  const menu = await createTestMenu(restaurant._id)
  const menuItem = await createTestMenuItem(menu._id)

  return { user, token, restaurant, menu, menuItem }
}

/**
 * Create multiple test users
 * @param {number} count - Number of users to create
 * @returns {Promise<Array>} Array of user objects with tokens
 */
const createMultipleUsers = async (count = 2) => {
  const users = []
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      email: `test-user-${i}-${Date.now()}@example.com`,
      name: `Test User ${i}`,
    })
    users.push(user)
  }
  return users
}

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Assert that an object has specific properties
 * @param {Object} obj - Object to check
 * @param {Array<string>} properties - Expected properties
 */
const assertHasProperties = (obj, properties) => {
  properties.forEach(prop => {
    expect(obj).toHaveProperty(prop)
  })
}

/**
 * Assert that response has standard success structure
 * @param {Object} response - Response object
 */
const assertSuccessResponse = response => {
  expect(response.body).toHaveProperty('success', true)
  expect(response.body).toHaveProperty('data')
}

/**
 * Assert that response has pagination structure
 * @param {Object} response - Response object
 */
const assertPaginationResponse = response => {
  assertSuccessResponse(response)
  expect(response.body).toHaveProperty('pagination')
  expect(response.body.pagination).toHaveProperty('page')
  expect(response.body.pagination).toHaveProperty('limit')
  expect(response.body.pagination).toHaveProperty('total')
  expect(response.body.pagination).toHaveProperty('pages')
}

/**
 * Extract error message from response
 * @param {Object} response - Response object
 * @returns {string} Error message
 */
const getErrorMessage = response => {
  return response.body?.message || response.body?.error || 'Unknown error'
}

module.exports = {
  generateToken,
  createTestUser,
  createTestAdmin,
  createTestRestaurant,
  createTestMenu,
  createTestMenuItem,
  cleanupDatabase,
  createCompleteTestSetup,
  createMultipleUsers,
  wait,
  assertHasProperties,
  assertSuccessResponse,
  assertPaginationResponse,
  getErrorMessage,
}

