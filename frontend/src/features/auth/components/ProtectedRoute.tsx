import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { FlexBox, LoadingSpinner } from '@/components/common'
import { useAuthContext } from '../contexts/AuthContext'

interface Props {
    children: React.ReactNode
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
    const location = useLocation()
    const { isAuthenticated, loading } = useAuthContext()

    if (loading) {
        return (
            <FlexBox direction="row" align="center" justify="center" className="h-screen">
                <LoadingSpinner label="Checking authentication..." />
            </FlexBox>
        )
    }

    if (!isAuthenticated) {
        const from = location.pathname + location.search

        return <Navigate to="/login" state={{ from }} replace />
    }

    return <>{children}</>
}

export default ProtectedRoute

