import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAuthData, storeAuthData, clearAuthData, isTokenExpired } from '../utils/authStorage'
import { authApi } from '../api/auth.api'
import { AuthUser, LoginRequest, RegisterRequest, ChangePasswordRequest, AuthOperationResult } from '../types/auth.types'
import {
    getValidationErrors,
    isValidationError,
    isRateLimitError,
    getRateLimitInfo,
    isAuthenticationError,
    getUserFriendlyErrorMessage
} from '@/features/errorHandling/utils/errorUtils'

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    const logout = useCallback(() => {
        clearAuthData()
        setIsAuthenticated(false)
        setUser(null)
        clearError()
    }, [clearError])

    const validateToken = useCallback(async (): Promise<AuthUser | null> => {
        try {
            const storedData = getAuthData()

            if (!storedData?.token) return null

            if (isTokenExpired(storedData.token)) {
                clearAuthData()

                return null
            }

            const response = await authApi.getCurrentUser()

            if (response.success) {
                return response.data
            } else {
                console.error('❌ Server validation failed:', response)
                clearAuthData()

                return null
            }
        } catch (error) {
            console.error('🚨 validateToken error:', error)
            clearAuthData()

            return null
        }
    }, [])

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setLoading(true)
                const storedData = getAuthData()

                if (storedData?.token && storedData?.user) {
                    if (isTokenExpired(storedData.token)) {
                        clearAuthData()
                        setIsAuthenticated(false)
                        setUser(null)

                        return
                    }

                    const serverUser = await validateToken()

                    if (serverUser) {
                        setIsAuthenticated(true)
                        setUser({
                            _id: serverUser._id,
                            email: serverUser.email,
                            name: serverUser.name,
                            role: serverUser.role,
                        })
                    } else {
                        setIsAuthenticated(false)
                        setUser(null)
                    }
                } else {
                    setIsAuthenticated(false)
                    setUser(null)
                }
            } catch (err) {
                setIsAuthenticated(false)
                setUser(null)
                console.error('Auth initialization error:', err)
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()
    }, [validateToken])

    const login = useCallback(async (data: LoginRequest & { rememberMe?: boolean }): Promise<AuthOperationResult> => {
        setLoading(true)
        clearError()

        try {
            const { rememberMe = false, ...loginData } = data
            const response = await authApi.login(loginData)

            if (!response.success) {
                let errorMessage: string

                if (isValidationError(response)) {
                    const validationErrors = getValidationErrors(response)

                    if (Object.keys(validationErrors).length > 0) {
                        errorMessage = Object.entries(validationErrors)
                            .map(([field, error]) => `${field}: ${error}`)
                            .join('\n')
                    } else {
                        errorMessage = getUserFriendlyErrorMessage(response, 'login')
                    }
                } else if (isRateLimitError(response)) {
                    const rateLimitInfo = getRateLimitInfo(response)

                    errorMessage = rateLimitInfo.message
                } else {
                    errorMessage = getUserFriendlyErrorMessage(response, 'login')
                }

                clearAuthData()
                setIsAuthenticated(false)
                setUser(null)
                setError(errorMessage)

                return { success: false, error: errorMessage }
            }

            const { token, ...userData } = response.data
            const user: AuthUser = {
                _id: userData._id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                displayName: userData.displayName || userData.name,
            }

            const storageType = rememberMe ? 'localStorage' : 'sessionStorage'

            storeAuthData(token, user, storageType)

            setIsAuthenticated(true)
            setUser(user)
            clearError()

            return { success: true }
        } catch (err) {
            console.error('Unexpected login error:', err)
            clearAuthData()
            setIsAuthenticated(false)
            setUser(null)

            const errorMessage = err instanceof Error
                ? err.message
                : getUserFriendlyErrorMessage(err, 'login')

            setError(errorMessage)

            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }, [clearError])

    const register = useCallback(async (data: RegisterRequest): Promise<AuthOperationResult> => {
        setLoading(true)
        clearError()

        try {
            const response = await authApi.register(data)

            if (!response.success) {
                let errorMessage: string

                if (isValidationError(response)) {
                    const validationErrors = getValidationErrors(response)

                    if (Object.keys(validationErrors).length > 0) {
                        errorMessage = Object.entries(validationErrors)
                            .map(([field, error]) => `${field}: ${error}`)
                            .join('\n')
                    } else {
                        errorMessage = getUserFriendlyErrorMessage(response, 'register')
                    }
                } else if (isRateLimitError(response)) {
                    const rateLimitInfo = getRateLimitInfo(response)

                    errorMessage = rateLimitInfo.message
                } else {
                    errorMessage = getUserFriendlyErrorMessage(response, 'register')
                }

                setError(errorMessage)

                return { success: false, error: errorMessage }
            }

            clearError()

            return { success: true }
        } catch (err) {
            console.error('Unexpected registration error:', err)

            const errorMessage = err instanceof Error
                ? err.message
                : getUserFriendlyErrorMessage(err, 'register')

            setError(errorMessage)

            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }, [clearError])

    const changePassword = useCallback(async (data: ChangePasswordRequest): Promise<AuthOperationResult> => {
        setLoading(true)
        clearError()

        try {
            const response = await authApi.changePassword(data)

            if (!response.success) {
                let errorMessage: string

                if (isValidationError(response)) {
                    const validationErrors = getValidationErrors(response)

                    if (Object.keys(validationErrors).length > 0) {
                        errorMessage = Object.entries(validationErrors)
                            .map(([field, error]) => `${field}: ${error}`)
                            .join('\n')
                    } else {
                        errorMessage = getUserFriendlyErrorMessage(response, 'password')
                    }
                } else if (isRateLimitError(response)) {
                    const rateLimitInfo = getRateLimitInfo(response)

                    errorMessage = rateLimitInfo.message
                } else {
                    errorMessage = getUserFriendlyErrorMessage(response, 'password')
                }

                setError(errorMessage)

                return { success: false, error: errorMessage }
            }

            clearError()

            return { success: true }
        } catch (err) {
            console.error('Unexpected password change error:', err)

            const errorMessage = err instanceof Error
                ? err.message
                : getUserFriendlyErrorMessage(err, 'password')

            setError(errorMessage)

            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }, [clearError])

    const refreshUser = useCallback(async () => {
        if (!isAuthenticated) return

        setLoading(true)
        clearError()

        try {
            const serverUser = await validateToken()

            if (serverUser) {
                const freshUser: AuthUser = {
                    _id: serverUser._id,
                    email: serverUser.email,
                    name: serverUser.name,
                    role: serverUser.role,
                    displayName: serverUser.displayName || serverUser.name,
                    isActive: serverUser.isActive,
                    createdAt: serverUser.createdAt,
                    updatedAt: serverUser.updatedAt,
                }

                setUser(freshUser)

                const storedData = getAuthData()

                if (storedData?.token) {
                    const storageType = localStorage.getItem('auth_token') ? 'localStorage' : 'sessionStorage'

                    storeAuthData(storedData.token, freshUser, storageType)
                }
            } else {
                logout()
            }
        } catch (err) {
            console.error('Error refreshing user:', err)

            const errorMessage = getUserFriendlyErrorMessage(err, 'refresh user data')

            setError(errorMessage)

            if (isAuthenticationError(err)) {
                logout()
            }
        } finally {
            setLoading(false)
        }
    }, [isAuthenticated, validateToken, logout, clearError])

    return useMemo(() => ({
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        changePassword,
        logout,
        clearError,
        refreshUser
    }), [
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        changePassword,
        logout,
        clearError,
        refreshUser
    ])
}