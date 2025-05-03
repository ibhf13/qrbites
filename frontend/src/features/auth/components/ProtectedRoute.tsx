import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Helper function to check if user is authenticated with token
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    const isAuth = !!token

    // Log auth state for debugging
    console.log('Auth check - token present:', isAuth)

    return isAuth
}

interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const location = useLocation()
    // Use the context directly which is tied to the authentication state
    const { isAuthenticated: isAuthFromContext, loading } = useAuth()

    // If the auth system is still loading, show nothing
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    // Double-check the token is still there - belt and suspenders approach
    const hasValidToken = isAuthenticated()
    const isAuth = isAuthFromContext && hasValidToken

    console.log(`Protected route [${location.pathname}] - Auth check:`, isAuth,
        { contextAuth: isAuthFromContext, tokenAuth: hasValidToken })

    // Redirect to login if not authenticated
    if (!isAuth) {
        return <Navigate to="/login" state={{ from: location.pathname }} />
    }

    // Render children if authenticated
    return <>{children}</>
}

export default ProtectedRoute 