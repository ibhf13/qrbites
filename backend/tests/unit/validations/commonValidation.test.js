const mongoose = require('mongoose')
const {
    validateObjectId,
    paginationSchema,
    searchSchema,
    objectIdSchema
} = require('../../../src/validations/commonValidation')
const Joi = require('joi')

describe('Common Validation Tests', () => {
    describe('validateObjectId', () => {
        it('should validate a valid ObjectId', () => {
            const validId = new mongoose.Types.ObjectId().toString()
            const mockHelpers = { error: jest.fn() }

            const result = validateObjectId(validId, mockHelpers)
            expect(result).toBe(validId)
            expect(mockHelpers.error).not.toHaveBeenCalled()
        })

        it('should return error for invalid ObjectId', () => {
            const invalidId = 'invalid-id'
            const mockHelpers = { error: jest.fn(() => 'error') }

            const result = validateObjectId(invalidId, mockHelpers)
            expect(result).toBe('error')
            expect(mockHelpers.error).toHaveBeenCalledWith('any.invalid')
        })

        it('should handle empty string', () => {
            const emptyId = ''
            const mockHelpers = { error: jest.fn(() => 'error') }

            const result = validateObjectId(emptyId, mockHelpers)
            expect(result).toBe('error')
            expect(mockHelpers.error).toHaveBeenCalledWith('any.invalid')
        })
    })

    describe('paginationSchema', () => {
        it('should validate default pagination values', () => {
            const schema = Joi.object(paginationSchema)
            const { error, value } = schema.validate({})

            expect(error).toBeUndefined()
            expect(value.page).toBe(1)
            expect(value.limit).toBe(10)
        })

        it('should validate custom pagination values', () => {
            const schema = Joi.object(paginationSchema)
            const data = { page: 2, limit: 25 }
            const { error, value } = schema.validate(data)

            expect(error).toBeUndefined()
            expect(value.page).toBe(2)
            expect(value.limit).toBe(25)
        })

        it('should fail validation for invalid page number', () => {
            const schema = Joi.object(paginationSchema)
            const data = { page: 0 }
            const { error } = schema.validate(data)

            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Page must be at least 1')
        })

        it('should fail validation for negative page number', () => {
            const schema = Joi.object(paginationSchema)
            const data = { page: -1 }
            const { error } = schema.validate(data)

            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Page must be at least 1')
        })

        it('should fail validation for limit exceeding maximum', () => {
            const schema = Joi.object(paginationSchema)
            const data = { limit: 101 }
            const { error } = schema.validate(data)

            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Limit cannot be more than 100')
        })

        it('should fail validation for negative limit', () => {
            const schema = Joi.object(paginationSchema)
            const data = { limit: -1 }
            const { error } = schema.validate(data)

            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Limit must be at least 1')
        })

        it('should fail validation for non-integer page', () => {
            const schema = Joi.object(paginationSchema)
            const data = { page: 1.5 }
            const { error } = schema.validate(data)

            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Page must be an integer')
        })

        it('should fail validation for non-integer limit', () => {
            const schema = Joi.object(paginationSchema)
            const data = { limit: 10.5 }
            const { error } = schema.validate(data)

            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Limit must be an integer')
        })
    })

    describe('searchSchema', () => {
        it('should validate valid search term', () => {
            const schema = Joi.object(searchSchema)
            const data = { search: 'test search term' }
            const { error } = schema.validate(data)

            expect(error).toBeUndefined()
        })

        it('should validate without search term', () => {
            const schema = Joi.object(searchSchema)
            const data = {}
            const { error } = schema.validate(data)

            expect(error).toBeUndefined()
        })

        it('should fail validation for empty search term', () => {
            const schema = Joi.object(searchSchema)
            const data = { search: '' }
            const { error } = schema.validate(data)

            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('is not allowed to be empty')
        })

        it('should fail validation for too long search term', () => {
            const schema = Joi.object(searchSchema)
            const data = { search: 'a'.repeat(101) }
            const { error } = schema.validate(data)

            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Search term cannot be longer than 100 characters')
        })
    })

    describe('objectIdSchema', () => {
        it('should validate valid ObjectId', () => {
            const validId = new mongoose.Types.ObjectId().toString()
            const { error } = objectIdSchema.validate(validId)

            expect(error).toBeUndefined()
        })

        it('should fail validation for invalid ObjectId', () => {
            const invalidId = 'invalid-id'
            const { error } = objectIdSchema.validate(invalidId)

            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Invalid ID format')
        })

        it('should fail validation for empty string', () => {
            const emptyId = ''
            const { error } = objectIdSchema.validate(emptyId)

            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('is not allowed to be empty')
        })

        it('should fail validation for null', () => {
            const { error } = objectIdSchema.validate(null)

            expect(error).toBeDefined()
        })
    })
}) 