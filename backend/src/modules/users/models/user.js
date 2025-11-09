const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcryptjs')
const logger = require('@commonUtils/logger')

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        // Password is required only for local authentication
        return this.authProvider === 'local'
      },
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    name: {
      type: String,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot be longer than 50 characters'],
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ role: 1, isActive: 1 })

// Hash password before saving
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password') || !this.password) return next()

    // Generate salt and hash password
    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12
    const salt = await bcrypt.genSalt(rounds)
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
    // OAuth users might not have a password
    if (!this.password) {
      return false
    }
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    logger.error('Error comparing passwords', error)
    throw error
  }
}

// Virtual for display name (returns name or Anonymous User)
userSchema.virtual('displayName').get(function () {
  return this.name || 'Anonymous User'
})

// Virtual for populating restaurants
userSchema.virtual('restaurants', {
  ref: 'Restaurant',
  localField: '_id',
  foreignField: 'userId',
})

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

const User = mongoose.model('User', userSchema)

module.exports = User
