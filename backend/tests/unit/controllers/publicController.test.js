const mongoose = require('mongoose')

// Mock the models
jest.mock('@models/restaurant')
jest.mock('@models/menu')
jest.mock('@models/menuItem')

// Mock asyncHandler to pass through the function
jest.mock('@utils/errorUtils', () => ({
    ...jest.requireActual('@utils/errorUtils'),
    asyncHandler: (fn) => async (...args) => fn(...args)
}))

// Mock the menu data service
jest.mock('@services/menuDataService', () => ({
    getCompleteMenuData: jest.fn(),
    processMenuForPublic: jest.fn()
}))

// Import the controller and models after mocking
const Restaurant = require('@models/restaurant')
const Menu = require('@models/menu')
const MenuItem = require('@models/menuItem')
const { getCompleteMenuData } = require('@services/menuDataService')
const { notFound } = require('@utils/errorUtils')

const {
    getPublicRestaurant,
    getPublicMenu,
    getPublicMenuItems,
    getCompletePublicMenu,
    redirectToMenu
} = require('@controllers/publicController')

describe('Public Controller', () => {
    let req, res

    beforeEach(() => {
        req = {
            params: {},
            query: {}
        }

        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            redirect: jest.fn()
        }

        // Setup the mock implementations for each test
        Restaurant.findById = jest.fn()
        Menu.findById = jest.fn()
        Menu.exists = jest.fn()
        MenuItem.paginate = jest.fn()
        MenuItem.distinct = jest.fn()
        MenuItem.find = jest.fn()

        // Clear all mocks
        jest.clearAllMocks()
    })

    describe('getPublicRestaurant', () => {
        it('should get a restaurant by ID', async () => {
            const restaurantId = new mongoose.Types.ObjectId()
            const mockRestaurant = {
                _id: restaurantId,
                name: 'Test Restaurant',
                description: 'Test Description',
                logoUrl: 'http://example.com/logo.jpg'
            }

            const selectMock = jest.fn().mockResolvedValue(mockRestaurant)
            Restaurant.findById.mockReturnValue({ select: selectMock })

            req.params.restaurantId = restaurantId.toString()

            await getPublicRestaurant(req, res)

            expect(Restaurant.findById).toHaveBeenCalledWith(restaurantId.toString())
            expect(selectMock).toHaveBeenCalledWith('name description logoUrl address contacts')
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockRestaurant
            })
        })

        it('should throw 404 if restaurant not found', async () => {
            const selectMock = jest.fn().mockResolvedValue(null)
            Restaurant.findById.mockReturnValue({ select: selectMock })

            req.params.restaurantId = new mongoose.Types.ObjectId().toString()

            await expect(getPublicRestaurant(req, res)).rejects.toThrow('Restaurant not found')
        })
    })

    describe('getPublicMenu', () => {
        it('should get a menu by ID with basic restaurant info', async () => {
            const menuId = new mongoose.Types.ObjectId()
            const mockMenu = {
                _id: menuId,
                name: 'Test Menu',
                description: 'Test Description',
                imageUrl: 'http://example.com/image.jpg',
                restaurantId: {
                    _id: new mongoose.Types.ObjectId(),
                    name: 'Test Restaurant',
                    logoUrl: 'http://example.com/logo.jpg'
                }
            }

            const populateMock = jest.fn().mockResolvedValue(mockMenu)
            const selectMock = jest.fn().mockReturnValue({ populate: populateMock })
            Menu.findById.mockReturnValue({ select: selectMock })

            req.params.menuId = menuId.toString()

            await getPublicMenu(req, res)

            expect(Menu.findById).toHaveBeenCalledWith(menuId.toString())
            expect(selectMock).toHaveBeenCalledWith('name description imageUrl restaurantId qrCodeUrl')
            expect(populateMock).toHaveBeenCalledWith('restaurantId', 'name logoUrl')
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockMenu
            })
        })

        it('should throw 404 if menu not found', async () => {
            const populateMock = jest.fn().mockResolvedValue(null)
            const selectMock = jest.fn().mockReturnValue({ populate: populateMock })
            Menu.findById.mockReturnValue({ select: selectMock })

            req.params.menuId = new mongoose.Types.ObjectId().toString()

            await expect(getPublicMenu(req, res)).rejects.toThrow('Menu not found')
        })
    })

    describe('getPublicMenuItems', () => {
        it('should get menu items with pagination and category filtering', async () => {
            const menuId = new mongoose.Types.ObjectId()
            const mockMenuItemDocs = [
                { name: 'Item 1', price: 10, category: 'Appetizer' },
                { name: 'Item 2', price: 15, category: 'Main' }
            ]

            // Mock the chainable find methods
            const mockFindChain = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockMenuItemDocs)
            }

            Menu.exists.mockResolvedValue(true)
            MenuItem.countDocuments.mockResolvedValue(2)
            MenuItem.find.mockReturnValue(mockFindChain)
            MenuItem.distinct.mockResolvedValue(['Appetizer', 'Main'])

            req.params.menuId = menuId.toString()
            req.query = { category: 'Main', page: 1, limit: 10 }

            await getPublicMenuItems(req, res)

            expect(Menu.exists).toHaveBeenCalledWith({ _id: menuId.toString() })
            expect(MenuItem.countDocuments).toHaveBeenCalledWith({ menuId: menuId.toString(), category: 'Main' })
            expect(MenuItem.find).toHaveBeenCalledWith({ menuId: menuId.toString(), category: 'Main' })
            expect(mockFindChain.select).toHaveBeenCalledWith('name description price imageUrl category')
            expect(mockFindChain.sort).toHaveBeenCalledWith({ category: 1, name: 1 })
            expect(mockFindChain.skip).toHaveBeenCalledWith(0)
            expect(mockFindChain.limit).toHaveBeenCalledWith(10)
            expect(mockFindChain.lean).toHaveBeenCalled()
            expect(MenuItem.distinct).toHaveBeenCalledWith('category', { menuId: menuId.toString() })
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    docs: mockMenuItemDocs,
                    totalDocs: 2,
                    limit: 10,
                    page: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                    pagingCounter: 1,
                    prevPage: null,
                    nextPage: null,
                    categories: ['Appetizer', 'Main']
                }
            })
        })

        it('should throw 404 if menu not found', async () => {
            Menu.exists.mockResolvedValue(false)

            req.params.menuId = new mongoose.Types.ObjectId().toString()

            await expect(getPublicMenuItems(req, res)).rejects.toThrow('Menu not found')
        })
    })

    describe('getCompletePublicMenu', () => {
        it('should get complete menu data using menu data service', async () => {
            const menuId = new mongoose.Types.ObjectId()
            const mockCompleteMenuData = {
                menu: {
                    id: menuId,
                    name: 'Test Menu',
                    description: 'Test Description',
                    restaurant: { id: 'restaurant123', name: 'Test Restaurant' }
                },
                categories: ['Appetizers', 'Main Course'],
                itemsByCategory: {
                    'Appetizers': [{ name: 'Salad', price: 10 }],
                    'Main Course': [{ name: 'Steak', price: 25 }]
                },
                totalItems: 2
            }

            getCompleteMenuData.mockResolvedValue(mockCompleteMenuData)

            req.params.menuId = menuId.toString()

            await getCompletePublicMenu(req, res)

            expect(getCompleteMenuData).toHaveBeenCalledWith(menuId.toString())
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockCompleteMenuData
            })
        })

        it('should handle errors from menu data service', async () => {
            const menuId = new mongoose.Types.ObjectId()
            const error = new Error('Menu not found')

            getCompleteMenuData.mockRejectedValue(error)

            req.params.menuId = menuId.toString()

            await expect(getCompletePublicMenu(req, res)).rejects.toThrow('Menu not found')
            expect(getCompleteMenuData).toHaveBeenCalledWith(menuId.toString())
        })
    })

    describe('redirectToMenu', () => {
        it('should redirect to frontend menu view URL', async () => {
            const menuId = new mongoose.Types.ObjectId()
            const restaurantId = new mongoose.Types.ObjectId()

            Menu.findById.mockResolvedValue({
                _id: menuId,
                restaurantId: {
                    toString: () => restaurantId.toString()
                }
            })

            req.params.menuId = menuId.toString()
            req.query.restaurant = restaurantId.toString()

            await redirectToMenu(req, res)

            expect(Menu.findById).toHaveBeenCalledWith(menuId.toString())
            expect(res.redirect).toHaveBeenCalledWith(
                `http://localhost:3000/view/menu/${menuId.toString()}?restaurant=${restaurantId.toString()}`
            )
        })

        it('should throw 404 if menu not found', async () => {
            Menu.findById.mockResolvedValue(null)

            req.params.menuId = new mongoose.Types.ObjectId().toString()

            await expect(redirectToMenu(req, res)).rejects.toThrow('Menu not found')
        })
    })
}) 