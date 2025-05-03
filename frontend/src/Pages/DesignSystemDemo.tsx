import React from 'react'
import { Badge, Button, Card, Col, Container, Row, Typography } from '../components/common'
import ThemeToggle from '../components/common/buttons/ThemeToggle'
import Skeleton from '../components/common/feedback/Skeleton'

export const DesignSystemDemo: React.FC = () => {
    return (
        <div className="min-h-screen py-8 bg-neutral-50 dark:bg-gray-900 transition-colors duration-200">
            <Container>
                <div className="flex justify-between items-center mb-8">
                    <Typography variant="h1" color="primary">QrBites Design System</Typography>
                    <ThemeToggle />
                </div>

                {/* Color Palette */}
                <section className="mb-12">
                    <Typography variant="h2" gutterBottom>Color Palette</Typography>
                    <Typography variant="body1" gutterBottom>Our color system showcases the primary, secondary, accent, and neutral colors.</Typography>

                    <Typography variant="h5" className="mt-6 mb-3">Primary Colors</Typography>
                    <Row>
                        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                            <Col key={shade} span={6} sm={4} md={3} lg={2}>
                                <div className="mb-4">
                                    <div
                                        className={`bg-primary-${shade} h-16 rounded-md mb-1`}
                                        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                                    ></div>
                                    <Typography variant="caption">{shade}</Typography>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    <Typography variant="h5" className="mt-6 mb-3">Secondary Colors</Typography>
                    <Row>
                        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                            <Col key={shade} span={6} sm={4} md={3} lg={2}>
                                <div className="mb-4">
                                    <div
                                        className={`bg-secondary-${shade} h-16 rounded-md mb-1`}
                                        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                                    ></div>
                                    <Typography variant="caption">{shade}</Typography>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </section>

                {/* Typography */}
                <section className="mb-12">
                    <Typography variant="h2" gutterBottom>Typography</Typography>
                    <Typography variant="body1" gutterBottom>Our typography system uses a consistent set of fonts, sizes, and weights.</Typography>

                    <div className="space-y-4 mt-6">
                        <Typography variant="h1">Heading 1 (H1)</Typography>
                        <Typography variant="h2">Heading 2 (H2)</Typography>
                        <Typography variant="h3">Heading 3 (H3)</Typography>
                        <Typography variant="h4">Heading 4 (H4)</Typography>
                        <Typography variant="h5">Heading 5 (H5)</Typography>
                        <Typography variant="h6">Heading 6 (H6)</Typography>
                        <Typography variant="subtitle1">Subtitle 1</Typography>
                        <Typography variant="subtitle2">Subtitle 2</Typography>
                        <Typography variant="body1">Body 1 - Regular paragraph text</Typography>
                        <Typography variant="body2">Body 2 - Smaller paragraph text</Typography>
                        <Typography variant="caption">Caption text</Typography>
                        <Typography variant="overline">OVERLINE TEXT</Typography>
                    </div>
                </section>

                {/* Buttons */}
                <section className="mb-12">
                    <Typography variant="h2" gutterBottom>Buttons</Typography>
                    <Typography variant="body1" gutterBottom>Button components for actions and navigation.</Typography>

                    <Typography variant="h5" className="mt-6 mb-3">Button Variants</Typography>
                    <div className="flex flex-wrap gap-4 mb-8">
                        <Button>Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="accent">Accent</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="link">Link</Button>
                    </div>

                    <Typography variant="h5" className="mt-6 mb-3">Button Sizes</Typography>
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <Button size="xs">Extra Small</Button>
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                        <Button size="xl">XL</Button>
                    </div>

                    <Typography variant="h5" className="mt-6 mb-3">Button States</Typography>
                    <div className="flex flex-wrap gap-4">
                        <Button isLoading>Loading</Button>
                        <Button disabled>Disabled</Button>
                    </div>
                </section>

                {/* Badges */}
                <section className="mb-12">
                    <Typography variant="h2" gutterBottom>Badges</Typography>
                    <Typography variant="body1" gutterBottom>Badge components for status, count, and category information.</Typography>

                    <Typography variant="h5" className="mt-6 mb-3">Badge Variants</Typography>
                    <div className="flex flex-wrap gap-4 mb-8">
                        <Badge label="Default" />
                        <Badge label="Outlined" variant="outlined" />
                        <Badge label="Light" variant="light" />
                    </div>

                    <Typography variant="h5" className="mt-6 mb-3">Badge Colors</Typography>
                    <div className="flex flex-wrap gap-4 mb-8">
                        <Badge label="Primary" color="primary" />
                        <Badge label="Secondary" color="secondary" />
                        <Badge label="Accent" color="accent" />
                        <Badge label="Success" color="success" />
                        <Badge label="Warning" color="warning" />
                        <Badge label="Error" color="error" />
                        <Badge label="Info" color="info" />
                    </div>
                </section>

                {/* Cards */}
                <section className="mb-12">
                    <Typography variant="h2" gutterBottom>Cards</Typography>
                    <Typography variant="body1" gutterBottom>Card components for grouping related content.</Typography>

                    <Row spacing={6}>
                        <Col span={12} md={6} lg={4}>
                            <Card className="mb-4">
                                <div className="p-6">
                                    <Typography variant="h4" gutterBottom>Card Title</Typography>
                                    <Typography variant="body1">
                                        This is a sample card with some content. Cards are used to group related information.
                                    </Typography>
                                </div>
                            </Card>
                        </Col>
                        <Col span={12} md={6} lg={4}>
                            <Card className="mb-4">
                                <div className="p-6">
                                    <Typography variant="h4" gutterBottom>Interactive Card</Typography>
                                    <Typography variant="body1" className="mb-4">
                                        Cards can contain interactive elements like buttons.
                                    </Typography>
                                    <Button>Learn More</Button>
                                </div>
                            </Card>
                        </Col>
                        <Col span={12} md={6} lg={4}>
                            <Card className="mb-4">
                                <div className="p-6">
                                    <Typography variant="h4" gutterBottom>Status Card</Typography>
                                    <Typography variant="body1" className="mb-4">
                                        Cards can include status indicators.
                                    </Typography>
                                    <Badge label="Completed" color="success" variant="light" />
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </section>

                {/* Grid System */}
                <section className="mb-12">
                    <Typography variant="h2" gutterBottom>Grid System</Typography>
                    <Typography variant="body1" gutterBottom>Our responsive grid system is based on a 12-column layout.</Typography>

                    <div className="mt-6">
                        <Typography variant="h5" className="mb-3">Basic Grid</Typography>
                        <Row className="mb-6">
                            <Col span={12}>
                                <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-md text-center">span=12</div>
                            </Col>
                        </Row>
                        <Row className="mb-6">
                            <Col span={6}>
                                <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-md text-center">span=6</div>
                            </Col>
                            <Col span={6}>
                                <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-md text-center">span=6</div>
                            </Col>
                        </Row>
                        <Row className="mb-6">
                            <Col span={4}>
                                <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-md text-center">span=4</div>
                            </Col>
                            <Col span={4}>
                                <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-md text-center">span=4</div>
                            </Col>
                            <Col span={4}>
                                <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-md text-center">span=4</div>
                            </Col>
                        </Row>
                        <Row className="mb-6">
                            <Col span={3}>
                                <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-md text-center">span=3</div>
                            </Col>
                            <Col span={3}>
                                <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-md text-center">span=3</div>
                            </Col>
                            <Col span={3}>
                                <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-md text-center">span=3</div>
                            </Col>
                            <Col span={3}>
                                <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-md text-center">span=3</div>
                            </Col>
                        </Row>

                        <Typography variant="h5" className="mt-6 mb-3">Responsive Grid</Typography>
                        <Row className="mb-6">
                            <Col span={12} md={6} lg={4}>
                                <div className="bg-secondary-100 dark:bg-secondary-900 p-4 rounded-md text-center mb-4">
                                    span=12 md=6 lg=4
                                </div>
                            </Col>
                            <Col span={12} md={6} lg={4}>
                                <div className="bg-secondary-100 dark:bg-secondary-900 p-4 rounded-md text-center mb-4">
                                    span=12 md=6 lg=4
                                </div>
                            </Col>
                            <Col span={12} md={12} lg={4}>
                                <div className="bg-secondary-100 dark:bg-secondary-900 p-4 rounded-md text-center mb-4">
                                    span=12 md=12 lg=4
                                </div>
                            </Col>
                        </Row>
                    </div>
                </section>

                {/* Loading States */}
                <section className="mb-12">
                    <Typography variant="h2" gutterBottom>Loading States</Typography>
                    <Typography variant="body1" gutterBottom>Components for representing loading states.</Typography>

                    <Typography variant="h5" className="mt-6 mb-3">Skeleton Loaders</Typography>
                    <Row>
                        <Col span={12} md={6}>
                            <Card className="mb-4">
                                <div className="p-6">
                                    <Skeleton variant="text" height="24px" className="mb-2" />
                                    <Skeleton variant="text" height="16px" className="mb-2" />
                                    <Skeleton variant="text" height="16px" className="mb-2" />
                                    <Skeleton variant="text" height="16px" className="mb-4" />
                                    <Skeleton variant="rectangular" height="150px" className="mb-2" />
                                </div>
                            </Card>
                        </Col>
                        <Col span={12} md={6}>
                            <Card className="mb-4">
                                <div className="p-6">
                                    <div className="flex items-center mb-4">
                                        <Skeleton variant="circular" width="50px" height="50px" className="mr-4" />
                                        <div className="flex-1">
                                            <Skeleton variant="text" height="18px" className="mb-2" />
                                            <Skeleton variant="text" height="14px" width="60%" />
                                        </div>
                                    </div>
                                    <Skeleton variant="text" height="16px" className="mb-2" />
                                    <Skeleton variant="text" height="16px" className="mb-2" />
                                    <Skeleton variant="text" height="16px" className="mb-4" />
                                    <div className="flex justify-end">
                                        <Skeleton variant="rectangular" width="80px" height="32px" className="rounded-md" />
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </section>
            </Container>
        </div>
    )
}

export default DesignSystemDemo 