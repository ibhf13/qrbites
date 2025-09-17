// Mock dependencies before importing the controller
jest.mock('@models/user')
jest.mock('@utils/logger')
jest.mock('@utils/sanitization', () => ({
    createSafeSearchQuery: jest.fn()
}))

// Mock asyncHandler to ensure proper execution
jest.mock('@utils/errorUtils', () => {
    const originalModule = jest.requireActual('@utils/errorUtils')
    return {
        ...originalModule,
        asyncHandler: (fn) => {
            return async (req, res, next) => {
                try {
                    await fn(req, res, next)
                } catch (error) {
                    next(error)
                }
            }
        }
    }
})

const mongoose = require('mongoose')
const User = require('@models/user')
const userController = require('@controllers/userController')
const userMock = require('@mocks/userMock')
const userMockEnhanced = require('@mocks/userMockEnhanced')
const { createSafeSearchQuery } = require('@utils/sanitization')

describe('User Controller Tests', () => {
    let req, res, next

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks()

        // Mock request, response and next function
        req = {
            params: {},
            query: {},
            body: {},
            user: {
                _id: new mongoose.Types.ObjectId(),
                email: 'test@example.com',
                role: 'user'
            }
        }

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        }

        next = jest.fn()
    })

    describe('getUsers', () => {
        beforeEach(() => {
            req.user.role = 'admin'
        })

        it('should return paginated users with default pagination', async () => {
            const mockUsers = userMock.userList
            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockUsers)
            }

            User.find = jest.fn().mockReturnValue(mockQuery)
            User.countDocuments = jest.fn().mockResolvedValue(mockUsers.length)

            await userController.getUsers(req, res, next)

            expect(User.find).toHaveBeenCalledWith({})
            expect(mockQuery.select).toHaveBeenCalledWith('-password')
            expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 })
            expect(mockQuery.skip).toHaveBeenCalledWith(0)
            expect(mockQuery.limit).toHaveBeenCalledWith(10)
            expect(User.countDocuments).toHaveBeenCalledWith({})
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUsers,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: mockUsers.length,
                    pages: Math.ceil(mockUsers.length / 10)
                }
            })
        })

        it('should return users with custom pagination', async () => {
            req.query = { page: 2, limit: 5 }
            const mockUsers = userMock.userList.slice(0, 2)
            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockUsers)
            }

            User.find = jest.fn().mockReturnValue(mockQuery)
            User.countDocuments = jest.fn().mockResolvedValue(10)

            await userController.getUsers(req, res, next)

            expect(mockQuery.skip).toHaveBeenCalledWith(5) // (page - 1) * limit = (2 - 1) * 5
            expect(mockQuery.limit).toHaveBeenCalledWith(5)
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUsers,
                pagination: {
                    page: 2,
                    limit: 5,
                    total: 10,
                    pages: 2
                }
            })
        })

        it('should filter by role', async () => {
            req.query = { role: 'admin' }
            const mockUsers = [userMock.userList[2]] // admin user
            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockUsers)
            }

            User.find = jest.fn().mockReturnValue(mockQuery)
            User.countDocuments = jest.fn().mockResolvedValue(1)

            await userController.getUsers(req, res, next)

            expect(User.find).toHaveBeenCalledWith({ role: 'admin' })
            expect(User.countDocuments).toHaveBeenCalledWith({ role: 'admin' })
        })

        it('should filter by isActive status', async () => {
            req.query = { isActive: 'false' }
            const mockUsers = []
            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockUsers)
            }

            User.find = jest.fn().mockReturnValue(mockQuery)
            User.countDocuments = jest.fn().mockResolvedValue(0)

            await userController.getUsers(req, res, next)

            expect(User.find).toHaveBeenCalledWith({ isActive: false })
            expect(User.countDocuments).toHaveBeenCalledWith({ isActive: false })
        })

        it('should search by email', async () => {
            req.query = { search: 'john' }
            const mockUsers = [userMock.userList[0]]
            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockUsers)
            }

            // Mock the sanitization function
            const expectedSearchQueries = [
                { email: { $regex: 'john', $options: 'i' } }
            ]
            createSafeSearchQuery.mockReturnValue(expectedSearchQueries)

            User.find = jest.fn().mockReturnValue(mockQuery)
            User.countDocuments = jest.fn().mockResolvedValue(1)

            const expectedQuery = {
                $or: expectedSearchQueries
            }

            await userController.getUsers(req, res, next)

            expect(createSafeSearchQuery).toHaveBeenCalledWith('john', ['email'])
            expect(User.find).toHaveBeenCalledWith(expectedQuery)
            expect(User.countDocuments).toHaveBeenCalledWith(expectedQuery)
        })

        it('should handle errors properly', async () => {
            const error = new Error('Database error')
            User.find = jest.fn().mockImplementation(() => {
                throw error
            })

            await userController.getUsers(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })
    })

    describe('getUserById', () => {
        it('should return user by ID for own profile', async () => {
            const userId = req.user._id.toString()
            req.params.id = userId
            const mockUser = { ...userMock.userList[0], _id: userId }

            const mockQuery = {
                select: jest.fn().mockResolvedValue(mockUser)
            }
            User.findById = jest.fn().mockReturnValue(mockQuery)

            await userController.getUserById(req, res, next)

            expect(User.findById).toHaveBeenCalledWith(userId)
            expect(mockQuery.select).toHaveBeenCalledWith('-password')
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser
            })
        })

        it('should return user by ID for admin', async () => {
            req.user.role = 'admin'
            req.params.id = 'someUserId'
            const mockUser = userMock.userList[0]

            const mockQuery = {
                select: jest.fn().mockResolvedValue(mockUser)
            }
            User.findById = jest.fn().mockReturnValue(mockQuery)

            await userController.getUserById(req, res, next)

            expect(User.findById).toHaveBeenCalledWith('someUserId')
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser
            })
        })

        it('should return forbidden error for unauthorized access', async () => {
            req.params.id = 'differentUserId'

            await userController.getUserById(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toBe('Not authorized to access this user profile')
            expect(calledError.statusCode).toBe(403)
        })

        it('should return not found error when user does not exist', async () => {
            req.params.id = req.user._id.toString()

            const mockQuery = {
                select: jest.fn().mockResolvedValue(null)
            }
            User.findById = jest.fn().mockReturnValue(mockQuery)

            await userController.getUserById(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toContain('not found')
            expect(calledError.statusCode).toBe(404)
        })
    })

    describe('updateUser', () => {
        it('should update own profile', async () => {
            const userId = req.user._id.toString()
            req.params.id = userId
            req.body = { email: 'updated@test.com' }

            const existingUser = { ...userMock.userList[0], _id: userId }
            const updatedUser = { ...existingUser, ...req.body }

            User.findById = jest.fn().mockResolvedValue(existingUser)
            User.findOne = jest.fn().mockResolvedValue(null) // No email conflict
            User.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser)

            await userController.updateUser(req, res, next)

            expect(User.findById).toHaveBeenCalledWith(userId)
            expect(User.findOne).toHaveBeenCalledWith({
                email: req.body.email,
                _id: { $ne: userId }
            })
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                req.body,
                {
                    new: true,
                    runValidators: true,
                    select: '-password'
                }
            )
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedUser
            })
        })

        it('should prevent non-admin from updating role', async () => {
            const userId = req.user._id.toString()
            req.params.id = userId
            req.body = { role: 'admin' }

            await userController.updateUser(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toBe('Not authorized to update role or account status')
            expect(calledError.statusCode).toBe(403)
        })

        it('should allow admin to update user role', async () => {
            req.user.role = 'admin'
            req.params.id = 'someUserId'
            req.body = { role: 'admin', isActive: false }

            const existingUser = userMock.userList[0]
            const updatedUser = { ...existingUser, ...req.body }

            User.findById = jest.fn().mockResolvedValue(existingUser)
            User.findOne = jest.fn().mockResolvedValue(null)
            User.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser)

            await userController.updateUser(req, res, next)

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'someUserId',
                req.body,
                {
                    new: true,
                    runValidators: true,
                    select: '-password'
                }
            )
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedUser
            })
        })

        it('should return error for email conflict', async () => {
            const userId = req.user._id.toString()
            req.params.id = userId
            req.body = { email: 'existing@test.com' }

            const existingUser = { ...userMock.userList[0], _id: userId, email: 'old@test.com' }
            const conflictUser = { _id: 'different-id', email: 'existing@test.com' }

            User.findById = jest.fn().mockResolvedValue(existingUser)
            User.findOne = jest.fn().mockResolvedValue(conflictUser)

            await userController.updateUser(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toBe('Email already exists')
            expect(calledError.statusCode).toBe(400)
        })

        it('should return not found error when user does not exist', async () => {
            req.params.id = req.user._id.toString()
            req.body = { email: 'updated@test.com' }

            User.findById = jest.fn().mockResolvedValue(null)

            await userController.updateUser(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toContain('not found')
            expect(calledError.statusCode).toBe(404)
        })
    })

    describe('deleteUser', () => {
        beforeEach(() => {
            req.user.role = 'admin'
        })

        it('should delete user as admin', async () => {
            req.params.id = 'userToDelete'
            const userToDelete = {
                ...userMock.userList[0],
                _id: 'userToDelete',
                deleteOne: jest.fn().mockResolvedValue()
            }

            User.findById = jest.fn().mockResolvedValue(userToDelete)

            await userController.deleteUser(req, res, next)

            expect(User.findById).toHaveBeenCalledWith('userToDelete')
            expect(userToDelete.deleteOne).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(204)
            expect(res.send).toHaveBeenCalled()
        })

        it('should return forbidden error for non-admin', async () => {
            req.user.role = 'user'
            req.params.id = 'someUserId'

            await userController.deleteUser(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toBe('Not authorized to delete user accounts')
            expect(calledError.statusCode).toBe(403)
        })

        it('should prevent admin from deleting own account', async () => {
            req.params.id = req.user._id.toString()

            await userController.deleteUser(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toBe('Cannot delete your own admin account')
            expect(calledError.statusCode).toBe(400)
        })

        it('should return not found error when user does not exist', async () => {
            req.params.id = 'nonExistentUser'

            User.findById = jest.fn().mockResolvedValue(null)

            await userController.deleteUser(req, res, next)

            expect(next).toHaveBeenCalled()
            const calledError = next.mock.calls[0][0]
            expect(calledError).toBeInstanceOf(Error)
            expect(calledError.message).toContain('not found')
            expect(calledError.statusCode).toBe(404)
        })
    })

    describe('deactivateAccount', () => {
        it('should deactivate current user account', async () => {
            const userId = req.user._id

            User.findByIdAndUpdate = jest.fn().mockResolvedValue()

            await userController.deactivateAccount(req, res, next)

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, { isActive: false })
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Account deactivated successfully'
            })
        })

        it('should handle errors properly', async () => {
            const error = new Error('Database error')
            User.findByIdAndUpdate = jest.fn().mockRejectedValue(error)

            await userController.deactivateAccount(req, res, next)
            expect(next).toHaveBeenCalledWith(error)
        })
    })
}) 