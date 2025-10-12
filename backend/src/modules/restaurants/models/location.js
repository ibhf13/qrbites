const mongoose = require('mongoose')
const { Schema } = mongoose

/**
 * Shared address schema
 */
const locationSchema = new Schema(
  {
    street: {
      type: String,
      trim: true,
      maxlength: [100, 'Street cannot be longer than 100 characters'],
    },
    houseNumber: {
      type: String,
      trim: true,
      maxlength: [5, 'House number cannot be longer than 5 characters'],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot be longer than 50 characters'],
    },
    zipCode: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^[0-9]{5}$/.test(v)
        },
        message: props => `${props.value} is not a valid postal code! Use 5 digits (e.g., 12345)`,
      },
    },
  },
  {
    _id: false,
  }
)

module.exports = locationSchema
