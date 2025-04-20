/**
 * Mock implementation for mongoose
 */

// Mock Schema class
class Schema {
  constructor(definition, options = {}) {
    this.definition = definition;
    this.options = options;
    this.virtuals = {};
    this.methods = {};
    this.statics = {};
    this.pre = jest.fn();
  }

  // Add a virtual property
  virtual(name) {
    const virtualObj = {
      get: jest.fn(),
      set: jest.fn(),
      // Chainable API
      ref: function(model) {
        this.refModel = model;
        return this;
      },
      localField: function(field) {
        this.localFieldName = field;
        return this;
      },
      foreignField: function(field) {
        this.foreignFieldName = field;
        return this;
      },
      justOne: function(bool) {
        this.justOneValue = bool;
        return this;
      }
    };

    this.virtuals[name] = virtualObj;
    return virtualObj;
  }

  // Add pre hook
  pre(event, callback) {
    this.preCallbacks = this.preCallbacks || {};
    this.preCallbacks[event] = this.preCallbacks[event] || [];
    this.preCallbacks[event].push(callback);
    return this;
  }

  // Add static method
  static(name, fn) {
    this.statics[name] = fn;
    return this;
  }
}

// Mock Model class with common methods
const modelFunctions = {
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  findByIdAndDelete: jest.fn().mockReturnThis(),
  deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  create: jest.fn(),
  insertMany: jest.fn(),
  updateOne: jest.fn().mockReturnThis(),
  updateMany: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(0),
  populate: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
  save: jest.fn().mockImplementation(function() {
    return Promise.resolve(this);
  }),
  toObject: jest.fn().mockImplementation(function() {
    return { ...this };
  })
};

// Mock model factory function
const modelFactory = (name, schema) => {
  // Create model constructor
  function MockModel(data) {
    Object.assign(this, data);
    
    // Add methods from schema
    Object.keys(schema.methods || {}).forEach(method => {
      this[method] = schema.methods[method].bind(this);
    });
    
    // Add toObject method
    this.toObject = function() {
      const obj = { ...this };
      delete obj.toObject;
      delete obj.save;
      return obj;
    };
    
    // Add save method
    this.save = jest.fn().mockImplementation(() => {
      // Execute pre save hooks
      if (schema.preCallbacks && schema.preCallbacks.save) {
        schema.preCallbacks.save.forEach(callback => {
          callback.call(this, () => {});
        });
      }
      return Promise.resolve(this);
    });
    
    // Add deleteOne method
    this.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
  }
  
  // Add all the model static functions
  Object.assign(MockModel, modelFunctions);
  
  // Add schema statics
  Object.keys(schema.statics || {}).forEach(method => {
    MockModel[method] = schema.statics[method];
  });
  
  // Add static schema property
  MockModel.schema = schema;
  
  return MockModel;
};

// Mock mongoose
const mongoose = {
  Schema,
  model: jest.fn().mockImplementation(modelFactory),
  connect: jest.fn().mockResolvedValue({
    connection: {
      host: 'mongodb://mockhost:27017'
    }
  }),
  disconnect: jest.fn().mockResolvedValue(true),
  connection: {
    collections: {}
  },
  Types: {
    ObjectId: class {
      constructor(id) {
        this.id = id || Math.floor(Math.random() * 10000).toString();
      }
      toString() {
        return this.id;
      }
    }
  }
};

module.exports = mongoose;
