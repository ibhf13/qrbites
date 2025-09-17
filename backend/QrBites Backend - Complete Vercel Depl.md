# QrBites Backend - Complete Vercel Deployment Guide with Cloudinary

## 🚀 Pre-Deployment Checklist

### 1. **Cloudinary Setup** ⭐ **CRITICAL**
- [ ] Create Cloudinary account at [cloudinary.com](https://cloudinary.com)
- [ ] Note your Cloud Name, API Key, and API Secret from dashboard
- [ ] Test credentials work by uploading a test image

### 2. **Database Setup**
- [ ] Set up MongoDB Atlas cluster
- [ ] Whitelist all IP addresses (0.0.0.0/0) or Vercel's IP ranges
- [ ] Create database user with read/write permissions
- [ ] Test connection string works

### 3. **Code Preparation**
- [ ] Ensure project structure matches requirements:
```
project-root/
├── api/
│   └── index.js              # Serverless entry point
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── cloudinaryService.js    # NEW: Cloudinary integration
│   │   │   ├── fileUploadService.js    # UPDATED: Uses Cloudinary
│   │   │   └── qrCodeService.js        # UPDATED: Uploads to Cloudinary
│   │   ├── middlewares/
│   │   │   └── uploadValidationMiddleware.js  # UPDATED
│   │   ├── app.js
│   │   ├── server.js
│   │   └── ...               # All your existing code
│   └── aliases.js
├── package.json              # UPDATED: With Cloudinary deps
├── vercel.json              # Vercel configuration
└── .env.example             # UPDATED: With Cloudinary vars
```

## 🔧 Step-by-Step Deployment

### Step 1: Install Dependencies & Vercel CLI
```bash
# Install all dependencies (including Cloudinary)
npm install

# Install Vercel CLI globally
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Configure Environment Variables

**🌟 Complete Environment Variables List:**

#### **Required Variables:**
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qrbites

# JWT
JWT_SECRET=your-super-secure-32-character-secret-key
JWT_EXPIRES_IN=7d

# URLs & CORS
FRONTEND_URL=https://your-frontend.vercel.app
BASE_URL=https://your-backend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000

# 🔥 CLOUDINARY (CRITICAL - NEW REQUIREMENT)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret-here

# Environment
NODE_ENV=production
```

#### **Optional but Recommended:**
```bash
# File Upload Configuration
MAX_FILE_SIZE=10
MAX_FILES_COUNT=5
CLOUDINARY_FOLDER=qrbites

# Performance
CACHE_TTL=1800
ENABLE_CACHE=true

# Rate Limiting
API_RATE_LIMIT=1000
AUTH_RATE_LIMIT=100

# QR Code Settings
QR_CODE_SIZE=512
QR_CODE_ERROR_CORRECTION=H
```

### Step 4: Add Environment Variables to Vercel

**Option A: Vercel Dashboard**
1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add all variables above

**Option B: Vercel CLI**
```bash
# Required variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add JWT_EXPIRES_IN
vercel env add FRONTEND_URL
vercel env add BASE_URL
vercel env add ALLOWED_ORIGINS
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
vercel env add NODE_ENV

# Optional variables
vercel env add MAX_FILE_SIZE
vercel env add CLOUDINARY_FOLDER
```

### Step 5: Deploy to Vercel
```bash
# Deploy to production
vercel --prod
```

## 🛠️ Key Updates for Cloudinary Integration

### 1. **File Upload System Overhaul**
- ✅ **OLD**: Local disk storage (doesn't work on Vercel)
- ✅ **NEW**: Cloudinary cloud storage with CDN

### 2. **Enhanced Features**
- **Auto-optimization**: WebP/AVIF format conversion
- **Responsive images**: Multiple sizes generated automatically
- **Smart cropping**: Face detection for avatars
- **QR code management**: Cloud-based QR code storage

### 3. **Updated Routes & Middleware**
All file upload endpoints now use Cloudinary:
```javascript
// Restaurant logo upload
POST /api/restaurants/:id/logo

// Menu item images
POST /api/menu-items (with image)

// QR code generation
POST /api/restaurants/:id/qr-code

// Profile avatars
POST /api/profile/avatar
```

### 4. **Error Handling & Cleanup**
- Automatic cleanup of failed uploads
- Graceful fallbacks if Cloudinary is unavailable
- User-friendly error messages

## 🔍 Testing Your Deployment

### 1. Basic Health Checks
```bash
# API health
curl https://your-app.vercel.app/

# Public endpoints
curl https://your-app.vercel.app/api/public/health

# Cloudinary configuration
curl https://your-app.vercel.app/api/test-cloudinary
```

### 2. Authentication Flow
```bash
# User registration
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# User login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

### 3. File Upload Test
```bash
# Test image upload (requires authentication token)
curl -X POST https://your-app.vercel.app/api/restaurants/test-id/logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "logo=@test-image.jpg"
```

### 4. QR Code Generation
```bash
# Generate restaurant QR code
curl -X POST https://your-app.vercel.app/api/restaurants/test-id/qr-code \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## 🐛 Troubleshooting Guide

### Issue 1: "Cloudinary not configured" Error
**Symptoms**: File uploads fail with 500 error
**Solution**: 
```bash
# Check environment variables
vercel env ls | grep CLOUDINARY

# Verify credentials in Cloudinary dashboard
# Ensure no spaces in environment variable values
```

### Issue 2: Module Not Found Errors
**Symptoms**: Import errors for @services, @models, etc.
**Solution**: 
- Verify `aliases.js` file exists
- Check `package.json` has correct `_moduleAliases`
- Ensure `require('module-alias/register')` in `api/index.js`

### Issue 3: Database Connection Timeout
**Symptoms**: MongoDB connection failures
**Solution**: 
```bash
# Check MongoDB Atlas settings:
# 1. Network Access → IP Whitelist → Allow 0.0.0.0/0
# 2. Database Access → User has readWrite permissions
# 3. Connection string format is correct
```

### Issue 4: CORS Errors
**Symptoms**: Frontend can't access API
**Solution**:
```bash
# Update ALLOWED_ORIGINS environment variable
vercel env add ALLOWED_ORIGINS
# Enter: https://your-frontend.vercel.app,https://custom-domain.com
```

### Issue 5: File Upload Size Errors
**Symptoms**: Large images fail to upload
**Solution**:
```javascript
// Check Vercel function limits:
// - Body size: 4.5MB for Hobby, 4.5MB for Pro
// - Execution time: 10s for Hobby, 60s for Pro
// Consider image compression before upload
```

### Issue 6: QR Code Generation Fails
**Symptoms**: QR code endpoints return errors
**Solution**:
- Verify `FRONTEND_URL` environment variable is set
- Check QR code data URL length (max 2000 characters)
- Ensure Cloudinary has sufficient quota

## 📊 Performance Optimization

### 1. **Database Indexing**
Add indexes to frequently queried fields:
```javascript
// In MongoDB Atlas or via script
db.users.createIndex({ email: 1 });
db.restaurants.createIndex({ ownerId: 1 });
db.menus.createIndex({ restaurantId: 1 });
db.menuItems.createIndex({ menuId: 1 });
```

### 2. **Cloudinary Optimizations**
```javascript
// Automatic format selection and optimization
const optimizedUrl = generateUrl(publicId, {
  fetch_format: 'auto',    // WebP/AVIF when supported
  quality: 'auto:good',    // Smart quality adjustment
  flags: 'progressive'     // Progressive loading
});
```

### 3. **Caching Strategy**
```javascript
// API response caching
app.use('/api/public', cacheMiddleware(1800)); // 30 minutes

// Cloudinary CDN caching is automatic
```

### 4. **Connection Optimization**
The serverless function implements connection reuse:
```javascript
// Reuses existing MongoDB connections
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  // ... connection logic
};
```

## 🔐 Security Best Practices

### 1. **Environment Variables**
- Use strong, unique secrets (32+ characters)
- Never commit sensitive data to repository
- Rotate JWT secrets periodically

### 2. **CORS Configuration**
```bash
# Specific origins only, no wildcards
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-domain.com
```

### 3. **Rate Limiting**
Built-in rate limiting is configured for:
- API endpoints: 1000 requests/15min
- Auth endpoints: 100 requests/15min
- User creation: 10 requests/hour

### 4. **File Upload Security**
- File type validation (images only)
- Size limits (10MB max)
- Automatic scanning via Cloudinary

## 🚀 Going Live

### 1. **Custom Domain Setup**
- Add custom domain in Vercel dashboard
- Update `BASE_URL` environment variable
- Update `ALLOWED_ORIGINS` if needed

### 2. **SSL Certificate**
Vercel automatically provides SSL certificates for all domains.

### 3. **Monitoring Setup**
- **Vercel Analytics**: Built-in performance monitoring
- **Cloudinary Analytics**: Image delivery and optimization metrics
- **MongoDB Atlas**: Database performance monitoring

### 4. **Error Tracking** (Recommended)
Add Sentry or similar for error tracking:
```bash
npm install @sentry/node
# Add SENTRY_DSN environment variable
```

## 📈 Scaling Considerations

### Vercel Function Limits
- **Hobby Plan**: 10s execution time, 1024MB memory
- **Pro Plan**: 60s execution time, 3008MB memory
- **Enterprise**: Custom limits available

### Cloudinary Quotas
- **Free Tier**: 25 GB storage, 25 GB bandwidth/month
- **Paid Plans**: Start at $99/month for higher limits

### Database Scaling
- MongoDB Atlas auto-scales based on usage
- Consider connection pooling for high traffic

## ✅ Final Deployment Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] Cloudinary credentials tested and working
- [ ] Database connection successful
- [ ] File uploads working (restaurant logos, menu images)
- [ ] QR code generation working
- [ ] Authentication flow complete
- [ ] CORS properly configured for your frontend domain
- [ ] Error handling tested

### Post-Launch
- [ ] SSL certificate active (automatic)
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring and analytics set up
- [ ] Performance optimization applied
- [ ] Backup strategy in place
- [ ] Documentation updated for team

### Testing URLs
Replace `your-app` with your actual Vercel app name:
- API Health: `https://your-app.vercel.app/`
- Auth: `https://your-app.vercel.app/api/auth/register`
- File Upload Test: `https://your-app.vercel.app/api/test-cloudinary`

## 🎉 Success! 

Your QrBites backend is now deployed with:
- ✅ **Serverless Architecture**: Scales automatically
- ✅ **Cloud File Storage**: Unlimited scalable image storage
- ✅ **Global CDN**: Fast image delivery worldwide  
- ✅ **Auto-Optimization**: WebP/AVIF conversion, smart quality
- ✅ **QR Code Management**: Cloud-based QR code generation
- ✅ **Production Security**: Rate limiting, CORS, authentication
- ✅ **99.99% Uptime**: Enterprise-grade reliability

**Your API is live and ready to power your QrBites application!** 🚀

---

## 🆘 Need Help?

**Common Commands:**
```bash
# View logs
vercel logs

# Check environment variables  
vercel env ls

# Redeploy
vercel --prod

# Remove deployment
vercel remove
```

**Support Resources:**
- [Vercel Documentation](https://vercel.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)

Your QrBites backend is now enterprise-ready! 🎊