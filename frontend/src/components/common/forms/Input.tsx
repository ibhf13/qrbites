import React from 'react'
import { cn } from '@/utils/cn'
import { animations } from '@/utils/designTokenUtils'
import { Box, Typography } from '@/components/common'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    responsive?: boolean
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    responsive = true,
    className,
    ...rest
}) => {
    return (
        <Box fullWidth>
            {label && (
                <Typography
                    variant="caption"
                    color="neutral"
                    className={cn('block mb-1')}
                >
                    {label}
                </Typography>
            )}
            <input
                className={cn(
                    'w-full border rounded-md',
                    'text-neutral-900 dark:text-neutral-100',
                    'bg-white dark:bg-neutral-800',
                    'placeholder-neutral-400 dark:placeholder-neutral-500',
                    animations.focus,
                    animations.disabled,
                    animations.transition,
                    responsive ? 'px-3 py-2.5 text-base sm:px-3 sm:py-2 sm:text-sm' : 'px-3 py-2',
                    responsive && 'min-h-[44px] sm:min-h-[36px]',
                    {
                        'border-error-500 dark:border-error-400 focus-visible:ring-error-500': error,
                        'border-neutral-300 dark:border-neutral-600 focus-visible:ring-primary-500': !error
                    },
                    className
                )}
                {...rest}
            />
            {error && (
                <Typography
                    variant="caption"
                    color="error"
                    className={cn('mt-1')}
                >
                    {error}
                </Typography>
            )}
        </Box>
    )
}

export default Input