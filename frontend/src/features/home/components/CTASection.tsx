import { Box, Button, Typography, Grid, IconButton, Badge } from '@/components/common'
import { PlayIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import React from 'react'

const CTASection: React.FC = () => {
    return (
        <section className="relative bg-primary py-24 lg:py-40 overflow-hidden">
            <Box className="absolute inset-0 bg-black/10" />
            <Box className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <Box className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

            <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <Box className="text-center mb-16">
                    <Badge
                        label="Limited Time Offer"
                        variant="light"
                        className="mb-8 text-primary-600 bg-white/90 backdrop-blur-sm text-lg px-6 py-3"
                    />
                    <Typography as="h2" variant="title" className="text-white mb-8">
                        Ready to Digitize Your Menu?
                    </Typography>
                    <Typography
                        as="p"
                        variant="body"
                        className="text-white/90 mb-12 max-w-4xl mx-auto text-2xl leading-relaxed"
                    >
                        Join thousands of restaurants already using QrBites to enhance customer experience and boost sales
                    </Typography>
                </Box>

                <Grid cols={1} colsSm={2} gap="lg" className="justify-center items-center max-w-2xl mx-auto">
                    <Button
                        variant="primary"
                        size="xl"
                        className="font-semibold hover-lift shadow-xl transform hover:scale-105 transition-all duration-200 bg-white text-primary-600 hover:bg-neutral-50 px-12 py-5 text-lg"
                    >
                        Start Your Free Trial
                        <IconButton
                            icon={ArrowRightIcon}
                            size="sm"
                            variant="ghost"
                            className="ml-3 text-primary-600 p-0"
                        />
                    </Button>
                    <Button
                        variant="outline"
                        size="xl"
                        className="text-white border-2 border-white/30 hover:bg-white/10 backdrop-blur-sm transition-all duration-200 px-12 py-5 text-lg"
                    >
                        <IconButton
                            icon={PlayIcon}
                            size="sm"
                            variant="ghost"
                            className="mr-3 text-white p-0"
                        />
                        View Demo
                    </Button>
                </Grid>

                <Box className="mt-16 text-center">
                    <Typography as="p" variant="body" className="text-white/70 text-xl">
                        ✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime
                    </Typography>
                </Box>
            </Box>
        </section>
    )
}

export default CTASection 