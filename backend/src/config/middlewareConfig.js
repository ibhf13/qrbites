/**
 * Middleware Configuration
 * Centralized configuration for Express middleware
 */

const express = require('express')
const compression = require('compression')
const mongoSanitize = require('express-mongo-sanitize')
const logger = require('@commonUtils/logger')

/**
 * Body parser configuration for JSON
 */
const jsonParserConfig = {
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8')
  },
}

/**
 * Body parser configuration for URL-encoded data
 */
const urlencodedParserConfig = {
  extended: true,
  limit: '10mb',
}

/**
 * Compression middleware configuration
 */
const compressionConfig = {
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  },
  level: 6,
}

/**
 * MongoDB sanitization configuration
 */
const mongoSanitizeConfig = {
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`Attempted NoSQL injection from ${req.ip}: ${key}`)
  },
}

/**
 * Get configured JSON parser middleware
 */
const getJsonParser = () => express.json(jsonParserConfig)

/**
 * Get configured URL-encoded parser middleware
 */
const getUrlencodedParser = () => express.urlencoded(urlencodedParserConfig)

/**
 * Get configured compression middleware
 */
const getCompression = () => compression(compressionConfig)

/**
 * Get configured MongoDB sanitization middleware
 */
const getMongoSanitize = () => mongoSanitize(mongoSanitizeConfig)

module.exports = {
  jsonParserConfig,
  urlencodedParserConfig,
  compressionConfig,
  mongoSanitizeConfig,
  getJsonParser,
  getUrlencodedParser,
  getCompression,
  getMongoSanitize,
}
