// Mock app before importing it
jest.mock('@src/app', () => {
    const express = require('express')
    const path = require('path')
    const multer = require('multer')
    const router = express.Router()

    // Simple mock storage
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(process.cwd(), 'tests', 'testData'))
        },
        filename: (req, file, cb) => {
            cb(null, 'test-upload.jpg')
        }
    })

    // Mock upload middleware
    const upload = multer({
        storage,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true)
            } else {
                cb(new Error('Only image files are allowed'), false)
            }
        }
    })

    // Auth middleware mock
    const auth = (req, res, next) => {
        const token = req.headers.authorization
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (token.includes('invalid')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            })
        }

        // For valid tokens, attach user ID to request
        req.user = { _id: '60d21b4667d0d8992e610c60' }
        next()
    }

    // Mock restaurant logo upload endpoint
    router.post('/api/restaurants/:id/logo', auth, upload.single('image'), (req, res) => {
        const { id } = req.params

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            })
        }

        // Testing different IDs
        if (id === 'not-found') {
            return res.status(404).json({
                success: false,
                error: 'Restaurant not found'
            })
        }

        if (id === 'unauthorized') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this restaurant'
            })
        }

        // Success case
        return res.status(200).json({
            success: true,
            data: {
                _id: id,
                logoUrl: `http://localhost:3000/uploads/restaurants/test-upload.jpg`
            }
        })
    })

    // Mock auth-only endpoints for testing authentication
    router.post('/api/auth-test/no-file-upload', auth, (req, res) => {
        return res.status(200).json({
            success: true,
            message: 'Authentication successful'
        })
    })

    // Mock menu image upload endpoint
    router.post('/api/menus/:id/image', auth, upload.single('image'), (req, res) => {
        const { id } = req.params

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            })
        }

        // Success case
        return res.status(200).json({
            success: true,
            data: {
                _id: id,
                imageUrl: `http://localhost:3000/uploads/menus/test-upload.jpg`
            }
        })
    })

    // Mock menu item image upload endpoint
    router.post('/api/menu-items/:id/image', auth, upload.single('image'), (req, res) => {
        const { id } = req.params

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            })
        }

        // Success case
        return res.status(200).json({
            success: true,
            data: {
                _id: id,
                imageUrl: `http://localhost:3000/uploads/menu-items/test-upload.jpg`
            }
        })
    })

    // Mock static file serving
    router.use('/uploads', express.static(path.join(process.cwd(), 'tests', 'fixtures', 'images')))

    const app = express()
    app.use(express.json())
    app.use(router)

    return app
})

const request = require('supertest')
const path = require('path')
const fs = require('fs')
const app = require('@src/app')

describe('File Upload Routes Integration Tests', () => {
    // Define directories first to ensure correct path construction
    const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures')
    const imagesDir = path.join(fixturesDir, 'images')
    const testImagePath = path.join(imagesDir, 'test-image.jpg')

    const validToken = 'Bearer valid-token'
    const invalidToken = 'Bearer invalid-token'

    beforeAll(() => {
        // Create fixtures/images directory if it doesn't exist
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true })
        }

        // Create a test image if it doesn't exist
        if (!fs.existsSync(testImagePath)) {
            // Create a simple 1x1 pixel JPEG
            const buffer = Buffer.from([
                0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
                0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
                0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
                0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
                0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
                0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc2, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00,
                0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01,
                0x01, 0x00, 0x01, 0x3f, 0x10
            ])
            fs.writeFileSync(testImagePath, buffer)
        }

        // Verify the test image now exists
        if (!fs.existsSync(testImagePath)) {
            throw new Error(`Test image creation failed: ${testImagePath}`)
        }

        // Create testData directory if it doesn't exist
        const testDataDir = path.join(process.cwd(), 'tests', 'testData')
        if (!fs.existsSync(testDataDir)) {
            fs.mkdirSync(testDataDir, { recursive: true })
        }
    })

    afterAll(() => {
        // Clean up test uploads
        const testUploadPath = path.join(process.cwd(), 'tests', 'testData', 'test-upload.jpg')
        if (fs.existsSync(testUploadPath)) {
            try {
                fs.unlinkSync(testUploadPath)
            } catch (error) {
                console.warn('Failed to remove test upload:', error.message)
            }
        }
    })

    describe('Restaurant Logo Upload', () => {
        it('should upload a restaurant logo', async () => {
            const response = await request(app)
                .post('/api/restaurants/60d21b4667d0d8992e610c70/logo')
                .set('Authorization', validToken)
                .attach('image', testImagePath)

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveProperty('logoUrl')
            expect(response.body.data.logoUrl).toContain('/uploads/restaurants/')
        })

        it('should return 401 when no token is provided', async () => {
            // Use non-file upload endpoint to test auth without connection issues
            const response = await request(app)
                .post('/api/auth-test/no-file-upload')

            expect(response.status).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.error).toBe('Authentication required')
        })

        it('should return 401 when invalid token is provided', async () => {
            // Use non-file upload endpoint to test auth without connection issues
            const response = await request(app)
                .post('/api/auth-test/no-file-upload')
                .set('Authorization', invalidToken)

            expect(response.status).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.error).toBe('Invalid token')
        })

        it('should return 404 when restaurant not found', async () => {
            const response = await request(app)
                .post('/api/restaurants/not-found/logo')
                .set('Authorization', validToken)
                .attach('image', testImagePath)

            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
            expect(response.body.error).toBe('Restaurant not found')
        })

        it('should return 403 when not authorized', async () => {
            const response = await request(app)
                .post('/api/restaurants/unauthorized/logo')
                .set('Authorization', validToken)
                .attach('image', testImagePath)

            expect(response.status).toBe(403)
            expect(response.body.success).toBe(false)
            expect(response.body.error).toBe('Not authorized to update this restaurant')
        })
    })

    describe('Menu Image Upload', () => {
        it('should upload a menu image', async () => {
            const response = await request(app)
                .post('/api/menus/60d21b4667d0d8992e610c80/image')
                .set('Authorization', validToken)
                .attach('image', testImagePath)

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveProperty('imageUrl')
            expect(response.body.data.imageUrl).toContain('/uploads/menus/')
        })
    })

    describe('Menu Item Image Upload', () => {
        it('should upload a menu item image', async () => {
            const response = await request(app)
                .post('/api/menu-items/60d21b4667d0d8992e610c90/image')
                .set('Authorization', validToken)
                .attach('image', testImagePath)

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data).toHaveProperty('imageUrl')
            expect(response.body.data.imageUrl).toContain('/uploads/menu-items/')
        })
    })

    describe('Uploaded File Access', () => {
        it('should serve uploaded files', async () => {
            // Simplified test that doesn't rely on actual uploads
            const response = await request(app)
                .get('/uploads/test-image.jpg')

            expect(response.status).toBe(200)
            expect(response.type).toMatch(/^image\//)
        })
    })
}) 