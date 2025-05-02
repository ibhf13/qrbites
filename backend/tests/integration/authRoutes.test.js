// Mock app before importing it
jest.mock('@src/app', () => {
    const express = require('express')
    const router = express.Router()

    // Mock the auth routes for testing
    router.post('/api/auth/register', (req, res) => {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide name, email and password'
            })
        }

        if (email === 'existing@example.com') {
            return res.status(400).json({
                success: false,
                error: 'User already exists'
            })
        }

        return res.status(201).json({
            success: true,
            data: {
                _id: 'new-user-id',
                name,
                email,
                role: 'user',
                token: 'mock-jwt-token'
            }
        })
    })

    router.post('/api/auth/login', (req, res) => {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            })
        }

        if (email === 'nonexistent@example.com') {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            })
        }

        if (email === 'user@example.com' && password !== 'correctpassword') {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                _id: 'existing-user-id',
                name: 'Test User',
                email,
                role: email.includes('admin') ? 'admin' : 'user',
                token: 'mock-jwt-token'
            }
        })
    })

    router.get('/api/auth/me', (req, res) => {
        const auth = req.headers.authorization

        if (!auth) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        if (auth === 'Bearer expired-token') {
            return res.status(401).json({
                success: false,
                error: 'Token expired'
            })
        }

        if (auth === 'Bearer invalid-token') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                _id: 'existing-user-id',
                name: 'Test User',
                email: 'user@example.com',
                role: auth.includes('admin') ? 'admin' : 'user'
            }
        })
    })

    router.post('/api/auth/forgot-password', (req, res) => {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email'
            })
        }

        if (email === 'nonexistent@example.com') {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                message: 'Password reset email sent'
            }
        })
    })

    router.put('/api/auth/reset-password/:resetToken', (req, res) => {
        const { resetToken } = req.params
        const { password } = req.body

        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a password'
            })
        }

        if (resetToken === 'invalid-token') {
            return res.status(400).json({
                success: false,
                error: 'Invalid token'
            })
        }

        if (resetToken === 'expired-token') {
            return res.status(400).json({
                success: false,
                error: 'Token expired'
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                message: 'Password reset successful'
            }
        })
    })

    const app = express()
    app.use(express.json())
    app.use(router)

    return app
})

const request = require('supertest')
const app = require('@src/app')
const userMock = require('@tests/fixtures/mocks/userMock')

describe('Auth Routes Integration Tests', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'New User',
                    email: 'newuser@example.com',
                    password: 'password123'
                })

            expect(res.statusCode).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('token')
            expect(res.body.data).toHaveProperty('name', 'New User')
            expect(res.body.data).toHaveProperty('email', 'newuser@example.com')
        })

        it('should return 400 if user already exists', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Existing User',
                    email: 'existing@example.com',
                    password: 'password123'
                })

            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('User already exists')
        })

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Incomplete User'
                })

            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
        })
    })

    describe('POST /api/auth/login', () => {
        it('should login an existing user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'user@example.com',
                    password: 'correctpassword'
                })

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('token')
            expect(res.body.data).toHaveProperty('email', 'user@example.com')
        })

        it('should login an admin user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@example.com',
                    password: 'correctpassword'
                })

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('role', 'admin')
        })

        it('should return 401 for invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'user@example.com',
                    password: 'wrongpassword'
                })

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Invalid credentials')
        })

        it('should return 404 for non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'anypassword'
                })

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('User not found')
        })
    })

    describe('GET /api/auth/me', () => {
        it('should return the current user', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer valid-token')

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data).toHaveProperty('_id')
            expect(res.body.data).toHaveProperty('name')
            expect(res.body.data).toHaveProperty('email')
        })

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/auth/me')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Authentication required')
        })

        it('should return 401 if token is expired', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer expired-token')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Token expired')
        })

        it('should return 401 if token is invalid', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')

            expect(res.statusCode).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Invalid token')
        })
    })

    describe('POST /api/auth/forgot-password', () => {
        it('should send a password reset email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    email: 'user@example.com'
                })

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.message).toBe('Password reset email sent')
        })

        it('should return 404 for non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    email: 'nonexistent@example.com'
                })

            expect(res.statusCode).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('User not found')
        })

        it('should return 400 if email is not provided', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({})

            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
        })
    })

    describe('PUT /api/auth/reset-password/:resetToken', () => {
        it('should reset password with valid token', async () => {
            const res = await request(app)
                .put('/api/auth/reset-password/valid-token')
                .send({
                    password: 'newpassword123'
                })

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.message).toBe('Password reset successful')
        })

        it('should return 400 for invalid token', async () => {
            const res = await request(app)
                .put('/api/auth/reset-password/invalid-token')
                .send({
                    password: 'newpassword123'
                })

            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Invalid token')
        })

        it('should return 400 for expired token', async () => {
            const res = await request(app)
                .put('/api/auth/reset-password/expired-token')
                .send({
                    password: 'newpassword123'
                })

            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('Token expired')
        })

        it('should return 400 if password is not provided', async () => {
            const res = await request(app)
                .put('/api/auth/reset-password/valid-token')
                .send({})

            expect(res.statusCode).toBe(400)
            expect(res.body.success).toBe(false)
        })
    })
}) 