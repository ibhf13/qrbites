import { Card, Box, Typography, Grid, IconButton } from '@/components/common'
import { StarIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import React from 'react'

interface Testimonial {
    quote: string
    author: string
    role: string
    company: string
    rating: number
    featured?: boolean
}

const TestimonialsSection: React.FC = () => {
    const testimonials: Testimonial[] = [
        {
            quote: "QrBites transformed how we present our menu. Our customers love the digital experience, and we've seen a 20% increase in sales.",
            author: "Maria Rodriguez",
            role: "Restaurant Owner",
            company: "Taste of Italy",
            rating: 5,
            featured: true
        },
        {
            quote: "Updating our specials used to be a hassle. Now it takes seconds with QrBites, and changes show up instantly.",
            author: "James Chen",
            role: "Head Chef",
            company: "Urban Plate",
            rating: 5
        },
        {
            quote: "The analytics provided by QrBites helped us optimize our menu. We now know exactly which items perform best.",
            author: "Sarah Johnson",
            role: "Marketing Manager",
            company: "Coastal Bites",
            rating: 5
        }
    ]

    const renderStars = (rating: number) => {
        return (
            <Box className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <IconButton
                        key={i}
                        icon={i < rating ? StarIconSolid : StarIcon}
                        size="sm"
                        variant="ghost"
                        className={`p-0 ${i < rating ? 'text-accent-500' : 'text-neutral-300'} hover:scale-110 transition-transform duration-200`}
                        aria-label={`${i + 1} star${i + 1 !== 1 ? 's' : ''}`}
                    />
                ))}
            </Box>
        )
    }

    return (
        <section className="section-card py-24 lg:py-32">
            <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Box className="mb-16 text-center">
                    <Typography as="h2" variant="heading" className="mb-6">
                        What Our Customers Say
                    </Typography>
                    <Typography
                        as="p"
                        variant="body"
                        color="muted"
                        className="max-w-3xl mx-auto text-xl"
                    >
                        Join thousands of satisfied restaurant owners who've transformed their business with QrBites
                    </Typography>
                </Box>

                <Grid cols={1} colsMd={3} gap="xl" className="items-stretch">
                    {testimonials.map((testimonial, index) => (
                        <Card
                            key={index}
                            variant="warm"
                            padding="xl"
                            hoverEffect="lift"
                            className="flex flex-col h-full justify-between group min-h-[400px]"
                            badges={testimonial.featured ? [
                                {
                                    label: 'Featured',
                                    variant: 'filled',
                                    color: 'accent',
                                    position: 'top-right'
                                }
                            ] : undefined}
                        >
                            <Box className="flex-grow">
                                <Box className="mb-8">
                                    {renderStars(testimonial.rating)}
                                </Box>
                                <Typography
                                    as="p"
                                    variant="body"
                                    className="italic mb-8 text-xl leading-relaxed text-neutral-700"
                                >
                                    "{testimonial.quote}"
                                </Typography>
                            </Box>

                            <Box className="pt-6 border-t border-neutral-100">
                                <Box className="flex items-center justify-between">
                                    <Box className="text-center flex-grow">
                                        <Typography as="p" variant="body" className="font-semibold mb-2 text-neutral-900 text-lg">
                                            {testimonial.author}
                                        </Typography>
                                        <Typography as="p" variant="body" color="muted" className="text-base">
                                            {testimonial.role} • {testimonial.company}
                                        </Typography>
                                    </Box>
                                    <Box className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <IconButton
                                            icon={ArrowUpRightIcon}
                                            size="md"
                                            variant="ghost"
                                            aria-label="View case study"
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Card>
                    ))}
                </Grid>
            </Box>
        </section>
    )
}

export default TestimonialsSection 