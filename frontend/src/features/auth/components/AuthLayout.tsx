import { Typography, Box, FlexBox } from '@/components/common'
import React from 'react'

interface AuthLayoutProps {
    children: React.ReactNode
    title?: string
    subtitle?: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title = 'QrBites',
    subtitle = 'Transform your restaurant menus into digital experiences'
}) => {
    return (
        <Box
            py="3xl"
            fullHeight
            className="min-h-screen bg-neutral-100 dark:bg-neutral-900 sm:px-6 lg:px-8"
        >
            <FlexBox
                direction="col"
                justify="center"
                className="h-full"
            >
                <Box className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Typography variant="title" align="center" color="neutral">
                        {title}
                    </Typography>
                    <Typography variant="caption" align="center" color="muted" className="mt-2">
                        {subtitle}
                    </Typography>
                </Box>

                <Box mt="2xl" className="sm:mx-auto sm:w-full sm:max-w-md">
                    {children}
                </Box>
            </FlexBox>
        </Box>
    )
}

export default AuthLayout 