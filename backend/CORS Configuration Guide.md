# CORS Configuration Guide

## Overview
The QrBites backend now uses environment-based CORS configuration that automatically switches between development and production modes for maximum security.

## Environment Variables

### Required for Production
```bash
NODE_ENV=production
ALLOWED_ORIGINS=https://qrbites.com,https://www.qrbites.com
```

### Optional for Development
```bash
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3001,http://your-custom-dev-server:3000
```

## How It Works

### Development Mode (NODE_ENV != 'production')
- **Default allowed origins**: `http://localhost:3000`, `http://localhost:5173`
- **Custom origins**: Add via `ALLOWED_ORIGINS` environment variable
- **Behavior**: Permissive for development workflow

### Production Mode (NODE_ENV = 'production')
- **Default origins**: NONE - must be explicitly defined
- **Required**: `ALLOWED_ORIGINS` environment variable
- **Behavior**: Strict allowlist only, logs warnings if not configured

## Security Features

1. **No Wildcards**: Eliminated `Access-Control-Allow-Origin: '*'` from static files
2. **Origin Validation**: All requests validated against allowlist
3. **Logging**: CORS blocks are logged for security monitoring
4. **Fallback Protection**: Production fails safely if no origins configured

## Configuration Examples

### Production Deployment
```bash
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Development with Custom Frontend
```bash
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3001,http://192.168.1.100:3000
```

### Testing Environment
```bash
NODE_ENV=test
# Uses default localhost origins
```

## Static File CORS
Static files (images, uploads) now use the same allowlist as the main API:
- `/uploads/*` - Images and file uploads
- `/restaurants/*` - Restaurant images with proper CORS headers

## Migration from Previous Setup
The old hardcoded `ALLOWED_ORIGINS = ['http://localhost:3000']` has been replaced with dynamic, environment-aware configuration that provides:
- Better security in production
- More flexibility in development
- Proper logging and monitoring
- Consistent CORS handling across all endpoints
