const logger = require('@utils/logger')

/**
 * Maximum allowed length for search queries to prevent ReDoS attacks
 */
const MAX_SEARCH_LENGTH = 100

/**
 * Maximum allowed length for regex patterns
 */
const MAX_REGEX_LENGTH = 50

/**
 * Escape special regex characters to prevent ReDoS attacks
 * @param {string} string - Input string to sanitize
 * @returns {string} Sanitized string with escaped regex characters
 */
const escapeRegexChars = (string) => {
    if (!string || typeof string !== 'string') {
        return ''
    }

    // Escape special regex characters: . * + ? ^ $ { } ( ) | [ ] \
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Sanitize search input for MongoDB regex queries
 * @param {string} input - Raw search input
 * @param {Object} options - Configuration options
 * @param {number} options.maxLength - Maximum allowed length (default: 100)
 * @param {boolean} options.allowEmpty - Whether to allow empty strings (default: false)
 * @returns {string|null} Sanitized search string or null if invalid
 */
const sanitizeSearchInput = (input, options = {}) => {
    const { maxLength = MAX_SEARCH_LENGTH, allowEmpty = false } = options

    // Check if input exists and is a string
    if (!input || typeof input !== 'string') {
        return allowEmpty ? '' : null
    }

    // Trim whitespace
    const trimmed = input.trim()

    // Check if empty after trimming
    if (!trimmed && !allowEmpty) {
        return null
    }

    // Check length limit to prevent ReDoS
    if (trimmed.length > maxLength) {
        logger.warn(`Search input exceeded maximum length: ${trimmed.length} > ${maxLength}`)
        return null
    }

    // Escape special regex characters
    const sanitized = escapeRegexChars(trimmed)

    // Additional check for patterns that could cause exponential backtracking
    if (sanitized.includes('.*.*') || sanitized.includes('.+.+')) {
        logger.warn('Potentially dangerous regex pattern detected and blocked')
        return null
    }

    return sanitized
}

/**
 * Create a safe MongoDB regex query object
 * @param {string} input - Raw search input
 * @param {Object} options - Configuration options
 * @param {string} options.flags - Regex flags (default: 'i' for case-insensitive)
 * @param {number} options.maxLength - Maximum allowed length
 * @param {boolean} options.allowEmpty - Whether to allow empty strings
 * @returns {Object|null} MongoDB regex query object or null if invalid
 */
const createSafeRegexQuery = (input, options = {}) => {
    const { flags = 'i', ...sanitizeOptions } = options

    const sanitizedInput = sanitizeSearchInput(input, sanitizeOptions)

    if (sanitizedInput === null) {
        return null
    }

    return {
        $regex: sanitizedInput,
        $options: flags
    }
}

/**
 * Sanitize multiple search fields for OR queries
 * @param {string} input - Raw search input
 * @param {Array<string>} fields - Field names to create queries for
 * @param {Object} options - Configuration options
 * @returns {Array} Array of MongoDB query objects
 */
const createSafeSearchQuery = (input, fields, options = {}) => {
    const regexQuery = createSafeRegexQuery(input, options)

    if (!regexQuery || !Array.isArray(fields) || fields.length === 0) {
        return []
    }

    return fields.map(field => ({
        [field]: regexQuery
    }))
}

/**
 * Validate and sanitize a regex pattern for direct use
 * @param {string} pattern - Raw regex pattern
 * @param {Object} options - Configuration options
 * @param {number} options.maxLength - Maximum allowed pattern length
 * @returns {string|null} Sanitized pattern or null if invalid
 */
const sanitizeRegexPattern = (pattern, options = {}) => {
    const { maxLength = MAX_REGEX_LENGTH } = options

    if (!pattern || typeof pattern !== 'string') {
        return null
    }

    const trimmed = pattern.trim()

    if (!trimmed || trimmed.length > maxLength) {
        logger.warn(`Regex pattern invalid or too long: ${trimmed.length} > ${maxLength}`)
        return null
    }

    // Test the pattern for potential ReDoS vulnerabilities
    try {
        // Test with a sample string to check for exponential backtracking
        const testString = 'a'.repeat(50)
        const testRegex = new RegExp(trimmed, 'i')

        // Set a timeout for the test (this is a simple check)
        const start = Date.now()
        testRegex.test(testString)
        const elapsed = Date.now() - start

        // If the test takes too long, it might be vulnerable to ReDoS
        if (elapsed > 100) {
            logger.warn('Regex pattern may be vulnerable to ReDoS attack')
            return null
        }

        return trimmed
    } catch (error) {
        logger.warn('Invalid regex pattern detected:', error.message)
        return null
    }
}

module.exports = {
    escapeRegexChars,
    sanitizeSearchInput,
    createSafeRegexQuery,
    createSafeSearchQuery,
    sanitizeRegexPattern,
    MAX_SEARCH_LENGTH,
    MAX_REGEX_LENGTH
}
