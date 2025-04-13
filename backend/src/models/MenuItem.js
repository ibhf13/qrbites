const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an item name'],
    trim: true,
    maxlength: [100, 'Item name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  imageURL: {
    type: String
  },
  section: {
    type: String,
    required: [true, 'Please specify a section ID']
  },
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  nutritionalInfo: {
    calories: Number,
    allergens: [String],
    dietary: [String] // vegan, vegetarian, gluten-free, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update the 'updatedAt' field on save
MenuItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find items by menu ID
MenuItemSchema.statics.findByMenuId = async function(menuId) {
  return await this.find({ menu: menuId }).sort({ section: 1, order: 1 });
};

// Static method to find items by section
MenuItemSchema.statics.findBySection = async function(menuId, sectionId) {
  return await this.find({ menu: menuId, section: sectionId }).sort({ order: 1 });
};

// Static method to find available items by menu ID
MenuItemSchema.statics.findAvailableByMenuId = async function(menuId) {
  return await this.find({ menu: menuId, isAvailable: true }).sort({ section: 1, order: 1 });
};

module.exports = mongoose.model('MenuItem', MenuItemSchema); 