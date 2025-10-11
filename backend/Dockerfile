# ============================================
# Multi-stage build for QrBites API
# ============================================

# Stage 1: Build dependencies
FROM node:18-alpine AS dependencies

LABEL maintainer="your-email@example.com"
LABEL project="QrBites API"
LABEL version="1.0.0"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# ============================================
# Stage 2: Production image
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies from build stage
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads && \
    chown -R nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/server.js"]