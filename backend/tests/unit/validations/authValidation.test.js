const {
    registerSchema,
    loginSchema,
    changePasswordSchema
} = require('../../../src/validations/authValidation')

describe('Auth Validation Tests', () => {
    describe('registerSchema', () => {
        it('should validate valid registration data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            }

            const { error } = registerSchema.validate(validData)
            expect(error).toBeUndefined()
        })

        it('should fail validation with invalid email', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'password123',
                confirmPassword: 'password123'
            }

            const { error } = registerSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Please provide a valid email address')
        })

        it('should fail validation with short password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: '123',
                confirmPassword: '123'
            }

            const { error } = registerSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Password must be at least 6 characters long')
        })

        it('should fail validation with mismatched passwords', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'different123'
            }

            const { error } = registerSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Passwords do not match')
        })

        it('should fail validation with missing required fields', () => {
            const invalidData = {
                email: 'test@example.com'
            }

            const { error } = registerSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Password is required')
        })
    })

    describe('loginSchema', () => {
        it('should validate valid login data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123'
            }

            const { error } = loginSchema.validate(validData)
            expect(error).toBeUndefined()
        })

        it('should fail validation with invalid email', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'password123'
            }

            const { error } = loginSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Please provide a valid email address')
        })

        it('should fail validation with missing password', () => {
            const invalidData = {
                email: 'test@example.com'
            }

            const { error } = loginSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Password is required')
        })

        it('should fail validation with missing email', () => {
            const invalidData = {
                password: 'password123'
            }

            const { error } = loginSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Email is required')
        })
    })

    describe('changePasswordSchema', () => {
        it('should validate valid password change data', () => {
            const validData = {
                currentPassword: 'oldpassword123',
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123'
            }

            const { error } = changePasswordSchema.validate(validData)
            expect(error).toBeUndefined()
        })

        it('should fail validation with short new password', () => {
            const invalidData = {
                currentPassword: 'oldpassword123',
                newPassword: '123',
                confirmPassword: '123'
            }

            const { error } = changePasswordSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('New password must be at least 6 characters long')
        })

        it('should fail validation with mismatched new passwords', () => {
            const invalidData = {
                currentPassword: 'oldpassword123',
                newPassword: 'newpassword123',
                confirmPassword: 'different123'
            }

            const { error } = changePasswordSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Passwords do not match')
        })

        it('should fail validation with missing current password', () => {
            const invalidData = {
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123'
            }

            const { error } = changePasswordSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Current password is required')
        })

        it('should fail validation with missing confirm password', () => {
            const invalidData = {
                currentPassword: 'oldpassword123',
                newPassword: 'newpassword123'
            }

            const { error } = changePasswordSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Confirm password is required')
        })
    })
}) 