import { StorageType, StoredAuthData, User } from '../types/auth.types'

const AUTH_TOKEN_KEY = 'auth_token'
const USER_DATA_KEY = 'user'


export const storeAuthData = (token: string, user: User, storageType: StorageType): void => {
    try {
        const storage = storageType === 'localStorage' ? localStorage : sessionStorage

        storage.setItem(AUTH_TOKEN_KEY, token)
        storage.setItem(USER_DATA_KEY, JSON.stringify(user))

        console.log(`📝 Auth data stored in ${storageType}`)
    } catch (error) {
        console.error('Failed to store auth data:', error)
        throw new Error('Failed to store authentication data')
    }
}


export const getAuthData = (): StoredAuthData | null => {
    try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY)
        const userData = localStorage.getItem(USER_DATA_KEY) || sessionStorage.getItem(USER_DATA_KEY)

        if (!token) {
            return null
        }

        if (!userData || userData === 'undefined' || userData.trim() === '') {
            console.warn('Token found but no valid user data - cleaning up corrupted auth state')
            cleanupCorruptedAuthData()

            return null
        }

        const user = JSON.parse(userData)

        if (!user || typeof user !== 'object') {
            console.warn('Invalid user data format - cleaning up corrupted auth state')
            cleanupCorruptedAuthData()

            return null
        }

        return { token, user }
    } catch (error) {
        console.error('Failed to retrieve auth data:', error)
        cleanupCorruptedAuthData()

        return null
    }
}


export const getAuthToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY)
}


export const getUserData = (): User | null => {
    try {
        const userData = localStorage.getItem(USER_DATA_KEY) || sessionStorage.getItem(USER_DATA_KEY)

        if (!userData || userData === 'undefined' || userData.trim() === '') {
            return null
        }

        const user = JSON.parse(userData)

        return user && typeof user === 'object' ? user : null
    } catch (error) {
        console.error('Failed to parse user data:', error)

        return null
    }
}


export const clearAuthData = (): void => {
    try {
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(USER_DATA_KEY)
        sessionStorage.removeItem(AUTH_TOKEN_KEY)
        sessionStorage.removeItem(USER_DATA_KEY)

        console.log('🧹 Auth data cleared from storage')
    } catch (error) {
        console.error('Failed to clear auth data:', error)
    }
}


export const isUserAuthenticated = (): boolean => {
    return !!getAuthToken()
}


export const cleanupCorruptedAuthData = (): void => {
    try {
        const token = getAuthToken()

        if (token) {
            localStorage.removeItem(USER_DATA_KEY)
            sessionStorage.removeItem(USER_DATA_KEY)
            console.log('🧹 Cleaned up corrupted user data, kept token')
        } else {
            clearAuthData()
        }
    } catch (error) {
        console.error('Failed to cleanup corrupted auth data:', error)
        clearAuthData()
    }
} 