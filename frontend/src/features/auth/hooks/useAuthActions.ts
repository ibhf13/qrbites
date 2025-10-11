import { useNavigate } from 'react-router-dom'
import { useNotificationActions } from '@/features/notifications'
import { useAuthContext } from '../contexts/AuthContext'
import { AuthOperationResult, LoginRequest, RegisterRequest, ChangePasswordRequest } from '../types/auth.types'

export const useLoginAction = () => {
    const { login, loading, error, clearError } = useAuthContext()
    const { showSuccess, showError } = useNotificationActions()

    const handleLogin = async (userData: LoginRequest & { rememberMe?: boolean }): Promise<AuthOperationResult> => {
        const result = await login(userData)

        if (!result.success) {
            showError(result.error ?? 'An unexpected error occurred')

            return { success: false, error: result.error ?? 'An unexpected error occurred' }
        }

        showSuccess('Login successful!')

        return { success: true }
    }

    return {
        login: handleLogin,
        isLoading: loading,
        error,
        clearError
    }
}

export const useRegisterAction = () => {
    const { register, loading, error, clearError } = useAuthContext()
    const { showSuccess, showError } = useNotificationActions()

    const handleRegister = async (userData: RegisterRequest): Promise<AuthOperationResult> => {
        const result = await register(userData)

        if (!result.success) {
            showError(result.error ?? 'An unexpected error occurred')

            return { success: false, error: result.error ?? 'An unexpected error occurred' }
        }

        showSuccess('Registration successful! You can now log in.')

        return { success: true }
    }

    return {
        register: handleRegister,
        isLoading: loading,
        error,
        clearError
    }
}

export const useChangePasswordAction = () => {
    const { changePassword, loading, error, clearError } = useAuthContext()
    const { showSuccess, showError } = useNotificationActions()

    const handleChangePassword = async (data: ChangePasswordRequest): Promise<AuthOperationResult> => {
        const result = await changePassword(data)

        if (!result.success) {
            showError(result.error ?? 'An unexpected error occurred')

            return { success: false, error: result.error ?? 'An unexpected error occurred' }
        }

        showSuccess('Password changed successfully!')

        return { success: true }
    }

    return {
        changePassword: handleChangePassword,
        isLoading: loading,
        error,
        clearError
    }
}

export const useLogoutAction = () => {
    const { logout } = useAuthContext()
    const { showSuccess } = useNotificationActions()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        showSuccess('You have been successfully logged out')
        navigate('/login')
    }

    return { logout: handleLogout }
}