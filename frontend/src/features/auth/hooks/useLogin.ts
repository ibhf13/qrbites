import { useNotification } from '@/hooks/useNotification'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoginRequest } from '../types/auth.types'

export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false)
    const { login, error, clearError } = useAuth()
    const { showError } = useNotification()

    const handleLogin = async (userData: LoginRequest) => {
        setIsLoading(true)

        try {
            await login(userData)
            return true
        } catch (err: any) {
            // Display error via notification if error message exists
            if (err?.error?.message) {
                showError(err.error.message)
            } else {
                showError('An unexpected error occurred during login')
            }
            return false
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