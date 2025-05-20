import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { animations } from '@/utils/designTokenUtils'
import { Box, Typography } from '@/components/common'

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
    responsive?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ label, error, responsive = true, className, ...rest }, ref) => {
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
                <textarea
                    ref={ref}
                    className={cn(
                        'w-full border rounded-md resize-vertical',
                        'text-neutral-900 dark:text-neutral-100',
                        'bg-white dark:bg-neutral-800',
                        'placeholder-neutral-400 dark:placeholder-neutral-500',
                        animations.focus,
                        animations.disabled,
                        animations.transition,
                        responsive ? 'px-3 py-2.5 text-base sm:px-3 sm:py-2 sm:text-sm' : 'px-3 py-2',
                        responsive && 'min-h-[100px] sm:min-h-[80px]',
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
)

TextArea.displayName = 'TextArea'

export default TextArea