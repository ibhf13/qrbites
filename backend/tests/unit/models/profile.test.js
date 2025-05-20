const Profile = require('@models/profile')
const User = require('@models/user')
const profileMock = require('@mocks/profileMock')
const mongoose = require('mongoose')

describe('Profile Model Test', () => {
    let userId

    beforeAll(async () => {
        // Create a test user first
        const user = await User.create({
            email: 'test@example.com',
            password: 'password123'
        })
        userId = user._id
    })

    it('should create & save profile successfully', async () => {
        const validProfile = new Profile({
            ...profileMock.validProfile,
            userId
        })
        const savedProfile = await validProfile.save()

        expect(savedProfile._id).toBeDefined()
        expect(savedProfile.userId).toEqual(userId)
        expect(savedProfile.firstName).toBe(profileMock.validProfile.firstName)
        expect(savedProfile.lastName).toBe(profileMock.validProfile.lastName)
        expect(savedProfile.isPublic).toBe(false)
        expect(savedProfile.isVerified).toBe(false)
    })

    it('should create profile with minimal data (only userId)', async () => {
        const user2 = await User.create({
            email: 'test2@example.com',
            password: 'password123'
        })

        const minimalProfile = new Profile({
            userId: user2._id
        })
        const savedProfile = await minimalProfile.save()

        expect(savedProfile._id).toBeDefined()
        expect(savedProfile.userId).toEqual(user2._id)
        expect(savedProfile.isPublic).toBe(false) // default value
        expect(savedProfile.preferences.language).toBe('en') // default value
    })

    it('should fail to save profile without required userId', async () => {
        const profileWithoutUserId = new Profile({
            firstName: 'Test',
            lastName: 'User'
        })

        let err
        try {
            await profileWithoutUserId.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeInstanceOf(Error)
        expect(err.errors.userId).toBeDefined()
    })

    it('should fail to save profile with invalid data', async () => {
        const user3 = await User.create({
            email: 'test3@example.com',
            password: 'password123'
        })

        const profileWithInvalidData = new Profile({
            userId: user3._id,
            firstName: 'A', // too short
            phone: 'invalid-phone',
            dateOfBirth: new Date('2030-01-01') // future date
        })

        let err
        try {
            await profileWithInvalidData.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeInstanceOf(Error)
    })

    it('should generate fullName virtual correctly', async () => {
        const user4 = await User.create({
            email: 'test4@example.com',
            password: 'password123'
        })

        // Test with firstName and lastName
        const profile1 = await Profile.create({
            userId: user4._id,
            firstName: 'John',
            lastName: 'Doe'
        })
        expect(profile1.fullName).toBe('John Doe')

        // Test with only displayName
        const user5 = await User.create({
            email: 'test5@example.com',
            password: 'password123'
        })
        const profile2 = await Profile.create({
            userId: user5._id,
            displayName: 'johndoe'
        })
        expect(profile2.fullName).toBe('johndoe')

        // Test with no name fields
        const user6 = await User.create({
            email: 'test6@example.com',
            password: 'password123'
        })
        const profile3 = await Profile.create({
            userId: user6._id
        })
        expect(profile3.fullName).toBe('Anonymous User')
    })

    it('should generate formattedAddress virtual correctly', async () => {
        const user7 = await User.create({
            email: 'test7@example.com',
            password: 'password123'
        })

        const profileWithAddress = await Profile.create({
            userId: user7._id,
            location: {
                street: 'Teststraße',
                houseNumber: '123',
                city: 'Berlin',
                zipCode: '10115'
            }
        })

        expect(profileWithAddress.formattedAddress).toBe('Teststraße, 123, Berlin, 10115')

        // Test with partial address
        const user8 = await User.create({
            email: 'test8@example.com',
            password: 'password123'
        })
        const profilePartialAddress = await Profile.create({
            userId: user8._id,
            location: {
                city: 'München',
                zipCode: '80331'
            }
        })

        expect(profilePartialAddress.formattedAddress).toBe('München, 80331')
    })

    it('should validate social links correctly', async () => {
        const user9 = await User.create({
            email: 'test9@example.com',
            password: 'password123'
        })

        const validProfile = await Profile.create({
            userId: user9._id,
            socialLinks: {
                website: 'https://example.com',
                twitter: '@validhandle',
                instagram: '@valid_handle',
                linkedin: 'https://linkedin.com/in/validuser'
            }
        })

        expect(validProfile.socialLinks.website).toBe('https://example.com')
        expect(validProfile.socialLinks.twitter).toBe('@validhandle')
    })

    it('should enforce unique userId constraint', async () => {
        // Create a user first
        const testUser = await User.create({
            email: 'unique-test@example.com',
            password: 'password123'
        })

        // Create first profile
        await Profile.create({
            userId: testUser._id,
            firstName: 'First'
        })

        // Try to create another profile with the same userId
        const duplicateProfile = new Profile({
            userId: testUser._id, // Same userId
            firstName: 'Second'
        })

        let err
        try {
            await duplicateProfile.save()
        } catch (error) {
            err = error
        }

        expect(err).toBeInstanceOf(Error)
        expect(err.code).toBe(11000) // MongoDB duplicate key error
    })

    // Additional comprehensive tests
    describe('Advanced Profile Model Tests', () => {
        it('should update lastProfileUpdate on save', async () => {
            const user = await User.create({
                email: 'update-test@example.com',
                password: 'password123'
            })

            const profile = await Profile.create({
                userId: user._id,
                firstName: 'Test'
            })

            const originalUpdate = profile.lastProfileUpdate

            // Wait a bit and update
            await new Promise(resolve => setTimeout(resolve, 10))
            profile.lastName = 'Updated'
            await profile.save()

            expect(profile.lastProfileUpdate.getTime()).toBeGreaterThan(originalUpdate.getTime())
        })

        it('should not update lastProfileUpdate on new profile creation', async () => {
            const user = await User.create({
                email: 'new-profile@example.com',
                password: 'password123'
            })

            const profile = new Profile({
                userId: user._id,
                firstName: 'New'
            })

            const beforeSave = Date.now()
            await profile.save()
            const afterSave = Date.now()

            // Should have a timestamp within reasonable range
            expect(profile.lastProfileUpdate.getTime()).toBeGreaterThanOrEqual(beforeSave - 1000)
            expect(profile.lastProfileUpdate.getTime()).toBeLessThanOrEqual(afterSave + 1000)
        })

        it('should validate all supported languages', async () => {
            const languages = ['en', 'es', 'fr', 'de', 'it', 'pt']
            const users = []

            for (const lang of languages) {
                const user = await User.create({
                    email: `lang-${lang}@example.com`,
                    password: 'password123'
                })
                users.push(user)

                const profile = await Profile.create({
                    userId: user._id,
                    preferences: {
                        language: lang
                    }
                })

                expect(profile.preferences.language).toBe(lang)
            }
        })

        it('should validate notification preferences', async () => {
            const user = await User.create({
                email: 'notifications@example.com',
                password: 'password123'
            })

            const profile = await Profile.create({
                userId: user._id,
                preferences: {
                    notifications: {
                        email: false,
                        sms: true,
                        push: false
                    }
                }
            })

            expect(profile.preferences.notifications.email).toBe(false)
            expect(profile.preferences.notifications.sms).toBe(true)
            expect(profile.preferences.notifications.push).toBe(false)
        })

        it('should handle empty address correctly', async () => {
            const user = await User.create({
                email: 'empty-address@example.com',
                password: 'password123'
            })

            const profile = await Profile.create({
                userId: user._id,
                location: {}
            })

            expect(profile.formattedAddress).toBeNull()
        })

        it('should validate profile picture URL', async () => {
            const user = await User.create({
                email: 'pic-test@example.com',
                password: 'password123'
            })

            const validProfile = await Profile.create({
                userId: user._id,
                profilePicture: 'https://example.com/picture.jpg'
            })

            expect(validProfile.profilePicture).toBe('https://example.com/picture.jpg')

            // Test invalid URL
            const invalidProfile = new Profile({
                userId: new mongoose.Types.ObjectId(),
                profilePicture: 'not-a-url'
            })

            let err
            try {
                await invalidProfile.save()
            } catch (error) {
                err = error
            }

            expect(err).toBeInstanceOf(Error)
        })

        it('should handle timezone preferences', async () => {
            const user = await User.create({
                email: 'timezone@example.com',
                password: 'password123'
            })

            const profile = await Profile.create({
                userId: user._id,
                preferences: {
                    timezone: 'America/New_York'
                }
            })

            expect(profile.preferences.timezone).toBe('America/New_York')
        })

        it('should validate bio length constraints', async () => {
            const user = await User.create({
                email: 'bio-test@example.com',
                password: 'password123'
            })

            // Valid bio
            const validProfile = await Profile.create({
                userId: user._id,
                bio: 'This is a valid bio that is under the 500 character limit.'
            })

            expect(validProfile.bio).toBeDefined()

            // Invalid bio (too long)
            const user2 = await User.create({
                email: 'bio-test2@example.com',
                password: 'password123'
            })

            const invalidProfile = new Profile({
                userId: user2._id,
                bio: 'a'.repeat(501) // Too long
            })

            let err
            try {
                await invalidProfile.save()
            } catch (error) {
                err = error
            }

            expect(err).toBeInstanceOf(Error)
        })

        it('should validate phone number formats', async () => {
            const validPhones = [
                '+1234567890',
                '(555) 123-4567',
                '555-123-4567',
                '5551234567'
            ]

            for (let i = 0; i < validPhones.length; i++) {
                const user = await User.create({
                    email: `phone${i}@example.com`,
                    password: 'password123'
                })

                const profile = await Profile.create({
                    userId: user._id,
                    phone: validPhones[i]
                })

                expect(profile.phone).toBe(validPhones[i])
            }
        })

        it('should handle complex social links validation', async () => {
            const user = await User.create({
                email: 'social@example.com',
                password: 'password123'
            })

            // Test various valid formats
            const validSocialLinks = {
                website: 'http://example.com',
                twitter: 'validhandle', // without @
                instagram: '@valid_handle123',
                linkedin: 'https://www.linkedin.com/in/validuser/'
            }

            const profile = await Profile.create({
                userId: user._id,
                socialLinks: validSocialLinks
            })

            expect(profile.socialLinks.website).toBe(validSocialLinks.website)
            expect(profile.socialLinks.twitter).toBe(validSocialLinks.twitter)
            expect(profile.socialLinks.instagram).toBe(validSocialLinks.instagram)
            expect(profile.socialLinks.linkedin).toBe(validSocialLinks.linkedin)
        })

        it('should properly handle JSON serialization', async () => {
            const user = await User.create({
                email: 'json@example.com',
                password: 'password123'
            })

            const profile = await Profile.create({
                userId: user._id,
                firstName: 'John',
                lastName: 'Doe',
                isPublic: true
            })

            const profileJSON = profile.toJSON()

            // Should include virtual fields
            expect(profileJSON).toHaveProperty('id')
            expect(profileJSON).toHaveProperty('fullName')
            expect(profileJSON.fullName).toBe('John Doe')
        })

        it('should handle edge cases in fullName virtual', async () => {
            const user = await User.create({
                email: 'fullname@example.com',
                password: 'password123'
            })

            // Test with only firstName
            const profile1 = await Profile.create({
                userId: user._id,
                firstName: 'John'
            })
            expect(profile1.fullName).toBe('John')

            // Test with only lastName
            const user2 = await User.create({
                email: 'lastname@example.com',
                password: 'password123'
            })
            const profile2 = await Profile.create({
                userId: user2._id,
                lastName: 'Doe'
            })
            expect(profile2.fullName).toBe('Doe')

            // Test with firstName and displayName (should prefer firstName + lastName)
            const user3 = await User.create({
                email: 'mixed@example.com',
                password: 'password123'
            })
            const profile3 = await Profile.create({
                userId: user3._id,
                firstName: 'John',
                lastName: 'Doe',
                displayName: 'johndoe'
            })
            expect(profile3.fullName).toBe('John Doe')
        })

        it('should maintain profile indexes', () => {
            const indexes = Profile.schema.indexes()
            const indexFields = indexes.map(index => index[0])

            // Check that the expected indexes exist
            expect(indexFields).toContainEqual({ userId: 1 })
            expect(indexFields).toContainEqual({ 'preferences.language': 1 })
            expect(indexFields).toContainEqual({ isPublic: 1 })
            expect(indexFields).toContainEqual({ isVerified: 1 })
        })
    })
}) 