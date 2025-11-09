/**
 * Data factories for creating test objects with realistic data
 */

let counter = 0
const getUniqueId = () => {
  counter++
  return `${Date.now()}-${counter}`
}

/**
 * User factory
 */
const userFactory = {
  build: (overrides = {}) => ({
    email: overrides.email || `user-${getUniqueId()}@example.com`,
    password: overrides.password || 'Password123!',
    name: overrides.name || `Test User ${getUniqueId()}`,
    role: overrides.role || 'user',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    ...overrides,
  }),

  buildAdmin: (overrides = {}) => userFactory.build({ role: 'admin', ...overrides }),

  buildInactive: (overrides = {}) => userFactory.build({ isActive: false, ...overrides }),
}

/**
 * Restaurant factory
 */
const restaurantFactory = {
  build: (userId, overrides = {}) => ({
    name: overrides.name || `Restaurant ${getUniqueId()}`,
    userId,
    description: overrides.description || 'A wonderful test restaurant',
    contact: overrides.contact || {
      phone: '+15550100',
      email: `restaurant-${getUniqueId()}@example.com`,
      website: overrides.website,
    },
    location: overrides.location || {
      street: '123 Main Street',
      houseNumber: '1A',
      city: 'Test City',
      zipCode: '12345',
    },
    hours: overrides.hours || [
      { day: 0, closed: true },
      { day: 1, closed: false, open: '09:00', close: '22:00' },
      { day: 2, closed: false, open: '09:00', close: '22:00' },
      { day: 3, closed: false, open: '09:00', close: '22:00' },
      { day: 4, closed: false, open: '09:00', close: '22:00' },
      { day: 5, closed: false, open: '09:00', close: '23:00' },
      { day: 6, closed: false, open: '10:00', close: '23:00' },
    ],
    logoUrl: overrides.logoUrl,
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    ...overrides,
  }),
}

/**
 * Menu factory
 */
const menuFactory = {
  build: (restaurantId, overrides = {}) => ({
    name: overrides.name || `Menu ${getUniqueId()}`,
    restaurantId,
    description: overrides.description || 'A delicious test menu',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    imageUrl: overrides.imageUrl,
    ...overrides,
  }),
}

/**
 * Menu Item factory
 */
const menuItemFactory = {
  build: (menuId, overrides = {}) => ({
    name: overrides.name || `Item ${getUniqueId()}`,
    menuId,
    description: overrides.description || 'A tasty test item',
    price: overrides.price !== undefined ? overrides.price : 12.99,
    category: overrides.category || 'Main Course',
    isAvailable: overrides.isAvailable !== undefined ? overrides.isAvailable : true,
    imageUrl: overrides.imageUrl,
    allergens: overrides.allergens || [],
    dietary: overrides.dietary || [],
    spicyLevel: overrides.spicyLevel,
    ...overrides,
  }),
}

/**
 * Location factory (embedded in Restaurant)
 */
const locationFactory = {
  build: (overrides = {}) => ({
    street: overrides.street || '123 Main Street',
    houseNumber: overrides.houseNumber || '1A',
    city: overrides.city || 'Test City',
    zipCode: overrides.zipCode || '12345',
  }),
}

/**
 * Bulk factories for creating multiple items
 */
const bulkFactory = {
  users: (count = 3, overridesFn = () => ({})) => {
    return Array.from({ length: count }, (_, i) => userFactory.build(overridesFn(i)))
  },

  restaurants: (userId, count = 3, overridesFn = () => ({})) => {
    return Array.from({ length: count }, (_, i) => restaurantFactory.build(userId, overridesFn(i)))
  },

  menus: (restaurantId, count = 3, overridesFn = () => ({})) => {
    return Array.from({ length: count }, (_, i) => menuFactory.build(restaurantId, overridesFn(i)))
  },

  menuItems: (menuId, count = 5, overridesFn = () => ({})) => {
    return Array.from({ length: count }, (_, i) => menuItemFactory.build(menuId, overridesFn(i)))
  },
}

module.exports = {
  userFactory,
  restaurantFactory,
  menuFactory,
  menuItemFactory,
  locationFactory,
  bulkFactory,
}
