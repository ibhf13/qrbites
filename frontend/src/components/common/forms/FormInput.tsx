import React, { forwardRef } from 'react'

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
            containerClassName = '',
            labelClassName = '',
            inputClassName = '',
            helperClassName = '',
            errorClassName = '',
            id,
            disabled,
            className = '',
            ...rest
        },
        ref
    ) => {
        const inputId = id || Math.random().toString(36).substring(2, 9)

        return (
            <div className={`mb-4 ${containerClassName}`}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
                    >
                        {label}
                    </label>
                )}
                <div className="relative rounded-md">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        className={`
              w-full rounded-md 
              ${leftIcon ? 'pl-10' : 'pl-4'} 
              ${rightIcon ? 'pr-10' : 'pr-4'} 
              py-2 
              border ${error ? 'border-red-300' : 'border-gray-300'} 
              ${error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-primary-500 focus:border-primary-500'}
              text-gray-900 placeholder-gray-400
              disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
              ${inputClassName}
              ${className}
            `}
                        {...rest}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {helperText && !error && (
                    <p className={`mt-1 text-sm text-gray-500 ${helperClassName}`}>{helperText}</p>
                )}
                {error && (
                    <p className={`mt-1 text-sm text-red-600 ${errorClassName}`}>{error}</p>
                )}
            </div>
        )
    }
)

FormInput.displayName = 'FormInput'

export default FormInput 