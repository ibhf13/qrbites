import React from 'react'
import {
    Button,
    Card,
    Col,
    Container,
    ErrorDisplay,
    FormInput,
    LoadingSpinner,
    Row
} from '../components/common'

const DesignSystem: React.FC = () => {
    return (
        <div className="py-10">
            <Container>
                <div className="pb-12 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">QrBites Design System</h1>
                    <p className="text-xl text-gray-500">A comprehensive collection of reusable components built with Tailwind CSS</p>
                </div>

                {/* Color Palette */}
                <section className="py-12 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Color Palette</h2>

                    <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Colors</h3>
                    <Row gapX="2" gapY="2" className="mb-8">
                        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                            <Col key={shade} span={6} sm={4} md={3} lg={2}>
                                <div className="flex flex-col h-24">
                                    <div
                                        className={`bg-primary-${shade} h-full rounded-md shadow-sm`}
                                    ></div>
                                    <div className="mt-2 text-xs">
                                        <div>primary-{shade}</div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    <h3 className="text-lg font-medium text-gray-900 mb-4">Secondary Colors</h3>
                    <Row gapX="2" gapY="2" className="mb-8">
                        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                            <Col key={shade} span={6} sm={4} md={3} lg={2}>
                                <div className="flex flex-col h-24">
                                    <div
                                        className={`bg-secondary-${shade} h-full rounded-md shadow-sm`}
                                    ></div>
                                    <div className="mt-2 text-xs">
                                        <div>secondary-{shade}</div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    <h3 className="text-lg font-medium text-gray-900 mb-4">Accent Colors</h3>
                    <Row gapX="2" gapY="2" className="mb-8">
                        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                            <Col key={shade} span={6} sm={4} md={3} lg={2}>
                                <div className="flex flex-col h-24">
                                    <div
                                        className={`bg-accent-${shade} h-full rounded-md shadow-sm`}
                                    ></div>
                                    <div className="mt-2 text-xs">
                                        <div>accent-{shade}</div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </section>

                {/* Typography */}
                <section className="py-12 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Typography</h2>

                    <Card className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Headings</h3>
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-5xl font-display">Heading 1 (5xl)</h1>
                                <p className="text-sm text-gray-500 mt-1">Font: Poppins, 3rem (48px)</p>
                            </div>
                            <div>
                                <h2 className="text-4xl font-display">Heading 2 (4xl)</h2>
                                <p className="text-sm text-gray-500 mt-1">Font: Poppins, 2.25rem (36px)</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-display">Heading 3 (3xl)</h3>
                                <p className="text-sm text-gray-500 mt-1">Font: Poppins, 1.875rem (30px)</p>
                            </div>
                            <div>
                                <h4 className="text-2xl font-display">Heading 4 (2xl)</h4>
                                <p className="text-sm text-gray-500 mt-1">Font: Poppins, 1.5rem (24px)</p>
                            </div>
                            <div>
                                <h5 className="text-xl font-display">Heading 5 (xl)</h5>
                                <p className="text-sm text-gray-500 mt-1">Font: Poppins, 1.25rem (20px)</p>
                            </div>
                            <div>
                                <h6 className="text-lg font-display">Heading 6 (lg)</h6>
                                <p className="text-sm text-gray-500 mt-1">Font: Poppins, 1.125rem (18px)</p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Body Text</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-base">
                                    Body text (base) - This is a paragraph of text. It uses the base font size and includes a mix of
                                    <strong className="font-semibold"> bold text</strong>,
                                    <em className="italic"> italic text</em>, and
                                    <a href="#" className="text-primary-600 hover:text-primary-800"> hyperlinks</a>.
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Font: Inter, 1rem (16px)</p>
                            </div>

                            <div>
                                <p className="text-sm">
                                    Small text (sm) - This is a smaller paragraph used for less important information.
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Font: Inter, 0.875rem (14px)</p>
                            </div>

                            <div>
                                <p className="text-xs">
                                    Extra small text (xs) - Used for captions, footnotes, and other auxiliary content.
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Font: Inter, 0.75rem (12px)</p>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Buttons */}
                <section className="py-12 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Buttons</h2>

                    <Card className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Button Variants</h3>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="primary">Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="accent">Accent</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                        </div>
                    </Card>

                    <Card className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Button Sizes</h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            <Button size="xs">Extra Small</Button>
                            <Button size="sm">Small</Button>
                            <Button size="md">Medium</Button>
                            <Button size="lg">Large</Button>
                            <Button size="xl">Extra Large</Button>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Button States</h3>
                        <div className="flex flex-wrap gap-4">
                            <Button>Default</Button>
                            <Button disabled>Disabled</Button>
                            <Button isLoading>Loading</Button>
                            <Button
                                leftIcon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                }
                            >
                                With Icon
                            </Button>
                            <Button isFullWidth>Full Width</Button>
                        </div>
                    </Card>
                </section>

                {/* Forms */}
                <section className="py-12 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Components</h2>

                    <Card>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Form Inputs</h3>
                        <div className="space-y-4 max-w-md">
                            <FormInput
                                label="Text Input"
                                placeholder="Enter your text"
                                helperText="This is a standard text input"
                            />

                            <FormInput
                                label="Text Input with Error"
                                placeholder="Enter your text"
                                error="This field is required"
                            />

                            <FormInput
                                label="Disabled Input"
                                placeholder="Disabled input"
                                disabled
                            />

                            <FormInput
                                label="Input with Icon"
                                placeholder="Search..."
                                leftIcon={
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                }
                            />
                        </div>
                    </Card>
                </section>

                {/* Cards */}
                <section className="py-12 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Cards</h2>

                    <Row gapX="6" gapY="6">
                        <Col span={12} md={6}>
                            <Card
                                title="Card with Title"
                                subtitle="This is a subtitle"
                            >
                                <p>This is a basic card with a title and subtitle.</p>
                            </Card>
                        </Col>

                        <Col span={12} md={6}>
                            <Card
                                title="Card with Footer"
                                footer={
                                    <div className="flex justify-end">
                                        <Button variant="outline" className="mr-2">Cancel</Button>
                                        <Button>Save</Button>
                                    </div>
                                }
                            >
                                <p>This card has a footer with actions.</p>
                            </Card>
                        </Col>

                        <Col span={12} md={6}>
                            <Card
                                title="Card with Action"
                                headerAction={<Button size="sm" variant="ghost">View All</Button>}
                            >
                                <p>This card has an action in the header.</p>
                            </Card>
                        </Col>

                        <Col span={12} md={6}>
                            <Card variant="outlined">
                                <p>This is an outlined card without a header or footer.</p>
                            </Card>
                        </Col>
                    </Row>
                </section>

                {/* Feedback */}
                <section className="py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Feedback Components</h2>

                    <Card className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Loading Spinners</h3>
                        <div className="flex flex-wrap gap-8 items-center">
                            <LoadingSpinner size="xs" label="Loading..." />
                            <LoadingSpinner size="sm" />
                            <LoadingSpinner size="md" color="secondary" />
                            <LoadingSpinner size="lg" color="accent" />
                            <LoadingSpinner size="xl" />
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Error Displays</h3>
                        <div className="space-y-6">
                            <ErrorDisplay
                                message="Something went wrong. Please try again later."
                                variant="inline"
                                onRetry={() => alert('Retry clicked')}
                            />

                            <ErrorDisplay
                                title="Connection Error"
                                message="Could not connect to the server. Please check your internet connection."
                                variant="banner"
                                onRetry={() => alert('Retry clicked')}
                            />

                            <div className="h-60 border border-gray-200 rounded-lg">
                                <ErrorDisplay
                                    title="Data Not Found"
                                    message="We couldn't find the requested data."
                                    variant="full"
                                    onRetry={() => alert('Retry clicked')}
                                />
                            </div>
                        </div>
                    </Card>
                </section>
            </Container>
        </div>
    )
}

export default DesignSystem 