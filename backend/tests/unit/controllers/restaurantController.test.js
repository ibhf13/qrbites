const mongoose = require('mongoose')
const Restaurant = require('@models/restaurantModel')
const restaurantController = require('@controllers/restaurantController')
const restaurantMock = require('@mocks/restaurantMockEnhanced')
const userMock = require('@mocks/userMockEnhanced')
const { notFound, forbidden, badRequest } = require('@utils/errorUtils')

// Mock dependencies
jest.mock('@models/restaurantModel')
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

describe('Restaurant Controller Tests', () => {
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

    describe('getRestaurants', () => {
        it('should return restaurants with default pagination', async () => {
            // Mock Restaurant.find and related methods
            const findMock = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue([restaurantMock.validRestaurant, restaurantMock.secondRestaurant])
            }
            Restaurant.find = jest.fn().mockReturnValue(findMock)
            Restaurant.countDocuments = jest.fn().mockResolvedValue(2)

            await restaurantController.getRestaurants(req, res, next)

            expect(Restaurant.find).toHaveBeenCalledWith({})
            expect(findMock.select).toHaveBeenCalledWith('-__v')
            expect(findMock.sort).toHaveBeenCalledWith({ createdAt: -1 })
            expect(findMock.skip).toHaveBeenCalledWith(0)
            expect(findMock.limit).toHaveBeenCalledWith(10)
            expect(findMock.populate).toHaveBeenCalledWith('userId', 'email')
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: [restaurantMock.validRestaurant, restaurantMock.secondRestaurant],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 2,
                    pages: 1
                }
            })
        })

        it('should handle filtering by name', async () => {
            req.query = { name: 'Test', page: 2, limit: 5, sortBy: 'name', order: 'asc' }

            const findMock = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue([restaurantMock.validRestaurant])
            }
            Restaurant.find = jest.fn().mockReturnValue(findMock)
            Restaurant.countDocuments = jest.fn().mockResolvedValue(1)

            await restaurantController.getRestaurants(req, res, next)

            expect(Restaurant.find).toHaveBeenCalledWith({
                name: { $regex: 'Test', $options: 'i' }
            })
            expect(findMock.sort).toHaveBeenCalledWith({ name: 1 })
            expect(findMock.skip).toHaveBeenCalledWith(5) // (page-1) * limit
            expect(findMock.limit).toHaveBeenCalledWith(5)
            expect(findMock.populate).toHaveBeenCalledWith('userId', 'email')
            expect(res.json).toHaveBeenCalled()
        })

        it('should handle database error during restaurant listing', async () => {
            const error = new Error('Database error')
            Restaurant.find = jest.fn().mockImplementation(() => {
                throw error
            })

            await restaurantController.getRestaurants(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })
    })

    describe('getRestaurantById', () => {
        it('should return a restaurant by ID', async () => {
            req.params.id = restaurantMock.validRestaurant._id.toString()

            const findByIdMock = {
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(restaurantMock.validRestaurant)
            }
            Restaurant.findById = jest.fn().mockReturnValue(findByIdMock)

            await restaurantController.getRestaurantById(req, res, next)

            expect(Restaurant.findById).toHaveBeenCalledWith(req.params.id)
            expect(findByIdMock.select).toHaveBeenCalledWith('-__v')
            expect(findByIdMock.populate).toHaveBeenCalledWith('userId', 'email')
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: restaurantMock.validRestaurant
            })
        })

        it('should return 404 if restaurant not found', async () => {
            req.params.id = new mongoose.Types.ObjectId().toString()

            const findByIdMock = {
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(null)
            }
            Restaurant.findById = jest.fn().mockReturnValue(findByIdMock)

            await restaurantController.getRestaurantById(req, res, next)
            expect(notFound).toHaveBeenCalled()
            expect(next).toHaveBeenCalled()
        })

        it('should handle invalid ID format', async () => {
            req.params.id = 'invalid-id'
            const error = new Error('Cast Error')
            error.name = 'CastError'

            Restaurant.findById = jest.fn().mockImplementation(() => {
                throw error
            })

            await restaurantController.getRestaurantById(req, res, next)
            expect(badRequest).toHaveBeenCalledWith('Invalid restaurant ID format')
            expect(next).toHaveBeenCalled()
        })
    })

    describe('createRestaurant', () => {
        it('should create a new restaurant', async () => {
            req.body = {
                name: 'New Restaurant',
                description: 'A brand new restaurant',
                contact: {
                    phone: '+1234567890',
                    email: 'new@restaurant.com',
                    website: 'https://newrestaurant.com'
                },
                location: {
                    address: '123 New St',
                    city: 'New City',
                    state: 'New State',
                    zipCode: '12345',
                    country: 'New Country'
                },
                hours: [
                    {
                        day: 0,
                        open: '09:00',
                        close: '17:00',
                        closed: false
                    }
                ],
                isActive: true
            }
            req.user = { _id: userMock.validUser._id }

            const createdRestaurant = {
                _id: new mongoose.Types.ObjectId(),
                ...req.body,
                userId: req.user._id
            }

            Restaurant.create = jest.fn().mockResolvedValue(createdRestaurant)

            await restaurantController.createRestaurant(req, res, next)

            expect(Restaurant.create).toHaveBeenCalledWith({
                ...req.body,
                userId: req.user._id
            })
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: createdRestaurant
            })
        })

        it('should add logo URL if file was uploaded', async () => {
            req.body = {
                name: 'New Restaurant',
                description: 'A brand new restaurant',
                contact: {
                    phone: '+1234567890',
                    email: 'new@restaurant.com',
                    website: 'https://newrestaurant.com'
                },
                location: {
                    address: '123 New St',
                    city: 'New City',
                    state: 'New State',
                    zipCode: '12345',
                    country: 'New Country'
                }
            }
            req.user = { _id: userMock.validUser._id }
            req.file = { filename: 'logo.jpg' }

            // Mock the fileUploadService behavior
            const { getFileUrl } = require('@services/fileUploadService')
            getFileUrl.mockReturnValue('http://example.com/uploads/logo.jpg')

            const createdRestaurant = {
                _id: new mongoose.Types.ObjectId(),
                ...req.body,
                userId: req.user._id,
                logoUrl: 'http://example.com/uploads/logo.jpg'
            }

            Restaurant.create = jest.fn().mockResolvedValue(createdRestaurant)

            await restaurantController.createRestaurant(req, res, next)

            // Expect getFileUrl to be called with the correct arguments
            expect(getFileUrl).toHaveBeenCalledWith('logo.jpg', 'restaurant')

            // Expect logoUrl to be set in the request body
            expect(req.body.logoUrl).toBe('http://example.com/uploads/logo.jpg')

            expect(Restaurant.create).toHaveBeenCalledWith({
                ...req.body,
                userId: req.user._id
            })
        })

        it('should handle database error during restaurant creation', async () => {
            req.body = { name: 'Invalid Restaurant' }
            req.user = { _id: userMock.validUser._id }

            const error = new Error('Validation error')
            Restaurant.create = jest.fn().mockRejectedValue(error)

            await restaurantController.createRestaurant(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })
    })

    describe('updateRestaurant', () => {
        it('should update a restaurant when user is owner', async () => {
            const restaurantId = restaurantMock.validRestaurant._id.toString()
            req.params.id = restaurantId
            req.body = {
                name: 'Updated Restaurant Name',
                description: 'Updated description'
            }
            req.user = {
                _id: restaurantMock.validRestaurant.userId,
                role: 'user'
            }

            const existingRestaurant = {
                ...restaurantMock.validRestaurant,
                userId: {
                    toString: () => restaurantMock.validRestaurant.userId.toString()
                }
            }

            const updatedRestaurant = {
                ...existingRestaurant,
                name: 'Updated Restaurant Name',
                description: 'Updated description'
            }

            Restaurant.findById = jest.fn().mockResolvedValue(existingRestaurant)
            Restaurant.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedRestaurant)

            await restaurantController.updateRestaurant(req, res, next)

            expect(Restaurant.findById).toHaveBeenCalledWith(restaurantId)
            expect(Restaurant.findByIdAndUpdate).toHaveBeenCalledWith(
                restaurantId,
                req.body,
                { new: true, runValidators: true }
            )
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedRestaurant
            })
        })

        it('should update a restaurant when user is admin', async () => {
            const restaurantId = restaurantMock.secondRestaurant._id.toString()
            req.params.id = restaurantId
            req.body = { name: 'Admin Updated Restaurant' }
            req.user = {
                _id: userMock.adminUser._id,
                role: 'admin'
            }

            const existingRestaurant = {
                ...restaurantMock.secondRestaurant,
                userId: {
                    toString: () => restaurantMock.secondRestaurant.userId.toString()
                }
            }

            const updatedRestaurant = {
                ...existingRestaurant,
                name: 'Admin Updated Restaurant'
            }

            Restaurant.findById = jest.fn().mockResolvedValue(existingRestaurant)
            Restaurant.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedRestaurant)

            await restaurantController.updateRestaurant(req, res, next)

            expect(Restaurant.findByIdAndUpdate).toHaveBeenCalled()
            expect(res.json).toHaveBeenCalled()
        })

        it('should return 403 if user is not authorized to update restaurant', async () => {
            const restaurantId = restaurantMock.secondRestaurant._id.toString()
            req.params.id = restaurantId
            req.body = { name: 'Unauthorized Update' }
            req.user = {
                _id: userMock.validUser._id, // Different user
                role: 'user'
            }

            const existingRestaurant = {
                ...restaurantMock.secondRestaurant,
                userId: {
                    toString: () => restaurantMock.secondRestaurant.userId.toString()
                }
            }

            Restaurant.findById = jest.fn().mockResolvedValue(existingRestaurant)

            await restaurantController.updateRestaurant(req, res, next)

            expect(forbidden).toHaveBeenCalledWith('Not authorized to update this restaurant')
            expect(next).toHaveBeenCalled()
            expect(Restaurant.findByIdAndUpdate).not.toHaveBeenCalled()
        })

        it('should return 404 if restaurant not found', async () => {
            req.params.id = new mongoose.Types.ObjectId().toString()
            req.user = { _id: userMock.validUser._id }

            Restaurant.findById = jest.fn().mockResolvedValue(null)

            await restaurantController.updateRestaurant(req, res, next)
            expect(notFound).toHaveBeenCalled()
            expect(next).toHaveBeenCalled()
        })

        it('should add logo URL if file was uploaded during update', async () => {
            const restaurantId = restaurantMock.validRestaurant._id.toString()
            req.params.id = restaurantId
            req.body = { name: 'Updated With Logo' }
            req.file = { filename: 'new-logo.jpg' }
            req.user = {
                _id: restaurantMock.validRestaurant.userId,
                role: 'user'
            }

            // Mock the fileUploadService behavior
            const { getFileUrl } = require('@services/fileUploadService')
            getFileUrl.mockReturnValue('http://example.com/uploads/new-logo.jpg')

            const existingRestaurant = {
                ...restaurantMock.validRestaurant,
                userId: {
                    toString: () => restaurantMock.validRestaurant.userId.toString()
                }
            }

            const updatedRestaurant = {
                ...existingRestaurant,
                name: 'Updated With Logo',
                logoUrl: 'http://example.com/uploads/new-logo.jpg'
            }

            Restaurant.findById = jest.fn().mockResolvedValue(existingRestaurant)
            Restaurant.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedRestaurant)

            await restaurantController.updateRestaurant(req, res, next)

            // Expect getFileUrl to be called with the correct arguments
            expect(getFileUrl).toHaveBeenCalledWith('new-logo.jpg', 'restaurant')

            // Expect logoUrl to be set in the request body
            expect(req.body.logoUrl).toBe('http://example.com/uploads/new-logo.jpg')

            expect(Restaurant.findByIdAndUpdate).toHaveBeenCalledWith(
                restaurantId,
                req.body,
                { new: true, runValidators: true }
            )
        })
    })

    describe('deleteRestaurant', () => {
        it('should delete a restaurant when user is owner', async () => {
            const restaurantId = restaurantMock.validRestaurant._id.toString()
            req.params.id = restaurantId
            req.user = {
                _id: restaurantMock.validRestaurant.userId,
                role: 'user'
            }

            const existingRestaurant = {
                ...restaurantMock.validRestaurant,
                userId: {
                    toString: () => restaurantMock.validRestaurant.userId.toString()
                },
                deleteOne: jest.fn().mockResolvedValue({ acknowledged: true, deletedCount: 1 })
            }

            Restaurant.findById = jest.fn().mockResolvedValue(existingRestaurant)

            await restaurantController.deleteRestaurant(req, res, next)

            expect(Restaurant.findById).toHaveBeenCalledWith(restaurantId)
            expect(existingRestaurant.deleteOne).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(204)
            expect(res.send).toHaveBeenCalled()
        })

        it('should delete a restaurant when user is admin', async () => {
            const restaurantId = restaurantMock.secondRestaurant._id.toString()
            req.params.id = restaurantId
            req.user = {
                _id: userMock.adminUser._id,
                role: 'admin'
            }

            const existingRestaurant = {
                ...restaurantMock.secondRestaurant,
                userId: {
                    toString: () => restaurantMock.secondRestaurant.userId.toString()
                },
                deleteOne: jest.fn().mockResolvedValue({ acknowledged: true, deletedCount: 1 })
            }

            Restaurant.findById = jest.fn().mockResolvedValue(existingRestaurant)

            await restaurantController.deleteRestaurant(req, res, next)

            expect(existingRestaurant.deleteOne).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(204)
        })

        it('should return 403 if user is not authorized to delete restaurant', async () => {
            const restaurantId = restaurantMock.secondRestaurant._id.toString()
            req.params.id = restaurantId
            req.user = {
                _id: userMock.validUser._id, // Different user
                role: 'user'
            }

            const existingRestaurant = {
                ...restaurantMock.secondRestaurant,
                userId: {
                    toString: () => restaurantMock.secondRestaurant.userId.toString()
                },
                deleteOne: jest.fn()
            }

            Restaurant.findById = jest.fn().mockResolvedValue(existingRestaurant)

            await restaurantController.deleteRestaurant(req, res, next)

            expect(forbidden).toHaveBeenCalledWith('Not authorized to delete this restaurant')
            expect(next).toHaveBeenCalled()
            expect(existingRestaurant.deleteOne).not.toHaveBeenCalled()
        })

        it('should return 404 if restaurant not found', async () => {
            req.params.id = new mongoose.Types.ObjectId().toString()
            req.user = { _id: userMock.validUser._id }

            Restaurant.findById = jest.fn().mockResolvedValue(null)

            await restaurantController.deleteRestaurant(req, res, next)
            expect(notFound).toHaveBeenCalled()
            expect(next).toHaveBeenCalled()
        })
    })
}) 