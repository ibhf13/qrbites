import { Box, Card, Typography, Badge, Grid, FlexBox } from '@/components/common'
import { CheckCircleIcon, DevicePhoneMobileIcon, SparklesIcon } from '@heroicons/react/24/outline'
import React from 'react'

const ProductShowcaseSection: React.FC = () => {
    const features = [
        'Drag-and-drop menu builder with live preview',
        'Add high-quality photos to showcase your dishes',
        'Organize items into categories and highlight specials',
        'Display allergen information and dietary preferences',
        'Customizable themes to match your brand'
    ]

    return (
        <section className="section-card py-24 lg:py-32">
            <Box className="flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6">
                <Grid cols={1} colsLg={2} gap="2xl" className="items-center justify-center ">
                    <Card
                        variant="warm"
                        padding="xl"
                        hoverEffect="lift"
                        className="min-h-[500px]"
                        badges={[
                            {
                                label: 'Live Demo',
                                variant: 'filled',
                                color: 'accent',
                                position: 'top-right'
                            }
                        ]}
                        actions={[
                            {
                                icon: SparklesIcon,
                                label: 'Try Demo',
                                onClick: () => console.log('Demo clicked'),
                                variant: 'primary'
                            }
                        ]}
                    >
                        <Box className="text-center h-full flex flex-col justify-center">
                            <Box className="p-8 bg-accent-50 dark:bg-accent-900/20 rounded-2xl mx-auto mb-8 shadow-lg group-hover:bg-accent-100 dark:group-hover:bg-accent-800/30 group-hover:scale-105 transition-all duration-300 max-w-md w-full">
                                <FlexBox direction="row" align="center" justify="center" gap="lg">
                                    <DevicePhoneMobileIcon className="w-12 h-12 text-accent-600 dark:text-accent-400" />
                                </FlexBox>
                                <Typography as="h4" variant="heading" className="font-bold text-xl text-accent-700 dark:text-accent-300">
                                    Menu Preview Demo
                                </Typography>
                            </Box>
                            <Typography as="p" variant="body" color="muted" className="text-xl mb-6">
                                Interactive menu showcase
                            </Typography>
                            <Badge
                                label="Click to interact"
                                variant="filled"
                                className="self-center"
                            />
                        </Box>
                    </Card>

                    <Box className="space-y-10">
                        <Box>
                            <Typography as="h2" variant="heading" color="primary" className="mb-8 text-3xl font-bold">
                                Create Beautiful Digital Menus
                            </Typography>
                            <Typography as="p" variant="body" color="muted" className="mb-10 text-xl leading-relaxed">
                                Build stunning, interactive menus that showcase your culinary creations and drive sales.
                            </Typography>
                        </Box>

                        <Box className="space-y-6">
                            {features.map((item, i) => (
                                <FlexBox key={i} direction="row" align="center" justify="start" gap="md">
                                    <CheckCircleIcon className="w-8 h-8 text-success flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200" />
                                    <Typography as="p" variant="body" color="muted" className="leading-relaxed text-lg">
                                        {item}
                                    </Typography>
                                </FlexBox>
                            ))}
                        </Box>
                    </Box>
                </Grid>
            </Box>
        </section>
    )
}

export default ProductShowcaseSection 