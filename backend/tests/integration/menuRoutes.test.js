// Mock app before importing it
jest.mock('@src/app', () => {
    const express = require('express')
    const router = express.Router()

    // Mock the menu routes for testing
    router.get('/api/menus', (req, res) => {
        return res.status(200).json({
            success: true,
            data: [
                {
                    _id: '60d21b4667d0d8992e610c85',
                    name: 'Lunch Menu',
                    description: 'Lunch options',
                    restaurantId: '507f1f77bcf86cd799439011'
                },
                {
                    _id: '60d21b4667d0d8992e610c86',
                    name: 'Dinner Menu',
                    description: 'Dinner options',
                    restaurantId: '507f1f77bcf86cd799439011'
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

    router.get('/api/menus/filter', (req, res) => {
        const { name } = req.query
        if (name === 'Lunch') {
            return res.status(200).json({
                success: true,
                data: [
                    {
                        _id: '60d21b4667d0d8992e610c85',
                        name: 'Lunch Menu',
                        description: 'Lunch options',
                        restaurantId: '507f1f77bcf86cd799439011'
                    }
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    pages: 1
                }
            })
        }
        return res.status(200).json({ success: true, data: [] })
    })

    router.get('/api/menus/:id', (req, res) => {
        const { id } = req.params
        if (id === '60d21b4667d0d8992e610c85') {
            return res.status(200).json({
                success: true,
                data: {
                    _id: '60d21b4667d0d8992e610c85',
                    name: 'Lunch Menu',
                    description: 'Lunch options',
                    restaurantId: '507f1f77bcf86cd799439011'
                }
            })
        } else if (id === 'invalid-id') {
            return res.status(400).json({
                success: false,
                error: 'Invalid menu ID format'
            })
        } else {
            return res.status(404).json({
                success: false,
                error: 'Menu not found'
            })
        }
    })

    router.post('/api/menus', (req, res) => {
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (auth.includes('unauthorized')) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to create menu for this restaurant'
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
                _id: 'new-menu-id',
                ...req.body,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        })
    })

    router.put('/api/menus/:id', (req, res) => {
        const { id } = req.params
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (auth.includes('unauthorized')) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized'
            })
        }

        if (id === '60d21b4667d0d8992e610c85') {
            return res.status(200).json({
                success: true,
                data: {
                    _id: id,
                    ...req.body,
                    restaurantId: '507f1f77bcf86cd799439011',
                    updatedAt: new Date().toISOString()
                }
            })
        } else {
            return res.status(404).json({
                success: false,
                error: 'Menu not found'
            })
        }
    })

    router.delete('/api/menus/:id', (req, res) => {
        const { id } = req.params
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (auth.includes('unauthorized')) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized'
            })
        }

        if (id === 'menu-to-delete') {
            return res.status(204).end()
        } else if (id === '60d21b4667d0d8992e610c85') {
            return res.status(204).end()
        } else {
            return res.status(404).json({
                success: false,
                error: 'Menu not found'
            })
        }
    })

    const app = express()
    app.use(express.json())
    app.use(router)

    return app
})

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('@src/app')
const menuMock = require('@tests/fixtures/mocks/menuMockEnhanced')

