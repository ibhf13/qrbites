import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { Box, FlexBox, Typography } from '@/components/common'

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    helperText?: string
    error?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    containerClassName?: string
    labelClassName?: string
    inputClassName?: string
    helperClassName?: string
    errorClassName?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    (
        {
            label,
            helperText,
            error,
            leftIcon,
            rightIcon,
            containerClassName,
            labelClassName,
            inputClassName,
            helperClassName,
            errorClassName,
            id,
            disabled,
            className,
            ...rest
        },
        ref
    ) => {
        const inputId = id || Math.random().toString(36).substring(2, 9)

        return (
            <Box mb="md" className={containerClassName}>
                {label && (
                    <Typography
                        variant="caption"
                        color="neutral"
                        className={cn('block mb-1', labelClassName)}
                    >
                        {label}
                    </Typography>
                )}
                <Box className="relative" rounded="md">
                    {leftIcon && (
                        <FlexBox
                            align="center"
                            className="absolute inset-y-0 left-0 pl-3 pointer-events-none text-neutral-400 dark:text-neutral-500"
                        >
                            {leftIcon}
                        </FlexBox>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        className={cn(
                            'w-full rounded-md py-2 border',
                            'text-neutral-900 dark:text-neutral-100',
                            'bg-white dark:bg-neutral-800',
                            'placeholder-neutral-400 dark:placeholder-neutral-500',
                            'disabled:bg-neutral-100 dark:disabled:bg-neutral-700',
                            'disabled:text-neutral-500 dark:disabled:text-neutral-400',
                            'disabled:cursor-not-allowed',
                            'focus-visible:outline-none focus-visible:ring-2',
                            {
                                'pl-10': leftIcon,
                                'pl-4': !leftIcon,
                                'pr-10': rightIcon,
                                'pr-4': !rightIcon,
                                'border-error-300 dark:border-error-600 focus-visible:ring-error-500 focus-visible:border-error-500': error,
                                'border-neutral-300 dark:border-neutral-600 focus-visible:ring-primary-500 focus-visible:border-primary-500': !error
                            },
                            inputClassName,
                            className
                        )}
                        {...rest}
                    />
                    {rightIcon && (
                        <FlexBox
                            align="center"
                            className="absolute inset-y-0 right-0 pr-3 pointer-events-none text-neutral-400 dark:text-neutral-500"
                        >
                            {rightIcon}
                        </FlexBox>
                    )}
                </Box>
                {helperText && !error && (
                    <Typography
                        variant="caption"
                        color="neutral"
                        className={cn('mt-1', helperClassName)}>
                        {helperText}
                    </Typography>
                )}
                {error && (
                    <Typography
                        variant="caption"
                        color="error"
                        className={cn('mt-1', errorClassName)}>
                        {error}
                    </Typography>
                )}
            </Box>
        )
    }
)

FormInput.displayName = 'FormInput'

export default FormInput