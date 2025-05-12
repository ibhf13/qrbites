import { ChartBarIcon, CheckCircleIcon, CursorArrowRaysIcon, DevicePhoneMobileIcon, PlusIcon, StarIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const HomePage: React.FC = () => {
    const features = [
        {
            icon: <PlusIcon className="w-8 h-8 text-primary-400" />,
            title: 'Easy Setup',
            description: 'Create and customize your digital menu in minutes with our intuitive interface.'
        },
        {
            icon: <CheckCircleIcon className="w-8 h-8 text-primary-400" />,
            title: 'Real-time Updates',
            description: 'Update your menu anytime, anywhere. Changes reflect instantly for your customers.'
        },
        {
            icon: <ChartBarIcon className="w-8 h-8 text-primary-400" />,
            title: 'Analytics & Insights',
            description: 'Track menu performance and customer engagement with detailed analytics.'
        }
    ]

    const benefits = [
        {
            icon: <CursorArrowRaysIcon className="w-8 h-8 text-secondary-400" />,
            title: 'Increased Efficiency',
            description: 'Reduce order errors and wait times with digital menus that customers can browse at their own pace.'
        },
        {
            icon: <DevicePhoneMobileIcon className="w-8 h-8 text-secondary-400" />,
            title: 'Mobile Friendly',
            description: 'Responsive design ensures your menu looks great on any device, from smartphones to tablets.'
        },
        {
            icon: <StarIcon className="w-8 h-8 text-secondary-400" />,
            title: 'Better Customer Experience',
            description: 'Enhance dining experience with visually appealing menus and convenient ordering options.'
        }
    ]

    const testimonials = [
        {
            quote: "QrBites transformed how we present our menu. Our customers love the digital experience, and we've seen a 20% increase in sales.",
            author: "Maria Rodriguez",
            role: "Restaurant Owner",
            company: "Taste of Italy"
        },
        {
            quote: "Updating our specials used to be a hassle. Now it takes seconds with QrBites, and changes show up instantly.",
            author: "James Chen",
            role: "Head Chef",
            company: "Urban Plate"
        },
        {
            quote: "The analytics provided by QrBites helped us optimize our menu. We now know exactly which items perform best.",
            author: "Sarah Johnson",
            role: "Marketing Manager",
            company: "Coastal Bites"
        }
    ]

    const navigate = useNavigate()

    return (
        <div className="min-h-screen section-bg">
            {/* Hero Section */}
            <div className="bg-gradient-primary py-20">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h1 className="text-white drop-shadow-lg">Transform Your Restaurant Menu</h1>
                    <p className="text-xl text-white/90 mb-8">Create digital menus with QR codes in minutes. Enhance customer experience and streamline your operations.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="modern-btn" onClick={() => navigate('/dashboard')}>Get Started Free</button>
                        <button className="modern-btn-accent" onClick={() => navigate('/login')}>Sign In</button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="section-alt py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-center mb-12">Why Choose QrBites?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="modern-card flex flex-col items-center text-center">
                                <div className="mb-4">{feature.icon}</div>
                                <h3 className="mb-2 text-neutral-800">{feature.title}</h3>
                                <p className="text-neutral-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Showcase Section */}
            <div className="section-bg py-16">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                    <div className="modern-card flex items-center justify-center min-h-[260px]">
                        <span className="text-primary-400 text-xl">Menu Preview</span>
                    </div>
                    <div>
                        <h3 className="mb-4 text-primary-600">Create Beautiful Digital Menus</h3>
                        <ul className="space-y-4">
                            {[
                                'Drag-and-drop menu builder with live preview',
                                'Add high-quality photos to showcase your dishes',
                                'Organize items into categories and highlight specials',
                                'Display allergen information and dietary preferences',
                                'Customizable themes to match your brand'
                            ].map((item, i) => (
                                <li key={i} className="flex items-start text-neutral-700">
                                    <CheckCircleIcon className="w-5 h-5 text-primary-400 mr-2 flex-shrink-0 mt-1" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="section-alt py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-center mb-4">Benefits for Your Business</h2>
                    <p className="text-center text-primary-500 mb-12">QrBites helps you improve operations while delighting your customers</p>
                    <div className="grid md:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="modern-card flex flex-col items-center text-center">
                                <div className="mb-4">{benefit.icon}</div>
                                <h3 className="mb-2 text-neutral-800">{benefit.title}</h3>
                                <p className="text-neutral-600">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="section-bg py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-center mb-12">What Our Customers Say</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="modern-card flex flex-col h-full justify-between">
                                <div className="mb-4 text-primary-400 flex">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} className="w-5 h-5 fill-current" />
                                    ))}
                                </div>
                                <p className="italic mb-4 flex-grow text-neutral-700">"{testimonial.quote}"</p>
                                <div>
                                    <span className="font-semibold text-neutral-800">{testimonial.author}</span>
                                    <div className="text-sm text-neutral-500">{testimonial.role}, {testimonial.company}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary-200 py-16">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h2 className="text-neutral-900 mb-4">Ready to Digitize Your Menu?</h2>
                    <p className="text-lg text-neutral-900/80 mb-8">Join thousands of restaurants already using QrBites to enhance customer experience and boost sales</p>
                    <button className="modern-btn">Start Your Free Trial</button>
                </div>
            </div>
        </div>
    )
}

export default HomePage 