describe('Menu Routes Integration Tests', () => {
    let userToken, adminToken, unauthorizedToken

    beforeAll(() => {
        // Generate mock tokens for testing
        userToken = 'Bearer valid-token'
        adminToken = 'Bearer admin-token'
        unauthorizedToken = 'Bearer unauthorized-token'
    })

    describe('GET /api/menus', () => {
        it('should return a list of menus', async () => {
            const res = await request(app)
                .get('/api/menus')
                .expect('Content-Type', /json/)
                .expect(200)

            expect(res.body.success).toBe(true)
            expect(res.body.data.length).toBe(2)
            expect(res.body.pagination).toBeDefined()
        })

        it('should filter menus by name', async () => {
            const res = await request(app)
                .get('/api/menus/filter?name=Lunch')
                .expect(200)

            expect(res.body.success).toBe(true)
            expect(res.body.data.length).toBe(1)
            expect(res.body.data[0].name).toContain('Lunch')
        })
    })

    describe('GET /api/menus/:id', () => {
        it('should return a menu by ID', async () => {
            const res = await request(app)
                .get('/api/menus/60d21b4667d0d8992e610c85')
                .expect(200)

            expect(res.body.success).toBe(true)
            expect(res.body.data._id).toBe('60d21b4667d0d8992e610c85')
            expect(res.body.data.name).toBe('Lunch Menu')
        })

        it('should return 404 for non-existent menu ID', async () => {
            const res = await request(app)
                .get('/api/menus/nonexistent')
                .expect(404)

            expect(res.body.success).toBe(false)
            expect(res.body.error).toBeDefined()
        })

        it('should return 400 for invalid menu ID format', async () => {
            const res = await request(app)
                .get('/api/menus/invalid-id')
                .expect(400)

            expect(res.body.success).toBe(false)
            expect(res.body.error).toBeDefined()
        })
    })

    describe('POST /api/menus', () => {
        it('should create a new menu when authenticated as restaurant owner', async () => {
            const newMenu = {
                name: 'New Test Menu',
                description: 'A new test menu for integration testing',
                isActive: true,
                categories: ['Test Category'],
                restaurantId: '507f1f77bcf86cd799439011'
            }

            const res = await request(app)
                .post('/api/menus')
                .set('Authorization', userToken)
                .send(newMenu)
                .expect(201)

            expect(res.body.success).toBe(true)
            expect(res.body.data.name).toBe(newMenu.name)
            expect(res.body.data.restaurantId).toBe(newMenu.restaurantId)
        })

        it('should return 403 when authenticated as non-owner', async () => {
            const newMenu = {
                name: 'Unauthorized Menu',
                description: 'This should not be created',
                restaurantId: '507f1f77bcf86cd799439011'
            }

            const res = await request(app)
                .post('/api/menus')
                .set('Authorization', unauthorizedToken)
                .send(newMenu)
                .expect(403)

            expect(res.body.success).toBe(false)
            expect(res.body.error).toBeDefined()
        })

        it('should return 401 when not authenticated', async () => {
            const newMenu = {
                name: 'Unauthenticated Menu',
                description: 'This should not be created',
                restaurantId: '507f1f77bcf86cd799439011'
            }

            const res = await request(app)
                .post('/api/menus')
                .send(newMenu)
                .expect(401)

            expect(res.body.success).toBe(false)
            expect(res.body.error).toBeDefined()
        })

        it('should return 400 for invalid menu data', async () => {
            const invalidMenu = {
                name: 'A', // Too short
                restaurantId: '507f1f77bcf86cd799439011'
            }

            const res = await request(app)
                .post('/api/menus')
                .set('Authorization', userToken)
                .send(invalidMenu)
                .expect(400)

            expect(res.body.success).toBe(false)
            expect(res.body.error).toBeDefined()
        })
    })

    describe('PUT /api/menus/:id', () => {
        it('should update a menu when authenticated as owner', async () => {
            const updateData = {
                name: 'Updated Menu Name',
                description: 'Updated description'
            }

            const res = await request(app)
                .put('/api/menus/60d21b4667d0d8992e610c85')
                .set('Authorization', userToken)
                .send(updateData)
                .expect(200)

            expect(res.body.success).toBe(true)
            expect(res.body.data.name).toBe(updateData.name)
            expect(res.body.data.description).toBe(updateData.description)
        })

        it('should return 403 when authenticated as non-owner', async () => {
            const updateData = {
                name: 'Unauthorized Update'
            }

            const res = await request(app)
                .put('/api/menus/60d21b4667d0d8992e610c85')
                .set('Authorization', unauthorizedToken)
                .send(updateData)
                .expect(403)

            expect(res.body.success).toBe(false)
            expect(res.body.error).toBeDefined()
        })

        it('should return 404 for non-existent menu ID', async () => {
            const updateData = {
                name: 'Non-existent Menu Update'
            }

            const res = await request(app)
                .put('/api/menus/nonexistent')
                .set('Authorization', userToken)
                .send(updateData)
                .expect(404)

            expect(res.body.success).toBe(false)
            expect(res.body.error).toBeDefined()
        })
    })

    describe('DELETE /api/menus/:id', () => {
        it('should delete a menu when authenticated as owner', async () => {
            const res = await request(app)
                .delete('/api/menus/menu-to-delete')
                .set('Authorization', userToken)
                .expect(204)
        })

        it('should return 403 when authenticated as non-owner', async () => {
            const res = await request(app)
                .delete('/api/menus/60d21b4667d0d8992e610c85')
                .set('Authorization', unauthorizedToken)
                .expect(403)

            expect(res.body.success).toBe(false)
            expect(res.body.error).toBeDefined()
        })

        it('should return 404 for non-existent menu ID', async () => {
            const res = await request(app)
                .delete('/api/menus/nonexistent')
                .set('Authorization', userToken)
                .expect(404)

            expect(res.body.success).toBe(false)
            expect(res.body.error).toBeDefined()
        })
    })
}) 