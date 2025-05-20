const mongoose = require('mongoose')
const { Schema } = mongoose
const logger = require('@utils/logger')

const menuItemSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Menu item name is required'],
        trim: true,
        minlength: [3, 'Menu item name must be at least 3 characters'],
        maxlength: [50, 'Menu item name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        validate: {
            validator: function (value) {
                return value >= 0
            },
            message: 'Price must be a positive number'
        }
    },
    category: {
        type: String,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    allergens: {
        type: [String],
        default: []
    },
    calories: {
        type: Number,
        min: [0, 'Calories cannot be negative']
    },
    tags: {
        type: [String],
        default: []
    },
    menuId: {
        type: Schema.Types.ObjectId,
        ref: 'Menu',
        required: [true, 'Menu ID is required']
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

// Pre-save middleware to update timestamps
menuItemSchema.pre('save', function (next) {
    try {
        this.updatedAt = Date.now()
        logger.debug(`Menu item updated: ${this.name} (${this.price})`)
        next()
    } catch (error) {
        logger.error('Error updating menu item', error)
        next(error)
    }
})

const MenuItem = mongoose.model('MenuItem', menuItemSchema)

module.exports = MenuItem 