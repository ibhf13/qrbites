import React from 'react'
import { Box, Button, FlexBox, Typography } from '@/components/common'

const HeroSection: React.FC = () => {

    return (
        <section className="relative bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 w-full min-h-screen overflow-hidden">
            <Box className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20 dark:to-black/20" />
            <Box className="absolute -top-40 -right-40 w-96 h-96 bg-primary-300/30 dark:bg-primary-500/10 rounded-full blur-3xl animate-float" />
            <Box className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

            <Box className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen py-20">
                <Box className="max-w-5xl mx-auto text-center space-y-8">
                    <FlexBox direction="col" align="center" justify="center" className="space-y-6">
                        <Typography
                            as="h1"
                            variant="title"
                            className="text-neutral-900 dark:text-white tracking-tight animate-fade-in-up"
                        >
                            Transform Your Restaurant Menu
                        </Typography>

                        <Typography
                            as="p"
                            variant="body"
                            className="text-neutral-700 dark:text-neutral-300 max-w-3xl mx-auto text-xl sm:text-2xl leading-relaxed animate-fade-in-up"
                            style={{ animationDelay: '0.1s' }}
                        >
                            Create digital menus with QR codes in minutes. Enhance customer experience and streamline your operations.
                        </Typography>
                    </FlexBox>

                    <Box className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 pt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <Button
                            variant="primary"
                            size="xl"
                            link="/register"
                            className="px-8 sm:px-10 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Get Started Free
                        </Button>
                        <Button
                            variant="outline"
                            size="xl"
                            link="/login"
                            className="px-8 sm:px-10 py-3 sm:py-4 border-2 border-primary-600 dark:border-primary-400 text-primary-700 dark:text-primary-300 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white transition-all duration-300"
                        >
                            Sign In
                        </Button>
                    </Box>

                    {/* Feature Highlights */}
                    <FlexBox
                        direction="row"
                        justify="center"
                        gap="md"
                        className="flex-wrap pt-8 animate-fade-in-up"
                        style={{ animationDelay: '0.3s' }}
                    >
                        <FlexBox align="center" gap="xs" className="px-4 py-2 rounded-full bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
                            <Typography as="span" variant="body" className="text-primary-700 dark:text-primary-400 font-medium">
                                ✓
                            </Typography>
                            <Typography as="span" variant="body" className="text-neutral-800 dark:text-neutral-200 text-sm sm:text-base">
                                Totally free
                            </Typography>
                        </FlexBox>
                        <FlexBox align="center" gap="xs" className="px-4 py-2 rounded-full bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
                            <Typography as="span" variant="body" className="text-primary-700 dark:text-primary-400 font-medium">
                                ✓
                            </Typography>
                            <Typography as="span" variant="body" className="text-neutral-800 dark:text-neutral-200 text-sm sm:text-base">
                                Setup in 5 minutes
                            </Typography>
                        </FlexBox>
                        <FlexBox align="center" gap="xs" className="px-4 py-2 rounded-full bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
                            <Typography as="span" variant="body" className="text-primary-700 dark:text-primary-400 font-medium">
                                ✓
                            </Typography>
                            <Typography as="span" variant="body" className="text-neutral-800 dark:text-neutral-200 text-sm sm:text-base">
                                No credit card required
                            </Typography>
                        </FlexBox>
                    </FlexBox>
                </Box>
            </Box>
        </section>
    )
}

export default HeroSection 