import React from 'react'

interface FormErrorProps {
    errors?: string | string[]
    className?: string
}

export const FormError: React.FC<FormErrorProps> = ({ errors, className = '' }) => {
    // Return nothing if no errors
    if (!errors || (Array.isArray(errors) && errors.length === 0)) {
        return null
    }

    // Convert string error to array
    const errorList = Array.isArray(errors) ? errors : [errors]

    return (
        <div className={`mt-1 ${className}`}>
            {errorList.map((error, index) => (
                <p
                    key={index}
                    className="text-sm text-red-600 dark:text-red-400"
                    role="alert"
                >
                    {error}
                </p>
            ))}
        </div>
    )
}

export default FormError 