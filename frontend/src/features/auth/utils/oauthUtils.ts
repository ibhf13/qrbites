/**
 * OAuth utility functions for handling OAuth token flow
 */

import { isValidTokenFormat, storeOAuthPendingToken } from './authStorage'
import { safeDecodeJWT } from '@/utils/jwtUtils'

/**
 * Extract OAuth token from URL query parameters
 * Automatically cleans up the URL after extraction
 * @returns Token string or null if not found or invalid
 */
export const extractOAuthTokenFromUrl = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (!token) {
        return null
    }

    // Validate token format
    if (!isValidTokenFormat(token)) {
        console.warn('OAuth token has invalid format')
        // Clean up URL even if token is invalid
        window.history.replaceState({}, '', window.location.pathname)

        return null
    }

    // Clean URL immediately after extraction
    window.history.replaceState({}, '', window.location.pathname)

    return token
}

/**
 * Process OAuth token from URL
 * Extracts, validates, and stores token temporarily
 * Returns true if token was successfully processed
 * @returns Boolean indicating if OAuth token was found and stored
 */
export const processOAuthToken = (): boolean => {
    const token = extractOAuthTokenFromUrl()

    if (!token) {
        return false
    }

    const payload = safeDecodeJWT(token)

    if (!payload) {
        console.error('Failed to decode OAuth token')

        return false
    }

    storeOAuthPendingToken(token)

    return true
}

