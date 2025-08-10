import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { FlexBox, LoadingSpinner } from '@/components/common'
import { useAuthContext } from '../contexts/AuthContext'
import { isUserAuthenticated } from '../utils/authStorage'

export const isAuthenticated = (): boolean => {
    return isUserAuthenticated()
}

interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const location = useLocation()
    const { isAuthenticated: isAuthFromContext, loading } = useAuthContext()

    if (loading) {
        return (
            <FlexBox direction="row" align="center" justify="center" className="h-screen">
                <LoadingSpinner label="Checking authentication..." />
            </FlexBox>
        )
    }

    const hasValidToken = isAuthenticated()
    const isAuth = isAuthFromContext && hasValidToken

    if (!isAuth) {
        return <Navigate to="/login" state={{ from: location.pathname }} />
    }

    return <>{children}</>
}

export default ProtectedRoute 