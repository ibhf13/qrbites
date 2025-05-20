import { Card, ErrorDisplay, Typography, Box } from '@/components/common'
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
            <Typography variant="heading" align="center" color="neutral" className="mb-6">
                {title}
            </Typography>

            {error && (
                <ErrorDisplay
                    message={error}
                    variant="banner"
                    className="mb-4"
                />
            )}

            {children}

            {footerContent && (
                <Box mt="xl" className="text-center">
                    {footerContent}
                </Box>
            )}
        </Card>
    )
}

export default AuthCard 