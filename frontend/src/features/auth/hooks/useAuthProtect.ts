import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type ProtectionLevel = 'auth' | 'guest' | 'admin' | 'none'

interface UseAuthProtectProps {
    protectionLevel?: ProtectionLevel
    redirectPath?: string
}

/**
 * Hook to protect routes based on authentication state
 * 
 * @param protectionLevel - Level of protection required
 *   - 'auth': User must be authenticated
 *   - 'guest': User must NOT be authenticated
 *   - 'admin': User must be authenticated and have admin role
 *   - 'none': No protection (default)
 * @param redirectPath - Path to redirect to if protection fails
 * @returns Object with isAuthorized and isLoading flags
 */
export const useAuthProtect = ({
    protectionLevel = 'none',
    redirectPath = '/login'
}: UseAuthProtectProps = {}) => {
    const { isAuthenticated, user, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false)

    useEffect(() => {
        // Don't check until auth is loaded
        if (loading) return

        let authorized = false

        switch (protectionLevel) {
            case 'auth':
                authorized = isAuthenticated
                break
            case 'guest':
                authorized = !isAuthenticated
                break
            case 'admin':
                authorized = isAuthenticated && user?.role === 'admin'
                break
            case 'none':
                authorized = true
                break
        }

        setIsAuthorized(authorized)

        // Redirect if not authorized
        if (!authorized && protectionLevel !== 'none') {
            const currentPath = location.pathname
            navigate(redirectPath, {
                replace: true,
                state: { from: currentPath }
            })
        }
    }, [isAuthenticated, user, loading, protectionLevel, navigate, redirectPath, location.pathname])

    return { isAuthorized, isLoading: loading }
} 