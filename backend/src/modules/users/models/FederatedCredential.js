const mongoose = require('mongoose')
const { Schema } = mongoose

/**
 * FederatedCredential Schema
 * Links OAuth provider accounts to user accounts
 * Enables account auto-linking when OAuth email matches existing user
 */
const federatedCredentialSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    provider: {
      type: String,
      required: [true, 'Provider is required'],
      enum: ['google'],
      index: true,
    },
    providerId: {
      type: String,
      required: [true, 'Provider ID is required'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    accessToken: {
      type: String,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
)

federatedCredentialSchema.index({ provider: 1, providerId: 1 }, { unique: true })

federatedCredentialSchema.index({ userId: 1, provider: 1 })

const FederatedCredential = mongoose.model('FederatedCredential', federatedCredentialSchema)

module.exports = FederatedCredential
