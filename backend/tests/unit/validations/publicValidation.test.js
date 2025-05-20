const mongoose = require('mongoose')
const {
    menuIdSchema,
    restaurantIdSchema,
    menuItemsQuerySchema
} = require('../../../src/validations/publicValidation')

describe('Public Validation Tests', () => {
    describe('menuIdSchema', () => {
        it('should validate valid menu ID', () => {
            const validId = new mongoose.Types.ObjectId().toString()
            const validData = { menuId: validId }

            const { error } = menuIdSchema.validate(validData)
            expect(error).toBeUndefined()
        })

        it('should fail validation with invalid menu ID', () => {
            const invalidData = { menuId: 'invalid-id' }

            const { error } = menuIdSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Invalid menu ID format')
        })

        it('should fail validation with missing menu ID', () => {
            const invalidData = {}

            const { error } = menuIdSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Menu ID is required')
        })
    })

    describe('restaurantIdSchema', () => {
        it('should validate valid restaurant ID', () => {
            const validId = new mongoose.Types.ObjectId().toString()
            const validData = { restaurantId: validId }

            const { error } = restaurantIdSchema.validate(validData)
            expect(error).toBeUndefined()
        })

        it('should fail validation with invalid restaurant ID', () => {
            const invalidData = { restaurantId: 'invalid-id' }

            const { error } = restaurantIdSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Invalid restaurant ID format')
        })

        it('should fail validation with missing restaurant ID', () => {
            const invalidData = {}

            const { error } = restaurantIdSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Restaurant ID is required')
        })
    })

    describe('menuItemsQuerySchema', () => {
        it('should validate default query parameters', () => {
            const validData = {}

            const { error, value } = menuItemsQuerySchema.validate(validData)
            expect(error).toBeUndefined()
            expect(value.page).toBe(1)
            expect(value.limit).toBe(10)
        })

        it('should validate custom query parameters', () => {
            const validData = {
                page: 2,
                limit: 25,
                category: 'appetizers',
                search: 'chicken'
            }

            const { error, value } = menuItemsQuerySchema.validate(validData)
            expect(error).toBeUndefined()
            expect(value.page).toBe(2)
            expect(value.limit).toBe(25)
            expect(value.category).toBe('appetizers')
            expect(value.search).toBe('chicken')
        })

        it('should validate empty category and search', () => {
            const validData = {
                category: '',
                search: ''
            }

            const { error } = menuItemsQuerySchema.validate(validData)
            expect(error).toBeDefined() // Empty search should fail based on common validation
        })

        it('should strip unknown properties', () => {
            const validData = {
                page: 1,
                limit: 10,
                unknownField: 'should be stripped'
            }

            const { error, value } = menuItemsQuerySchema.validate(validData)
            expect(error).toBeUndefined()
            expect(value.unknownField).toBeUndefined()
        })

        it('should fail validation for invalid pagination', () => {
            const invalidData = {
                page: 0,
                limit: 101
            }

            const { error } = menuItemsQuerySchema.validate(invalidData)
            expect(error).toBeDefined()
        })

        it('should fail validation for too long search term', () => {
            const invalidData = {
                search: 'a'.repeat(101)
            }

            const { error } = menuItemsQuerySchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Search term cannot be longer than 100 characters')
        })
    })
}) 