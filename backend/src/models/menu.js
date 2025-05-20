const mongoose = require('mongoose')
const { Schema } = mongoose
const logger = require('@utils/logger')

const menuSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Menu name is required'],
        trim: true,
        minlength: [3, 'Menu name must be at least 3 characters'],
        maxlength: [50, 'Menu name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    categories: {
        type: [String],
        default: []
    },
    imageUrl: {
        type: String,
        default: null
    },
    imageUrls: {
        type: [String],
        default: []
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'Restaurant ID is required']
    },
    qrCodeUrl: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// Add virtual for populating menu items
menuSchema.virtual('menuItems', {
    ref: 'MenuItem',
    localField: '_id',
    foreignField: 'menuId'
})

// Pre-save middleware to update timestamps
menuSchema.pre('save', function (next) {
    try {
        this.updatedAt = Date.now()
        logger.debug(`Menu updated: ${this.name}`)
        next()
    } catch (error) {
        logger.error('Error updating menu', error)
        next(error)
    }
})

const Menu = mongoose.model('Menu', menuSchema)

module.exports = Menu 