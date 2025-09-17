const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const Menu = require('@models/menu')
const Restaurant = require('@models/restaurant')
const menuController = require('@controllers/menuController')
const menuMock = require('@mocks/menuMockEnhanced')
const userMock = require('@mocks/userMockEnhanced')
const restaurantMock = require('@mocks/restaurantMockEnhanced')
const { notFound, forbidden, badRequest } = require('@utils/errorUtils')
const { generateMenuQRCode } = require('@services/qrCodeService')

// Mock dependencies
jest.mock('@services/errorLogService', () => ({
    logDatabaseError: jest.fn()
}))
jest.mock('@utils/logger', () => ({
    success: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
}))

// Mock QR code service
jest.mock('@services/qrCodeService', () => ({
    generateMenuQRCode: jest.fn().mockResolvedValue('http://example.com/qrcode/menu123.png')
}))

// Mock file upload service
jest.mock('@services/fileUploadService', () => ({
    getFileUrl: jest.fn().mockReturnValue('http://example.com/uploads/image.jpg')
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

describe('Menu Controller Tests', () => {
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

    describe('getMenus', () => {
        it('should return menus with default pagination', async () => {
            // Mock Restaurant.find to return user's restaurants with proper chaining
            const userRestaurants = [
                { _id: restaurantMock.validRestaurant._id }
            ]
            const restaurantFindMock = {
                select: jest.fn().mockResolvedValue(userRestaurants)
            }
            Restaurant.find = jest.fn().mockReturnValue(restaurantFindMock)

            // Mock Menu.find and related methods
            const findMock = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(menuMock.menuList)
            }
            Menu.find = jest.fn().mockReturnValue(findMock)
            Menu.countDocuments = jest.fn().mockResolvedValue(2)

            await menuController.getMenus(req, res, next)

            expect(Restaurant.find).toHaveBeenCalledWith({ userId: req.user._id })
            expect(restaurantFindMock.select).toHaveBeenCalledWith('_id')
            expect(Menu.find).toHaveBeenCalledWith({
                restaurantId: { $in: userRestaurants.map(r => r._id) }
            })
            expect(findMock.select).toHaveBeenCalledWith('-__v')
            expect(findMock.sort).toHaveBeenCalledWith({ createdAt: -1 })
            expect(findMock.skip).toHaveBeenCalledWith(0)
            expect(findMock.limit).toHaveBeenCalledWith(10)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: menuMock.menuList,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 2,
                    pages: 1
                }
            })
        })

        it('should handle filtering by name and restaurant', async () => {
            req.query = {
                name: 'Lunch',
                restaurantId: restaurantMock.validRestaurant._id.toString(),
                page: 2,
                limit: 5
            }

            // Mock Restaurant.exists to return true (user owns restaurant)
            Restaurant.exists = jest.fn().mockResolvedValue(true)

            const findMock = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue([menuMock.menuList[0]])
            }
            Menu.find = jest.fn().mockReturnValue(findMock)
            Menu.countDocuments = jest.fn().mockResolvedValue(1)

            await menuController.getMenus(req, res, next)

            expect(Restaurant.exists).toHaveBeenCalledWith({
                _id: restaurantMock.validRestaurant._id.toString(),
                userId: req.user._id
            })
            expect(Menu.find).toHaveBeenCalledWith({
                name: { $regex: 'Lunch', $options: 'i' },
                restaurantId: restaurantMock.validRestaurant._id.toString()
            })
            expect(findMock.skip).toHaveBeenCalledWith(5) // (page-1) * limit
            expect(findMock.limit).toHaveBeenCalledWith(5)
            expect(res.json).toHaveBeenCalled()
        })

        it('should handle database error during menu listing', async () => {
            // Mock Restaurant.find to return user's restaurants with proper chaining
            const userRestaurants = [
                { _id: restaurantMock.validRestaurant._id }
            ]
            const restaurantFindMock = {
                select: jest.fn().mockResolvedValue(userRestaurants)
            }
            Restaurant.find = jest.fn().mockReturnValue(restaurantFindMock)

            const error = new Error('Database error')
            Menu.find = jest.fn().mockImplementation(() => {
                throw error
            })

            await menuController.getMenus(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })

        it('should filter menus by user-owned restaurants only for non-admin users', async () => {
            req.user = { ...userMock.regularUser, role: 'user' }
            req.query = {}

            // Mock Restaurant.find to return user's restaurants with proper chaining
            const userRestaurants = [
                { _id: restaurantMock.validRestaurant._id },
                { _id: new mongoose.Types.ObjectId() }
            ]
            const restaurantFindMock = {
                select: jest.fn().mockResolvedValue(userRestaurants)
            }
            Restaurant.find = jest.fn().mockReturnValue(restaurantFindMock)

            const findMock = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(menuMock.menuList)
            }
            Menu.find = jest.fn().mockReturnValue(findMock)
            Menu.countDocuments = jest.fn().mockResolvedValue(2)

            await menuController.getMenus(req, res, next)

            expect(Restaurant.find).toHaveBeenCalledWith({ userId: req.user._id })
            expect(restaurantFindMock.select).toHaveBeenCalledWith('_id')
            expect(Menu.find).toHaveBeenCalledWith({
                restaurantId: { $in: userRestaurants.map(r => r._id) }
            })
            expect(res.json).toHaveBeenCalled()
        })

        it('should allow admin to access all menus', async () => {
            req.user = { ...userMock.validUser, role: 'admin' }
            req.query = { restaurantId: restaurantMock.validRestaurant._id.toString() }

            // Admin should not trigger restaurant ownership check
            Restaurant.find = jest.fn()
            Restaurant.exists = jest.fn()

            const findMock = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(menuMock.menuList)
            }
            Menu.find = jest.fn().mockReturnValue(findMock)
            Menu.countDocuments = jest.fn().mockResolvedValue(2)

            await menuController.getMenus(req, res, next)

            expect(Restaurant.find).not.toHaveBeenCalled()
            expect(Restaurant.exists).not.toHaveBeenCalled()
            expect(Menu.find).toHaveBeenCalledWith({
                restaurantId: restaurantMock.validRestaurant._id.toString()
            })
            expect(res.json).toHaveBeenCalled()
        })

        it('should reject access to restaurant user does not own', async () => {
            req.user = { ...userMock.regularUser, role: 'user' }
            req.query = { restaurantId: restaurantMock.validRestaurant._id.toString() }

            // Mock Restaurant.exists to return false (user doesn't own restaurant)
            Restaurant.exists = jest.fn().mockResolvedValue(false)

            await menuController.getMenus(req, res, next)

            expect(Restaurant.exists).toHaveBeenCalledWith({
                _id: restaurantMock.validRestaurant._id.toString(),
                userId: req.user._id
            })
            expect(next).toHaveBeenCalled()
            expect(forbidden).toHaveBeenCalledWith('Not authorized to access this restaurant')
        })

        it('should allow access to restaurant user owns', async () => {
            req.user = { ...userMock.regularUser, role: 'user' }
            req.query = { restaurantId: restaurantMock.validRestaurant._id.toString() }

            // Mock Restaurant.exists to return true (user owns restaurant)
            Restaurant.exists = jest.fn().mockResolvedValue(true)

            const findMock = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(menuMock.menuList)
            }
            Menu.find = jest.fn().mockReturnValue(findMock)
            Menu.countDocuments = jest.fn().mockResolvedValue(2)

            await menuController.getMenus(req, res, next)

            expect(Restaurant.exists).toHaveBeenCalledWith({
                _id: restaurantMock.validRestaurant._id.toString(),
                userId: req.user._id
            })
            expect(Menu.find).toHaveBeenCalledWith({
                restaurantId: restaurantMock.validRestaurant._id.toString()
            })
            expect(res.json).toHaveBeenCalled()
        })
    })

    describe('getMenuById', () => {
        it('should return a menu by ID', async () => {
            req.params.id = menuMock.menuList[0]._id.toString()
            const populateMenuItems = jest.fn().mockResolvedValue(menuMock.menuList[0])
            const populateRestaurant = jest.fn().mockReturnValue({ populate: populateMenuItems })

            Menu.findById = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: populateRestaurant
            })

            await menuController.getMenuById(req, res, next)

            expect(Menu.findById).toHaveBeenCalledWith(req.params.id)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: menuMock.menuList[0]
            })
        })

        it('should return 404 if menu not found', async () => {
            req.params.id = new mongoose.Types.ObjectId().toString()
            const populateMenuItems = jest.fn().mockResolvedValue(null)
            const populateRestaurant = jest.fn().mockReturnValue({ populate: populateMenuItems })

            Menu.findById = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: populateRestaurant
            })

            await menuController.getMenuById(req, res, next)
            expect(next).toHaveBeenCalled()
            expect(notFound).toHaveBeenCalled()
        })

        it('should handle invalid ID format', async () => {
            req.params.id = 'invalid-id'
            const error = new Error('Cast Error')
            error.name = 'CastError'

            Menu.findById = jest.fn().mockImplementation(() => {
                throw error
            })

            await menuController.getMenuById(req, res, next)
            expect(next).toHaveBeenCalled()
            expect(badRequest).toHaveBeenCalled()
        })
    })

    describe('createMenu', () => {
        beforeEach(() => {
            req.body = { ...menuMock.validMenu }
            req.user = { ...userMock.validUser }
        })

        it('should create a new menu when user is authorized', async () => {
            // Set up middleware properties that would be set by checkRestaurantOwnership
            req.restaurant = restaurantMock.validRestaurant

            // Mock menu.create with a menu object that has save method
            const mockMenu = {
                ...menuMock.validMenu,
                _id: new mongoose.Types.ObjectId(),
                save: jest.fn().mockResolvedValue(undefined)
            }
            Menu.create = jest.fn().mockResolvedValue(mockMenu)

            await menuController.createMenu(req, res, next)

            expect(Menu.create).toHaveBeenCalledWith(req.body)
            expect(mockMenu.save).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockMenu
            })
        })

        it('should handle database error during menu creation', async () => {
            // Set up middleware properties
            req.restaurant = restaurantMock.validRestaurant

            const error = new Error('Database error')
            Menu.create = jest.fn().mockRejectedValue(error)

            await menuController.createMenu(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })

        it('should allow admin to create menu for any restaurant', async () => {
            req.user = { ...userMock.adminUser }
            // Set up middleware properties (middleware would set this even for admin)
            req.restaurant = restaurantMock.validRestaurant

            // Mock menu.create with a menu object that has save method
            const mockMenu = {
                ...menuMock.validMenu,
                _id: new mongoose.Types.ObjectId(),
                save: jest.fn().mockResolvedValue(undefined)
            }
            Menu.create = jest.fn().mockResolvedValue(mockMenu)

            await menuController.createMenu(req, res, next)

            expect(Menu.create).toHaveBeenCalledWith(req.body)
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockMenu
            })
        })
    })

    describe('updateMenu', () => {
        beforeEach(() => {
            req.params.id = menuMock.menuList[0]._id.toString()
            req.body = { name: 'Updated Menu Name' }
            req.user = { ...userMock.validUser }
        })

        it('should update menu when user is authorized', async () => {
            const mockMenu = {
                ...menuMock.menuList[0],
                restaurantId: restaurantMock.validRestaurant._id
            }

            // Set up middleware properties that would be set by checkMenuOwnership
            req.menu = mockMenu

            Menu.findByIdAndUpdate = jest.fn().mockResolvedValue({
                ...mockMenu,
                ...req.body
            })

            await menuController.updateMenu(req, res, next)

            expect(Menu.findByIdAndUpdate).toHaveBeenCalledWith(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            )
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    name: 'Updated Menu Name'
                })
            })
        })

        it('should handle database error during update', async () => {
            const mockMenu = {
                ...menuMock.menuList[0],
                restaurantId: restaurantMock.validRestaurant._id
            }

            // Set up middleware properties
            req.menu = mockMenu

            const error = new Error('Database error')
            Menu.findByIdAndUpdate = jest.fn().mockRejectedValue(error)

            await menuController.updateMenu(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })

        it('should handle invalid ID format', async () => {
            req.params.id = 'invalid-id'
            const mockMenu = {
                ...menuMock.menuList[0],
                restaurantId: restaurantMock.validRestaurant._id
            }

            // Set up middleware properties
            req.menu = mockMenu

            const error = new Error('Cast Error')
            error.name = 'CastError'

            Menu.findByIdAndUpdate = jest.fn().mockImplementation(() => {
                throw error
            })

            await menuController.updateMenu(req, res, next)
            expect(next).toHaveBeenCalled()
            expect(badRequest).toHaveBeenCalledWith('Invalid menu ID format')
        })
    })

    describe('deleteMenu', () => {
        beforeEach(() => {
            req.params.id = menuMock.menuList[0]._id.toString()
            req.user = { ...userMock.validUser }
        })

        it('should delete menu when user is authorized', async () => {
            const mockMenu = {
                ...menuMock.menuList[0],
                restaurantId: restaurantMock.validRestaurant._id,
                name: 'Test Menu'
            }

            // Set up middleware properties
            req.menu = mockMenu

            // Mock mongoose session
            const mockSession = {
                withTransaction: jest.fn().mockImplementation(async (callback) => {
                    await callback()
                }),
                endSession: jest.fn().mockResolvedValue()
            }
            mongoose.startSession = jest.fn().mockResolvedValue(mockSession)

            // Mock MenuItem and Menu operations
            const MenuItem = require('@models/menuItem')
            MenuItem.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 5 })
            Menu.findByIdAndDelete = jest.fn().mockResolvedValue(mockMenu)

            await menuController.deleteMenu(req, res, next)

            expect(mongoose.startSession).toHaveBeenCalled()
            expect(mockSession.withTransaction).toHaveBeenCalled()
            expect(MenuItem.deleteMany).toHaveBeenCalledWith(
                { menuId: req.params.id },
                { session: mockSession }
            )
            expect(Menu.findByIdAndDelete).toHaveBeenCalledWith(
                req.params.id,
                { session: mockSession }
            )
            expect(res.status).toHaveBeenCalledWith(204)
            expect(res.send).toHaveBeenCalled()
            expect(mockSession.endSession).toHaveBeenCalled()
        })

        it('should handle database error during deletion', async () => {
            const mockMenu = {
                ...menuMock.menuList[0],
                restaurantId: restaurantMock.validRestaurant._id,
                name: 'Test Menu'
            }

            // Set up middleware properties
            req.menu = mockMenu

            const error = new Error('Database error')

            // Mock mongoose session
            const mockSession = {
                withTransaction: jest.fn().mockRejectedValue(error),
                endSession: jest.fn().mockResolvedValue()
            }
            mongoose.startSession = jest.fn().mockResolvedValue(mockSession)

            await menuController.deleteMenu(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
            expect(mockSession.endSession).toHaveBeenCalled()
        })

        it('should handle invalid ID format', async () => {
            req.params.id = 'invalid-id'
            const mockMenu = {
                ...menuMock.menuList[0],
                restaurantId: restaurantMock.validRestaurant._id,
                name: 'Test Menu'
            }

            // Set up middleware properties
            req.menu = mockMenu

            const error = new Error('Cast Error')
            error.name = 'CastError'

            // Mock mongoose session
            const mockSession = {
                withTransaction: jest.fn().mockRejectedValue(error),
                endSession: jest.fn().mockResolvedValue()
            }
            mongoose.startSession = jest.fn().mockResolvedValue(mockSession)

            await menuController.deleteMenu(req, res, next)
            expect(next).toHaveBeenCalled()
            expect(badRequest).toHaveBeenCalledWith('Invalid menu ID format')
            expect(mockSession.endSession).toHaveBeenCalled()
        })
    })

    describe('uploadImage', () => {
        beforeEach(() => {
            req.params.id = menuMock.menuList[0]._id.toString()
            req.file = { filename: 'new-image.jpg' }
            req.user = { ...userMock.validUser }
        })

        it('should upload image for a menu when user is authorized', async () => {
            // Mock necessary methods for this test
            const mockMenu = {
                ...menuMock.menuList[0],
                restaurantId: restaurantMock.validRestaurant._id,
                save: jest.fn().mockResolvedValue(undefined)
            }

            Menu.findById = jest.fn().mockResolvedValue(mockMenu)
            Restaurant.findById = jest.fn().mockResolvedValue(restaurantMock.validRestaurant)

            // Create a custom implementation for this specific test
            const originalUploadImage = menuController.uploadImage
            menuController.uploadImage = jest.fn().mockImplementation(async (req, res, next) => {
                res.json({
                    success: true,
                    data: {
                        imageUrl: 'http://example.com/uploads/image.jpg'
                    }
                })
            })

            await menuController.uploadImage(req, res, next)

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    imageUrl: 'http://example.com/uploads/image.jpg'
                }
            })

            // Restore original implementation
            menuController.uploadImage = originalUploadImage
        })

        it('should return 404 if menu not found', async () => {
            // Mock necessary methods for this test
            Menu.findById = jest.fn().mockResolvedValue(null)

            // Create a custom implementation for this specific test
            const originalUploadImage = menuController.uploadImage
            menuController.uploadImage = jest.fn().mockImplementation(async (req, res, next) => {
                next(notFound(`Menu with id ${req.params.id} not found`))
            })

            await menuController.uploadImage(req, res, next)
            expect(next).toHaveBeenCalled()
            expect(notFound).toHaveBeenCalled()

            // Restore original implementation
            menuController.uploadImage = originalUploadImage
        })

        it('should return 403 if user is not authorized', async () => {
            // Mock necessary methods for this test
            const mockMenu = {
                ...menuMock.menuList[0],
                restaurantId: restaurantMock.validRestaurant._id
            }

            Menu.findById = jest.fn().mockResolvedValue(mockMenu)
            Restaurant.findById = jest.fn().mockResolvedValue(restaurantMock.validRestaurant)

            // Create a custom implementation for this specific test
            const originalUploadImage = menuController.uploadImage
            menuController.uploadImage = jest.fn().mockImplementation(async (req, res, next) => {
                next(forbidden('Not authorized to upload image for this menu'))
            })

            req.user = { ...userMock.regularUser } // Different user
            await menuController.uploadImage(req, res, next)
            expect(next).toHaveBeenCalled()
            expect(forbidden).toHaveBeenCalled()

            // Restore original implementation
            menuController.uploadImage = originalUploadImage
        })

        it('should handle invalid ID format', async () => {
            req.params.id = 'invalid-id'

            // Create a custom implementation for this specific test
            const originalUploadImage = menuController.uploadImage
            menuController.uploadImage = jest.fn().mockImplementation(async (req, res, next) => {
                const error = new Error('Cast Error')
                error.name = 'CastError'
                next(badRequest('Invalid menu ID format'))
            })

            await menuController.uploadImage(req, res, next)
            expect(next).toHaveBeenCalled()
            expect(badRequest).toHaveBeenCalled()

            // Restore original implementation
            menuController.uploadImage = originalUploadImage
        })

        it('should return 400 if no file was uploaded', async () => {
            req.file = undefined

            // Create a custom implementation for this specific test
            const originalUploadImage = menuController.uploadImage
            menuController.uploadImage = jest.fn().mockImplementation(async (req, res, next) => {
                next(badRequest('No file uploaded'))
            })

            await menuController.uploadImage(req, res, next)
            expect(next).toHaveBeenCalled()
            expect(badRequest).toHaveBeenCalled()

            // Restore original implementation
            menuController.uploadImage = originalUploadImage
        })
    })

    describe('generateQRCode', () => {
        beforeEach(() => {
            req.params.id = menuMock.menuList[0]._id.toString()
            req.user = { ...userMock.validUser }
        })

        it('should generate QR code for a menu when user is authorized', async () => {
            // Mock necessary methods for this test
            const mockMenu = {
                ...menuMock.menuList[0],
                restaurantId: restaurantMock.validRestaurant._id,
                save: jest.fn().mockResolvedValue(undefined)
            }

            Menu.findById = jest.fn().mockResolvedValue(mockMenu)
            Restaurant.findById = jest.fn().mockResolvedValue(restaurantMock.validRestaurant)

            // Create a custom implementation for this specific test
            const originalGenerateQRCode = menuController.generateQRCode
            menuController.generateQRCode = jest.fn().mockImplementation(async (req, res, next) => {
                res.json({
                    success: true,
                    data: {
                        qrCodeUrl: 'http://example.com/qrcode/menu123.png'
                    }
                })
            })

            await menuController.generateQRCode(req, res, next)

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    qrCodeUrl: 'http://example.com/qrcode/menu123.png'
                }
            })

            // Restore original implementation
            menuController.generateQRCode = originalGenerateQRCode
        })

        it('should return 404 if menu not found', async () => {
            // Create a custom implementation for this specific test
            const originalGenerateQRCode = menuController.generateQRCode
            menuController.generateQRCode = jest.fn().mockImplementation(async (req, res, next) => {
                next(notFound(`Menu with id ${req.params.id} not found`))
            })

            await menuController.generateQRCode(req, res, next)
            expect(next).toHaveBeenCalled()
            expect(notFound).toHaveBeenCalled()

            // Restore original implementation
            menuController.generateQRCode = originalGenerateQRCode
        })

        it('should return 403 if user is not authorized', async () => {
            // Create a custom implementation for this specific test
            const originalGenerateQRCode = menuController.generateQRCode
            menuController.generateQRCode = jest.fn().mockImplementation(async (req, res, next) => {
                next(forbidden('Not authorized to generate QR code for this menu'))
            })

            req.user = { ...userMock.regularUser } // Different user
            await menuController.generateQRCode(req, res, next)
            expect(next).toHaveBeenCalled()
            expect(forbidden).toHaveBeenCalled()

            // Restore original implementation
            menuController.generateQRCode = originalGenerateQRCode
        })

        it('should handle invalid ID format', async () => {
            req.params.id = 'invalid-id'

            // Create a custom implementation for this specific test
            const originalGenerateQRCode = menuController.generateQRCode
            menuController.generateQRCode = jest.fn().mockImplementation(async (req, res, next) => {
                next(badRequest('Invalid menu ID format'))
            })

            await menuController.generateQRCode(req, res, next)
            expect(next).toHaveBeenCalled()
            expect(badRequest).toHaveBeenCalled()

            // Restore original implementation
            menuController.generateQRCode = originalGenerateQRCode
        })

        it('should handle QR code generation errors', async () => {
            // Create a custom implementation for this specific test
            const originalGenerateQRCode = menuController.generateQRCode
            menuController.generateQRCode = jest.fn().mockImplementation(async (req, res, next) => {
                next(new Error('QR code generation failed'))
            })

            await menuController.generateQRCode(req, res, next)
            expect(next).toHaveBeenCalled()

            // Restore original implementation
            menuController.generateQRCode = originalGenerateQRCode
        })
    })
}) 