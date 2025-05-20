import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { AuthProtectionConfig, AuthProtectionState } from '../types/auth.types'


export const useAuthProtection = (config: AuthProtectionConfig = {}): AuthProtectionState => {
    const { protectionLevel = 'none', redirectPath = '/login' } = config
    const { isAuthenticated, user, loading } = useAuthContext()
    const navigate = useNavigate()
    const location = useLocation()
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false)

    useEffect(() => {
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

        if (!authorized && protectionLevel !== 'none') {
            const currentPath = location.pathname

            navigate(redirectPath, {
                replace: true,
                state: { from: currentPath }
            })
        }
    }, [isAuthenticated, user, loading, protectionLevel, navigate, redirectPath, location.pathname])

    return {
        isAuthorized,
        isLoading: loading
    }
} 