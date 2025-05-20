import { UserInfo } from '../types/profile.types'
import { getUserData, storeAuthData, getAuthToken, clearAuthData } from '../../auth/utils/authStorage'
import { User } from '../../auth/types/auth.types'

export const getStoredUser = (): UserInfo | null => {
    const userData = getUserData()

    return userData as UserInfo | null
}

export const updateStoredUser = (updates: Partial<UserInfo>): void => {
    try {
        const currentUser = getUserData()
        const token = getAuthToken()

        if (!currentUser || !token) {
            console.warn('Cannot update user: no current user or token found')

            return
        }

        const updatedUser = { ...currentUser, ...updates }
        const storageType = localStorage.getItem('user') ? 'localStorage' : 'sessionStorage'

        storeAuthData(token, updatedUser as User, storageType)
    } catch (error) {
        console.error('Error updating stored user data:', error)
    }
}

export const clearStoredUser = (): void => {
    clearAuthData()
} 