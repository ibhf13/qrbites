import { Box, Card, Typography, Grid, IconButton, FlexBox } from '@/components/common'
import { CursorArrowRaysIcon, DevicePhoneMobileIcon, StarIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import React from 'react'

interface Benefit {
    icon: React.ReactNode
    title: string
    description: string
    highlighted?: boolean
}

const BenefitsSection: React.FC = () => {
    const benefits: Benefit[] = [
        {
            icon: <CursorArrowRaysIcon className="w-10 h-10 text-secondary-600 dark:text-secondary-400" />,
            title: 'Increased Efficiency',
            description: 'Reduce order errors and wait times with digital menus that customers can browse at their own pace.',
            highlighted: true
        },
        {
            icon: <DevicePhoneMobileIcon className="w-10 h-10 text-secondary-600 dark:text-secondary-400" />,
            title: 'Mobile Friendly',
            description: 'Responsive design ensures your menu looks great on any device, from smartphones to tablets.'
        },
        {
            icon: <StarIcon className="w-10 h-10 text-secondary-600 dark:text-secondary-400" />,
            title: 'Better Customer Experience',
            description: 'Enhance dining experience with visually appealing menus and convenient ordering options.'
        }
    ]

    return (
        <section className="section-warm py-24 lg:py-32">
            <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Box className="mb-16 text-center">
                    <Typography as="h2" variant="heading" className="mb-6">
                        Benefits for Your Business
                    </Typography>
                    <Typography
                        as="p"
                        variant="body"
                        color="muted"
                        className="max-w-3xl mx-auto text-xl leading-relaxed"
                    >
                        QrBites helps you improve operations while delighting your customers with modern dining experiences
                    </Typography>
                </Box>

                <Grid cols={1} colsMd={3} gap="xl" className="items-stretch">
                    {benefits.map((benefit, index) => (
                        <Card
                            key={index}
                            variant="earth"
                            padding="xl"
                            hoverEffect="lift"
                            className="flex flex-col items-center min-h-[400px] text-center group justify-center"
                            badges={benefit.highlighted ? [
                                {
                                    label: 'Popular',
                                    variant: 'filled',
                                    color: 'secondary',
                                    position: 'top-right'
                                }
                            ] : undefined}
                        >
                            <Box className="mb-8 p-6 bg-secondary-50 dark:bg-secondary-900/20 rounded-2xl group-hover:bg-secondary-100 dark:group-hover:bg-secondary-800/30 group-hover:scale-105 transition-all duration-300 w-full max-w-xs">
                                <FlexBox direction="row" align="center" justify="center" gap="md">
                                    {benefit.icon}
                                    <Typography as="h3" variant="subheading" className="text-lg font-bold text-secondary-700 dark:text-secondary-300 text-center">
                                        {benefit.title}
                                    </Typography>
                                </FlexBox>
                            </Box>
                            <Typography as="p" variant="body" color="muted" className="leading-relaxed flex-grow text-lg">
                                {benefit.description}
                            </Typography>
                            <Box className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <IconButton
                                    icon={ArrowRightIcon}
                                    size="md"
                                    variant="ghost"
                                    aria-label="Learn more"
                                />
                            </Box>
                        </Card>
                    ))}
                </Grid>
            </Box>
        </section>
    )
}

export default BenefitsSection 