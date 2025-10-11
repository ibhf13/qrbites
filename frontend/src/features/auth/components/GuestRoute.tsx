import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingSpinner, FlexBox } from '@/components/common'
import { useAuthContext } from '../contexts/AuthContext'

interface Props {
    children: React.ReactNode
}

const GuestRoute: React.FC<Props> = ({ children }) => {
    const location = useLocation()
    const { isAuthenticated, loading } = useAuthContext()

    if (loading) {
        return (
            <FlexBox justify="center" align="center" className="h-screen">
                <LoadingSpinner label="Checking authentication..." />
            </FlexBox>
        )
    }

    if (isAuthenticated) {
        const from = (location.state)?.from || '/'

        return <Navigate to={from} replace />
    }

    return <>{children}</>
}

export default GuestRoute