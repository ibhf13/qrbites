import React from 'react'
import { Typography, Box, Card } from '@/components/common'
import { getSpinnerSizes } from '@/utils/designTokenUtils'
import { cn } from '@/utils/cn'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    label?: string
    subtitle?: string
    className?: string
}

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={cn('animate-spin', className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
        />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
    </svg>
)

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'lg',
    label = 'Loading Menu',
    subtitle = 'Preparing your digital menu experience...',
    className
}) => {
    const spinnerSizes = getSpinnerSizes(size)
    const spinnerClasses = spinnerSizes.spinner

    return (
        <Box className={cn('min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4', className)}>
            <Card
                variant="elevated"
                className="max-w-md w-full text-center"
                contentPadding="sm"
            >
                <Box className="flex-1 space-y-2.5">
                    <Box className="flex flex-col items-center gap-6">
                        <Box className="relative">
                            <SpinnerIcon className={cn(spinnerClasses, 'text-primary-600 dark:text-primary-400')} />
                        </Box>

                        <Box className="text-center space-y-2.5">
                            <Typography variant="heading" className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                                {label}
                            </Typography>
                            <Typography variant="body" className="text-sm text-slate-600 dark:text-slate-400">
                                {subtitle}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Card>
        </Box>
    )
}

export default LoadingSpinner