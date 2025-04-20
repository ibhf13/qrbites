const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const uploadController = require('@controllers/uploadController');
const Upload = require('@models/Upload');
const User = require('@models/User');

// Mock dependencies
jest.mock('@models/Upload');
jest.mock('@models/User');
jest.mock('@utils/logger');

describe('Upload Controller', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    
    // Default req.user for authenticated requests
    req.user = {
      id: new mongoose.Types.ObjectId().toString(),
      role: 'user'
    };
    
    // Default req.protocol and headers for URL generation
    req.protocol = 'http';
    req.get = jest.fn(() => 'localhost:5000');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('uploadFile', () => {
    beforeEach(() => {
      req.file = {
        originalname: 'test-menu.jpg',
        filename: '1234567890-test-menu.jpg',
        mimetype: 'image/jpeg',
        size: 12345,
        path: '/path/to/test-menu.jpg'
      };
      
      Upload.create.mockResolvedValue({
        _id: 'mock-upload-id',
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        user: req.user.id,
        createdAt: new Date()
      });
    });
    
    it('should create a new upload record', async () => {
      await uploadController.uploadFile(req, res, next);
      
      expect(Upload.create).toHaveBeenCalledWith({
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        user: req.user.id,
        menu: null
      });
    });
    
    it('should return 201 status with upload data', async () => {
      await uploadController.uploadFile(req, res, next);
      
      expect(res.statusCode).toBe(201);
      expect(res._isEndCalled()).toBeTruthy();
      
      const responseData = res._getJSONData();
      expect(responseData.success).toBeTruthy();
      expect(responseData.data).toHaveProperty('_id', 'mock-upload-id');
      expect(responseData.data).toHaveProperty('url');
    });
    
    it('should handle errors', async () => {
      const errorMessage = 'Database error';
      Upload.create.mockRejectedValue(new Error(errorMessage));
      
      await uploadController.uploadFile(req, res, next);
      
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(errorMessage);
    });
  });
  
  describe('getUploads', () => {
    beforeEach(() => {
      Upload.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          {
            _id: 'upload-id-1',
            originalName: 'test1.jpg',
            mimetype: 'image/jpeg',
            size: 12345,
            user: req.user.id,
            isProcessed: false,
            ocrStatus: 'pending',
            createdAt: new Date()
          },
          {
            _id: 'upload-id-2',
            originalName: 'test2.jpg',
            mimetype: 'image/jpeg',
            size: 67890,
            user: req.user.id,
            isProcessed: true,
            ocrStatus: 'completed',
            createdAt: new Date()
          }
        ])
      });
    });
    
    it('should return all uploads for the user', async () => {
      await uploadController.getUploads(req, res, next);
      
      expect(Upload.find).toHaveBeenCalledWith({ user: req.user.id });
      expect(res.statusCode).toBe(200);
      
      const responseData = res._getJSONData();
      expect(responseData.success).toBeTruthy();
      expect(responseData.count).toBe(2);
      expect(responseData.data).toHaveLength(2);
      expect(responseData.data[0]).toHaveProperty('_id', 'upload-id-1');
      expect(responseData.data[1]).toHaveProperty('_id', 'upload-id-2');
    });
  });
}); 