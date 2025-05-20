import React from 'react'
import { Link } from 'react-router-dom'
import { PageContainer, Paper, Typography } from '@/components/common/layout'
import { Button } from '@/components/common/buttons'
import { Box, FlexBox } from '@/components/common'

const NotFoundPage: React.FC = () => {
    return (
        <PageContainer maxWidth="md" background="neutral" fullHeight centered>
            <Paper
                variant="elevated"
                padding="xl"
                className="text-center animate-fade-in bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
            >
                <Box mb="xl">
                    <Typography
                        variant="display"
                        color="primary"
                        align="center"
                        className="text-6xl font-display font-bold"
                    >
                        404
                    </Typography>
                    <Typography
                        variant="heading"
                        color="neutral"
                        align="center"
                        className="mt-4"
                    >
                        Page Not Found
                    </Typography>
                </Box>

                <Typography
                    variant="body"
                    color="muted"
                    align="center"
                    className="mb-8"
                >
                    The page you are looking for doesn't exist or has been moved.
                </Typography>

                <FlexBox direction="col" justify="center" gap="md" responsive>
                    <Link to="/">
                        <Button
                            variant="primary"
                            size="md"
                            className="w-full sm:w-auto"
                        >
                            Go Home
                        </Button>
                    </Link>

                    <Button
                        variant="secondary"
                        size="md"
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto"
                    >
                        Go Back
                    </Button>
                </FlexBox>
            </Paper>
        </PageContainer>
    )
}

export default NotFoundPage 