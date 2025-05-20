const mongoose = require('mongoose')

const profileMock = {
    validProfile: {
        userId: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c60'),
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'johndoe',
        phone: '+1234567890',
        bio: 'This is a test bio for unit testing',
        dateOfBirth: new Date('1990-01-01'),
        location: {
            street: 'Teststraße',
            houseNumber: '123',
            city: 'Hamburg',
            zipCode: '20095'
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
        },
        isPublic: false,
        isVerified: false
    },

    validPublicProfile: {
        userId: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c61'),
        firstName: 'Jane',
        lastName: 'Smith',
        displayName: 'janesmith',
        phone: '+0987654321',
        bio: 'Public profile for testing',
        location: {
            street: 'Öffentliche Allee',
            houseNumber: '456',
            city: 'Köln',
            zipCode: '50667'
        },
        preferences: {
            language: 'es',
            timezone: 'America/New_York',
            notifications: {
                email: false,
                sms: true,
                push: false
            }
        },
        socialLinks: {
            website: 'https://janesmith.com',
            twitter: '@janesmith'
        },
        isPublic: true,
        isVerified: true
    },

    invalidProfile: {
        // Missing required userId
        firstName: 'A', // too short
        lastName: 'B', // too short
        phone: 'invalid-phone',
        bio: 'A'.repeat(501), // too long
        dateOfBirth: new Date('2030-01-01'), // future date
        location: {
            street: 'A'.repeat(101), // too long
            houseNumber: '123',
            city: 'Hamburg',
            zipCode: 'invalid123' // invalid German postal code
        },
        preferences: {
            language: 'invalid-lang'
        },
        socialLinks: {
            website: 'not-a-url',
            twitter: 'invalid-handle-that-is-way-too-long',
            linkedin: 'not-linkedin-url'
        }
    },

    updateProfileData: {
        firstName: 'Updated John',
        lastName: 'Updated Doe',
        bio: 'Updated bio for testing',
        phone: '+1111111111',
        preferences: {
            language: 'fr',
            notifications: {
                email: false,
                sms: true,
                push: true
            }
        }
    },

    adminUpdateData: {
        firstName: 'Admin Updated',
        lastName: 'User',
        isVerified: true,
        isPublic: true
    },

    profileList: [
        {
            _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c70'),
            userId: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c60'),
            firstName: 'Alice',
            lastName: 'Johnson',
            displayName: 'alice',
            isPublic: true,
            isVerified: false,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
        },
        {
            _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c71'),
            userId: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c61'),
            firstName: 'Bob',
            lastName: 'Wilson',
            displayName: 'bobwilson',
            isPublic: false,
            isVerified: true,
            createdAt: new Date('2023-01-02'),
            updatedAt: new Date('2023-01-02')
        }
    ],

    // Mock profile with minimal data
    minimalProfile: {
        userId: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c62')
    }
}

module.exports = profileMock 