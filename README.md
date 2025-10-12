# 🍽️ QRBites

**Restaurant Menu Digitization Platform**

QRBites is a modern, full-stack web application that enables restaurants to digitize their menus and provide customers with a seamless, contactless dining experience through QR codes. Built with cutting-edge technologies, QRBites offers a comprehensive solution for restaurant menu management, QR code generation, and customer menu viewing.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## 🌐 Live Demo

- **Backend API**: [https://qrbites-api.vercel.app](https://qrbites-api.vercel.app)
- **Frontend App**: [https://qr-bites-api.vercel.app](https://qr-bites.vercel.app)
- **API Documentation**: [https://qrbites-api.vercel.app/api-docs](https://qrbites-api.vercel.app/api-docs)

## ✨ Features

- 🍽️ **Digital Menu Management** - Create, update, and organize restaurant menus with ease
- 📱 **QR Code Generation** - Automatic QR code creation for instant menu access
- 🔐 **Secure Authentication** - JWT-based authentication with role-based access control
- 👥 **Multi-Role Support** - Admin, Restaurant Owner, and Customer roles
- 🖼️ **Image Management** - Cloudinary integration for efficient image upload and optimization
- 🔍 **Advanced Search** - Powerful menu search and filtering capabilities
- 📊 **API Documentation** - Interactive Swagger/OpenAPI documentation
- ⚡ **High Performance** - Redis caching and rate limiting for optimal performance
- 🎨 **Modern UI** - Beautiful, responsive interface built with React and Tailwind CSS
- 🌐 **PWA Ready** - Progressive Web App capabilities for mobile experience

## 🏗️ Architecture

QRBites follows a modern monorepo structure with separated frontend and backend:

```
qrbites/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + MongoDB
├── .husky/            # Git hooks for code quality
└── package.json       # Root workspace configuration
```

### Technology Stack

#### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 5.1
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Caching**: Redis with ioredis
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with Supertest
- **Code Quality**: ESLint, Prettier

#### Frontend
- **Library**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router 7
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Headless UI, Heroicons
- **Notifications**: Notistack

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **MongoDB** (local or cloud instance)
- **Redis** (optional, for caching)
- **Cloudinary Account** (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/qrbites.git
   cd qrbites
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Configuration

#### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/qrbites

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
CREATE_USER_RATE_LIMIT_MAX=3

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

#### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_DEMO_EMAIL=demo@example.com
VITE_DEMO_PASSWORD=demo123
```

### Running the Application

#### Development Mode

1. **Start the backend**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

2. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

#### Production Mode

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend in production**
   ```bash
   cd backend
   npm run start:prod
   ```

### Using Docker

#### Backend

```bash
cd backend

# Build the image
npm run docker:build

# Run the container
npm run docker:run
```

## 📚 Documentation

### API Documentation

Access the interactive API documentation:

- **Production**: [https://qrbites-api.vercel.app/api-docs](https://qrbites-api.vercel.app/api-docs)
- **Local Development**: `http://localhost:5000/api-docs`

### Project Documentation

- [Backend Documentation](./backend/README.md) - Detailed backend setup and API information
- [Frontend Documentation](./frontend/README.md) - Frontend architecture and component guide

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:unit
npm run test:integration
```

### Test Coverage

The backend maintains high test coverage with:
- Unit tests for models, controllers, and services
- Integration tests for API endpoints
- Middleware tests for authentication and validation

## 🎨 Code Quality

The project uses pre-commit hooks via Husky to ensure code quality:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Lint-staged** - Run checks on staged files

### Manual Code Quality Checks

```bash
# Lint backend
npm run lint:backend

# Lint frontend
npm run lint:frontend

# Format backend
npm run format:backend

# Format frontend
npm run format:frontend

# Run all pre-commit checks
npm run pre
```

## 📁 Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── common/              # Shared utilities
│   │   ├── errors/          # Error classes
│   │   ├── middlewares/     # Express middlewares
│   │   ├── services/        # Common services
│   │   ├── utils/           # Utility functions
│   │   └── validation/      # Validation schemas
│   ├── config/              # Configuration files
│   ├── modules/             # Feature modules
│   │   ├── users/           # User management
│   │   ├── restaurants/     # Restaurant management
│   │   ├── menus/           # Menu management
│   │   ├── menuItems/       # Menu items management
│   │   └── health/          # Health check
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
├── __tests__/               # Test files
├── docs/                    # API documentation
└── package.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── api/                 # API client
│   ├── assets/              # Static assets
│   ├── components/          # Reusable components
│   │   ├── common/          # Common UI components
│   │   └── app/             # App-level components
│   ├── config/              # Configuration
│   │   └── routes/          # Route definitions
│   ├── contexts/            # React contexts
│   ├── features/            # Feature modules
│   │   ├── auth/            # Authentication
│   │   ├── restaurants/     # Restaurant management
│   │   ├── menus/           # Menu management
│   │   ├── viewer/          # Menu viewer
│   │   └── qr/              # QR code generation
│   ├── hooks/               # Custom React hooks
│   ├── providers/           # App providers
│   ├── styles/              # Global styles
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
└── package.json
```

## 🔒 Security

QRBites implements multiple security best practices:

- **Authentication**: JWT-based stateless authentication
- **Authorization**: Role-based access control (RBAC)
- **Password Hashing**: Bcrypt with configurable rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Joi schemas for request validation
- **Sanitization**: MongoDB query sanitization
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers middleware
- **File Upload**: Validated and restricted file uploads

## 🚢 Deployment

### Backend Deployment (Vercel)

The backend is configured for Vercel deployment with `vercel.json`.

```bash
cd backend
vercel deploy
```

### Frontend Deployment (Vercel)

The frontend is also configured for Vercel deployment.

```bash
cd frontend
vercel deploy
```

### Environment Variables

Ensure all required environment variables are configured in your deployment platform.
