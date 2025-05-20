const mongoose = require('mongoose')
const { Schema } = mongoose
const logger = require('../utils/logger')
const locationSchema = require('./location')

const profileSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        unique: true
    },
    firstName: {
        type: String,
        trim: true,
        minlength: [2, 'First name must be at least 2 characters long'],
        maxlength: [50, 'First name cannot be longer than 50 characters']
    },
    lastName: {
        type: String,
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters long'],
        maxlength: [50, 'Last name cannot be longer than 50 characters']
    },
    displayName: {
        type: String,
        trim: true,
        minlength: [2, 'Display name must be at least 2 characters long'],
        maxlength: [50, 'Display name cannot be longer than 50 characters']
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return !v || /^\+?[\d\s\-\(\)]+$/.test(v)
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    profilePicture: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^https?:\/\/.+/.test(v)
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [500, 'Bio cannot be longer than 500 characters']
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function (v) {
                return !v || v < new Date()
            },
            message: 'Date of birth must be in the past'
        }
    },
    location: {
        type: locationSchema,
        default: {}
    },
    preferences: {
        language: {
            type: String,
            default: 'en',
            enum: ['en', 'es', 'fr', 'de', 'it', 'pt'],
            validate: {
                validator: function (v) {
                    return ['en', 'es', 'fr', 'de', 'it', 'pt'].includes(v)
                },
                message: 'Language must be one of: en, es, fr, de, it, pt'
            }
        },
        timezone: {
            type: String,
            default: 'UTC'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            },
            push: {
                type: Boolean,
                default: true
            }
        }
    },
    socialLinks: {
        website: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^https?:\/\/.+/.test(v)
                },
                message: props => `${props.value} is not a valid URL!`
            }
        },
        twitter: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^@?[A-Za-z0-9_]{1,15}$/.test(v)
                },
                message: props => `${props.value} is not a valid Twitter handle!`
            }
        },
        instagram: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^@?[A-Za-z0-9_.]{1,30}$/.test(v)
                },
                message: props => `${props.value} is not a valid Instagram handle!`
            }
        },
        linkedin: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-]+\/?$/.test(v)
                },
                message: props => `${props.value} is not a valid LinkedIn URL!`
            }
        }
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastProfileUpdate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

// Virtual for full name
profileSchema.virtual('fullName').get(function () {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`
    }
    return this.displayName || this.firstName || this.lastName || 'Anonymous User'
})

// Virtual for formatted address
profileSchema.virtual('formattedAddress').get(function () {
    if (!this.location) return null

    const locationParts = []
    if (this.location.street) locationParts.push(this.location.street)
    if (this.location.houseNumber) locationParts.push(this.location.houseNumber)
    if (this.location.city) locationParts.push(this.location.city)
    if (this.location.zipCode) locationParts.push(this.location.zipCode)

    return locationParts.length > 0 ? locationParts.join(', ') : null
})

// Update lastProfileUpdate on save
profileSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.lastProfileUpdate = new Date()
    }
    next()
})

profileSchema.index({ 'preferences.language': 1 })
profileSchema.index({ isPublic: 1 })
profileSchema.index({ isVerified: 1 })

// Ensure virtuals are included in JSON output
profileSchema.set('toJSON', { virtuals: true })
profileSchema.set('toObject', { virtuals: true })

const Profile = mongoose.model('Profile', profileSchema)

module.exports = Profile 