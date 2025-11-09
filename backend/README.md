# 🍽️ QRBites Backend

The backend API for QRBites - a comprehensive restaurant menu digitization
platform built with Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Database Models](#database-models)
- [Authentication & Authorization](#authentication--authorization)
- [Testing](#testing)
- [Docker](#docker)
- [Deployment](#deployment)

## 🎯 Overview

The QRBites backend provides a RESTful API for managing restaurants, menus, menu
items, and user authentication. It features JWT-based authentication, role-based
authorization, image upload with Cloudinary, Redis caching, and comprehensive
API documentation with Swagger.

### 🌐 Production URL

- **API Base URL**:
  [https://qrbites-api.vercel.app](https://qrbites-api.vercel.app)
- **Swagger Documentation**:
  [https://qrbites-api.vercel.app/api-docs](https://qrbites-api.vercel.app/api-docs)

### Key Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Admin, Restaurant Owner, and Customer roles
- 🖼️ **Image Management** - Cloudinary integration for image uploads
- 📊 **API Documentation** - Interactive Swagger/OpenAPI docs
- ⚡ **Redis Caching** - High-performance caching layer
- 🛡️ **Security** - Helmet, CORS, rate limiting, input sanitization
- ✅ **Validation** - Joi schemas for request validation
- 📝 **Logging** - Winston logger with multiple transports
- 🧪 **Testing** - Comprehensive test suite with Jest

## 🛠️ Tech Stack

- **Runtime**: Node.js >= 20
- **Framework**: Express.js 5.1
- **Database**: MongoDB 8.x with Mongoose ODM
- **Cache**: Redis with ioredis
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Cloudinary
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Code Quality**: ESLint + Prettier
- **Logging**: Winston

### Key Dependencies

```json
{
  "express": "^5.1.0",
  "mongoose": "^8.18.1",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^3.0.2",
  "cloudinary": "^2.7.0",
  "ioredis": "^5.7.0",
  "joi": "^18.0.1",
  "helmet": "^8.1.0",
  "cors": "^2.8.5",
  "express-rate-limit": "^8.1.0",
  "multer": "^2.0.2",
  "qrcode": "^1.5.4",
  "winston": "^3.17.0"
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- MongoDB 4.4+ (local or MongoDB Atlas)
- Redis (optional, for caching)
- Cloudinary account

### Installation

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see
   [Environment Variables](#environment-variables))

5. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

### Available Scripts

```bash
# Development
npm run dev              # Start with nodemon (auto-reload)
npm start                # Start production server

# Production
npm run start:prod       # Start with NODE_ENV=production
npm run start:staging    # Start with NODE_ENV=staging

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:ci          # Run tests in CI mode

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier

# Documentation
npm run docs             # Validate Swagger documentation
npm run docs:validate    # Validate Swagger schema

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
npm run docker:run:prod  # Run Docker container in production

# Utilities
npm run clean            # Remove node_modules, dist, coverage
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                      # Express app configuration
│   ├── server.js                   # Server entry point
│   │
│   ├── config/                     # Configuration files
│   │   ├── environment.js          # Environment variables
│   │   ├── database.js             # MongoDB connection
│   │   ├── cloudinary.js           # Cloudinary setup
│   │   └── swagger.js              # Swagger configuration
│   │
│   ├── common/                     # Shared modules
│   │   ├── errors/                 # Custom error classes
│   │   │   ├── apiError.js         # Base API error
│   │   │   ├── validationError.js  # Validation errors
│   │   │   ├── unauthorizedError.js
│   │   │   ├── notFoundError.js
│   │   │   └── ...
│   │   │
│   │   ├── middlewares/            # Express middlewares
│   │   │   ├── authMiddleware.js   # JWT authentication
│   │   │   ├── errorMiddleware.js  # Error handling
│   │   │   ├── validationMiddleware.js
│   │   │   ├── rateLimitMiddleware.js
│   │   │   ├── cacheMiddleware.js
│   │   │   └── ...
│   │   │
│   │   ├── utils/                  # Utility functions
│   │   │   ├── logger.js           # Winston logger
│   │   │   ├── paginationUtils.js  # Pagination helpers
│   │   │   ├── sanitization.js     # Input sanitization
│   │   │   └── ...
│   │   │
│   │   ├── services/               # Common services
│   │   │   └── upload/             # File upload service
│   │   │
│   │   └── validation/             # Common validations
│   │       ├── commonValidation.js
│   │       └── publicValidation.js
│   │
│   └── modules/                    # Feature modules
│       ├── health/                 # Health check
│       │   ├── controllers/
│       │   ├── routes/
│       │   └── services/
│       │
│       ├── users/                  # User management
│       │   ├── controllers/
│       │   │   ├── authController.js
│       │   │   ├── profileController.js
│       │   │   └── userController.js
│       │   ├── models/
│       │   │   └── user.js
│       │   ├── routes/
│       │   ├── services/
│       │   ├── validations/
│       │   └── __tests__/
│       │
│       ├── restaurants/            # Restaurant management
│       │   ├── controllers/
│       │   ├── models/
│       │   │   └── restaurant.js
│       │   ├── routes/
│       │   ├── services/
│       │   ├── validations/
│       │   └── __tests__/
│       │
│       ├── menus/                  # Menu management
│       │   ├── controllers/
│       │   ├── models/
│       │   │   └── menu.js
│       │   ├── routes/
│       │   ├── services/
│       │   ├── validations/
│       │   └── __tests__/
│       │
│       └── menuItems/              # Menu item management
│           ├── controllers/
│           ├── models/
│           │   └── menuItem.js
│           ├── routes/
│           ├── services/
│           └── validations/
│
├── __tests__/                      # Test helpers
│   └── helpers/
│       ├── factories.js            # Test data factories
│       ├── mockData.js             # Mock data
│       └── testHelpers.js          # Test utilities
│
├── docs/                           # Documentation
│   └── swagger.json                # OpenAPI specification
│
├── scripts/                        # Utility scripts
│   └── validateSwagger.js          # Swagger validator
│
├── api/                            # Vercel serverless entry
│   └── index.js
│
├── .env                            # Environment variables
├── .env.example                    # Environment template
├── Dockerfile                      # Docker configuration
├── docker-compose.yml              # Docker Compose setup
├── jest.config.js                  # Jest configuration
├── jest.setup.js                   # Jest setup
├── eslint.config.js                # ESLint configuration
├── vercel.json                     # Vercel deployment config
└── package.json
```

## 📖 API Documentation

### Swagger Documentation

Interactive API documentation is available at:

- **Production**:
  [https://qrbites-api.vercel.app/api-docs](https://qrbites-api.vercel.app/api-docs)
- **Local**: `http://localhost:5000/api-docs`

### API Endpoints

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

#### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile

#### Restaurants

- `GET /api/restaurants` - Get all restaurants
- `POST /api/restaurants` - Create restaurant
- `GET /api/restaurants/:id` - Get restaurant by ID
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant
- `POST /api/restaurants/:id/logo` - Upload restaurant logo

#### Menus

- `GET /api/menus` - Get all menus
- `POST /api/menus` - Create menu
- `GET /api/menus/:id` - Get menu by ID
- `PUT /api/menus/:id` - Update menu
- `DELETE /api/menus/:id` - Delete menu
- `GET /api/menus/:id/qr` - Generate QR code for menu
- `GET /api/menus/restaurant/:restaurantId` - Get menus by restaurant

#### Menu Items

- `GET /api/menu-items` - Get all menu items
- `POST /api/menu-items` - Create menu item
- `GET /api/menu-items/:id` - Get menu item by ID
- `PUT /api/menu-items/:id` - Update menu item
- `DELETE /api/menu-items/:id` - Delete menu item
- `POST /api/menu-items/:id/image` - Upload item image

#### Health

- `GET /api/health` - Health check
- `GET /api/health/db` - Database health check

### Authentication

Most endpoints require JWT authentication. Include the token in the
Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## ⚙️ Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
NODE_ENV=development                    # development | production | staging | test
PORT=5000                               # Server port
HOST=localhost                          # Server host

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/qrbites

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary Configuration (Required)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=5242880                   # 5MB in bytes
UPLOAD_DIR=uploads                      # Local upload directory (fallback)

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000             # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100             # Max requests per window
AUTH_RATE_LIMIT_MAX=5                   # Max auth attempts per window
CREATE_USER_RATE_LIMIT_MAX=3            # Max user creation per window

# Cache Configuration
CACHE_TTL=600                           # Cache TTL in seconds (10 minutes)

# Logging Configuration
LOG_LEVEL=debug                         # error | warn | info | debug
LOG_FILE=logs/app.log                   # Log file path

# Security Configuration
BCRYPT_ROUNDS=12                        # Bcrypt hashing rounds
SESSION_SECRET=your-session-secret

# API Configuration
API_URL=http://localhost:5000
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

### Required Variables

These variables are **required** for the application to run:

- `JWT_SECRET`
- `MONGODB_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 🗄️ Database Models

### User Model

```javascript
{
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (enum: ['admin', 'restaurantOwner', 'customer']),
  profilePicture: String,
  phone: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Restaurant Model

```javascript
{
  name: String,
  description: String,
  owner: ObjectId (ref: 'User'),
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  phone: String,
  email: String,
  website: String,
  logo: String,
  cuisine: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Menu Model

```javascript
{
  name: String,
  description: String,
  restaurant: ObjectId (ref: 'Restaurant'),
  isActive: Boolean,
  qrCode: String,
  categories: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### MenuItem Model

```javascript
{
  name: String,
  description: String,
  price: Number,
  menu: ObjectId (ref: 'Menu'),
  category: String,
  image: String,
  isAvailable: Boolean,
  isVegetarian: Boolean,
  isVegan: Boolean,
  isGlutenFree: Boolean,
  allergens: [String],
  ingredients: [String],
  preparationTime: Number,
  calories: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication & Authorization

### Authentication Flow

1. User registers or logs in → receives JWT token
2. Client stores token (localStorage/sessionStorage)
3. Client includes token in Authorization header for protected routes
4. Server validates token via `authMiddleware`
5. Request proceeds or returns 401 Unauthorized

### Role-Based Access Control (RBAC)

- **Admin**: Full access to all resources
- **Restaurant Owner**: Manage own restaurants, menus, and items
- **Customer**: View menus and items (read-only)

### Middleware Usage

```javascript
// Protect route with authentication
router.get('/profile', authMiddleware, getProfile)

// Protect route with authentication and authorization
router.post(
  '/restaurants',
  authMiddleware,
  authorize(['admin', 'restaurantOwner']),
  createRestaurant
)
```

## 🧪 Testing

### Test Structure

```
__tests__/
├── helpers/
│   ├── factories.js      # Test data factories
│   ├── mockData.js       # Mock data
│   └── testHelpers.js    # Test utilities
└── ...

src/modules/*/
└── __tests__/            # Module-specific tests
    ├── *.test.js         # Unit tests
    └── *.integration.test.js  # Integration tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run specific test file
npm test -- users.test.js

# Run tests in CI mode
npm run test:ci
```

### Writing Tests

```javascript
const request = require('supertest')
const app = require('@src/app')
const { createTestUser } = require('@tests/helpers/factories')

describe('User API', () => {
  let authToken

  beforeEach(async () => {
    const user = await createTestUser()
    authToken = user.generateAuthToken()
  })

  it('should get user profile', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(res.body.success).toBe(true)
  })
})
```

### Test Coverage

The project aims for high test coverage:

- Unit tests for models, services, utilities
- Integration tests for API endpoints
- Middleware tests for authentication and validation

View coverage report:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🐳 Docker

### Build Docker Image

```bash
npm run docker:build
```

### Run with Docker

```bash
# Development
npm run docker:run

# Production
npm run docker:run:prod
```

### Docker Compose

```bash
# Start all services (API, MongoDB, Redis)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f api
```

## 🚀 Deployment

### Vercel Deployment

The backend is configured for serverless deployment on Vercel.

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Deploy**

   ```bash
   vercel deploy
   ```

3. **Set environment variables** in Vercel dashboard or CLI:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   # ... add all required env vars
   ```

### Production Checklist

Before deploying to production:

- [ ] Set strong `JWT_SECRET` (32+ characters)
- [ ] Configure production `MONGODB_URI`
- [ ] Set up Cloudinary credentials
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Set appropriate `RATE_LIMIT` values
- [ ] Configure production logging
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Set up monitoring and error tracking

## 📊 Monitoring & Logging

### Logging

Winston logger with multiple transports:

- Console (development)
- File (production)
- Log levels: error, warn, info, debug

```javascript
const logger = require('@commonUtils/logger')

logger.info('User created', { userId: user._id })
logger.error('Database connection failed', { error: err.message })
```

### Error Tracking

Custom error classes for consistent error handling:

- `ApiError` - Base API error
- `ValidationError` - Request validation errors
- `UnauthorizedError` - Authentication errors
- `NotFoundError` - Resource not found
- `ConflictError` - Resource conflicts

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Failed**

```bash
# Check MongoDB is running
mongod --version
# or check MongoDB Atlas connection string
```

**Cloudinary Upload Failed**

```bash
# Verify Cloudinary credentials in .env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**JWT Verification Failed**

```bash
# Ensure JWT_SECRET is set and matches
# Check token expiration time
```

**Port Already in Use**

```bash
# Change PORT in .env or kill process
lsof -ti:5000 | xargs kill -9
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Jest Documentation](https://jestjs.io/)
