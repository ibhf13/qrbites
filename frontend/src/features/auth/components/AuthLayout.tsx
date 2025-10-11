import { Typography, FlexBox, Logo, Card, Box } from '@/components/common'
import useWindowSize from '@/hooks/useWindowSize'
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
    const { isMobile } = useWindowSize()

    return (
        <FlexBox className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 h-full dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 lg:p-8">
            <Card variant="earth" className="w-full h-full max-w-7xl mx-auto overflow-hidden" padding="none">
                <FlexBox className="min-h-[600px] lg:min-h-[700px]">
                    <FlexBox
                        direction="col"
                        align="center"
                        justify="center"
                        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

                        <FlexBox direction="col" align="center" className="overflow-hidden relative z-10 px-12 text-center">
                            <Logo size="xl" showText={false} className="mb-8 drop-shadow-2xl" />
                            <Typography variant="heading" className="text-white font-bold mb-4 text-4xl">
                                {title}
                            </Typography>
                            <Typography variant="subheading" className="text-white/90 mb-8 max-w-md leading-relaxed">
                                {subtitle}
                            </Typography>

                            <FlexBox direction="col" gap="sm" className="mt-8">
                                <FlexBox align="center" gap="sm" className="text-white/80">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                    <Typography variant="body" className="text-white/90">
                                        Upload menu photos instantly
                                    </Typography>
                                </FlexBox>
                                <FlexBox align="center" gap="sm" className="text-white/80">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                    <Typography variant="body" className="text-white/90">
                                        Generate QR codes automatically
                                    </Typography>
                                </FlexBox>
                                <FlexBox align="center" gap="sm" className="text-white/80">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                    <Typography variant="body" className="text-white/90">
                                        Manage multiple restaurants
                                    </Typography>
                                </FlexBox>
                            </FlexBox>
                        </FlexBox>
                    </FlexBox>

                    <FlexBox
                        direction="col"
                        align="center"
                        justify="center"
                        className="w-full lg:w-1/2 px-4 sm:px-6 lg:px-8 py-4"
                    >
                        {isMobile && (
                            <Box className="flex flex-col items-center justify-center gap-2 mb-4">
                                <Logo size="lg" className="flex flex-col items-center justify-center" />
                                <Typography variant="subheading" align="center" color="muted">
                                    {subtitle}
                                </Typography>
                            </Box>
                        )}
                        <FlexBox direction="col" align="center" className="w-full max-w-md">
                            {children}
                        </FlexBox>
                    </FlexBox>
                </FlexBox>
            </Card>
        </FlexBox>
    )
}

export default AuthLayout 