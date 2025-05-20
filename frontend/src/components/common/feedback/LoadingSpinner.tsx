import React from 'react'
import { Typography, Box } from '@/components/common'
import { SpinnerIcon } from './Icon'
import { getSpinnerSizes, type ColorVariant, type SizeVariant } from '@/utils/designTokenUtils'
import { cn } from '@/utils/cn'

interface LoadingSpinnerProps {
    size?: SizeVariant | '2xl'
    color?: ColorVariant | 'white' | 'current'
    className?: string
    label?: string
    showLabel?: boolean
    variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
    speed?: 'slow' | 'normal' | 'fast'
    thickness?: 'thin' | 'normal' | 'thick'
}

const spinnerSpeeds = {
    slow: 'animate-spin [animation-duration:2s]',
    normal: 'animate-spin',
    fast: 'animate-spin [animation-duration:0.5s]'
}

const spinnerThickness = {
    thin: { xs: '2', sm: '2', default: '2' },
    normal: { xs: '2', sm: '2', default: '3' },
    thick: { xs: '3', sm: '3', default: '4' }
}

const getSpinnerColorClass = (color: LoadingSpinnerProps['color']) => {
    if (color === 'white') return 'text-white'
    if (color === 'current') return 'text-current'

    return `text-${color}-600 dark:text-${color}-400`
}

const SpinnerVariant: React.FC<{
    size: string
    color: string
    speed: string
    thickness: string
}> = ({ size, color, speed, thickness }) => (
    <SpinnerIcon
        className={cn(speed, size, color)}
        thickness={thickness}
    />
)

const DotsVariant: React.FC<{
    size: string
    color: string
    speed: string
}> = ({ size, color, speed }) => (
    <Box className={cn('flex space-x-1', size)}>
        {[0, 1, 2].map((i) => (
            <Box
                key={i}
                className={cn(
                    'w-2 h-2 rounded-full animate-bounce',
                    color.replace('text-', 'bg-')
                )}
                style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: speed === 'fast' ? '0.6s' : speed === 'slow' ? '1.4s' : '1s'
                }}
            />
        ))}
    </Box>
)

const PulseVariant: React.FC<{
    size: string
    color: string
    speed: string
}> = ({ size, color, speed }) => (
    <Box className={cn(size, 'relative')}>
        <Box
            className={cn(
                'absolute inset-0 rounded-full animate-ping opacity-75',
                color.replace('text-', 'bg-')
            )}
            style={{
                animationDuration: speed === 'fast' ? '0.5s' : speed === 'slow' ? '2s' : '1s'
            }}
        />
        <Box className={cn('relative w-full h-full rounded-full', color.replace('text-', 'bg-'))} />
    </Box>
)

const BarsVariant: React.FC<{
    size: string
    color: string
    speed: string
}> = ({ size, color, speed }) => (
    <Box className={cn('flex items-end space-x-1', size)}>
        {[0, 1, 2, 3].map((i) => (
            <Box
                key={i}
                className={cn('w-1 animate-pulse', color.replace('text-', 'bg-'))}
                style={{
                    height: `${25 + (i % 2) * 50}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: speed === 'fast' ? '0.6s' : speed === 'slow' ? '1.4s' : '1s'
                }}
            />
        ))}
    </Box>
)

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'primary',
    className,
    label,
    showLabel = true,
    variant = 'spinner',
    speed = 'normal',
    thickness = 'normal',
}) => {
    const spinnerSizes = getSpinnerSizes(size)
    const sizeClasses = variant === 'spinner' ? spinnerSizes.spinner : spinnerSizes.other
    const colorClasses = getSpinnerColorClass(color)
    const speedClasses = spinnerSpeeds[speed]
    const isSmall = size === 'xs' || size === 'sm'
    const thicknessValue = spinnerThickness[thickness][isSmall ? 'xs' : 'default']

    const renderVariant = () => {
        const props = {
            size: sizeClasses,
            color: colorClasses,
            speed: speedClasses,
            thickness: thicknessValue
        }

        switch (variant) {
            case 'dots':
                return <DotsVariant {...props} />
            case 'pulse':
                return <PulseVariant {...props} />
            case 'bars':
                return <BarsVariant {...props} />
            case 'spinner':
            default:
                return <SpinnerVariant {...props} />
        }
    }

    return (
        <Box
            className={cn('inline-flex flex-col items-center justify-center', className)}
            role="status"
            aria-live="polite"
            aria-label={label || 'Loading...'}
        >
            {renderVariant()}

            {label && showLabel && (
                <Typography
                    as="p"
                    variant="body"
                    color="muted"
                    className="mt-3 text-center max-w-xs"
                    aria-hidden="true"
                >
                    {label}
                </Typography>
            )}

            <span className="sr-only">
                {label || 'Loading content, please wait...'}
            </span>
        </Box>
    )
}

export default LoadingSpinner