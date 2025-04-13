# QrBites Backend

The backend REST API for QrBites - a platform that converts photos of restaurant menus into digital versions with QR codes.

## Technology Stack

- **Core**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **File Upload**: Multer
- **OCR Service**: Tesseract.js
- **QR Generation**: qrcode

## Project Structure

The project follows the MVC architecture pattern:

```
src/
├── config/               # Configuration files
├── controllers/          # Route controllers (MVC)
├── middleware/           # Custom middleware
├── models/               # Database models (MVC)
├── routes/               # API routes
├── services/             # Business logic
├── utils/                # Utility functions
└── tests/                # Tests (unit & integration)
```

## Setup Instructions

1. **Install dependencies**:
   ```
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   JWT_COOKIE_EXPIRES_IN=7
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
   ```

3. **Run development server**:
   ```
   npm run dev
   ```

4. **Run tests**:
   ```
   npm test
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `POST /api/auth/forgotpassword` - Password reset request
- `PUT /api/auth/resetpassword/:resettoken` - Reset password

### Menu Management
- `GET /api/menus` - Get all menus for a user
- `POST /api/menus` - Create a new menu
- `GET /api/menus/:id` - Get a specific menu
- `PUT /api/menus/:id` - Update a menu
- `DELETE /api/menus/:id` - Delete a menu

### File Upload & OCR
- `POST /api/uploads` - Upload menu photos
- `GET /api/ocr/:id` - Get OCR results
- `PUT /api/ocr/:id` - Update OCR results

### QR Code
- `GET /api/qr-codes` - Get all QR codes for a user
- `POST /api/qr-codes` - Generate a new QR code
- `GET /api/qr-codes/:id` - Get a specific QR code

### Public Access
- `GET /api/public/menus/:id` - Public menu access
- `GET /api/public/menus/:id/search` - Search items in a menu 