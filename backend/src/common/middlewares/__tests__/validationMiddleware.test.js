const request = require('supertest')
const express = require('express')
const Joi = require('joi')
const { validateRequest: validate } = require('../validationMiddleware')
const { errorHandlerMiddleware } = require('../errorMiddleware')

describe('Validation Middleware', () => {
  let app

  beforeEach(() => {
    app = express()
    app.use(express.json())
  })

  describe('validate middleware', () => {
    it('should pass validation with valid data', async () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })

      const response = await request(app)
        .post('/test')
        .send({
          name: 'Test User',
          email: 'test@example.com',
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should reject invalid data', async () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app)
        .post('/test')
        .send({
          email: 'invalid-email',
        })
        .expect(422)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Validation')
    })

    it('should reject missing required fields', async () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app)
        .post('/test')
        .send({
          name: 'Test User',
        })
        .expect(422)

      expect(response.body.success).toBe(false)
    })

    it('should strip unknown fields by default', async () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      })

      let receivedBody

      app.post('/test', validate(schema), (req, res) => {
        receivedBody = req.body
        res.json({ success: true })
      })

      await request(app)
        .post('/test')
        .send({
          name: 'Test User',
          unknownField: 'should be removed',
        })
        .expect(200)

      expect(receivedBody.name).toBe('Test User')
      expect(receivedBody.unknownField).toBeUndefined()
    })

    it('should validate nested objects', async () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        }).required(),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })

      const response = await request(app)
        .post('/test')
        .send({
          user: {
            name: 'Test User',
            email: 'test@example.com',
          },
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should validate arrays', async () => {
      const schema = Joi.object({
        tags: Joi.array().items(Joi.string()).required(),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })

      const response = await request(app)
        .post('/test')
        .send({
          tags: ['tag1', 'tag2', 'tag3'],
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should validate with custom error messages', async () => {
      const schema = Joi.object({
        age: Joi.number().min(18).required().messages({
          'number.min': 'Must be at least 18 years old',
        }),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app)
        .post('/test')
        .send({
          age: 15,
        })
        .expect(422)

      expect(response.body.details.age).toContain('18')
    })

    it('should validate string length', async () => {
      const schema = Joi.object({
        password: Joi.string().min(8).max(100).required(),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app)
        .post('/test')
        .send({
          password: '123',
        })
        .expect(422)

      expect(response.body.success).toBe(false)
    })

    it('should validate enum values', async () => {
      const schema = Joi.object({
        role: Joi.string().valid('user', 'admin').required(),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app)
        .post('/test')
        .send({
          role: 'superuser',
        })
        .expect(422)

      expect(response.body.success).toBe(false)
    })

    it('should handle optional fields', async () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        nickname: Joi.string().optional(),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })

      const response = await request(app)
        .post('/test')
        .send({
          name: 'Test User',
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should validate conditional fields', async () => {
      const schema = Joi.object({
        hasAddress: Joi.boolean().required(),
        address: Joi.string().when('hasAddress', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })

      // Should pass when hasAddress is false
      await request(app)
        .post('/test')
        .send({
          hasAddress: false,
        })
        .expect(200)

      // Should fail when hasAddress is true but address is missing
      await request(app)
        .post('/test')
        .send({
          hasAddress: true,
        })
        .expect(422)
    })
  })

  describe('Validation Edge Cases', () => {
    it('should handle empty request body', async () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandlerMiddleware)

      const response = await request(app).post('/test').send({}).expect(422)

      expect(response.body.success).toBe(false)
    })

    it('should handle null values', async () => {
      const schema = Joi.object({
        name: Joi.string().allow(null).optional(),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })

      const response = await request(app)
        .post('/test')
        .send({
          name: null,
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should validate email format', async () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })

      const invalidEmails = ['invalid', 'test@', '@example.com', 'test@@example.com']

      for (const email of invalidEmails) {
        await request(app).post('/test').send({ email }).expect(422)
      }

      // Valid email should pass
      await request(app).post('/test').send({ email: 'valid@example.com' }).expect(200)
    })

    it('should validate number ranges', async () => {
      const schema = Joi.object({
        age: Joi.number().min(0).max(120).required(),
      })

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true })
      })

      // Too low
      await request(app).post('/test').send({ age: -1 }).expect(422)

      // Too high
      await request(app).post('/test').send({ age: 150 }).expect(422)

      // Valid
      await request(app).post('/test').send({ age: 25 }).expect(200)
    })
  })
})
