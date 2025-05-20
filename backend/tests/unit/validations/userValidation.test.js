const Joi = require('joi')
const { updateUserSchema, getUsersQuerySchema } = require('../../../src/validations/userValidation')

describe('User Validation Tests', () => {
    describe('updateUserSchema', () => {
        it('should validate valid user update data', () => {
            const validData = {
                email: 'test@example.com',
                role: 'user',
                isActive: true
            }

            const { error } = updateUserSchema.validate(validData)
            expect(error).toBeUndefined()
        })

        it('should validate partial user update data', () => {
            const partialData = {
                email: 'test@example.com'
            }

            const { error } = updateUserSchema.validate(partialData)
            expect(error).toBeUndefined()
        })

        it('should fail validation with invalid email', () => {
            const invalidData = {
                email: 'invalid-email'
            }

            const { error } = updateUserSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('valid email address')
        })

        it('should fail validation with invalid role', () => {
            const invalidData = {
                role: 'invalid-role'
            }

            const { error } = updateUserSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Role must be either user or admin')
        })

        it('should fail validation with invalid isActive type', () => {
            const invalidData = {
                isActive: 'not-a-boolean'
            }

            const { error } = updateUserSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('isActive must be a boolean value')
        })

        it('should fail validation with empty object', () => {
            const emptyData = {}

            const { error } = updateUserSchema.validate(emptyData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('At least one field must be provided for update')
        })

        it('should validate admin role', () => {
            const adminData = {
                role: 'admin'
            }

            const { error } = updateUserSchema.validate(adminData)
            expect(error).toBeUndefined()
        })

        it('should validate user role', () => {
            const userData = {
                role: 'user'
            }

            const { error } = updateUserSchema.validate(userData)
            expect(error).toBeUndefined()
        })

        it('should validate isActive false', () => {
            const deactivateData = {
                isActive: false
            }

            const { error } = updateUserSchema.validate(deactivateData)
            expect(error).toBeUndefined()
        })

        it('should validate multiple fields together', () => {
            const multipleFields = {
                email: 'admin@example.com',
                role: 'admin',
                isActive: true
            }

            const { error } = updateUserSchema.validate(multipleFields)
            expect(error).toBeUndefined()
        })
    })

    describe('getUsersQuerySchema', () => {
        it('should validate default query parameters', () => {
            const defaultQuery = {}

            const { error, value } = getUsersQuerySchema.validate(defaultQuery)
            expect(error).toBeUndefined()
            expect(value.page).toBe(1)
            expect(value.limit).toBe(10)
        })

        it('should validate custom pagination', () => {
            const customQuery = {
                page: 2,
                limit: 20
            }

            const { error } = getUsersQuerySchema.validate(customQuery)
            expect(error).toBeUndefined()
        })

        it('should validate role filter', () => {
            const roleQuery = {
                role: 'admin'
            }

            const { error } = getUsersQuerySchema.validate(roleQuery)
            expect(error).toBeUndefined()
        })

        it('should validate isActive filter', () => {
            const activeQuery = {
                isActive: 'true'
            }

            const { error } = getUsersQuerySchema.validate(activeQuery)
            expect(error).toBeUndefined()
        })

        it('should validate search parameter', () => {
            const searchQuery = {
                search: 'john'
            }

            const { error } = getUsersQuerySchema.validate(searchQuery)
            expect(error).toBeUndefined()
        })

        it('should fail validation with invalid page', () => {
            const invalidQuery = {
                page: 0
            }

            const { error } = getUsersQuerySchema.validate(invalidQuery)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Page must be at least 1')
        })

        it('should fail validation with invalid limit', () => {
            const invalidQuery = {
                limit: 101
            }

            const { error } = getUsersQuerySchema.validate(invalidQuery)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Limit cannot be more than 100')
        })

        it('should fail validation with invalid role', () => {
            const invalidQuery = {
                role: 'invalid-role'
            }

            const { error } = getUsersQuerySchema.validate(invalidQuery)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Role must be either user or admin')
        })

        it('should fail validation with invalid isActive', () => {
            const invalidQuery = {
                isActive: 'maybe'
            }

            const { error } = getUsersQuerySchema.validate(invalidQuery)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('isActive must be either true or false')
        })

        it('should fail validation with empty search', () => {
            const invalidQuery = {
                search: ''
            }

            const { error } = getUsersQuerySchema.validate(invalidQuery)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('not allowed to be empty')
        })

        it('should fail validation with too long search', () => {
            const invalidQuery = {
                search: 'a'.repeat(101)
            }

            const { error } = getUsersQuerySchema.validate(invalidQuery)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Search term cannot be longer than 100 characters')
        })

        it('should validate all parameters together', () => {
            const complexQuery = {
                page: 3,
                limit: 15,
                role: 'user',
                isActive: 'false',
                search: 'test user'
            }

            const { error } = getUsersQuerySchema.validate(complexQuery)
            expect(error).toBeUndefined()
        })
    })
}) 