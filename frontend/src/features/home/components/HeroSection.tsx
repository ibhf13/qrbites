import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography } from '@/components/common'

const HeroSection: React.FC = () => {
    const navigate = useNavigate()

    return (
        <section className="relative bg-mint py-24 lg:py-40 overflow-hidden">
            <Box className="absolute inset-0 bg-black/5" />
            <Box className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <Box className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

            <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Box className="max-w-5xl mx-auto text-center">
                    <Typography
                        as="h1"
                        variant="title"
                        className="text-white mb-8 tracking-tight"
                    >
                        Transform Your Restaurant Menu
                    </Typography>

                    <Typography
                        as="p"
                        variant="body"
                        className="text-white/90 mb-12 max-w-4xl mx-auto text-2xl leading-relaxed"
                    >
                        Create digital menus with QR codes in minutes. Enhance customer experience and streamline your operations.
                    </Typography>

                    <Box className="flex flex-col sm:flex-row justify-center gap-6 animate-scale-in">
                        <Button
                            variant="primary"
                            size="xl"
                            className="font-semibold hover-lift shadow-xl px-10 py-4"
                            onClick={() => navigate('/')}
                        >
                            Get Started Free
                        </Button>
                        <Button
                            variant="outline"
                            size="xl"
                            className="border-2 border-white text-white hover:bg-white hover:text-primary-600 backdrop-blur-sm px-10 py-4"
                            onClick={() => navigate('/login')}
                        >
                            Sign In
                        </Button>
                    </Box>

                    <Box className="mt-16 text-center">
                        <Typography as="p" variant="body" className="text-white/70 text-lg">
                            ✓ No credit card required • ✓ 14-day free trial • ✓ Setup in 5 minutes
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </section>
    )
}

export default HeroSection 