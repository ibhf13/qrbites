const mongoose = require('mongoose')

const { Schema } = mongoose
const locationSchema = require('./location')

// Contact schema
const contactSchema = new Schema({
  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\+[1-9]\d{7,14}$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`,
    },
  },
  email: {
    type: String,
    validate: {
      validator: function (v) {
        // eslint-disable-next-line security/detect-unsafe-regex , no-useless-escape
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v)
      },
      message: props => `${props.value} is not a valid email address!`,
    },
  },
  website: {
    type: String,
  },
})

// Hours schema
const hoursSchema = new Schema({
  day: {
    type: Number,
    required: [true, 'Day is required'],
    min: [0, 'Day must be between 0 and 6'],
    max: [6, 'Day must be between 0 and 6'],
  },
  open: {
    type: String,
    validate: {
      validator: function (v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v)
      },
      message: props => `${props.value} is not a valid time format (HH:MM)!`,
    },
  },
  close: {
    type: String,
    validate: {
      validator: function (v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v)
      },
      message: props => `${props.value} is not a valid time format (HH:MM)!`,
    },
  },
  closed: {
    type: Boolean,
    default: false,
  },
})

const restaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      minlength: [3, 'Restaurant name must be at least 3 characters'],
      maxlength: [50, 'Restaurant name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    contact: {
      type: contactSchema,
      required: [true, 'Contact information is required'],
    },
    location: {
      type: locationSchema,
      required: [true, 'Location information is required'],
    },
    hours: {
      type: [hoursSchema],
      default: [],
    },
    logoUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Add virtual for populating menus
restaurantSchema.virtual('menus', {
  ref: 'Menu',
  localField: '_id',
  foreignField: 'restaurantId',
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema)

module.exports = Restaurant
