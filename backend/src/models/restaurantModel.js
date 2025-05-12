const mongoose = require('mongoose')
const { Schema } = mongoose

// Contact schema
const contactSchema = new Schema({
  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\+?[1-9]\d{1,14}$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  email: {
    type: String,
    validate: {
      validator: function (v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v)
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  website: {
    type: String,
    validate: {
      validator: function (v) {
        return /^(http|https):\/\/[^ "]+$/.test(v)
      },
      message: props => `${props.value} is not a valid URL!`
    }
  }
})

// Location schema
const locationSchema = new Schema({
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  zipCode: {
    type: String,
    required: [true, 'Zip code is required'],
    validate: {
      validator: function (v) {
        return /^[0-9]{5}(-[0-9]{4})?$/.test(v)
      },
      message: props => `${props.value} is not a valid zip code!`
    }
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  }
})

// Hours schema
const hoursSchema = new Schema({
  day: {
    type: Number,
    required: [true, 'Day is required'],
    min: [0, 'Day must be between 0 and 6'],
    max: [6, 'Day must be between 0 and 6']
  },
  open: {
    type: String,
    validate: {
      validator: function (v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v)
      },
      message: props => `${props.value} is not a valid time format (HH:MM)!`
    }
  },
  close: {
    type: String,
    validate: {
      validator: function (v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v)
      },
      message: props => `${props.value} is not a valid time format (HH:MM)!`
    }
  },
  closed: {
    type: Boolean,
    default: false
  }
})

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    minlength: [3, 'Restaurant name must be at least 3 characters'],
    maxlength: [50, 'Restaurant name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  contact: {
    type: contactSchema,
    required: [true, 'Contact information is required']
  },
  location: {
    type: locationSchema,
    required: [true, 'Location information is required']
  },
  hours: {
    type: [hoursSchema],
    default: []
  },
  logoUrl: {
    type: String,
    default: null
  },
  bannerImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
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

// Add virtual for populating menus
restaurantSchema.virtual('menus', {
  ref: 'Menu',
  localField: '_id',
  foreignField: 'restaurantId'
})

// Pre-save middleware to update timestamps
restaurantSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema)

module.exports = Restaurant 