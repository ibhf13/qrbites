/**
 * Swagger/OpenAPI Configuration
 * Defines API documentation structure and metadata for QrBites API
 */

const swaggerJsdoc = require('swagger-jsdoc')

const config = require('./environment')

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'QrBites API',
            version: '1.0.0',
            description: `
QrBites Restaurant Menu Management System API Documentation.

## Features
- 🍽️ Digital menu management
- 📱 QR code generation for menus
- 🔐 JWT-based authentication
- 👥 Multi-role authorization (Admin, Restaurant Owner, Customer)
- 🖼️ Image upload with Cloudinary integration
- 🔍 Advanced menu search and filtering

## Authentication
Most endpoints require JWT authentication. To authenticate:
1. Register or login via /api/auth/register or /api/auth/login
2. Copy the token from the response
3. Click the "Authorize" button (🔒 icon) above
4. Enter: \`Bearer <your-token>\`
5. Click "Authorize" and "Close"

Your token will be automatically included in subsequent requests.
      `,
            contact: {
                name: 'QrBites Support',
                email: 'support@qrbites.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: config.IS_PRODUCTION
                    ? config.API_URL
                    : `http://localhost:${config.PORT}`,
                description: config.IS_PRODUCTION ? 'Production server' : 'Development server',
            },
            {
                url: 'https://qrbites-api.vercel.app',
                description: 'Production (Vercel)',
            },
            {
                url: 'http://localhost:5000',
                description: 'Local development',
            },
        ],
        tags: [
            {
                name: 'System',
                description: 'System health and status endpoints',
            },
            {
                name: 'Authentication',
                description: 'User authentication and authorization endpoints',
            },
            {
                name: 'Users',
                description: 'User management operations',
            },
            {
                name: 'Restaurants',
                description: 'Restaurant profile and management',
            },
            {
                name: 'Menus',
                description: 'Menu management operations',
            },
            {
                name: 'Menu Items',
                description: 'Menu item CRUD operations',
            },
            {
                name: 'QR Codes',
                description: 'QR code generation and management',
            },
            {
                name: 'Public',
                description: 'Public endpoints (no authentication required)',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token in the format: Bearer {token}',
                },
            },
            schemas: {
                // ============================================================
                // Error Response Schemas
                // ============================================================
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        error: {
                            type: 'string',
                            example: 'Error message describing what went wrong',
                        },
                    },
                },
                ValidationError: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        error: {
                            type: 'string',
                            example: 'Validation failed',
                        },
                        details: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: {
                                        type: 'string',
                                        example: 'email',
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Invalid email format',
                                    },
                                },
                            },
                        },
                    },
                },

                // ============================================================
                // User Schemas
                // ============================================================
                User: {
                    type: 'object',
                    required: ['email', 'password', 'role'],
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'objectId',
                            example: '507f1f77bcf86cd799439011',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com',
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            minLength: 8,
                            example: 'SecurePass123!',
                            description: 'Password is never returned in responses',
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'restaurant_owner', 'customer'],
                            example: 'restaurant_owner',
                        },
                        restaurantId: {
                            type: 'string',
                            format: 'objectId',
                            example: '507f1f77bcf86cd799439011',
                            description: 'Reference to restaurant (for restaurant_owner role)',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },

                // ============================================================
                // Restaurant Schemas
                // ============================================================
                Restaurant: {
                    type: 'object',
                    required: ['name', 'ownerId'],
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'objectId',
                            example: '507f1f77bcf86cd799439011',
                        },
                        name: {
                            type: 'string',
                            example: 'La Bella Cucina',
                        },
                        description: {
                            type: 'string',
                            example: 'Authentic Italian cuisine in the heart of the city',
                        },
                        location: {
                            type: 'object',
                            properties: {
                                address: {
                                    type: 'string',
                                    example: '123 Main Street',
                                },
                                city: {
                                    type: 'string',
                                    example: 'New York',
                                },
                                state: {
                                    type: 'string',
                                    example: 'NY',
                                },
                                zipCode: {
                                    type: 'string',
                                    example: '10001',
                                },
                                country: {
                                    type: 'string',
                                    example: 'USA',
                                },
                            },
                        },
                        contact: {
                            type: 'object',
                            properties: {
                                phone: {
                                    type: 'string',
                                    example: '+1-555-123-4567',
                                },
                                email: {
                                    type: 'string',
                                    format: 'email',
                                    example: 'info@restaurant.com',
                                },
                            },
                        },
                        ownerId: {
                            type: 'string',
                            format: 'objectId',
                            example: '507f1f77bcf86cd799439011',
                        },
                        isActive: {
                            type: 'boolean',
                            example: true,
                        },
                        logo: {
                            type: 'string',
                            format: 'uri',
                            example: 'https://res.cloudinary.com/xxx/image/upload/v123/logo.jpg',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },

                // ============================================================
                // Menu Schemas
                // ============================================================
                Menu: {
                    type: 'object',
                    required: ['name', 'restaurantId'],
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'objectId',
                            example: '507f1f77bcf86cd799439011',
                        },
                        name: {
                            type: 'string',
                            example: 'Lunch Menu',
                        },
                        description: {
                            type: 'string',
                            example: 'Daily lunch specials available 11am-3pm',
                        },
                        restaurantId: {
                            type: 'string',
                            format: 'objectId',
                            example: '507f1f77bcf86cd799439011',
                        },
                        isActive: {
                            type: 'boolean',
                            example: true,
                        },
                        categories: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            example: ['Appetizers', 'Main Course', 'Desserts', 'Beverages'],
                        },
                        qrCode: {
                            type: 'string',
                            format: 'uri',
                            example: 'https://res.cloudinary.com/xxx/image/upload/v123/qrcode.png',
                        },
                        qrCodeId: {
                            type: 'string',
                            example: 'abc123xyz',
                            description: 'Unique identifier for QR code URL',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },

                // ============================================================
                // MenuItem Schemas
                // ============================================================
                MenuItem: {
                    type: 'object',
                    required: ['name', 'price', 'menuId'],
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'objectId',
                            example: '507f1f77bcf86cd799439011',
                        },
                        name: {
                            type: 'string',
                            example: 'Margherita Pizza',
                        },
                        description: {
                            type: 'string',
                            example: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
                        },
                        price: {
                            type: 'number',
                            format: 'float',
                            example: 12.99,
                        },
                        currency: {
                            type: 'string',
                            example: 'USD',
                            default: 'USD',
                        },
                        category: {
                            type: 'string',
                            example: 'Main Course',
                        },
                        menuId: {
                            type: 'string',
                            format: 'objectId',
                            example: '507f1f77bcf86cd799439011',
                        },
                        image: {
                            type: 'string',
                            format: 'uri',
                            example: 'https://res.cloudinary.com/xxx/image/upload/v123/pizza.jpg',
                        },
                        isAvailable: {
                            type: 'boolean',
                            example: true,
                        },
                        allergens: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            example: ['gluten', 'dairy'],
                        },
                        dietary: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            example: ['vegetarian'],
                        },
                        spicyLevel: {
                            type: 'number',
                            minimum: 0,
                            maximum: 5,
                            example: 2,
                        },
                        preparationTime: {
                            type: 'number',
                            description: 'Preparation time in minutes',
                            example: 15,
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },

                // ============================================================
                // Auth Schemas
                // ============================================================
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com',
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: 'SecurePass123!',
                        },
                    },
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'password', 'role'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'newuser@example.com',
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            minLength: 8,
                            example: 'SecurePass123!',
                        },
                        role: {
                            type: 'string',
                            enum: ['restaurant_owner', 'customer'],
                            example: 'restaurant_owner',
                        },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        data: {
                            type: 'object',
                            properties: {
                                token: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                },
                                user: {
                                    type: 'object',
                                    properties: {
                                        _id: {
                                            type: 'string',
                                            example: '507f1f77bcf86cd799439011',
                                        },
                                        email: {
                                            type: 'string',
                                            example: 'user@example.com',
                                        },
                                        role: {
                                            type: 'string',
                                            example: 'restaurant_owner',
                                        },
                                        restaurantId: {
                                            type: 'string',
                                            example: '507f1f77bcf86cd799439011',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },

                // ============================================================
                // Pagination Schema
                // ============================================================
                Pagination: {
                    type: 'object',
                    properties: {
                        total: {
                            type: 'integer',
                            example: 100,
                            description: 'Total number of items',
                        },
                        page: {
                            type: 'integer',
                            example: 1,
                            description: 'Current page number',
                        },
                        limit: {
                            type: 'integer',
                            example: 10,
                            description: 'Items per page',
                        },
                        totalPages: {
                            type: 'integer',
                            example: 10,
                            description: 'Total number of pages',
                        },
                    },
                },
            },

            // ============================================================
            // Reusable Response Definitions
            // ============================================================
            responses: {
                Success: {
                    description: 'Successful operation',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: {
                                        type: 'boolean',
                                        example: true,
                                    },
                                    data: {
                                        type: 'object',
                                    },
                                },
                            },
                        },
                    },
                },
                Created: {
                    description: 'Resource created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: {
                                        type: 'boolean',
                                        example: true,
                                    },
                                    data: {
                                        type: 'object',
                                    },
                                },
                            },
                        },
                    },
                },
                NoContent: {
                    description: 'Resource deleted successfully - no content returned',
                },
                BadRequest: {
                    description: 'Bad request - validation error or invalid input',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ValidationError',
                            },
                        },
                    },
                },
                Unauthorized: {
                    description: 'Authentication required - missing or invalid token',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                            example: {
                                success: false,
                                error: 'Authentication required',
                            },
                        },
                    },
                },
                Forbidden: {
                    description: 'Insufficient permissions - authenticated but not authorized',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                            example: {
                                success: false,
                                error: 'You do not have permission to access this resource',
                            },
                        },
                    },
                },
                NotFound: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                            example: {
                                success: false,
                                error: 'Resource not found',
                            },
                        },
                    },
                },
                Conflict: {
                    description: 'Conflict - resource already exists',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                            example: {
                                success: false,
                                error: 'Resource already exists',
                            },
                        },
                    },
                },
                ServerError: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                            example: {
                                success: false,
                                error: 'An unexpected error occurred',
                            },
                        },
                    },
                },
                TooManyRequests: {
                    description: 'Rate limit exceeded',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                            example: {
                                success: false,
                                error: 'Too many requests. Please try again later.',
                            },
                        },
                    },
                },
            },

            // ============================================================
            // Reusable Parameters
            // ============================================================
            parameters: {
                IdParam: {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Resource ID (MongoDB ObjectId)',
                    schema: {
                        type: 'string',
                        format: 'objectId',
                        example: '507f1f77bcf86cd799439011',
                    },
                },
                PageParam: {
                    name: 'page',
                    in: 'query',
                    description: 'Page number for pagination (starts at 1)',
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        default: 1,
                        example: 1,
                    },
                },
                LimitParam: {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of items per page',
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100,
                        default: 10,
                        example: 10,
                    },
                },
                SortParam: {
                    name: 'sort',
                    in: 'query',
                    description: 'Sort field and order (prefix with - for descending)',
                    schema: {
                        type: 'string',
                        example: '-createdAt',
                    },
                },
                SearchParam: {
                    name: 'search',
                    in: 'query',
                    description: 'Search query string',
                    schema: {
                        type: 'string',
                        example: 'pizza',
                    },
                },
            },
        },

        // Default security for all endpoints (can be overridden per endpoint)
        security: [
            {
                bearerAuth: [],
            },
        ],
    },

    // Paths to files containing OpenAPI documentation
    apis: [
        './src/modules/**/routes/*.js',
        './src/modules/**/models/*.js',
        './src/app.js',
    ],
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec

