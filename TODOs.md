# QrBites Backend Implementation TODOs

## Phase 1: Project Setup and Foundation

- [ ] Initialize Node.js project with npm
- [ ] Install core dependencies (express, mongoose, etc.)
- [ ] Set up ESLint configuration
- [ ] Create MVC folder structure
- [ ] Implement basic Express server
- [ ] Set up environment variables with dotenv
- [ ] Configure basic middleware (cors, body-parser, etc.)
- [ ] Create MongoDB connection with Mongoose
- [ ] Set up error handling middleware
- [ ] Implement basic logging system
- [ ] Create initial README.md with setup instructions
- [ ] Set up Jest for testing

## Phase 2: Authentication System

- [ ] Write tests for User model
- [ ] Write tests for authentication endpoints
- [ ] Create User schema with Mongoose
- [ ] Implement password hashing with bcrypt
- [ ] Create authentication controller
- [ ] Implement registration endpoint (US-1.1)
- [ ] Create login endpoint with JWT (US-1.2)
- [ ] Add password reset functionality (US-1.3)
- [ ] Implement user profile management (US-1.4)
- [ ] Create JWT authentication middleware

## Phase 3: File Upload and OCR System

- [ ] Write tests for file upload functionality
- [ ] Write tests for OCR processing
- [ ] Configure Multer for file uploads
- [ ] Set up GridFS for file storage
- [ ] Create file validation middleware
- [ ] Implement upload model and controller (US-2.1)
- [ ] Set up Tesseract.js integration
- [ ] Create in-memory queue for OCR processing
- [ ] Implement OCR text extraction service (US-2.2)
- [ ] Build OCR results model and controller (US-2.3)

## Phase 4: Menu Management System

- [ ] Write tests for menu models
- [ ] Write tests for menu CRUD operations
- [ ] Create Menu and MenuItem schemas
- [ ] Implement section organization structure
- [ ] Develop menu CRUD controllers (US-3.1)
- [ ] Create section management endpoints (US-3.2)
- [ ] Implement item management endpoints (US-3.3)
- [ ] Add menu publishing workflow (US-3.4)

## Phase 5: QR Code System

- [ ] Write tests for QR code generation
- [ ] Write tests for QR code management
- [ ] Set up qrcode library integration
- [ ] Create QR code model
- [ ] Implement QR code generation service (US-4.1)
- [ ] Create QR code management controllers (US-4.2)
- [ ] Implement scan tracking functionality (US-4.3)

## Phase 6: Public Menu API

- [ ] Write tests for public menu access
- [ ] Write tests for menu display optimization
- [ ] Write tests for search functionality
- [ ] Create public menu access routes (US-5.1)
- [ ] Implement optimized section and item retrieval (US-5.2)
- [ ] Add basic search functionality (US-5.3)
- [ ] Implement caching for performance

## Phase 7: Testing and Refinement

- [ ] Expand integration test coverage
- [ ] Test full user flows
- [ ] Profile API endpoints
- [ ] Optimize database queries
- [ ] Implement additional caching
- [ ] Add compression where needed

## Phase 8: Final Preparation

- [ ] Address identified bugs and issues
- [ ] Create API documentation
- [ ] Set up Docker configuration
- [ ] Prepare database initialization
- [ ] Document deployment process 