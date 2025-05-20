import React, { ReactNode } from 'react'
import { Button, Card, Typography, Box, FlexBox } from '@/components/common'
import { ErrorTriangleIcon } from './Icon'
import { cn } from '@/utils/cn'

interface ErrorDisplayProps {
    title?: string
    message: ReactNode
    onRetry?: () => void
    icon?: React.ReactNode
    className?: string
    variant?: 'inline' | 'full' | 'banner' | 'minimal'
    actions?: ReactNode
    showIcon?: boolean
    retryText?: string
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    title = 'An error occurred',
    message,
    onRetry,
    icon,
    className,
    variant = 'inline',
    actions,
    showIcon = true,
    retryText = 'Try Again',
}) => {
    const defaultIcon = <ErrorTriangleIcon />

    const displayIcon = showIcon ? (icon || defaultIcon) : null

    switch (variant) {
        case 'full':
            return (
                <Box
                    p="2xl"
                    fullWidth
                    className={cn('min-h-[400px]', className)}
                >
                    <FlexBox
                        align="center"
                        justify="center"
                        className="h-full"
                    >
                        <Card variant="elevated" padding="xl" className="text-center max-w-md w-full">
                            {displayIcon && (
                                <Box
                                    mb="xl"
                                    mx="auto"
                                    rounded="full"
                                    className="w-16 h-16 bg-error-100 dark:bg-error-900/30"
                                >
                                    <FlexBox
                                        align="center"
                                        justify="center"
                                        className="h-full"
                                    >
                                        {displayIcon}
                                    </FlexBox>
                                </Box>
                            )}
                            <Typography as="h4" variant="heading" color="error" className="font-bold">
                                {title}
                            </Typography>
                            <Typography as="p" variant="body" color="muted" className="mb-6">
                                {message}
                            </Typography>
                            <FlexBox direction="col" justify="center" gap="md" responsive>
                                {onRetry && (
                                    <Button variant="primary" onClick={onRetry} className="w-full sm:w-auto">
                                        {retryText}
                                    </Button>
                                )}
                                {actions}
                            </FlexBox>
                        </Card>
                    </FlexBox>
                </Box>
            )

        case 'banner':
            return (
                <Card
                    variant="outlined"
                    className={cn(
                        'bg-error-50 dark:bg-error-950/20',
                        'border-error-200 dark:border-error-800',
                        'border-l-4 border-l-error-500',
                        className
                    )}
                    padding="md"
                >
                    <FlexBox align="start" justify="between">
                        <FlexBox align="start" gap="md" className="flex-1 min-w-0">
                            {displayIcon && (
                                <Box className="flex-shrink-0 mt-0.5">
                                    {displayIcon}
                                </Box>
                            )}
                            <Box className="flex-1 min-w-0">
                                <Typography as="h4" variant="heading" color="error" className="font-semibold">
                                    {title}
                                </Typography>
                                <Typography as="p" variant="body" color="error" className="leading-relaxed">
                                    {message}
                                </Typography>
                                {(onRetry || actions) && (
                                    <Box mt="md">
                                        <FlexBox wrap="wrap" gap="sm">
                                            {onRetry && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={onRetry}
                                                    className="border-error-300 text-error-700 hover:bg-error-100"
                                                >
                                                    {retryText}
                                                </Button>
                                            )}
                                            {actions}
                                        </FlexBox>
                                    </Box>
                                )}
                            </Box>
                        </FlexBox>
                    </FlexBox>
                </Card>
            )

        case 'minimal':
            return (
                <FlexBox align="center" justify="center" className={cn('text-center', className)}>
                    <FlexBox direction="col" align="center" gap="sm">
                        {displayIcon && (
                            <Box className="w-8 h-8 text-error-500 dark:text-error-400">
                                {displayIcon}
                            </Box>
                        )}
                        <Typography as="p" variant="caption" color="error" className="font-medium">
                            {typeof message === 'string' ? message : title}
                        </Typography>
                        {onRetry && (
                            <Button
                                size="xs"
                                variant="ghost"
                                onClick={onRetry}
                                className="text-error-600 hover:text-error-700"
                            >
                                {retryText}
                            </Button>
                        )}
                    </FlexBox>
                </FlexBox>
            )

        case 'inline':
        default:
            return (
                <Box className={cn(
                    'flex items-start space-x-3 p-3 rounded-lg',
                    'bg-error-50 dark:bg-error-950/20',
                    'border border-error-200 dark:border-error-800',
                    className
                )}>
                    {displayIcon && (
                        <Box className="flex-shrink-0 mt-0.5">
                            {displayIcon}
                        </Box>
                    )}
                    <Box className="flex-1 min-w-0">
                        <Typography as="h4" variant="heading" color="error" className="font-semibold">
                            {title}
                        </Typography>
                        <Typography as="p" variant="body" color="error" className="mt-1">
                            {message}
                        </Typography>
                        {(onRetry || actions) && (
                            <Box className="mt-3 flex items-center space-x-2">
                                {onRetry && (
                                    <Button
                                        size="xs"
                                        variant="ghost"
                                        onClick={onRetry}
                                        className="text-error-700 dark:text-error-300 hover:text-error-800 dark:hover:text-error-200 p-0 h-auto font-medium underline"
                                    >
                                        {retryText}
                                    </Button>
                                )}
                                {actions}
                            </Box>
                        )}
                    </Box>
                </Box>
            )
    }
}

export default ErrorDisplay