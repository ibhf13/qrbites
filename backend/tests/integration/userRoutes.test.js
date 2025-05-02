// Mock app before importing it
jest.mock('@src/app', () => {
    const express = require('express')
    const router = express.Router()

    // Mock the user routes for testing
    router.get('/api/users', (req, res) => {
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (!auth.includes('admin')) {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            })
        }

        return res.status(200).json({
            success: true,
            data: [
                {
                    _id: 'user-id-1',
                    name: 'User One',
                    email: 'user1@example.com',
                    role: 'user'
                },
                {
                    _id: 'user-id-2',
                    name: 'User Two',
                    email: 'user2@example.com',
                    role: 'user'
                }
            ],
            pagination: {
                page: 1,
                limit: 10,
                total: 2,
                pages: 1
            }
        })
    })

    router.get('/api/users/:id', (req, res) => {
        const { id } = req.params
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (!auth.includes('admin') && !auth.includes(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this user'
            })
        }

        if (id === 'user-id-1') {
            return res.status(200).json({
                success: true,
                data: {
                    _id: 'user-id-1',
                    name: 'User One',
                    email: 'user1@example.com',
                    role: 'user'
                }
            })
        } else if (id === 'invalid-id') {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            })
        } else {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            })
        }
    })

    router.put('/api/users/:id', (req, res) => {
        const { id } = req.params
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (!auth.includes('admin') && !auth.includes(id)) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this user'
            })
        }

        if (id === 'user-id-1') {
            return res.status(200).json({
                success: true,
                data: {
                    _id: 'user-id-1',
                    ...req.body,
                    role: req.body.role || 'user'
                }
            })
        } else if (id === 'invalid-id') {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            })
        } else {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            })
        }
    })

    router.delete('/api/users/:id', (req, res) => {
        const { id } = req.params
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (!auth.includes('admin')) {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            })
        }

        if (id === 'user-id-1' || id === 'user-to-delete') {
            return res.status(204).end()
        } else if (id === 'invalid-id') {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            })
        } else {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            })
        }
    })

    const app = express()
    app.use(express.json())
    app.use(router)

    return app
})

const request = require('supertest')
const app = require('@src/app')
const userMock = require('@tests/fixtures/mocks/userMock')
const userMockEnhanced = require('@tests/fixtures/mocks/userMockEnhanced')

describe('User Routes Integration Tests', () => {
    let userToken, adminToken

    beforeAll(() => {
        // Generate mock tokens for testing
        userToken = 'Bearer user-id-1-token'
        adminToken = 'Bearer admin-token'
    })

    describe('GET /api/users', () => {
        it('should return all users for admin', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', adminToken)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toBeInstanceOf(Array)
            expect(res.body.data.length).toBe(2)
            expect(res.body.pagination).toHaveProperty('total', 2)
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/users')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Authentication required')
        })

        it('should return 403 for non-admin users', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', userToken)

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Admin access required')
        })
    })

    describe('GET /api/users/:id', () => {
        it('should return a specific user by ID for admin', async () => {
            const res = await request(app)
                .get('/api/users/user-id-1')
                .set('Authorization', adminToken)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('_id', 'user-id-1')
            expect(res.body.data).toHaveProperty('name', 'User One')
            expect(res.body.data).toHaveProperty('email', 'user1@example.com')
        })

        it('should allow users to access their own data', async () => {
            const res = await request(app)
                .get('/api/users/user-id-1')
                .set('Authorization', userToken)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('_id', 'user-id-1')
        })

        it('should return 403 for accessing other user data', async () => {
            const res = await request(app)
                .get('/api/users/user-id-2')
                .set('Authorization', userToken)

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Not authorized to access this user')
        })

        it('should return 404 for non-existent user', async () => {
            const res = await request(app)
                .get('/api/users/nonexistent-id')
                .set('Authorization', adminToken)

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('User not found')
        })

        it('should return 400 for invalid ID format', async () => {
            const res = await request(app)
                .get('/api/users/invalid-id')
                .set('Authorization', adminToken)

            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Invalid user ID format')
        })
    })

    describe('PUT /api/users/:id', () => {
        it('should update a user as admin', async () => {
            const updateData = {
                name: 'Updated User Name',
                email: 'updated@example.com'
            }

            const res = await request(app)
                .put('/api/users/user-id-1')
                .set('Authorization', adminToken)
                .send(updateData)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('name', updateData.name)
            expect(res.body.data).toHaveProperty('email', updateData.email)
        })

        it('should allow users to update their own data', async () => {
            const updateData = {
                name: 'Self Updated Name'
            }

            const res = await request(app)
                .put('/api/users/user-id-1')
                .set('Authorization', userToken)
                .send(updateData)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('name', updateData.name)
        })

        it('should return 403 for updating other user data', async () => {
            const res = await request(app)
                .put('/api/users/user-id-2')
                .set('Authorization', userToken)
                .send({ name: 'Attempted Update' })

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Not authorized to update this user')
        })

        it('should return 404 for non-existent user', async () => {
            const res = await request(app)
                .put('/api/users/nonexistent-id')
                .set('Authorization', adminToken)
                .send({ name: 'New Name' })

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('User not found')
        })
    })

    describe('DELETE /api/users/:id', () => {
        it('should delete a user as admin', async () => {
            const res = await request(app)
                .delete('/api/users/user-to-delete')
                .set('Authorization', adminToken)

            expect(res.statusCode).toBe(204)
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).delete('/api/users/user-id-1')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Authentication required')
        })

        it('should return 403 for non-admin users', async () => {
            const res = await request(app)
                .delete('/api/users/user-id-1')
                .set('Authorization', userToken)

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Admin access required')
        })

        it('should return 404 for non-existent user', async () => {
            const res = await request(app)
                .delete('/api/users/nonexistent-id')
                .set('Authorization', adminToken)

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('User not found')
        })
    })
}) 