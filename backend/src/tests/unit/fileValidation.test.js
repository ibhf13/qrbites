const { validateFileUpload } = require('@middleware/fileValidation');
const createError = require('http-errors');

describe('File Validation Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should pass validation for valid image file', () => {
    mockRequest.file = {
      mimetype: 'image/jpeg',
      size: 1024 * 1024, // 1MB
      originalname: 'test.jpg'
    };

    validateFileUpload()(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith();
    expect(nextFunction).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should pass validation for valid PDF file', () => {
    mockRequest.file = {
      mimetype: 'application/pdf',
      size: 1024 * 1024, // 1MB
      originalname: 'test.pdf'
    };

    validateFileUpload()(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should reject when no file is uploaded', () => {
    mockRequest.file = undefined;

    validateFileUpload()(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: expect.stringContaining('No file uploaded')
    }));
  });

  it('should reject invalid file types', () => {
    mockRequest.file = {
      mimetype: 'text/plain',
      size: 1024,
      originalname: 'test.txt'
    };

    validateFileUpload()(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: expect.stringContaining('Invalid file type')
    }));
  });

  it('should reject files that exceed size limit', () => {
    mockRequest.file = {
      mimetype: 'image/jpeg',
      size: 20 * 1024 * 1024, // 20MB (exceeds default 10MB)
      originalname: 'large.jpg'
    };

    validateFileUpload()(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
      status: 400,
      message: expect.stringContaining('File too large')
    }));
  });

  it('should respect custom options', () => {
    mockRequest.file = {
      mimetype: 'text/csv',
      size: 500 * 1024, // 500KB
      originalname: 'data.csv'
    };

    // Custom options that allow CSV files up to 1MB
    const options = {
      allowedMimeTypes: ['text/csv'],
      maxFileSize: 1024 * 1024, // 1MB
      fieldName: 'csvFile'
    };

    validateFileUpload(options)(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith();
    expect(nextFunction).not.toHaveBeenCalledWith(expect.any(Error));
  });
}); 