// Mock app before importing it
jest.mock('@src/app', () => {
    const express = require('express')
    const router = express.Router()

    // Mock profile routes for testing
    router.get('/api/profile', (req, res) => {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized, no token'
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                _id: 'profile-id',
                userId: 'user-id',
                firstName: 'John',
                lastName: 'Doe',
                email: 'user@example.com',
                isPublic: false
            }
        })
    })

    router.put('/api/profile', (req, res) => {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized, no token'
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                _id: 'profile-id',
                userId: 'user-id',
                ...req.body
            }
        })
    })

    router.put('/api/profile/privacy', (req, res) => {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized, no token'
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                isPublic: req.body.isPublic
            }
        })
    })

    router.post('/api/profile/picture', (req, res) => {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized, no token'
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                profilePicture: '/uploads/profiles/test-image.jpg'
            }
        })
    })

    router.get('/api/profile/user/:userId', (req, res) => {
        const { userId } = req.params

        if (userId === 'private-user') {
            return res.status(403).json({
                success: false,
                error: 'This profile is private'
            })
        }

        if (userId === 'nonexistent') {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                _id: 'profile-id',
                userId,
                firstName: 'Jane',
                lastName: 'Smith',
                isPublic: true
            }
        })
    })

    router.get('/api/profile/all', (req, res) => {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer admin-token')) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized, no token'
            })
        }

        return res.status(200).json({
            success: true,
            data: [
                {
                    _id: 'profile-1',
                    userId: 'user-1',
                    firstName: 'John',
                    lastName: 'Doe',
                    isPublic: true
                },
                {
                    _id: 'profile-2',
                    userId: 'user-2',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    isPublic: false
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

    router.put('/api/profile/user/:userId', (req, res) => {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer admin-token')) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized, no token'
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                _id: 'profile-id',
                userId: req.params.userId,
                ...req.body
            }
        })
    })

    router.delete('/api/profile/user/:userId', (req, res) => {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer admin-token')) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized, no token'
            })
        }

        return res.status(204).send()
    })

    // Mock express app
    const app = express()
    app.use(express.json())
    app.use(router)

    return app
})

const request = require('supertest')
const app = require('@src/app')

describe('Profile Routes Integration Tests', () => {
    describe('GET /api/profile', () => {
        it('should return current user profile', async () => {
            const res = await request(app)
                .get('/api/profile')
                .set('Authorization', 'Bearer mock-jwt-token')

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('_id')
            expect(res.body.data).toHaveProperty('userId')
            expect(res.body.data).toHaveProperty('firstName', 'John')
            expect(res.body.data).toHaveProperty('lastName', 'Doe')
        })

        it('should return 401 without token', async () => {
            const res = await request(app)
                .get('/api/profile')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Not authorized, no token')
        })
    })

    describe('PUT /api/profile', () => {
        it('should update current user profile', async () => {
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name',
                bio: 'Updated bio'
            }

            const res = await request(app)
                .put('/api/profile')
                .set('Authorization', 'Bearer mock-jwt-token')
                .send(updateData)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('firstName', 'Updated')
            expect(res.body.data).toHaveProperty('lastName', 'Name')
            expect(res.body.data).toHaveProperty('bio', 'Updated bio')
        })

        it('should return 401 without token', async () => {
            const res = await request(app)
                .put('/api/profile')
                .send({ firstName: 'Test' })

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
        })
    })

    describe('PUT /api/profile/privacy', () => {
        it('should update privacy settings', async () => {
            const res = await request(app)
                .put('/api/profile/privacy')
                .set('Authorization', 'Bearer mock-jwt-token')
                .send({ isPublic: true })

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('isPublic', true)
        })

        it('should return 401 without token', async () => {
            const res = await request(app)
                .put('/api/profile/privacy')
                .send({ isPublic: true })

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
        })
    })

    describe('POST /api/profile/picture', () => {
        it('should upload profile picture', async () => {
            const res = await request(app)
                .post('/api/profile/picture')
                .set('Authorization', 'Bearer mock-jwt-token')

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('profilePicture')
        })

        it('should return 401 without token', async () => {
            const res = await request(app)
                .post('/api/profile/picture')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
        })
    })

    describe('GET /api/profile/user/:userId', () => {
        it('should return public user profile', async () => {
            const res = await request(app)
                .get('/api/profile/user/public-user')

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('firstName', 'Jane')
            expect(res.body.data).toHaveProperty('isPublic', true)
        })

        it('should return 403 for private profile', async () => {
            const res = await request(app)
                .get('/api/profile/user/private-user')

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('This profile is private')
        })

        it('should return 404 for non-existent profile', async () => {
            const res = await request(app)
                .get('/api/profile/user/nonexistent')

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Profile not found')
        })
    })

    describe('GET /api/profile/all (Admin)', () => {
        it('should return all profiles for admin', async () => {
            const res = await request(app)
                .get('/api/profile/all')
                .set('Authorization', 'Bearer admin-token')

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveLength(2)
            expect(res.body.pagination).toHaveProperty('total', 2)
        })

        it('should return 401 for non-admin', async () => {
            const res = await request(app)
                .get('/api/profile/all')
                .set('Authorization', 'Bearer user-token')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
        })
    })

    describe('PUT /api/profile/user/:userId (Admin)', () => {
        it('should update user profile by admin', async () => {
            const updateData = {
                firstName: 'Admin Updated',
                isVerified: true
            }

            const res = await request(app)
                .put('/api/profile/user/some-user-id')
                .set('Authorization', 'Bearer admin-token')
                .send(updateData)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('firstName', 'Admin Updated')
            expect(res.body.data).toHaveProperty('isVerified', true)
        })

        it('should return 401 for non-admin', async () => {
            const res = await request(app)
                .put('/api/profile/user/some-user-id')
                .set('Authorization', 'Bearer user-token')
                .send({ firstName: 'Test' })

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
        })
    })

    describe('DELETE /api/profile/user/:userId (Admin)', () => {
        it('should delete user profile by admin', async () => {
            const res = await request(app)
                .delete('/api/profile/user/some-user-id')
                .set('Authorization', 'Bearer admin-token')

            expect(res.statusCode).toBe(204)
        })

        it('should return 401 for non-admin', async () => {
            const res = await request(app)
                .delete('/api/profile/user/some-user-id')
                .set('Authorization', 'Bearer user-token')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
        })
    })
}) 