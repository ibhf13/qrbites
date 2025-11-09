const request = require('supertest')
const express = require('express')
const { notFoundMiddleware, errorHandlerMiddleware } = require('../errorMiddleware')
const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  TooManyRequestsError,
} = require('@errors')

describe('Error Middleware', () => {
  let app

  beforeEach(() => {
    app = express()
    app.use(express.json())
  })

  describe('notFoundMiddleware', () => {
    it('should return 404 for unknown routes', async () => {
      app.use(notFoundMiddleware)
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/unknown-route').expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('not found')
    })

    it('should include the requested path in error message', async () => {
      app.use(notFoundMiddleware)
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/api/unknown').expect(404)

      expect(response.body.error).toContain('not found')
    })

    it('should work with POST requests', async () => {
      app.use(notFoundMiddleware)
      app.use(errorHandlerMiddleware)

      const response = await request(app).post('/unknown-route').expect(404)

      expect(response.body.success).toBe(false)
    })
  })

  describe('errorHandlerMiddleware', () => {
    it('should handle BadRequestError', async () => {
      app.get('/test', (req, res, next) => {
        next(new BadRequestError('Bad request message'))
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Bad request message')
    })

    it('should handle UnauthorizedError', async () => {
      app.get('/test', (req, res, next) => {
        next(new UnauthorizedError('Unauthorized message'))
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Unauthorized message')
    })

    it('should handle ForbiddenError', async () => {
      app.get('/test', (req, res, next) => {
        next(new ForbiddenError('Forbidden message'))
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(403)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Forbidden message')
    })

    it('should handle NotFoundError', async () => {
      app.get('/test', (req, res, next) => {
        next(new NotFoundError('Not found message'))
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Not found message')
    })

    it('should handle ValidationError with details', async () => {
      const validationDetails = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ]

      app.get('/test', (req, res, next) => {
        next(new ValidationError('Validation failed', validationDetails))
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(422)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Validation')
      expect(response.body.details).toBeDefined()
    })

    it('should handle ConflictError', async () => {
      app.get('/test', (req, res, next) => {
        next(new ConflictError('Conflict message'))
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(409)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Conflict message')
    })

    it('should handle TooManyRequestsError', async () => {
      app.get('/test', (req, res, next) => {
        next(new TooManyRequestsError('Too many requests'))
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(429)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Too many requests')
    })

    it('should handle Mongoose validation errors', async () => {
      const mongooseError = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email is required' },
          password: { message: 'Password is required' },
        },
      }

      app.get('/test', (req, res, next) => {
        next(mongooseError)
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(422)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Validation')
    })

    it('should handle Mongoose CastError', async () => {
      const castError = {
        name: 'CastError',
        path: '_id',
        value: 'invalid-id',
      }

      app.get('/test', (req, res, next) => {
        next(castError)
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
    })

    it('should handle MongoDB duplicate key errors', async () => {
      const duplicateError = {
        code: 11000,
        keyPattern: { email: 1 },
        keyValue: { email: 'test@example.com' },
      }

      app.get('/test', (req, res, next) => {
        next(duplicateError)
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
    })

    it('should handle JWT errors', async () => {
      const jwtError = {
        name: 'JsonWebTokenError',
        message: 'invalid token',
      }

      app.get('/test', (req, res, next) => {
        next(jwtError)
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid token')
    })

    it('should handle JWT expired errors', async () => {
      const expiredError = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
      }

      app.get('/test', (req, res, next) => {
        next(expiredError)
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('expired')
    })

    it('should handle generic errors', async () => {
      app.get('/test', (req, res, next) => {
        next(new Error('Generic error'))
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
    })

    it('should not expose stack traces in production', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      app.get('/test', (req, res, next) => {
        next(new Error('Test error'))
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(500)

      expect(response.body.stack).toBeUndefined()

      process.env.NODE_ENV = originalEnv
    })

    it('should include error details in test environment', async () => {
      process.env.NODE_ENV = 'test'

      app.get('/test', (req, res, next) => {
        const error = new Error('Test error')
        next(error)
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(500)

      expect(response.body.error).toBeDefined()
    })
  })

  describe('Error Flow Integration', () => {
    it('should catch errors thrown in async handlers', async () => {
      app.get('/test', async (req, res, next) => {
        try {
          throw new BadRequestError('Async error')
        } catch (error) {
          next(error)
        }
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Async error')
    })

    it('should handle multiple error middleware in sequence', async () => {
      app.get('/test', (req, res, next) => {
        next(new NotFoundError('Resource not found'))
      })
      app.use(notFoundMiddleware)
      app.use(errorHandlerMiddleware)

      const response = await request(app).get('/test').expect(404)

      expect(response.body.success).toBe(false)
    })
  })
})
