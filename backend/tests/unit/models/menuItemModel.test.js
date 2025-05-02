const MenuItem = require('@models/menuItemModel')
const Menu = require('@models/menuModel')
const Restaurant = require('@models/restaurantModel')
const User = require('@models/userModel')
const menuItemMock = require('@mocks/menuItemMock')
const menuMock = require('@mocks/menuMock')
const restaurantMock = require('@mocks/restaurantMock')

describe('MenuItem Model Test', () => {
  let menuId

  beforeAll(async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123'
    })

    const restaurant = await Restaurant.create({
      ...restaurantMock.validRestaurant,
      userId: user._id
    })

    const menu = await Menu.create({
      ...menuMock.validMenu,
      restaurantId: restaurant._id
    })

    menuId = menu._id
  })

  it('should create & save menu item successfully', async () => {
    const validMenuItem = new MenuItem({
      ...menuItemMock.validMenuItem,
      menuId
    })
    const savedMenuItem = await validMenuItem.save()

    expect(savedMenuItem._id).toBeDefined()
    expect(savedMenuItem.name).toBe(menuItemMock.validMenuItem.name)
    expect(savedMenuItem.menuId).toBe(menuId)
  })

  it('should fail to save menu item without required fields', async () => {
    const menuItemWithoutRequiredField = new MenuItem({
      menuId,
      description: 'Test description'
    })
    let err

    try {
      await menuItemWithoutRequiredField.save()
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
  })

  it('should fail to save menu item with invalid data', async () => {
    const menuItemWithInvalidData = new MenuItem({
      ...menuItemMock.invalidMenuItem,
      menuId
    })
    let err

    try {
      await menuItemWithInvalidData.save()
    } catch (error) {
      err = error
    }

    expect(err).toBeInstanceOf(Error)
  })

  it('should update menu item successfully', async () => {
    const menuItem = await MenuItem.create({
      ...menuItemMock.validMenuItem,
      menuId
    })

    const updatedName = 'Updated Menu Item Name'
    menuItem.name = updatedName
    const updatedMenuItem = await menuItem.save()

    expect(updatedMenuItem.name).toBe(updatedName)
  })
}) 