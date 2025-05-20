import { useNotificationContext } from '@/features/notifications/contexts/NotificationContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { AuthOperationResult, LoginRequest, RegisterRequest } from '../types/auth.types'

export const useLoginAction = () => {
    const [isLoading, setIsLoading] = useState(false)
    const { login, error, clearError } = useAuthContext()
    const { showError } = useNotificationContext()

    const handleLogin = async (userData: LoginRequest): Promise<AuthOperationResult> => {
        setIsLoading(true)

        try {
            await login(userData)

            return { success: true }
        } catch (err: any) {
            const errorMessage = err?.error?.message || 'An unexpected error occurred during login'

            showError(errorMessage)

            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }

    return {
        login: handleLogin,
        isLoading,
        error,
        clearError
    }
}

export const useRegisterAction = () => {
    const [isLoading, setIsLoading] = useState(false)
    const { register, error, clearError } = useAuthContext()
    const { showError } = useNotificationContext()

    const handleRegister = async (userData: RegisterRequest): Promise<AuthOperationResult> => {
        setIsLoading(true)

        try {
            await register(userData)

            return { success: true }
        } catch (err: any) {
            const errorMessage = err?.error?.message || 'An unexpected error occurred during registration'

            showError(errorMessage)

            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }

    return {
        register: handleRegister,
        isLoading,
        error,
        clearError
    }
}


export const useLogoutAction = () => {
    const { logout } = useAuthContext()
    const navigate = useNavigate()
    const { showSuccess } = useNotificationContext()

    const handleLogout = () => {
        logout()
        showSuccess('You have been successfully logged out')
        navigate('/login')
    }

    return {
        logout: handleLogout
    }
} 