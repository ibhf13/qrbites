import { AuthUser, StorageType, StoredAuthData, JWTPayload } from "../types/auth.types"

const AUTH_TOKEN_KEY = 'auth_token'
const USER_DATA_KEY = 'user'
const OAUTH_PENDING_TOKEN_KEY = 'oauth_pending_token'

export const storeAuthData = (token: string, user: AuthUser, storageType: StorageType): void => {
    const storage = storageType === 'localStorage' ? localStorage : sessionStorage

    if (storageType === 'localStorage') {
        sessionStorage.removeItem(AUTH_TOKEN_KEY)
        sessionStorage.removeItem(USER_DATA_KEY)
    } else {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(USER_DATA_KEY)
    }

    storage.setItem(AUTH_TOKEN_KEY, token)
    storage.setItem(USER_DATA_KEY, JSON.stringify(user))

    if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 Auth data stored in ${storageType}`)
    }
}

export const getAuthData = (): StoredAuthData | null => {
    let token = localStorage.getItem(AUTH_TOKEN_KEY)
    let userData = localStorage.getItem(USER_DATA_KEY)

    if (!token || !userData) {
        token = sessionStorage.getItem(AUTH_TOKEN_KEY)
        userData = sessionStorage.getItem(USER_DATA_KEY)
    }

    if (!token) return null
    if (!userData || userData === 'undefined' || userData.trim() === '') {
        cleanupCorruptedAuthData()

        return null
    }

    try {
        const user = JSON.parse(userData) as AuthUser

        if (!user || typeof user !== 'object') {
            cleanupCorruptedAuthData()

            return null
        }

        if (!user._id || !user.email) {
            console.warn('⚠️ Missing essential user fields, clearing auth data')
            cleanupCorruptedAuthData()

            return null
        }

        return { token, user }
    } catch (error) {
        console.error('Error parsing stored user data:', error)
        cleanupCorruptedAuthData()

        return null
    }
}

export const getAuthToken = (): string | null => {
    // Check regular storage first
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY)

    // Fallback to pending OAuth token if no stored token
    if (!storedToken) {
        const pendingToken = localStorage.getItem(OAUTH_PENDING_TOKEN_KEY)

        return pendingToken
    }

    return storedToken
}

export const getUserData = (): AuthUser | null => {
    const userData = localStorage.getItem(USER_DATA_KEY) || sessionStorage.getItem(USER_DATA_KEY)

    if (!userData || userData === 'undefined' || userData.trim() === '') {
        return null
    }

    try {
        const user = JSON.parse(userData) as AuthUser

        return user && typeof user === 'object' ? user : null
    } catch {
        return null
    }
}

export const clearAuthData = (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(USER_DATA_KEY)
    localStorage.removeItem(OAUTH_PENDING_TOKEN_KEY)
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
    sessionStorage.removeItem(USER_DATA_KEY)

    if (process.env.NODE_ENV === 'development') {
        console.log('🧹 Auth data cleared from storage')
    }
}

export const isUserAuthenticated = (): boolean => {
    const token = getAuthToken()

    if (!token) return false

    return !isTokenExpired(token)
}

export const cleanupCorruptedAuthData = (): void => {
    const token = getAuthToken()

    if (token) {
        localStorage.removeItem(USER_DATA_KEY)
        sessionStorage.removeItem(USER_DATA_KEY)
    } else {
        clearAuthData()
    }
}

export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1])) as JWTPayload

        return Date.now() >= (payload.exp * 1000)
    } catch {
        return true
    }
}

export const getCurrentStorageType = (): StorageType | null => {
    const hasLocalStorage = !!localStorage.getItem(AUTH_TOKEN_KEY)
    const hasSessionStorage = !!sessionStorage.getItem(AUTH_TOKEN_KEY)

    if (hasLocalStorage) return 'localStorage'
    if (hasSessionStorage) return 'sessionStorage'

    return null
}

export const isValidTokenFormat = (token: string): boolean => {
    if (!token || typeof token !== 'string') return false
    const parts = token.split('.')

    if (parts.length !== 3) return false

    try {
        const payload = JSON.parse(atob(parts[1])) as JWTPayload

        return !!(payload.exp && payload.id)
    } catch {
        return false
    }
}

/**
 * Store OAuth token temporarily before user data is fetched
 * @param token - JWT token from OAuth provider
 */
export const storeOAuthPendingToken = (token: string): void => {
    localStorage.setItem(OAUTH_PENDING_TOKEN_KEY, token)

    if (process.env.NODE_ENV === 'development') {
        console.log('🔐 OAuth pending token stored')
    }
}

/**
 * Get OAuth pending token without removing it
 * @returns OAuth token or null
 */
export const getOAuthPendingToken = (): string | null => {
    const token = localStorage.getItem(OAUTH_PENDING_TOKEN_KEY)

    if (token && process.env.NODE_ENV === 'development') {
        console.log('🔐 OAuth pending token retrieved')
    }

    return token
}

/**
 * Remove OAuth pending token from storage
 */
export const removeOAuthPendingToken = (): void => {
    localStorage.removeItem(OAUTH_PENDING_TOKEN_KEY)

    if (process.env.NODE_ENV === 'development') {
        console.log('🔐 OAuth pending token removed')
    }
}