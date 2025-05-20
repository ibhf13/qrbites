import React from 'react'
import {
    BenefitsSection,
    CTASection,
    FeaturesSection,
    HeroSection,
    ProductShowcaseSection,
    TestimonialsSection
} from '../components'
import { Box } from '@/components/common'

const HomePage: React.FC = () => {
    return (
        <Box className="min-h-screen">
            <HeroSection />
            <FeaturesSection />
            <ProductShowcaseSection />
            <BenefitsSection />
            <TestimonialsSection />
            <CTASection />
        </Box>
    )
}

export default HomePage 