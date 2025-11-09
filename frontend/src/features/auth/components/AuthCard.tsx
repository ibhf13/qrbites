import { Card, Typography, Box, Divider } from '@/components/common'
import { ErrorDisplay } from '@/features/errorHandling/components'
import React from 'react'

interface AuthCardProps {
    children: React.ReactNode
    title: string
    error?: string | null
    oauthContent?: React.ReactNode
    footerContent?: React.ReactNode
    className?: string
}

const AuthCard: React.FC<AuthCardProps> = ({
    children,
    title,
    error,
    oauthContent,
    footerContent,
    className = ""
}) => {
    const formatError = (errorString: string) => {
        if (errorString.includes('\n')) {
            return errorString.split('\n').map((line, index) => (
                <Box key={index} className="text-sm">
                    {line}
                </Box>
            ))
        }

        return errorString
    }

    return (
        <Card className={`max-w-md w-full mx-auto ${className}`}>
            <Typography variant="heading" align="center" color="neutral" className="mb-6">
                {title}
            </Typography>

            {error && (
                <ErrorDisplay
                    message={formatError(error)}
                    variant="banner"
                    className="mb-4"
                />
            )}

            {children}

            {oauthContent && (
                <>
                    <Divider text="OR" className="my-6" />
                    <Box>
                        {oauthContent}
                    </Box>
                </>
            )}

            {footerContent && (
                <Box mt="xl" className="text-center">
                    {footerContent}
                </Box>
            )}
        </Card>
    )
}

export default AuthCard