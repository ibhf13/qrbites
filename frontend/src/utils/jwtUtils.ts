/**
 * JWT utility functions for safe token handling
 */

export interface JWTPayload {
    id: string
    exp: number
    iat: number
}

export interface OAuthJWTPayload extends JWTPayload {
    authProvider?: 'google' | 'local'
}

/**
 * Safely decode a JWT token without throwing errors
 * @param token - The JWT token string to decode
 * @returns Decoded payload or null if invalid
 */
export const safeDecodeJWT = (token: string): JWTPayload | null => {
    try {
        const parts = token.split('.')

        if (parts.length !== 3) {
            console.warn('Invalid JWT format: expected 3 parts')

            return null
        }

        const payload = JSON.parse(atob(parts[1])) as JWTPayload

        if (!payload.id || !payload.exp || !payload.iat) {
            console.warn('Invalid JWT payload: missing required fields')

            return null
        }

        return payload
    } catch (error) {
        console.error('Failed to decode JWT:', error)

        return null
    }
}

/**
 * Check if a JWT token is expired
 * @param token - The JWT token string or payload
 * @returns True if expired, false otherwise
 */
export const isJWTExpired = (token: string | JWTPayload): boolean => {
    try {
        const payload = typeof token === 'string' ? safeDecodeJWT(token) : token

        if (!payload) {
            return true
        }

        return Date.now() >= (payload.exp * 1000)
    } catch {
        return true
    }
}

