import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingSpinner, FlexBox } from '@/components/common'
import { useAuthContext } from '../contexts/AuthContext'
import { isUserAuthenticated } from '../utils/authStorage'

interface GuestRouteProps {
    children: React.ReactNode
}


const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
    const location = useLocation()
    const { isAuthenticated: isAuthFromContext, loading } = useAuthContext()

    if (loading) {
        return (
            <FlexBox justify="center" align="center" className="h-screen">
                <LoadingSpinner
                    size="lg"
                    label="Checking authentication..."
                    showLabel={true}
                />
            </FlexBox>
        )
    }

    const hasValidToken = isUserAuthenticated()
    const isAuth = isAuthFromContext && hasValidToken

    if (isAuth) {
        const from = (location.state as any)?.from || '/'

        return <Navigate to={from} replace />
    }

    return <>{children}</>
}

export default GuestRoute 