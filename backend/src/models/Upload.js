const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: [true, 'Original filename is required']
    },
    filename: {
      type: String,
      required: [true, 'Stored filename is required']
    },
    mimetype: {
      type: String,
      required: [true, 'File MIME type is required']
    },
    size: {
      type: Number,
      required: [true, 'File size is required']
    },
    path: {
      type: String,
      required: [true, 'File path is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      default: null
    },
    isProcessed: {
      type: Boolean,
      default: false
    },
    ocrStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('Upload', UploadSchema); 