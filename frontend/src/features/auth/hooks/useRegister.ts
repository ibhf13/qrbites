import { useNotification } from '@/hooks/useNotification'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { RegisterRequest } from '../types/auth.types'

export const useRegister = () => {
    const [isLoading, setIsLoading] = useState(false)
    const { register, error, clearError } = useAuth()
    const { showError } = useNotification()

    const handleRegister = async (userData: RegisterRequest) => {
        setIsLoading(true)

        try {
            await register(userData)
            return true
        } catch (err: any) {
            // Display error via notification if error message exists
            if (err?.error?.message) {
                showError(err.error.message)
            } else {
                showError('An unexpected error occurred during registration')
            }
            return false
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