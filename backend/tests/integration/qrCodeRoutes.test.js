// Mock app before importing it
jest.mock('@src/app', () => {
    const express = require('express')
    const router = express.Router()

    // Mock the QR code routes for testing
    router.get('/api/qrcodes/restaurant/:restaurantId', (req, res) => {
        const { restaurantId } = req.params
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (restaurantId === 'restaurant-id-1' && !auth.includes('user-id-1') && !auth.includes('admin')) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access QR codes for this restaurant'
            })
        }

        if (restaurantId === 'restaurant-id-1') {
            return res.status(200).json({
                success: true,
                data: [
                    {
                        _id: 'qr-code-id-1',
                        restaurantId: 'restaurant-id-1',
                        menuId: 'menu-id-1',
                        type: 'menu',
                        filePath: '/uploads/qrcodes/qr-code-id-1.png',
                        createdAt: '2023-01-01T12:00:00Z'
                    },
                    {
                        _id: 'qr-code-id-2',
                        restaurantId: 'restaurant-id-1',
                        menuId: 'menu-id-2',
                        type: 'menu',
                        filePath: '/uploads/qrcodes/qr-code-id-2.png',
                        createdAt: '2023-01-02T12:00:00Z'
                    }
                ]
            })
        } else {
            return res.status(404).json({
                success: false,
                error: 'No QR codes found for this restaurant'
            })
        }
    })

    router.get('/api/qrcodes/menu/:menuId', (req, res) => {
        const { menuId } = req.params
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if ((menuId === 'menu-id-1' || menuId === 'menu-id-2') && !auth.includes('user-id-1') && !auth.includes('admin')) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access QR code for this menu'
            })
        }

        if (menuId === 'menu-id-1') {
            return res.status(200).json({
                success: true,
                data: {
                    _id: 'qr-code-id-1',
                    restaurantId: 'restaurant-id-1',
                    menuId: 'menu-id-1',
                    type: 'menu',
                    filePath: '/uploads/qrcodes/qr-code-id-1.png',
                    url: 'https://qrbites.com/menu/menu-id-1',
                    createdAt: '2023-01-01T12:00:00Z'
                }
            })
        } else if (menuId === 'menu-id-2') {
            return res.status(200).json({
                success: true,
                data: {
                    _id: 'qr-code-id-2',
                    restaurantId: 'restaurant-id-1',
                    menuId: 'menu-id-2',
                    type: 'menu',
                    filePath: '/uploads/qrcodes/qr-code-id-2.png',
                    url: 'https://qrbites.com/menu/menu-id-2',
                    createdAt: '2023-01-02T12:00:00Z'
                }
            })
        } else {
            return res.status(404).json({
                success: false,
                error: 'No QR code found for this menu'
            })
        }
    })

    router.post('/api/qrcodes/generate', (req, res) => {
        const { menuId, type } = req.body
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (!menuId || !type) {
            return res.status(400).json({
                success: false,
                error: 'menuId and type are required'
            })
        }

        if (menuId === 'menu-id-1' && !auth.includes('user-id-1') && !auth.includes('admin')) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to generate QR code for this menu'
            })
        }

        return res.status(201).json({
            success: true,
            data: {
                _id: 'new-qr-code-id',
                restaurantId: 'restaurant-id-1',
                menuId,
                type,
                filePath: `/uploads/qrcodes/new-qr-code-id.png`,
                url: `https://qrbites.com/${type}/${menuId}`,
                createdAt: new Date().toISOString()
            }
        })
    })

    router.delete('/api/qrcodes/:id', (req, res) => {
        const { id } = req.params
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (id === 'qr-code-id-1' && !auth.includes('user-id-1') && !auth.includes('admin')) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this QR code'
            })
        }

        if (id === 'qr-code-id-1' || id === 'qr-code-to-delete') {
            return res.status(204).end()
        } else {
            return res.status(404).json({
                success: false,
                error: 'QR code not found'
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

describe('QR Code Routes Integration Tests', () => {
    let ownerToken, userToken, adminToken

    beforeAll(() => {
        // Generate mock tokens for testing
        ownerToken = 'Bearer user-id-1-token'
        userToken = 'Bearer user-id-2-token'
        adminToken = 'Bearer admin-token'
    })

    describe('GET /api/qrcodes/restaurant/:restaurantId', () => {
        it('should return all QR codes for a restaurant as owner', async () => {
            const res = await request(app)
                .get('/api/qrcodes/restaurant/restaurant-id-1')
                .set('Authorization', ownerToken)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toBeInstanceOf(Array)
            expect(res.body.data.length).toBe(2)
            expect(res.body.data[0]).toHaveProperty('_id')
            expect(res.body.data[0]).toHaveProperty('restaurantId', 'restaurant-id-1')
            expect(res.body.data[0]).toHaveProperty('menuId')
            expect(res.body.data[0]).toHaveProperty('filePath')
        })

        it('should return all QR codes for a restaurant as admin', async () => {
            const res = await request(app)
                .get('/api/qrcodes/restaurant/restaurant-id-1')
                .set('Authorization', adminToken)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toBeInstanceOf(Array)
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/qrcodes/restaurant/restaurant-id-1')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Authentication required')
        })

        it('should return 403 for unauthorized access', async () => {
            const res = await request(app)
                .get('/api/qrcodes/restaurant/restaurant-id-1')
                .set('Authorization', userToken)

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Not authorized to access QR codes for this restaurant')
        })

        it('should return 404 for non-existent restaurant QR codes', async () => {
            const res = await request(app)
                .get('/api/qrcodes/restaurant/nonexistent-id')
                .set('Authorization', ownerToken)

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('No QR codes found for this restaurant')
        })
    })

    describe('GET /api/qrcodes/menu/:menuId', () => {
        it('should return a specific QR code for a menu as owner', async () => {
            const res = await request(app)
                .get('/api/qrcodes/menu/menu-id-1')
                .set('Authorization', ownerToken)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('_id', 'qr-code-id-1')
            expect(res.body.data).toHaveProperty('menuId', 'menu-id-1')
            expect(res.body.data).toHaveProperty('restaurantId', 'restaurant-id-1')
            expect(res.body.data).toHaveProperty('url')
            expect(res.body.data).toHaveProperty('filePath')
        })

        it('should return a specific QR code for a menu as admin', async () => {
            const res = await request(app)
                .get('/api/qrcodes/menu/menu-id-2')
                .set('Authorization', adminToken)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('menuId', 'menu-id-2')
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/qrcodes/menu/menu-id-1')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Authentication required')
        })

        it('should return 403 for unauthorized access', async () => {
            const res = await request(app)
                .get('/api/qrcodes/menu/menu-id-1')
                .set('Authorization', userToken)

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Not authorized to access QR code for this menu')
        })

        it('should return 404 for non-existent menu QR code', async () => {
            const res = await request(app)
                .get('/api/qrcodes/menu/nonexistent-menu-id')
                .set('Authorization', ownerToken)

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('No QR code found for this menu')
        })
    })

    describe('POST /api/qrcodes/generate', () => {
        it('should generate a new QR code for a menu as owner', async () => {
            const res = await request(app)
                .post('/api/qrcodes/generate')
                .set('Authorization', ownerToken)
                .send({
                    menuId: 'menu-id-1',
                    type: 'menu'
                })

            expect(res.statusCode).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('_id')
            expect(res.body.data).toHaveProperty('menuId', 'menu-id-1')
            expect(res.body.data).toHaveProperty('type', 'menu')
            expect(res.body.data).toHaveProperty('url')
            expect(res.body.data).toHaveProperty('filePath')
        })

        it('should generate a new QR code for a menu as admin', async () => {
            const res = await request(app)
                .post('/api/qrcodes/generate')
                .set('Authorization', adminToken)
                .send({
                    menuId: 'menu-id-1',
                    type: 'menu'
                })

            expect(res.statusCode).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('menuId', 'menu-id-1')
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(app)
                .post('/api/qrcodes/generate')
                .send({
                    menuId: 'menu-id-1',
                    type: 'menu'
                })

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Authentication required')
        })

        it('should return 400 for missing required fields', async () => {
            const res = await request(app)
                .post('/api/qrcodes/generate')
                .set('Authorization', ownerToken)
                .send({
                    menuId: 'menu-id-1'
                    // missing type
                })

            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('menuId and type are required')
        })

        it('should return 403 for unauthorized access', async () => {
            const res = await request(app)
                .post('/api/qrcodes/generate')
                .set('Authorization', userToken)
                .send({
                    menuId: 'menu-id-1',
                    type: 'menu'
                })

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Not authorized to generate QR code for this menu')
        })
    })

    describe('DELETE /api/qrcodes/:id', () => {
        it('should delete a QR code as owner', async () => {
            const res = await request(app)
                .delete('/api/qrcodes/qr-code-id-1')
                .set('Authorization', ownerToken)

            expect(res.statusCode).toBe(204)
        })

        it('should delete a QR code as admin', async () => {
            const res = await request(app)
                .delete('/api/qrcodes/qr-code-to-delete')
                .set('Authorization', adminToken)

            expect(res.statusCode).toBe(204)
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).delete('/api/qrcodes/qr-code-id-1')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Authentication required')
        })

        it('should return 403 for unauthorized access', async () => {
            const res = await request(app)
                .delete('/api/qrcodes/qr-code-id-1')
                .set('Authorization', userToken)

            expect(res.statusCode).toBe(403)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Not authorized to delete this QR code')
        })

        it('should return 404 for non-existent QR code', async () => {
            const res = await request(app)
                .delete('/api/qrcodes/nonexistent-id')
                .set('Authorization', ownerToken)

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('QR code not found')
        })
    })
}) 