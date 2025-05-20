import { Card, Typography, Box, Grid, FlexBox } from '@/components/common'
import { ChartBarIcon, CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline'
import React from 'react'

interface Feature {
    icon: React.ReactNode
    title: string
    description: string
}

const FeaturesSection: React.FC = () => {
    const features: Feature[] = [
        {
            icon: <PlusIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />,
            title: 'Easy Setup',
            description: 'Create and customize your digital menu in minutes with our intuitive interface.'
        },
        {
            icon: <CheckCircleIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />,
            title: 'Real-time Updates',
            description: 'Update your menu anytime, anywhere. Changes reflect instantly for your customers.'
        },
        {
            icon: <ChartBarIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />,
            title: 'Analytics & Insights',
            description: 'Track menu performance and customer engagement with detailed analytics.'
        }
    ]

    return (
        <section className="section-soft py-24 lg:py-32">
            <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Box className="text-center mb-16">
                    <Typography as="h2" variant="heading" className="mb-6">
                        Why Choose QrBites?
                    </Typography>
                    <Typography
                        variant="body"
                        color="muted"
                        className="max-w-3xl mx-auto text-xl leading-relaxed"
                    >
                        Discover how our platform makes digital menu management effortless
                    </Typography>
                </Box>

                <Grid cols={1} colsMd={3} gap="xl" className="items-stretch">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            variant="fresh"
                            padding="xl"
                            hoverEffect="lift"
                            className="flex flex-col items-center text-center group min-h-[400px] justify-center"
                        >
                            <Box className="mb-8 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-2xl group-hover:bg-primary-100 dark:group-hover:bg-primary-800/30 group-hover:scale-105 transition-all duration-300 w-full max-w-xs">
                                <FlexBox direction="row" align="center" justify="center" gap="md">
                                    {feature.icon}
                                    <Typography as="h3" variant="subheading" className="text-lg font-bold text-primary-700 dark:text-primary-300">
                                        {feature.title}
                                    </Typography>
                                </FlexBox>
                            </Box>
                            <Typography as="p" variant="body" color="muted" className="leading-relaxed text-lg">
                                {feature.description}
                            </Typography>
                        </Card>
                    ))}
                </Grid>
            </Box>
        </section>
    )
}

export default FeaturesSection 