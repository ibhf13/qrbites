# 🚀 QrBites Cloudinary Integration Guide

This guide provides comprehensive instructions for setting up Cloudinary integration with your QrBites backend for production deployment on Vercel.

## 📋 Table of Contents

1. [Why Cloudinary?](#why-cloudinary)
2. [Cloudinary Account Setup](#cloudinary-account-setup)
3. [Environment Configuration](#environment-configuration)
4. [Integration Features](#integration-features)
5. [File Upload Workflow](#file-upload-workflow)
6. [QR Code Management](#qr-code-management)
7. [Image Optimization](#image-optimization)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Migration from Local Storage](#migration-from-local-storage)
11. [Troubleshooting](#troubleshooting)

## 🤔 Why Cloudinary?

### Vercel Limitations
- **No Persistent Storage**: Vercel's serverless functions don't support persistent file storage
- **Function Size Limits**: Files increase deployment bundle size
- **Cold Starts**: Large bundles slow down serverless function initialization

### Cloudinary Benefits
- ✅ **Unlimited Storage**: No storage limits
- ✅ **Global CDN**: Fast image delivery worldwide
- ✅ **Automatic Optimization**: WebP/AVIF conversion, quality optimization
- ✅ **Dynamic Transformations**: Resize, crop, effects on-the-fly
- ✅ **99.99% Uptime**: Enterprise-grade reliability
- ✅ **Free Tier**: 25 GB storage, 25 GB bandwidth/month
- ✅ **Easy Integration**: Simple API and SDKs

## 🔧 Cloudinary Account Setup

### Step 1: Create Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up Free"
3. Choose plan (Free tier sufficient for development)
4. Verify your email

### Step 2: Get Credentials
1. Go to your Cloudinary Dashboard
2. Copy the following values:
   - **Cloud Name**: Your unique identifier
   - **API Key**: Public key for API access
   - **API Secret**: Private key (keep secret!)

### Step 3: Configure Upload Presets (Optional but Recommended)
1. Go to Settings > Upload > Add Upload Preset
2. Create presets for different image types:
   - `restaurant_images`: For restaurant photos
   - `menu_images`: For menu photos
   - `qr_codes`: For QR code images

Example Upload Preset Configuration:
```json
{
  "name": "restaurant_images",
  "unsigned": false,
  "folder": "qrbites/restaurants",
  "transformation": [
    {
      "width": 1000,
      "height": 1000,
      "crop": "limit",
      "quality": "auto:good"
    }
  ],
  "allowed_formats": ["jpg", "png", "gif", "webp"],
  "max_file_size": 10485760
}
```

## ⚙️ Environment Configuration

Add these variables to your Vercel project:

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add the following:

```bash
# Required Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbC123dEfG456hIjK789lMnO

# Optional Configuration
CLOUDINARY_FOLDER=qrbites
MAX_FILE_SIZE=10
MAX_FILES_COUNT=5
```

### Via Vercel CLI:
```bash
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY  
vercel env add CLOUDINARY_API_SECRET
```

## 🌟 Integration Features

### Automatic Image Optimization
```javascript
// Automatic format conversion and optimization
const optimizedUrl = generateUrl(publicId, {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto:good',
  fetch_format: 'auto' // Automatically serves WebP/AVIF
});
```

### Responsive Image URLs
```javascript
const responsiveUrls = getResponsiveImageUrls(publicId);
// Returns:
// {
//   thumbnail: "...w_200,h_150...",
//   small: "...w_400,h_300...",
//   medium: "...w_800,h_600...",
//   large: "...w_1200,h_900...",
//   original: "..."
// }
```

### Smart Cropping
```javascript
// Face detection and smart cropping for avatars
const avatarUrl = generateUrl(publicId, {
  width: 300,
  height: 300,
  crop: 'fill',
  gravity: 'face' // Focuses on faces
});
```

## 📤 File Upload Workflow

### 1. Restaurant Logo Upload
```javascript
// POST /api/restaurants/:id/logo
router.post('/:id/logo', 
  protect, // Authentication
  ...uploadMiddleware('logo', 'restaurant'), // Cloudinary upload
  async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    
    // Delete old logo if exists
    if (restaurant.logoPublicId) {
      await deleteImage(restaurant.logoPublicId);
    }
    
    // Update with new logo
    restaurant.logo = req.uploadedFile.url;
    restaurant.logoPublicId = req.uploadedFile.publicId;
    await restaurant.save();
    
    res.json({
      success: true,
      data: {
        logo: restaurant.logo,
        optimized: getOptimizedImageUrl(restaurant.logoPublicId, 'avatar')
      }
    });
  }
);
```

### 2. Menu Item Images
```javascript
// POST /api/menu-items
router.post('/',
  protect,
  ...uploadMiddleware('image', 'menuItem'),
  validateRequest(menuItemSchema),
  async (req, res) => {
    const menuItemData = {
      ...req.body,
      image: req.uploadedFile?.url,
      imagePublicId: req.uploadedFile?.publicId
    };
    
    const menuItem = await MenuItem.create(menuItemData);
    
    res.status(201).json({
      success: true,
      data: {
        ...menuItem.toObject(),
        imageUrls: getResponsiveImageUrls(menuItem.imagePublicId)
      }
    });
  }
);
```

### 3. Multiple File Upload
```javascript
// POST /api/restaurants/:id/gallery
router.post('/:id/gallery',
  protect,
  ...uploadMultipleMiddleware('images', 10, 'restaurant'),
  async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    
    const galleryImages = req.uploadedFiles.map(file => ({
      url: file.url,
      publicId: file.publicId,
      width: file.width,
      height: file.height
    }));
    
    restaurant.gallery = [...restaurant.gallery, ...galleryImages];
    await restaurant.save();
    
    res.json({
      success: true,
      data: restaurant.gallery
    });
  }
);
```

## 🔲 QR Code Management

### Generate Restaurant QR Code
```javascript
const qrCodeService = require('@services/qrCodeService');

// Generate QR code for restaurant
const qrResult = await qrCodeService.generateRestaurantQRCode(restaurant, {
  width: 512,
  errorCorrectionLevel: 'H',
  color: {
    dark: restaurant.primaryColor || '#000000',
    light: '#FFFFFF'
  }
});

// Save QR code info to restaurant
restaurant.qrCode = qrResult.url;
restaurant.qrCodePublicId = qrResult.publicId;
await restaurant.save();
```

### QR Code Sizes for Different Uses
```javascript
const qrSizes = getQRCodeSizes(restaurant.qrCodePublicId);
// Returns:
// {
//   small: "...w_256,h_256...",      // For mobile displays
//   medium: "...w_512,h_512...",     // For web displays
//   large: "...w_1024,h_1024...",    // For high-res displays
//   print: "...w_2048,h_2048...",    // For printing
//   original: "..."                  // Original size
// }
```

## 🎨 Image Optimization

### Automatic Format Selection
```javascript
// Cloudinary automatically serves the best format
const url = generateUrl(publicId, {
  fetch_format: 'auto' // WebP for Chrome, AVIF for supported browsers
});
```

### Quality Optimization
```javascript
// Smart quality adjustment
const optimizedUrl = generateUrl(publicId, {
  quality: 'auto:good', // Balances quality vs file size
  // quality: 'auto:best', // Maximum quality
  // quality: 'auto:eco',  // Smallest file size
});
```

### Progressive JPEG
```javascript
const progressiveUrl = generateUrl(publicId, {
  flags: 'progressive' // Loads progressively for better UX
});
```

### Custom Transformations
```javascript
// Restaurant banner with overlay
const bannerUrl = generateUrl(publicId, {
  width: 1200,
  height: 400,
  crop: 'fill',
  overlay: 'qrbites_logo', // Your logo overlay
  gravity: 'south_east',
  x: 20,
  y: 20,
  opacity: 80
});
```

## ⚠️ Error Handling

### Upload Error Recovery
```javascript
const uploadMiddleware = (fieldName, imageType = 'image') => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        if (req.file) {
          const result = await processFiles(req, imageType);
          req.uploadedFile = result;
        }
        next();
      } catch (error) {
        // Cleanup any partial uploads
        if (req.uploadResults) {
          await cleanupUploadedFiles(req.uploadResults);
        }
        
        // Return user-friendly error
        return res.status(400).json({
          success: false,
          error: 'Failed to upload image. Please try again.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  ];
};
```

### Cloudinary Connection Issues
```javascript
// Check Cloudinary configuration on startup
const { isCloudinaryConfigured } = require('@services/cloudinaryService');

app.use('/api', (req, res, next) => {
  if (!isCloudinaryConfigured && req.method !== 'GET') {
    return res.status(503).json({
      success: false,
      error: 'File upload service temporarily unavailable'
    });
  }
  next();
});
```

## 🧪 Testing

### Test Cloudinary Configuration
```javascript
// Test endpoint to verify Cloudinary setup
router.get('/test-cloudinary', async (req, res) => {
  try {
    const { isCloudinaryConfigured, cloudinary } = require('@services/cloudinaryService');
    
    if (!isCloudinaryConfigured) {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary not configured'
      });
    }
    
    // Test upload with a simple image
    const testResult = await cloudinary.uploader.upload(
      'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
      { folder: 'qrbites/test' }
    );
    
    // Clean up test image
    await cloudinary.uploader.destroy(testResult.public_id);
    
    res.json({
      success: true,
      message: 'Cloudinary working correctly',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Cloudinary test failed',
      details: error.message
    });
  }
});
```

### Integration Tests
```javascript
// Test file upload endpoint
describe('File Upload Integration', () => {
  it('should upload image to Cloudinary', async () => {
    const response = await request(app)
      .post('/api/restaurants/test-id/logo')
      .set('Authorization', `Bearer ${token}`)
      .attach('logo', Buffer.from('fake-image'), 'test.jpg');
      
    expect(response.status).toBe(200);
    expect(response.body.data.logo).toMatch(/cloudinary\.com/);
  });
});
```

## 🔄 Migration from Local Storage

### Migration Strategy
1. **Gradual Migration**: Run both systems in parallel
2. **Background Migration**: Move existing files to Cloudinary
3. **URL Updates**: Update database with new Cloudinary URLs
4. **Cleanup**: Remove local files after successful migration

### Migration Script
```javascript
// scripts/migrateToCloudinary.js
const fs = require('fs');
const path = require('path');
const { uploadBuffer } = require('@services/cloudinaryService');
const Restaurant = require('@models/restaurant');

const migrateRestaurantImages = async () => {
  const restaurants = await Restaurant.find({ logo: { $exists: true } });
  
  for (const restaurant of restaurants) {
    if (restaurant.logo && !restaurant.logo.includes('cloudinary.com')) {
      try {
        // Read local file
        const localPath = path.join(__dirname, '..', restaurant.logo);
        if (fs.existsSync(localPath)) {
          const buffer = fs.readFileSync(localPath);
          
          // Upload to Cloudinary
          const result = await uploadBuffer(buffer, {
            folder: 'qrbites/restaurants',
            publicId: `restaurant_${restaurant._id}`
          });
          
          // Update database
          restaurant.logo = result.url;
          restaurant.logoPublicId = result.publicId;
          await restaurant.save();
          
          console.log(`Migrated: ${restaurant.name}`);
        }
      } catch (error) {
        console.error(`Failed to migrate ${restaurant.name}:`, error);
      }
    }
  }
};

migrateRestaurantImages();
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Cloudinary not configured" Error
```bash
# Check environment variables
vercel env ls

# Verify credentials in Cloudinary dashboard
# Make sure no extra spaces in environment variables
```

#### 2. Upload Timeouts
```javascript
// Increase timeout in Cloudinary config
cloudinary.config({
  // ... other config
  upload_timeout: 60000 // 60 seconds
});
```

#### 3. Large File Upload Issues
```javascript
// Check file size limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    fieldSize: 10 * 1024 * 1024
  }
});
```

#### 4. CORS Issues with Cloudinary URLs
```javascript
// Ensure Cloudinary URLs are whitelisted in CORS
app.use(cors({
  origin: ['https://res.cloudinary.com', ...otherOrigins]
}));
```

### Debug Mode
```javascript
// Enable debug logging
process.env.CLOUDINARY_DEBUG = 'true';

// Log all uploads
const logger = require('@utils/logger');
logger.info('Uploading to Cloudinary:', { publicId, options });
```

## 📊 Monitoring & Analytics

### Track Upload Metrics
```javascript
// In your upload middleware
const uploadStats = {
  totalUploads: 0,
  totalSize: 0,
  errors: 0
};

const trackUpload = (file, success = true) => {
  if (success) {
    uploadStats.totalUploads++;
    uploadStats.totalSize += file.size;
  } else {
    uploadStats.errors++;
  }
};
```

### Cloudinary Usage Dashboard
- Monitor bandwidth usage
- Track storage consumption  
- View optimization savings
- Check error rates

## 🎯 Best Practices

1. **Always Use Transformations**: Apply width/height limits to prevent oversized images
2. **Implement Cleanup**: Delete unused images to save storage
3. **Use Appropriate Formats**: Let Cloudinary auto-select optimal formats
4. **Implement Fallbacks**: Handle upload failures gracefully
5. **Monitor Usage**: Keep track of bandwidth and storage consumption
6. **Secure Uploads**: Use signed uploads for sensitive content
7. **Organize Assets**: Use consistent folder structures and naming

## 🚀 Next Steps

1. Set up Cloudinary account and get credentials
2. Update environment variables in Vercel
3. Test file uploads in development
4. Deploy to production
5. Monitor usage and optimize as needed

Your QrBites backend is now ready for production with enterprise-grade image management! 🎉