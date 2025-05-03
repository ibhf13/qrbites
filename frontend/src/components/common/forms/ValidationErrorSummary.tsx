import React from 'react'
import ErrorDisplay from '../feedback/ErrorDisplay'

interface ValidationErrors {
    [fieldName: string]: string[]
}

interface ValidationErrorSummaryProps {
    errors?: ValidationErrors
    onDismiss?: () => void
    className?: string
}

export const ValidationErrorSummary: React.FC<ValidationErrorSummaryProps> = ({
    errors,
    onDismiss,
    className = '',
}) => {
    if (!errors || Object.keys(errors).length === 0) {
        return null
    }

    // Get total error count
    const totalErrors = Object.values(errors).reduce(
        (count, fieldErrors) => count + fieldErrors.length,
        0
    )

    // Get a flat list of all errors with field names
    const errorMessages = Object.entries(errors).flatMap(([field, fieldErrors]) =>
        fieldErrors.map(error => `${field}: ${error}`)
    )

    return (
        <ErrorDisplay
            title={`${totalErrors} validation ${totalErrors === 1 ? 'error' : 'errors'}`}
            message={
                <ul className="list-disc list-inside">
                    {errorMessages.map((error, index) => (
                        <li key={index} className="mt-1">{error}</li>
                    ))}
                </ul>
            }
            onRetry={onDismiss}
            variant="banner"
            className={className}
        />
    )
}

export default ValidationErrorSummary 