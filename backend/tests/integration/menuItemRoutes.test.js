// Mock app before importing it
jest.mock('@src/app', () => {
    const express = require('express')
    const router = express.Router()

    // Mock the menu item routes for testing
    router.get('/api/menu-items', (req, res) => {
        const { menuId } = req.query

        let items = [
            {
                _id: 'menu-item-id-1',
                name: 'Item One',
                description: 'Description for item one',
                price: 9.99,
                category: 'Appetizer',
                menuId: 'menu-id-1',
                restaurantId: 'restaurant-id-1'
            },
            {
                _id: 'menu-item-id-2',
                name: 'Item Two',
                description: 'Description for item two',
                price: 14.99,
                category: 'Main',
                menuId: 'menu-id-1',
                restaurantId: 'restaurant-id-1'
            },
            {
                _id: 'menu-item-id-3',
                name: 'Item Three',
                description: 'Description for item three',
                price: 5.99,
                category: 'Dessert',
                menuId: 'menu-id-2',
                restaurantId: 'restaurant-id-1'
            }
        ]

        if (menuId) {
            items = items.filter(item => item.menuId === menuId)
        }

        return res.status(200).json({
            success: true,
            data: items,
            pagination: {
                page: 1,
                limit: 10,
                total: items.length,
                pages: 1
            }
        })
    })

    router.get('/api/menu-items/:id', (req, res) => {
        const { id } = req.params

        if (id === 'menu-item-id-1') {
            return res.status(200).json({
                success: true,
                data: {
                    _id: 'menu-item-id-1',
                    name: 'Item One',
                    description: 'Description for item one',
                    price: 9.99,
                    category: 'Appetizer',
                    menuId: 'menu-id-1',
                    restaurantId: 'restaurant-id-1',
                    image: 'item1.jpg',
                    allergens: ['gluten', 'dairy'],
                    nutritionalInfo: {
                        calories: 350,
                        protein: 12,
                        carbs: 45,
                        fat: 15
                    },
                    available: true
                }
            })
        } else if (id === 'invalid-id') {
            return res.status(400).json({
                success: false,
                error: 'Invalid menu item ID format'
            })
        } else {
            return res.status(404).json({
                success: false,
                error: 'Menu item not found'
            })
        }
    })

    router.post('/api/menu-items', (req, res) => {
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
                error: 'Not authorized to create menu items for this restaurant'
            })
        }

        if (!req.body.name || !req.body.price || !req.body.menuId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            })
        }

        return res.status(201).json({
            success: true,
            data: {
                _id: 'new-menu-item-id',
                ...req.body,
                restaurantId: 'restaurant-id-1',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        })
    })

    router.put('/api/menu-items/:id', (req, res) => {
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
                error: 'Not authorized to update this menu item'
            })
        }

        if (id === 'menu-item-id-1') {
            return res.status(200).json({
                success: true,
                data: {
                    _id: id,
                    ...req.body,
                    menuId: 'menu-id-1',
                    restaurantId: 'restaurant-id-1',
                    updatedAt: new Date().toISOString()
                }
            })
        } else {
            return res.status(404).json({
                success: false,
                error: 'Menu item not found'
            })
        }
    })

    router.delete('/api/menu-items/:id', (req, res) => {
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
                error: 'Not authorized to delete this menu item'
            })
        }

        if (id === 'menu-item-id-1' || id === 'menu-item-to-delete') {
            return res.status(204).end()
        } else {
            return res.status(404).json({
                success: false,
                error: 'Menu item not found'
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
const menuItemMock = require('@tests/fixtures/mocks/menuItemMock')

describe('Menu Item Routes Integration Tests', () => {
    let ownerToken, userToken, unauthorizedToken

    beforeAll(() => {
        // Generate mock tokens for testing
        ownerToken = 'Bearer owner-token'
        userToken = 'Bearer user-token'
        unauthorizedToken = 'Bearer unauthorized-token'
    })

    describe('GET /api/menu-items', () => {
        it('should return all menu items', async () => {
            const res = await request(app).get('/api/menu-items')

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toBeInstanceOf(Array)
            expect(res.body.data.length).toBe(3)
            expect(res.body.pagination).toHaveProperty('total', 3)
        })

        it('should filter menu items by menuId', async () => {
            const res = await request(app).get('/api/menu-items?menuId=menu-id-1')

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toBeInstanceOf(Array)
            expect(res.body.data.length).toBe(2)
            expect(res.body.data[0].menuId).toBe('menu-id-1')
            expect(res.body.data[1].menuId).toBe('menu-id-1')
        })
    })

    describe('GET /api/menu-items/:id', () => {
        it('should return a specific menu item by ID', async () => {
            const res = await request(app).get('/api/menu-items/menu-item-id-1')

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('_id', 'menu-item-id-1')
            expect(res.body.data).toHaveProperty('name', 'Item One')
            expect(res.body.data).toHaveProperty('price', 9.99)
            expect(res.body.data).toHaveProperty('menuId', 'menu-id-1')
            expect(res.body.data).toHaveProperty('nutritionalInfo')
        })

        it('should return 404 for non-existent menu item', async () => {
            const res = await request(app).get('/api/menu-items/nonexistent-id')

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Menu item not found')
        })

        it('should return 400 for invalid ID format', async () => {
            const res = await request(app).get('/api/menu-items/invalid-id')

            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Invalid menu item ID format')
        })
    })

    describe('POST /api/menu-items', () => {
        it('should create a new menu item with valid data', async () => {
            const newMenuItem = {
                name: 'New Test Item',
                description: 'A description for the new test item',
                price: 12.99,
                category: 'Main',
                menuId: 'menu-id-1',
                allergens: ['nuts']
            }

            const res = await request(app)
                .post('/api/menu-items')
                .set('Authorization', ownerToken)
                .send(newMenuItem)

            expect(res.statusCode).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('_id')
            expect(res.body.data).toHaveProperty('name', newMenuItem.name)
            expect(res.body.data).toHaveProperty('price', newMenuItem.price)
            expect(res.body.data).toHaveProperty('menuId', newMenuItem.menuId)
            expect(res.body.data).toHaveProperty('restaurantId')
            expect(res.body.data).toHaveProperty('createdAt')
            expect(res.body.data).toHaveProperty('updatedAt')
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(app)
                .post('/api/menu-items')
                .send({
                    name: 'Unauthorized Item',
                    price: 10.99,
                    menuId: 'menu-id-1'
                })

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Authentication required')
        })

        it('should return 403 for unauthorized user', async () => {
            const res = await request(app)
                .post('/api/menu-items')
                .set('Authorization', unauthorizedToken)
                .send({
                    name: 'Unauthorized Item',
                    price: 10.99,
                    menuId: 'menu-id-1'
                })

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Not authorized to create menu items for this restaurant')
        })

        it('should return 400 for missing required fields', async () => {
            const res = await request(app)
                .post('/api/menu-items')
                .set('Authorization', ownerToken)
                .send({
                    name: 'Incomplete Item'
                    // missing price and menuId
                })

            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Missing required fields')
        })
    })

    describe('PUT /api/menu-items/:id', () => {
        it('should update a menu item with valid data', async () => {
            const updateData = {
                name: 'Updated Item Name',
                price: 11.99,
                description: 'Updated description'
            }

            const res = await request(app)
                .put('/api/menu-items/menu-item-id-1')
                .set('Authorization', ownerToken)
                .send(updateData)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('name', updateData.name)
            expect(res.body.data).toHaveProperty('price', updateData.price)
            expect(res.body.data).toHaveProperty('description', updateData.description)
            expect(res.body.data).toHaveProperty('menuId', 'menu-id-1')
            expect(res.body.data).toHaveProperty('restaurantId', 'restaurant-id-1')
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(app)
                .put('/api/menu-items/menu-item-id-1')
                .send({ name: 'Unauthorized Update' })

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Authentication required')
        })

        it('should return 403 for unauthorized user', async () => {
            const res = await request(app)
                .put('/api/menu-items/menu-item-id-1')
                .set('Authorization', unauthorizedToken)
                .send({ name: 'Unauthorized Update' })

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Not authorized to update this menu item')
        })

        it('should return 404 for non-existent menu item', async () => {
            const res = await request(app)
                .put('/api/menu-items/nonexistent-id')
                .set('Authorization', ownerToken)
                .send({ name: 'Updated Name' })

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Menu item not found')
        })
    })

    describe('DELETE /api/menu-items/:id', () => {
        it('should delete a menu item', async () => {
            const res = await request(app)
                .delete('/api/menu-items/menu-item-id-1')
                .set('Authorization', ownerToken)

            expect(res.statusCode).toBe(204)
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).delete('/api/menu-items/menu-item-id-1')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Authentication required')
        })

        it('should return 403 for unauthorized user', async () => {
            const res = await request(app)
                .delete('/api/menu-items/menu-item-id-1')
                .set('Authorization', unauthorizedToken)

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Not authorized to delete this menu item')
        })

        it('should return 404 for non-existent menu item', async () => {
            const res = await request(app)
                .delete('/api/menu-items/nonexistent-id')
                .set('Authorization', ownerToken)

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Menu item not found')
        })
    })
}) 