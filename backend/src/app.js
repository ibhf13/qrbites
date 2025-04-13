const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'QrBites API',
    version: '1.0.0',
    documentation: '/api/docs' 
  });
});

// Import and use route files
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menus', require('./routes/menuRoutes'));
// app.use('/api/uploads', require('./routes/uploadRoutes'));
// app.use('/api/qr-codes', require('./routes/qrCodeRoutes'));
// app.use('/api/public', require('./routes/publicRoutes'));

// Error handling middleware (should be last)
app.use(errorHandler);

module.exports = app; 