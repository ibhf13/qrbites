# QrBites

QrBites is a web-based platform that enables restaurant owners to convert physical menu photos into digital versions accessible via QR codes.

## Features

- **User Management:** Register, login, and manage restaurant owner accounts
- **Restaurant Management:** Create and manage multiple restaurants
- **Menu Digitization:** Create digital menus with items and categories
- **QR Code Generation:** Generate QR codes for menus that customers can scan
- **File Upload:** Upload and store menu and item images
- **Public Access:** Mobile-optimized public menu viewing
- **Real-time Updates:** Update menu items instantly across all access points

## Tech Stack

- **Backend:** Node.js, Express, MongoDB with Mongoose
- **Authentication:** JWT, bcrypt
- **Data Handling:** Joi (validation), Multer (file upload)
- **Features:** Tesseract.js (OCR), qrcode (QR generation)
- **Quality Tools:** Jest/Supertest (testing), Winston/Morgan (logging)
- **Security:** Helmet, Rate limiting, Input validation

## Documentation

- [Getting Started](./docs/getting-started/README.md) - Installation and basic setup
- [Architecture](./docs/architecture/README.md) - System design and components
- [API Documentation](./docs/api/README.md) - Endpoints and usage
- [Development Guide](./docs/development/README.md) - Coding standards and practices
- [Deployment Guide](./docs/deployment/README.md) - Production setup and configuration
- [Contributing Guide](./docs/contributing/README.md) - How to contribute to the project
- [Testing Guide](./docs/development/testing.md) - Testing strategy and examples
- [Middleware Documentation](./docs/architecture/middlewares.md) - Middleware explanations
- [Services Documentation](./docs/architecture/services.md) - Core services documentation
- [API Response Examples](./docs/api/response-examples.md) - Sample API responses
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions
- [FAQ](./docs/faq.md) - Frequently asked questions

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/qrbites.git
cd qrbites
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

5. Visit `http://localhost:3000` to access the API

## API Endpoints

- **Authentication:**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Login and get token

- **Restaurants:**
  - `GET /api/restaurants` - Get all restaurants (for user)
  - `POST /api/restaurants` - Create a new restaurant
  - `GET /api/restaurants/:id` - Get a specific restaurant
  - `PUT /api/restaurants/:id` - Update a restaurant
  - `DELETE /api/restaurants/:id` - Delete a restaurant

- **Menus:**
  - `GET /api/restaurants/:id/menus` - Get all menus for a restaurant
  - `POST /api/restaurants/:id/menus` - Create a new menu
  - `GET /api/menus/:id` - Get a specific menu
  - `PUT /api/menus/:id` - Update a menu
  - `DELETE /api/menus/:id` - Delete a menu
  - `POST /api/menus/:id/qr` - Generate QR code for a menu

For a complete list of endpoints, see the [API Documentation](./docs/api/README.md).

## Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Testing

The project uses Jest for testing. To run the test suite:

```bash
npm test
```

For more information, see the [Testing Guide](./docs/development/testing.md).

## Deployment

For deployment instructions, see the [Deployment Guide](./docs/deployment/README.md).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./docs/contributing/README.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please create an issue in the repository or contact the development team. 