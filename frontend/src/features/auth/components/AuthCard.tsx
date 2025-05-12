import { Card, ErrorDisplay } from '@/components/common'
import React from 'react'

interface AuthCardProps {
    children: React.ReactNode
    title: string
    error?: string | null
    footerContent?: React.ReactNode
}

const AuthCard: React.FC<AuthCardProps> = ({
    children,
    title,
    error,
    footerContent
}) => {
    return (
        <Card className="max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{title}</h2>

            {error && (
                <ErrorDisplay
                    message={error}
                    variant="banner"
                    className="mb-4"
                />
            )}

            {children}

            {footerContent && (
                <div className="mt-6 text-center">
                    {footerContent}
                </div>
            )}
        </Card>
    )
}

export default AuthCard 