const mongoose = require('mongoose')
const MenuItem = require('@models/menuItem')
const Menu = require('@models/menu')
const Restaurant = require('@models/restaurant')
const menuItemController = require('@controllers/menuItemController')
const menuItemMock = require('@mocks/menuItemMock')
const menuMock = require('@mocks/menuMockEnhanced')
const restaurantMock = require('@mocks/restaurantMockEnhanced')
const userMock = require('@mocks/userMockEnhanced')
const { notFound, forbidden, badRequest } = require('@utils/errorUtils')

// Mock dependencies
jest.mock('@models/menuItem')
jest.mock('@models/menu')
jest.mock('@models/restaurant')
jest.mock('@services/errorLogService', () => ({
    logDatabaseError: jest.fn()
}))
jest.mock('@services/fileUploadService', () => ({
    getFileUrl: jest.fn((filename, type) => `http://example.com/uploads/${filename}`)
}))
jest.mock('@utils/logger', () => ({
    success: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
}))

// Mock the asyncHandler to make testing easier
jest.mock('@utils/errorUtils', () => {
    const originalModule = jest.requireActual('@utils/errorUtils')
    return {
        ...originalModule,
        asyncHandler: fn => async (req, res, next) => {
            try {
                return await fn(req, res, next)
            } catch (error) {
                next(error)
            }
        },
        notFound: jest.fn(msg => new Error(msg)),
        badRequest: jest.fn(msg => new Error(msg)),
        forbidden: jest.fn(msg => new Error(msg))
    }
})

