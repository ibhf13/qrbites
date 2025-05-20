import { useEffect, useState } from 'react'
import { LoginRequest, RegisterRequest, User } from '../types/auth.types'
import { cleanupCorruptedAuthData, getAuthData } from '../utils/authStorage'
import { useLoginMutation, useLogoutAction, useRegisterMutation } from './useAuthMutations'

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const loginMutation = useLoginMutation()
    const registerMutation = useRegisterMutation()
    const logoutAction = useLogoutAction()

    useEffect(() => {
        try {
            const authData = getAuthData()

            if (authData?.token && authData?.user) {
                setIsAuthenticated(true)
                setUser(authData.user)
            } else {
                setIsAuthenticated(false)
                setUser(null)
            }
        } catch (err) {
            console.error('Error loading auth state:', err)
            cleanupCorruptedAuthData()
            setIsAuthenticated(false)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    const handleLogin = async (data: LoginRequest): Promise<void> => {
        setLoading(true)
        setError(null)

        try {
            await loginMutation.mutateAsync(data)

            const authData = getAuthData()

            if (authData?.token && authData?.user) {
                setIsAuthenticated(true)
                setUser(authData.user)
            } else {
                throw new Error('Authentication data not found after successful login')
            }
        } catch (err: any) {
            const errorMessage = err?.error?.message || err?.message || 'Login failed. Please try again.'

            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (data: RegisterRequest): Promise<void> => {
        setLoading(true)
        setError(null)

        try {
            await registerMutation.mutateAsync(data)
            setError(null)
        } catch (err: any) {
            const errorMessage = err?.error?.message || err?.message || 'Registration failed. Please try again.'

            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = (): void => {
        logoutAction()
        setIsAuthenticated(false)
        setUser(null)
        setError(null)
    }

    const clearError = (): void => {
        setError(null)
    }

    return {
        isAuthenticated,
        user,
        loading: loading || loginMutation.isPending || registerMutation.isPending,
        error: error || loginMutation.error?.message || registerMutation.error?.message,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        clearError
    }
} 