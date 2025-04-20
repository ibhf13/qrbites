const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a menu name'],
      trim: true,
      maxlength: [100, 'Menu name cannot be more than 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    sections: [
      {
        name: {
          type: String,
          required: [true, 'Please add a section name'],
          trim: true,
          maxlength: [100, 'Section name cannot be more than 100 characters']
        },
        description: {
          type: String,
          maxlength: [300, 'Section description cannot be more than 300 characters']
        },
        order: {
          type: Number,
          default: 0
        }
      }
    ],
    qrCodeURL: {
      type: String
    },
    scanCount: {
      type: Number,
      default: 0
    },
    originalImageURL: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add virtual for items
MenuSchema.virtual('items', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'menu',
  justOne: false
});

// Middleware to update the 'updatedAt' field on save
MenuSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get menu with items
MenuSchema.statics.getWithItems = async function(menuId) {
  return await this.findById(menuId).populate('items');
};

// Static method to get published menu by ID
MenuSchema.statics.getPublishedMenuById = async function(menuId) {
  return await this.findOne({ _id: menuId, isPublished: true }).populate('items');
};

// Static method to increment scan count
MenuSchema.statics.incrementScanCount = async function(menuId) {
  const menu = await this.findById(menuId);
  if (!menu) return null;
  
  menu.scanCount += 1;
  await menu.save();
  return menu;
};

// Static method to find menus by restaurant ID
MenuSchema.statics.findByRestaurantId = async function(restaurantId) {
  return await this.find({ restaurant: restaurantId });
};

// Instance method to add a section
MenuSchema.methods.addSection = async function(section) {
  // Check if section with same name already exists
  const existingSection = this.sections.find(s => s.name === section.name);
  if (existingSection) {
    throw new Error('Section with this name already exists');
  }

  this.sections.push(section);
  await this.save();
  return this;
};

// Instance method to remove a section
MenuSchema.methods.removeSection = async function(section) {
  const sectionIndex = this.sections.findIndex(s => s.name === section.name);
  if (sectionIndex === -1) {
    throw new Error('Section not found');
  }

  this.sections.splice(sectionIndex, 1);
  await this.save();
  return this;
};

module.exports = mongoose.model('Menu', MenuSchema); 