describe('MenuItem Controller Tests', () => {
    let req, res, next

    // Setup mock req and res objects
    beforeEach(() => {
        res = {
            status: jest.fn(() => res),
            json: jest.fn(() => res),
            send: jest.fn(() => res)
        }
        req = {
            params: {},
            query: {},
            body: {},
            user: { ...userMock.validUser }
        }
        next = jest.fn()
    })

    // Reset all mocks after each test
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('getMenuItems', () => {
        it('should return menu items with default pagination', async () => {
            // Mock MenuItem.find and related methods
            const findMock = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(menuItemMock.menuItemList)
            }
            MenuItem.find = jest.fn().mockReturnValue(findMock)
            MenuItem.countDocuments = jest.fn().mockResolvedValue(3)

            await menuItemController.getMenuItems(req, res, next)

            expect(MenuItem.find).toHaveBeenCalledWith({})
            expect(findMock.select).toHaveBeenCalledWith('-__v')
            expect(findMock.sort).toHaveBeenCalledWith({ createdAt: -1 })
            expect(findMock.skip).toHaveBeenCalledWith(0)
            expect(findMock.limit).toHaveBeenCalledWith(10)
            expect(findMock.populate).toHaveBeenCalledWith({
                path: 'menuId',
                select: 'name restaurantId'
            })
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: menuItemMock.menuItemList,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 3,
                    pages: 1
                }
            })
        })

        it('should handle filtering by name, menuId and category', async () => {
            req.query = {
                name: 'Pizza',
                menuId: menuMock.menuList[0]._id.toString(),
                category: 'Pizza',
                page: 2,
                limit: 5,
                sortBy: 'price',
                order: 'asc'
            }

            const findMock = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue([menuItemMock.menuItemList[0]])
            }
            MenuItem.find = jest.fn().mockReturnValue(findMock)
            MenuItem.countDocuments = jest.fn().mockResolvedValue(1)

            await menuItemController.getMenuItems(req, res, next)

            expect(MenuItem.find).toHaveBeenCalledWith({
                name: { $regex: 'Pizza', $options: 'i' },
                menuId: menuMock.menuList[0]._id.toString(),
                category: 'Pizza'
            })
            expect(findMock.sort).toHaveBeenCalledWith({ price: 1 })
            expect(findMock.skip).toHaveBeenCalledWith(5) // (page-1) * limit
            expect(findMock.limit).toHaveBeenCalledWith(5)
            expect(res.json).toHaveBeenCalled()
        })

        it('should handle database error during menu item listing', async () => {
            const error = new Error('Database error')
            MenuItem.find = jest.fn().mockImplementation(() => {
                throw error
            })

            await menuItemController.getMenuItems(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })
    })

    describe('getMenuItemById', () => {
        it('should return a menu item by ID', async () => {
            req.params.id = menuItemMock.menuItemList[0]._id.toString()

            const findByIdMock = {
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(menuItemMock.menuItemList[0])
            }
            MenuItem.findById = jest.fn().mockReturnValue(findByIdMock)

            await menuItemController.getMenuItemById(req, res, next)

            expect(MenuItem.findById).toHaveBeenCalledWith(req.params.id)
            expect(findByIdMock.select).toHaveBeenCalledWith('-__v')
            expect(findByIdMock.populate).toHaveBeenCalledWith({
                path: 'menuId',
                select: 'name restaurantId',
                populate: {
                    path: 'restaurantId',
                    select: 'name'
                }
            })
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: menuItemMock.menuItemList[0]
            })
        })

        it('should return 404 if menu item not found', async () => {
            req.params.id = new mongoose.Types.ObjectId().toString()

            const findByIdMock = {
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(null)
            }
            MenuItem.findById = jest.fn().mockReturnValue(findByIdMock)

            await menuItemController.getMenuItemById(req, res, next)
            expect(notFound).toHaveBeenCalled()
            expect(next).toHaveBeenCalled()
        })

        it('should handle invalid ID format', async () => {
            req.params.id = 'invalid-id'
            const error = new Error('Cast Error')
            error.name = 'CastError'

            MenuItem.findById = jest.fn().mockImplementation(() => {
                throw error
            })

            await menuItemController.getMenuItemById(req, res, next)
            expect(badRequest).toHaveBeenCalledWith('Invalid menu item ID format')
            expect(next).toHaveBeenCalled()
        })
    })

    describe('createMenuItem', () => {
        it('should create a new menu item when user is restaurant owner', async () => {
            // Setup request data
            req.body = {
                name: 'New Menu Item',
                description: 'A delicious new menu item',
                price: 15.99,
                category: 'Main Course',
                menuId: menuMock.menuList[0]._id.toString(),
                allergens: ['Gluten', 'Dairy']
            }
            req.user = {
                _id: userMock.validUser._id,
                role: 'user'
            }

            // Mock Menu.findById to return a menu
            const menu = {
                _id: menuMock.menuList[0]._id,
                name: menuMock.menuList[0].name,
                restaurantId: restaurantMock.validRestaurant._id
            }
            Menu.findById = jest.fn().mockResolvedValue(menu)

            // Mock Restaurant.findById to return a restaurant
            const restaurant = {
                _id: restaurantMock.validRestaurant._id,
                name: restaurantMock.validRestaurant.name,
                userId: {
                    toString: () => userMock.validUser._id.toString()
                }
            }
            Restaurant.findById = jest.fn().mockResolvedValue(restaurant)

            // Mock MenuItem.create to return a new menu item
            const createdMenuItem = {
                _id: new mongoose.Types.ObjectId(),
                ...req.body
            }
            MenuItem.create = jest.fn().mockResolvedValue(createdMenuItem)

            await menuItemController.createMenuItem(req, res, next)

            expect(Menu.findById).toHaveBeenCalledWith(req.body.menuId)
            expect(Restaurant.findById).toHaveBeenCalledWith(menu.restaurantId)
            expect(MenuItem.create).toHaveBeenCalledWith(req.body)
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: createdMenuItem
            })
        })

        it('should create a menu item with image if file was uploaded', async () => {
            // Setup request data
            req.body = {
                name: 'New Menu Item',
                description: 'A delicious new menu item',
                price: 15.99,
                category: 'Main Course',
                menuId: menuMock.menuList[0]._id.toString()
            }
            req.file = { filename: 'menuitem.jpg' }
            req.user = {
                _id: userMock.validUser._id,
                role: 'user'
            }

            // Mock the fileUploadService behavior
            const { getFileUrl } = require('@services/fileUploadService')
            getFileUrl.mockReturnValue('http://example.com/uploads/menuitem.jpg')

            // Mock Menu.findById to return a menu
            const menu = {
                _id: menuMock.menuList[0]._id,
                name: menuMock.menuList[0].name,
                restaurantId: restaurantMock.validRestaurant._id
            }
            Menu.findById = jest.fn().mockResolvedValue(menu)

            // Mock Restaurant.findById to return a restaurant
            const restaurant = {
                _id: restaurantMock.validRestaurant._id,
                name: restaurantMock.validRestaurant.name,
                userId: {
                    toString: () => userMock.validUser._id.toString()
                }
            }
            Restaurant.findById = jest.fn().mockResolvedValue(restaurant)

            // Mock MenuItem.create to return a new menu item
            const createdMenuItem = {
                _id: new mongoose.Types.ObjectId(),
                ...req.body,
                imageUrl: 'http://example.com/uploads/menuitem.jpg'
            }
            MenuItem.create = jest.fn().mockResolvedValue(createdMenuItem)

            await menuItemController.createMenuItem(req, res, next)

            // Expect getFileUrl to be called with the correct arguments
            expect(getFileUrl).toHaveBeenCalledWith('menuitem.jpg', 'menuItem')

            // Expect imageUrl to be set in the request body
            expect(req.body.imageUrl).toBe('http://example.com/uploads/menuitem.jpg')

            expect(MenuItem.create).toHaveBeenCalledWith(req.body)
        })

        it('should return 404 if menu not found', async () => {
            req.body = {
                name: 'New Menu Item',
                price: 15.99,
                menuId: new mongoose.Types.ObjectId().toString()
            }
            req.user = { _id: userMock.validUser._id }

            // Mock Menu.findById to return null
            Menu.findById = jest.fn().mockResolvedValue(null)

            await menuItemController.createMenuItem(req, res, next)

            expect(Menu.findById).toHaveBeenCalledWith(req.body.menuId)
            expect(notFound).toHaveBeenCalled()
            expect(next).toHaveBeenCalled()
            expect(MenuItem.create).not.toHaveBeenCalled()
        })

        it('should return 403 if user is not authorized to create menu item', async () => {
            req.body = {
                name: 'New Menu Item',
                price: 15.99,
                menuId: menuMock.menuList[0]._id.toString()
            }
            req.user = {
                _id: new mongoose.Types.ObjectId(), // Different user
                role: 'user'
            }

            // Mock Menu.findById to return a menu
            const menu = {
                _id: menuMock.menuList[0]._id,
                name: menuMock.menuList[0].name,
                restaurantId: restaurantMock.validRestaurant._id
            }
            Menu.findById = jest.fn().mockResolvedValue(menu)

            // Mock Restaurant.findById to return a restaurant
            const restaurant = {
                _id: restaurantMock.validRestaurant._id,
                name: restaurantMock.validRestaurant.name,
                userId: {
                    toString: () => userMock.validUser._id.toString() // Original owner
                }
            }
            Restaurant.findById = jest.fn().mockResolvedValue(restaurant)

            await menuItemController.createMenuItem(req, res, next)

            expect(forbidden).toHaveBeenCalledWith('Not authorized to create menu items for this menu')
            expect(next).toHaveBeenCalled()
            expect(MenuItem.create).not.toHaveBeenCalled()
        })
    })

    describe('updateMenuItem', () => {
        it('should update a menu item when user is restaurant owner', async () => {
            // Setup request data
            const menuItemId = menuItemMock.menuItemList[0]._id.toString()
            req.params.id = menuItemId
            req.body = {
                name: 'Updated Menu Item',
                price: 16.99
            }
            req.user = {
                _id: userMock.validUser._id,
                role: 'user'
            }

            // Mock MenuItem.findById to return a menu item
            const menuItem = {
                ...menuItemMock.menuItemList[0],
                menuId: menuMock.menuList[0]._id
            }
            MenuItem.findById = jest.fn().mockResolvedValue(menuItem)

            // Mock Menu.findById to return a menu
            const menu = {
                _id: menuMock.menuList[0]._id,
                name: menuMock.menuList[0].name,
                restaurantId: restaurantMock.validRestaurant._id
            }
            Menu.findById = jest.fn().mockResolvedValue(menu)

            // Mock Restaurant.findById to return a restaurant
            const restaurant = {
                _id: restaurantMock.validRestaurant._id,
                name: restaurantMock.validRestaurant.name,
                userId: {
                    toString: () => userMock.validUser._id.toString()
                }
            }
            Restaurant.findById = jest.fn().mockResolvedValue(restaurant)

            // Mock MenuItem.findByIdAndUpdate to return updated menu item
            const updatedMenuItem = {
                ...menuItem,
                ...req.body
            }
            MenuItem.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedMenuItem)

            await menuItemController.updateMenuItem(req, res, next)

            expect(MenuItem.findById).toHaveBeenCalledWith(menuItemId)
            expect(Menu.findById).toHaveBeenCalledWith(menuItem.menuId)
            expect(Restaurant.findById).toHaveBeenCalledWith(menu.restaurantId)
            expect(MenuItem.findByIdAndUpdate).toHaveBeenCalledWith(
                menuItemId,
                req.body,
                { new: true, runValidators: true }
            )
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedMenuItem
            })
        })

        it('should return 404 if menu item not found', async () => {
            req.params.id = new mongoose.Types.ObjectId().toString()
            req.body = { name: 'Updated Item' }
            req.user = { _id: userMock.validUser._id }

            // Mock MenuItem.findById to return null
            MenuItem.findById = jest.fn().mockResolvedValue(null)

            await menuItemController.updateMenuItem(req, res, next)

            expect(MenuItem.findById).toHaveBeenCalledWith(req.params.id)
            expect(notFound).toHaveBeenCalled()
            expect(next).toHaveBeenCalled()
            expect(MenuItem.findByIdAndUpdate).not.toHaveBeenCalled()
        })

        it('should return 403 if user is not authorized to update menu item', async () => {
            const menuItemId = menuItemMock.menuItemList[0]._id.toString()
            req.params.id = menuItemId
            req.body = { name: 'Unauthorized Update' }
            req.user = {
                _id: new mongoose.Types.ObjectId(), // Different user
                role: 'user'
            }

            // Mock MenuItem.findById to return a menu item
            const menuItem = {
                ...menuItemMock.menuItemList[0],
                menuId: menuMock.menuList[0]._id
            }
            MenuItem.findById = jest.fn().mockResolvedValue(menuItem)

            // Mock Menu.findById to return a menu
            const menu = {
                _id: menuMock.menuList[0]._id,
                name: menuMock.menuList[0].name,
                restaurantId: restaurantMock.validRestaurant._id
            }
            Menu.findById = jest.fn().mockResolvedValue(menu)

            // Mock Restaurant.findById to return a restaurant
            const restaurant = {
                _id: restaurantMock.validRestaurant._id,
                name: restaurantMock.validRestaurant.name,
                userId: {
                    toString: () => userMock.validUser._id.toString() // Original owner
                }
            }
            Restaurant.findById = jest.fn().mockResolvedValue(restaurant)

            await menuItemController.updateMenuItem(req, res, next)

            expect(forbidden).toHaveBeenCalledWith('Not authorized to update this menu item')
            expect(next).toHaveBeenCalled()
            expect(MenuItem.findByIdAndUpdate).not.toHaveBeenCalled()
        })

        it('should update a menu item with image if file was uploaded', async () => {
            // Setup request data
            const menuItemId = menuItemMock.menuItemList[0]._id.toString()
            req.params.id = menuItemId
            req.body = {
                name: 'Updated Menu Item With Image',
                price: 16.99
            }
            req.file = { filename: 'updated-menuitem.jpg' }
            req.user = {
                _id: userMock.validUser._id,
                role: 'user'
            }

            // Mock the fileUploadService behavior
            const { getFileUrl } = require('@services/fileUploadService')
            getFileUrl.mockReturnValue('http://example.com/uploads/updated-menuitem.jpg')

            // Mock MenuItem.findById to return a menu item
            const menuItem = {
                ...menuItemMock.menuItemList[0],
                menuId: menuMock.menuList[0]._id
            }
            MenuItem.findById = jest.fn().mockResolvedValue(menuItem)

            // Mock Menu.findById to return a menu
            const menu = {
                _id: menuMock.menuList[0]._id,
                name: menuMock.menuList[0].name,
                restaurantId: restaurantMock.validRestaurant._id
            }
            Menu.findById = jest.fn().mockResolvedValue(menu)

            // Mock Restaurant.findById to return a restaurant
            const restaurant = {
                _id: restaurantMock.validRestaurant._id,
                name: restaurantMock.validRestaurant.name,
                userId: {
                    toString: () => userMock.validUser._id.toString()
                }
            }
            Restaurant.findById = jest.fn().mockResolvedValue(restaurant)

            // Mock MenuItem.findByIdAndUpdate to return updated menu item
            const updatedMenuItem = {
                ...menuItem,
                ...req.body,
                imageUrl: 'http://example.com/uploads/updated-menuitem.jpg'
            }
            MenuItem.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedMenuItem)

            await menuItemController.updateMenuItem(req, res, next)

            // Expect getFileUrl to be called with the correct arguments
            expect(getFileUrl).toHaveBeenCalledWith('updated-menuitem.jpg', 'menuItem')

            // Expect imageUrl to be set in the request body
            expect(req.body.imageUrl).toBe('http://example.com/uploads/updated-menuitem.jpg')

            expect(MenuItem.findByIdAndUpdate).toHaveBeenCalledWith(
                menuItemId,
                req.body,
                { new: true, runValidators: true }
            )
        })
    })

    describe('deleteMenuItem', () => {
        it('should delete a menu item when user is restaurant owner', async () => {
            const menuItemId = menuItemMock.menuItemList[0]._id.toString()
            req.params.id = menuItemId
            req.user = {
                _id: userMock.validUser._id,
                role: 'user'
            }

            // Mock MenuItem.findById to return a menu item
            const menuItem = {
                ...menuItemMock.menuItemList[0],
                menuId: menuMock.menuList[0]._id,
                deleteOne: jest.fn().mockResolvedValue({ acknowledged: true, deletedCount: 1 })
            }
            MenuItem.findById = jest.fn().mockResolvedValue(menuItem)

            // Mock Menu.findById to return a menu
            const menu = {
                _id: menuMock.menuList[0]._id,
                name: menuMock.menuList[0].name,
                restaurantId: restaurantMock.validRestaurant._id
            }
            Menu.findById = jest.fn().mockResolvedValue(menu)

            // Mock Restaurant.findById to return a restaurant
            const restaurant = {
                _id: restaurantMock.validRestaurant._id,
                name: restaurantMock.validRestaurant.name,
                userId: {
                    toString: () => userMock.validUser._id.toString()
                }
            }
            Restaurant.findById = jest.fn().mockResolvedValue(restaurant)

            await menuItemController.deleteMenuItem(req, res, next)

            expect(MenuItem.findById).toHaveBeenCalledWith(menuItemId)
            expect(Menu.findById).toHaveBeenCalledWith(menuItem.menuId)
            expect(Restaurant.findById).toHaveBeenCalledWith(menu.restaurantId)
            expect(menuItem.deleteOne).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(204)
            expect(res.send).toHaveBeenCalled()
        })

        it('should return 404 if menu item not found', async () => {
            req.params.id = new mongoose.Types.ObjectId().toString()
            req.user = { _id: userMock.validUser._id }

            // Mock MenuItem.findById to return null
            MenuItem.findById = jest.fn().mockResolvedValue(null)

            await menuItemController.deleteMenuItem(req, res, next)

            expect(MenuItem.findById).toHaveBeenCalledWith(req.params.id)
            expect(notFound).toHaveBeenCalled()
            expect(next).toHaveBeenCalled()
        })

        it('should return 403 if user is not authorized to delete menu item', async () => {
            const menuItemId = menuItemMock.menuItemList[0]._id.toString()
            req.params.id = menuItemId
            req.user = {
                _id: new mongoose.Types.ObjectId(), // Different user
                role: 'user'
            }

            // Mock MenuItem.findById to return a menu item
            const menuItem = {
                ...menuItemMock.menuItemList[0],
                menuId: menuMock.menuList[0]._id,
                deleteOne: jest.fn()
            }
            MenuItem.findById = jest.fn().mockResolvedValue(menuItem)

            // Mock Menu.findById to return a menu
            const menu = {
                _id: menuMock.menuList[0]._id,
                name: menuMock.menuList[0].name,
                restaurantId: restaurantMock.validRestaurant._id
            }
            Menu.findById = jest.fn().mockResolvedValue(menu)

            // Mock Restaurant.findById to return a restaurant
            const restaurant = {
                _id: restaurantMock.validRestaurant._id,
                name: restaurantMock.validRestaurant.name,
                userId: {
                    toString: () => userMock.validUser._id.toString() // Original owner
                }
            }
            Restaurant.findById = jest.fn().mockResolvedValue(restaurant)

            await menuItemController.deleteMenuItem(req, res, next)

            expect(forbidden).toHaveBeenCalledWith('Not authorized to delete this menu item')
            expect(next).toHaveBeenCalled()
            expect(menuItem.deleteOne).not.toHaveBeenCalled()
        })
    })
}) 