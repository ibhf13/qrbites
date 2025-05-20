const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcryptjs')
const logger = require('../utils/logger')

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,

  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },

}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function (next) {
  try {
    // Only hash the password if it's new or modified
    if (!this.isModified('password')) return next()

    // Update the timestamp
    this.updatedAt = Date.now()

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)

    logger.debug(`Password hashed for user: ${this.email}`)
    next()
  } catch (error) {
    logger.error('Error hashing password', error)
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    logger.error('Error comparing passwords', error)
    throw error
  }
}

// Virtual for populating user profile
userSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
})

// Virtual for populating restaurants
userSchema.virtual('restaurants', {
  ref: 'Restaurant',
  localField: '_id',
  foreignField: 'userId'
})



// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

const User = mongoose.model('User', userSchema)

module.exports = User 