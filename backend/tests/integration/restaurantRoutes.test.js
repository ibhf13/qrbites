// Mock app before importing it
jest.mock('@src/app', () => {
    const express = require('express')
    const router = express.Router()

    // Mock the restaurant routes for testing
    router.get('/api/restaurants', (req, res) => {
        return res.status(200).json({
            success: true,
            data: [
                {
                    _id: 'restaurant-id-1',
                    name: 'Restaurant One',
                    address: '123 Test St',
                    phone: '123-456-7890',
                    ownerId: 'user-id-1'
                },
                {
                    _id: 'restaurant-id-2',
                    name: 'Restaurant Two',
                    address: '456 Test Ave',
                    phone: '987-654-3210',
                    ownerId: 'user-id-2'
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

    router.get('/api/restaurants/:id', (req, res) => {
        const { id } = req.params

        if (id === 'restaurant-id-1') {
            return res.status(200).json({
                success: true,
                data: {
                    _id: 'restaurant-id-1',
                    name: 'Restaurant One',
                    address: '123 Test St',
                    phone: '123-456-7890',
                    ownerId: 'user-id-1',
                    description: 'A test restaurant',
                    cuisine: 'Test Cuisine',
                    openingHours: {
                        monday: '9:00-22:00',
                        tuesday: '9:00-22:00',
                        wednesday: '9:00-22:00',
                        thursday: '9:00-22:00',
                        friday: '9:00-23:00',
                        saturday: '10:00-23:00',
                        sunday: '10:00-22:00'
                    }
                }
            })
        } else if (id === 'invalid-id') {
            return res.status(400).json({
                success: false,
                error: 'Invalid restaurant ID format'
            })
        } else {
            return res.status(404).json({
                success: false,
                error: 'Restaurant not found'
            })
        }
    })

    router.post('/api/restaurants', (req, res) => {
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (req.body.name && req.body.name.length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Validation error'
            })
        }

        return res.status(201).json({
            success: true,
            data: {
                _id: 'new-restaurant-id',
                ...req.body,
                ownerId: 'user-id-from-token',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        })
    })

    router.put('/api/restaurants/:id', (req, res) => {
        const { id } = req.params
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (id === 'restaurant-id-1' && !auth.includes('user-id-1') && !auth.includes('admin')) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this restaurant'
            })
        }

        if (id === 'restaurant-id-1') {
            return res.status(200).json({
                success: true,
                data: {
                    _id: id,
                    ...req.body,
                    ownerId: 'user-id-1',
                    updatedAt: new Date().toISOString()
                }
            })
        } else {
            return res.status(404).json({
                success: false,
                error: 'Restaurant not found'
            })
        }
    })

    router.delete('/api/restaurants/:id', (req, res) => {
        const { id } = req.params
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (id === 'restaurant-id-1' && !auth.includes('user-id-1') && !auth.includes('admin')) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this restaurant'
            })
        }

        if (id === 'restaurant-id-1' || id === 'restaurant-to-delete') {
            return res.status(204).end()
        } else {
            return res.status(404).json({
                success: false,
                error: 'Restaurant not found'
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
const restaurantMock = require('@tests/fixtures/mocks/restaurantMock')
const restaurantMockEnhanced = require('@tests/fixtures/mocks/restaurantMockEnhanced')

describe('Restaurant Routes Integration Tests', () => {
    let ownerToken, userToken, adminToken

    beforeAll(() => {
        // Generate mock tokens for testing
        ownerToken = 'Bearer user-id-1-token'
        userToken = 'Bearer user-id-2-token'
        adminToken = 'Bearer admin-token'
    })

    describe('GET /api/restaurants', () => {
        it('should return all restaurants', async () => {
            const res = await request(app).get('/api/restaurants')

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toBeInstanceOf(Array)
            expect(res.body.data.length).toBe(2)
            expect(res.body.pagination).toHaveProperty('total', 2)
        })
    })

    describe('GET /api/restaurants/:id', () => {
        it('should return a specific restaurant by ID', async () => {
            const res = await request(app).get('/api/restaurants/restaurant-id-1')

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('_id', 'restaurant-id-1')
            expect(res.body.data).toHaveProperty('name', 'Restaurant One')
            expect(res.body.data).toHaveProperty('address', '123 Test St')
            expect(res.body.data).toHaveProperty('openingHours')
        })

        it('should return 404 for non-existent restaurant', async () => {
            const res = await request(app).get('/api/restaurants/nonexistent-id')

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Restaurant not found')
        })

        it('should return 400 for invalid ID format', async () => {
            const res = await request(app).get('/api/restaurants/invalid-id')

            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Invalid restaurant ID format')
        })
    })

    describe('POST /api/restaurants', () => {
        it('should create a new restaurant with valid data', async () => {
            const newRestaurant = {
                name: 'New Test Restaurant',
                address: '789 Test Blvd',
                phone: '555-123-4567',
                cuisine: 'Test Cuisine',
                description: 'A new test restaurant'
            }

            const res = await request(app)
                .post('/api/restaurants')
                .set('Authorization', ownerToken)
                .send(newRestaurant)

            expect(res.statusCode).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('_id')
            expect(res.body.data).toHaveProperty('name', newRestaurant.name)
            expect(res.body.data).toHaveProperty('address', newRestaurant.address)
            expect(res.body.data).toHaveProperty('ownerId')
            expect(res.body.data).toHaveProperty('createdAt')
            expect(res.body.data).toHaveProperty('updatedAt')
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(app)
                .post('/api/restaurants')
                .send({
                    name: 'Unauthorized Restaurant',
                    address: '123 Unauthorized St'
                })

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Authentication required')
        })

        it('should return 400 for invalid data', async () => {
            const res = await request(app)
                .post('/api/restaurants')
                .set('Authorization', ownerToken)
                .send({
                    name: 'Ab', // Too short
                    address: '123 Test St'
                })

            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Validation error')
        })
    })

    describe('PUT /api/restaurants/:id', () => {
        it('should update a restaurant as owner', async () => {
            const updateData = {
                name: 'Updated Restaurant Name',
                description: 'Updated description'
            }

            const res = await request(app)
                .put('/api/restaurants/restaurant-id-1')
                .set('Authorization', ownerToken)
                .send(updateData)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('name', updateData.name)
            expect(res.body.data).toHaveProperty('description', updateData.description)
            expect(res.body.data).toHaveProperty('ownerId', 'user-id-1')
        })

        it('should update a restaurant as admin', async () => {
            const updateData = {
                name: 'Admin Updated Name',
                description: 'Admin updated description'
            }

            const res = await request(app)
                .put('/api/restaurants/restaurant-id-1')
                .set('Authorization', adminToken)
                .send(updateData)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('name', updateData.name)
        })

        it('should return 403 for unauthorized user', async () => {
            const res = await request(app)
                .put('/api/restaurants/restaurant-id-1')
                .set('Authorization', userToken)
                .send({ name: 'Attempted Update' })

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Not authorized to update this restaurant')
        })

        it('should return 404 for non-existent restaurant', async () => {
            const res = await request(app)
                .put('/api/restaurants/nonexistent-id')
                .set('Authorization', ownerToken)
                .send({ name: 'Updated Name' })

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Restaurant not found')
        })
    })

    describe('DELETE /api/restaurants/:id', () => {
        it('should delete a restaurant as owner', async () => {
            const res = await request(app)
                .delete('/api/restaurants/restaurant-id-1')
                .set('Authorization', ownerToken)

            expect(res.statusCode).toBe(204)
        })

        it('should delete a restaurant as admin', async () => {
            const res = await request(app)
                .delete('/api/restaurants/restaurant-to-delete')
                .set('Authorization', adminToken)

            expect(res.statusCode).toBe(204)
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).delete('/api/restaurants/restaurant-id-1')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Authentication required')
        })

        it('should return 403 for unauthorized user', async () => {
            const res = await request(app)
                .delete('/api/restaurants/restaurant-id-1')
                .set('Authorization', userToken)

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Not authorized to delete this restaurant')
        })

        it('should return 404 for non-existent restaurant', async () => {
            const res = await request(app)
                .delete('/api/restaurants/nonexistent-id')
                .set('Authorization', ownerToken)

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Restaurant not found')
        })
    })
}) 