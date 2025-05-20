import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { FlexBox } from '@/components/common'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string
    error?: string
    className?: string
    labelClassName?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, error, className, labelClassName, id, ...props }, ref) => {
        const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

        return (
            <FlexBox align="center" className={className}>
                <input
                    ref={ref}
                    type="checkbox"
                    id={checkboxId}
                    className={cn(
                        'h-4 w-4 text-primary-600 border-neutral-300 dark:border-neutral-600 rounded',
                        'bg-white dark:bg-neutral-800',
                        'focus-visible:ring-primary-500 focus-visible:ring-2 focus-visible:ring-offset-0',
                        'dark:focus-visible:ring-offset-neutral-900',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        {
                            'border-error-500 focus-visible:ring-error-500 dark:border-error-400': error
                        }
                    )}
                    {...props}
                />
                {label && (
                    <label
                        htmlFor={checkboxId}
                        className={cn(
                            'ml-2 block text-sm text-neutral-700 dark:text-neutral-300',
                            labelClassName
                        )}
                    >
                        {label}
                    </label>
                )}
                {error && (
                    <p className="mt-1 text-sm text-error-600 dark:text-error-400" role="alert">
                        {error}
                    </p>
                )}
            </FlexBox>
        )
    }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox