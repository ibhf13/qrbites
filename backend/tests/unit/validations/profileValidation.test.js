const Joi = require('joi')
const {
    updateProfileSchema,
    updateUserProfileSchema,
    privacySettingsSchema,
    getProfilesQuerySchema
} = require('../../../src/validations/profileValidation')

describe('Profile Validation Tests', () => {
    describe('updateProfileSchema', () => {
        it('should validate valid profile data', () => {
            const validData = {
                firstName: 'John',
                lastName: 'Doe',
                displayName: 'johndoe',
                phone: '+1234567890',
                bio: 'Test bio',
                dateOfBirth: new Date('1990-01-01'),
                location: {
                    street: 'Teststraße',
                    houseNumber: '123',
                    city: 'Hamburg',
                    zipCode: '22301'
                },
                preferences: {
                    language: 'en',
                    timezone: 'UTC',
                    notifications: {
                        email: true,
                        sms: false,
                        push: true
                    }
                },
                socialLinks: {
                    website: 'https://example.com',
                    twitter: '@johndoe',
                    instagram: '@johndoe',
                    linkedin: 'https://linkedin.com/in/johndoe'
                }
            }

            const { error } = updateProfileSchema.validate(validData)
            expect(error).toBeUndefined()
        })

        it('should validate minimal profile data', () => {
            const minimalData = {
                firstName: 'John'
            }

            const { error } = updateProfileSchema.validate(minimalData)
            expect(error).toBeUndefined()
        })

        it('should fail validation with short firstName', () => {
            const invalidData = {
                firstName: 'J'
            }

            const { error } = updateProfileSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('First name must be at least 2 characters long')
        })

        it('should fail validation with long firstName', () => {
            const invalidData = {
                firstName: 'a'.repeat(51)
            }

            const { error } = updateProfileSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('First name cannot be longer than 50 characters')
        })

        it('should fail validation with invalid phone', () => {
            const invalidData = {
                phone: 'invalid-phone-format'
            }

            const { error } = updateProfileSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Please provide a valid phone number')
        })

        it('should validate international phone formats', () => {
            const phoneFormats = [
                '+1234567890',
                '+44 20 7946 0958',
                '(555) 123-4567',
                '5551234567'
            ]

            phoneFormats.forEach(phone => {
                const data = { phone }
                const { error } = updateProfileSchema.validate(data)
                expect(error).toBeUndefined()
            })
        })

        it('should fail validation with future dateOfBirth', () => {
            const invalidData = {
                dateOfBirth: new Date('2030-01-01')
            }

            const { error } = updateProfileSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Date of birth must be in the past')
        })

        it('should fail validation with long bio', () => {
            const invalidData = {
                bio: 'a'.repeat(501)
            }

            const { error } = updateProfileSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Bio cannot be longer than 500 characters')
        })

        it('should validate supported languages', () => {
            const languages = ['en', 'es', 'fr', 'de', 'it', 'pt']

            languages.forEach(language => {
                const data = {
                    preferences: {
                        language
                    }
                }
                const { error } = updateProfileSchema.validate(data)
                expect(error).toBeUndefined()
            })
        })

        it('should fail validation with unsupported language', () => {
            const invalidData = {
                preferences: {
                    language: 'xx'
                }
            }

            const { error } = updateProfileSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Language must be one of: en, es, fr, de, it, pt')
        })

        it('should validate social links', () => {
            const validSocialLinks = {
                socialLinks: {
                    website: 'https://example.com',
                    twitter: '@validhandle',
                    instagram: '@valid_handle',
                    linkedin: 'https://linkedin.com/in/validuser'
                }
            }

            const { error } = updateProfileSchema.validate(validSocialLinks)
            expect(error).toBeUndefined()
        })

        it('should fail validation with invalid website URL', () => {
            const invalidData = {
                socialLinks: {
                    website: 'not-a-url'
                }
            }

            const { error } = updateProfileSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Website must be a valid URL')
        })

        it('should fail validation with invalid Twitter handle', () => {
            const invalidData = {
                socialLinks: {
                    twitter: 'invalid-handle-that-is-way-too-long-for-twitter'
                }
            }

            const { error } = updateProfileSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Please provide a valid Twitter handle')
        })

        it('should fail validation with invalid LinkedIn URL', () => {
            const invalidData = {
                socialLinks: {
                    linkedin: 'https://notlinkedin.com/user'
                }
            }

            const { error } = updateProfileSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Please provide a valid LinkedIn URL')
        })

        it('should validate address with partial data', () => {
            const partialAddress = {
                location: {
                    city: 'Berlin',
                    zipCode: '10115'
                }
            }

            const { error } = updateProfileSchema.validate(partialAddress)
            expect(error).toBeUndefined()
        })

        it('should fail validation with invalid German postal code', () => {
            const invalidData = {
                location: {
                    zipCode: 'invalid123'
                }
            }

            const { error } = updateProfileSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Please provide a valid German postal code')
        })

        it('should validate valid German postal codes', () => {
            const validPostalCodes = ['12345', '01067', '80331', '10115', '50667']

            validPostalCodes.forEach(zipCode => {
                const data = {
                    location: {
                        zipCode
                    }
                }
                const { error } = updateProfileSchema.validate(data)
                expect(error).toBeUndefined()
            })
        })

        it('should fail validation with non-5-digit postal codes', () => {
            const invalidPostalCodes = ['1234', '123456', 'ABC12', '12-34', '']

            invalidPostalCodes.forEach(zipCode => {
                const data = {
                    location: {
                        zipCode
                    }
                }
                const { error } = updateProfileSchema.validate(data)
                expect(error).toBeDefined()
            })
        })
    })

    describe('updateUserProfileSchema', () => {
        it('should validate admin-specific fields', () => {
            const adminData = {
                firstName: 'John',
                isPublic: true,
                isVerified: true
            }

            const { error } = updateUserProfileSchema.validate(adminData)
            expect(error).toBeUndefined()
        })

        it('should validate all fields including admin-only', () => {
            const completeData = {
                firstName: 'John',
                lastName: 'Doe',
                bio: 'Test bio',
                isPublic: false,
                isVerified: false,
                preferences: {
                    language: 'es'
                }
            }

            const { error } = updateUserProfileSchema.validate(completeData)
            expect(error).toBeUndefined()
        })

        it('should fail validation with invalid isPublic type', () => {
            const invalidData = {
                isPublic: 'not-boolean'
            }

            const { error } = updateUserProfileSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('isPublic must be a boolean value')
        })

        it('should fail validation with invalid isVerified type', () => {
            const invalidData = {
                isVerified: 'not-boolean'
            }

            const { error } = updateUserProfileSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('isVerified must be a boolean value')
        })
    })

    describe('privacySettingsSchema', () => {
        it('should validate privacy settings', () => {
            const validData = {
                isPublic: true
            }

            const { error } = privacySettingsSchema.validate(validData)
            expect(error).toBeUndefined()
        })

        it('should validate privacy settings false', () => {
            const validData = {
                isPublic: false
            }

            const { error } = privacySettingsSchema.validate(validData)
            expect(error).toBeUndefined()
        })

        it('should fail validation without isPublic', () => {
            const invalidData = {}

            const { error } = privacySettingsSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('isPublic is required')
        })

        it('should fail validation with invalid isPublic type', () => {
            const invalidData = {
                isPublic: 'maybe'
            }

            const { error } = privacySettingsSchema.validate(invalidData)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('isPublic must be a boolean value')
        })
    })

    describe('getProfilesQuerySchema', () => {
        it('should validate default query parameters', () => {
            const defaultQuery = {}

            const { error, value } = getProfilesQuerySchema.validate(defaultQuery)
            expect(error).toBeUndefined()
            expect(value.page).toBe(1)
            expect(value.limit).toBe(10)
        })

        it('should validate custom pagination', () => {
            const customQuery = {
                page: 3,
                limit: 25
            }

            const { error } = getProfilesQuerySchema.validate(customQuery)
            expect(error).toBeUndefined()
        })

        it('should validate filter parameters', () => {
            const filterQuery = {
                isPublic: 'true',
                isVerified: 'false',
                language: 'es'
            }

            const { error } = getProfilesQuerySchema.validate(filterQuery)
            expect(error).toBeUndefined()
        })

        it('should validate search parameter', () => {
            const searchQuery = {
                search: 'john doe'
            }

            const { error } = getProfilesQuerySchema.validate(searchQuery)
            expect(error).toBeUndefined()
        })

        it('should fail validation with invalid page', () => {
            const invalidQuery = {
                page: 0
            }

            const { error } = getProfilesQuerySchema.validate(invalidQuery)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Page must be at least 1')
        })

        it('should fail validation with invalid limit', () => {
            const invalidQuery = {
                limit: 101
            }

            const { error } = getProfilesQuerySchema.validate(invalidQuery)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Limit cannot be more than 100')
        })

        it('should fail validation with invalid language', () => {
            const invalidQuery = {
                language: 'invalid-lang'
            }

            const { error } = getProfilesQuerySchema.validate(invalidQuery)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('Language must be one of: en, es, fr, de, it, pt')
        })

        it('should fail validation with empty search', () => {
            const invalidQuery = {
                search: ''
            }

            const { error } = getProfilesQuerySchema.validate(invalidQuery)
            expect(error).toBeDefined()
            expect(error.details[0].message).toContain('not allowed to be empty')
        })

        it('should validate all parameters together', () => {
            const complexQuery = {
                page: 2,
                limit: 15,
                isPublic: 'true',
                isVerified: 'false',
                language: 'fr',
                search: 'test user'
            }

            const { error } = getProfilesQuerySchema.validate(complexQuery)
            expect(error).toBeUndefined()
        })
    })
}) 