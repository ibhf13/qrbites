import { useEffect, useState } from 'react'
import { loginUser, logoutUser, registerUser } from '../api/auth.api'
import { User } from '../types/auth-context.types'
import { LoginRequest, RegisterRequest } from '../types/auth.types'

/**
 * Custom hook to manage authentication state and operations
 */
export const useAuthState = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // Initialize auth state from storage on mount
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
            const localUserData = localStorage.getItem('user')
            const sessionUserData = sessionStorage.getItem('user')
            const storedUser = localUserData || sessionUserData

            if (storedToken) {
                setIsAuthenticated(true)

                if (storedUser && storedUser !== 'undefined' && storedUser.trim() !== '') {
                    try {
                        // Parse stored user data
                        const parsedUser = JSON.parse(storedUser)
                        if (parsedUser && typeof parsedUser === 'object') {
                            setUser(parsedUser)
                        } else {
                            console.warn('Stored user data is not a valid object:', storedUser)
                            // Don't logout, just keep the token but reset user object
                            setUser(null)
                        }
                    } catch (parseError) {
                        // If we can't parse the user data, just clear the user data but keep the token
                        console.error('Error parsing stored user data:', parseError)
                        localStorage.removeItem('user')
                        sessionStorage.removeItem('user')
                        setUser(null)
                    }
                } else {
                    // Token exists but no valid user data
                    setUser(null)
                    console.log('No valid user data found, but token exists')
                }
            } else {
                // No token found, ensure we're logged out
                setIsAuthenticated(false)
                setUser(null)
            }
        } catch (err) {
            console.error('Error loading auth state:', err)
            // Clear potentially corrupted data
            logoutUser()
            setIsAuthenticated(false)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    const login = async (data: LoginRequest): Promise<void> => {
        setLoading(true)
        setError(null)

        try {
            const response = await loginUser(data)

            if (response.success) {
                setIsAuthenticated(true)
                setUser(response.data.user)
                return // Success case - exit early
            }

            // If we get here, response was success: false but no error was thrown
            setError('Login failed. Please try again.')
            throw new Error('Login failed')

        } catch (err: any) {
            let errorMessage = 'Login failed. Please try again.'

            // Extract error message if available
            if (err?.error?.message) {
                errorMessage = err.error.message
            }

            setError(errorMessage)
            throw err // Re-throw for external error handling
        } finally {
            setLoading(false)
        }
    }

    const register = async (data: RegisterRequest): Promise<void> => {
        setLoading(true)
        setError(null)

        try {
            const response = await registerUser(data)

            if (response.success) {
                // Successfully registered, but user still needs to log in
                setError(null)
                return // Success case - exit early
            }

            // If we get here, response was success: false but no error was thrown
            setError('Registration failed. Please try again.')
            throw new Error('Registration failed')

        } catch (err: any) {
            let errorMessage = 'Registration failed. Please try again.'

            // Extract error message if available
            if (err?.error?.message) {
                errorMessage = err.error.message
            }

            setError(errorMessage)
            throw err // Re-throw for external error handling
        } finally {
            setLoading(false)
        }
    }

    const logout = (): void => {
        logoutUser()
        setIsAuthenticated(false)
        setUser(null)
    }

    const clearError = (): void => {
        setError(null)
    }

    return {
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError
    }
} 