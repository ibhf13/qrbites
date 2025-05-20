import React from 'react'
import { cn } from '@/utils/cn'
import { animations } from '@/utils/designTokenUtils'
import { Box, Typography } from '@/components/common'

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string
    error?: string
    onChange: (value: string) => void
    responsive?: boolean
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    responsive = true,
    className,
    onChange,
    children,
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
            <select
                className={cn(
                    'w-full border rounded-md appearance-none cursor-pointer',
                    'text-neutral-900 dark:text-neutral-100',
                    'bg-white dark:bg-neutral-800',
                    'bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K")] bg-no-repeat bg-[right_0.75rem_center] bg-[length:12px_8px]',
                    'dark:bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzY0NzQ4YiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K")]',
                    animations.focus,
                    animations.disabled,
                    animations.transition,
                    responsive ? 'px-3 py-2.5 pr-10 text-base sm:px-3 sm:py-2 sm:pr-10 sm:text-sm' : 'px-3 py-2 pr-10',
                    responsive && 'min-h-[44px] sm:min-h-[36px]',
                    {
                        'border-error-500 dark:border-error-400 focus-visible:ring-error-500': error,
                        'border-neutral-300 dark:border-neutral-600 focus-visible:ring-primary-500': !error
                    },
                    className
                )}
                onChange={(e) => onChange(e.target.value)}
                {...rest}
            >
                {children}
            </select>
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

export default Select