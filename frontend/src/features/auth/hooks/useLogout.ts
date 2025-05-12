import { useNotificationContext } from '@/contexts/NotificationContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Custom hook for handling user logout
 * Provides a clean way to handle logout with navigation and notifications
 */
export const useLogout = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const { showSuccess } = useNotificationContext()

    const handleLogout = () => {
        logout()
        showSuccess('You have been successfully logged out')
        navigate('/login')
    }

    return { logout: handleLogout }
} 