const mongoose = require('mongoose')
const Menu = require('@models/menu')
const menuMock = require('@mocks/menuMockEnhanced')

describe('Menu Model Tests', () => {
  it('should create and save a menu successfully', async () => {
    const validMenu = new Menu(menuMock.validMenu)
    const savedMenu = await validMenu.save()

    // Verify saved document
    expect(savedMenu._id).toBeDefined()
    expect(savedMenu.name).toBe(menuMock.validMenu.name)
    expect(savedMenu.description).toBe(menuMock.validMenu.description)
    expect(savedMenu.isActive).toBe(menuMock.validMenu.isActive)
    expect(savedMenu.categories).toEqual(expect.arrayContaining(menuMock.validMenu.categories))
    expect(savedMenu.restaurantId.toString()).toBe(menuMock.validMenu.restaurantId.toString())
    expect(savedMenu.createdAt).toBeDefined()
    expect(savedMenu.updatedAt).toBeDefined()
  })

  it('should create a menu with default values when only required fields are provided', async () => {
    const menuWithRequiredFields = new Menu({
      name: 'Minimal Menu',
      restaurantId: menuMock.validMenu.restaurantId
    })

    const savedMenu = await menuWithRequiredFields.save()

    expect(savedMenu._id).toBeDefined()
    expect(savedMenu.name).toBe('Minimal Menu')
    expect(savedMenu.isActive).toBe(true)
    expect(savedMenu.categories).toEqual([])
    expect(savedMenu.qrCodeUrl).toBeNull()
  })

  it('should fail to save a menu without a name', async () => {
    const menuWithoutName = new Menu({
      description: 'A menu without a name',
      restaurantId: menuMock.validMenu.restaurantId
    })

    let error
    try {
      await menuWithoutName.save()
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
    expect(error.errors.name).toBeDefined()
    expect(error.name).toBe('ValidationError')
  })

  it('should fail to save a menu without a restaurantId', async () => {
    const menuWithoutRestaurantId = new Menu({
      name: 'Menu without restaurant',
      description: 'This menu has no restaurant ID'
    })

    let error
    try {
      await menuWithoutRestaurantId.save()
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
    expect(error.errors.restaurantId).toBeDefined()
    expect(error.name).toBe('ValidationError')
  })

  it('should fail to save a menu with a name that is too short', async () => {
    const menuWithShortName = new Menu({
      name: 'Ab', // Less than 3 characters
      restaurantId: menuMock.validMenu.restaurantId
    })

    let error
    try {
      await menuWithShortName.save()
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
    expect(error.errors.name).toBeDefined()
    expect(error.name).toBe('ValidationError')
  })

  it('should fail to save a menu with a name that is too long', async () => {
    const menuWithLongName = new Menu({
      name: 'A'.repeat(51), // More than 50 characters
      restaurantId: menuMock.validMenu.restaurantId
    })

    let error
    try {
      await menuWithLongName.save()
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
    expect(error.errors.name).toBeDefined()
    expect(error.name).toBe('ValidationError')
  })

  it('should fail to save a menu with a description that is too long', async () => {
    const menuWithLongDescription = new Menu({
      name: 'Menu with long description',
      description: 'A'.repeat(501), // More than 500 characters
      restaurantId: menuMock.validMenu.restaurantId
    })

    let error
    try {
      await menuWithLongDescription.save()
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
    expect(error.errors.description).toBeDefined()
    expect(error.name).toBe('ValidationError')
  })

  it('should update timestamps when saving a menu', async () => {
    // Create initial menu
    const menu = new Menu(menuMock.validMenu)
    const savedMenu = await menu.save()

    // Delay to ensure timestamps are different
    await new Promise(resolve => setTimeout(resolve, 100))

    // Update the menu
    savedMenu.name = 'Updated Menu Name'
    const updatedMenu = await savedMenu.save()

    expect(updatedMenu.updatedAt).not.toEqual(savedMenu.createdAt)
    expect(updatedMenu.updatedAt.getTime()).toBeGreaterThan(savedMenu.createdAt.getTime())
  })

  it('should have a virtual menuItems field', async () => {
    // Create a menu first to ensure there's data
    const menu = new Menu(menuMock.validMenu)
    await menu.save()

    // Check if we can access the virtual field
    const foundMenu = await Menu.findOne()

    // Just verify the virtual property exists
    expect(foundMenu).toBeDefined()
    expect(foundMenu).toHaveProperty('menuItems')
  })
}) 