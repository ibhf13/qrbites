/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiErrorResponse } from '@/config/api'

/**
 * Checks if the response is a validation error
 */
export const isValidationError = (response: any): boolean => {
    if (isApiErrorResponse(response)) {
        return response.error === 'Validation error' && !!response.details
    }

    // Handle axios-wrapped error response
    if (response?.response?.data && isApiErrorResponse(response.response.data)) {
        const apiError = response.response.data

        return apiError.error === 'Validation error' && !!apiError.details
    }

    return false
}

/**
 * Extracts validation errors from API response
 */
export const getValidationErrors = (response: any): Record<string, string> => {
    let apiError: ApiErrorResponse | null = null

    if (isApiErrorResponse(response)) {
        apiError = response
    } else if (response?.response?.data && isApiErrorResponse(response.response.data)) {
        apiError = response.response.data
    }

    if (apiError && isValidationError(apiError) && apiError.details) {
        const validationErrors: Record<string, string> = {}

        Object.entries(apiError.details).forEach(([key, value]) => {
            validationErrors[key] = typeof value === 'string' ? value : String(value)
        })

        return validationErrors
    }

    return {}
}

/**
 * Gets the first validation error message
 */
export const getFirstValidationError = (response: any): string | null => {
    const errors = getValidationErrors(response)
    const firstKey = Object.keys(errors)[0]

    return firstKey ? errors[firstKey] : null
}

/**
 * Maps validation errors to form field format
 */
export const mapValidationErrorsToForm = (response: any): Record<string, { message: string }> => {
    const errors = getValidationErrors(response)
    const formErrors: Record<string, { message: string }> = {}

    Object.entries(errors).forEach(([field, message]) => {
        formErrors[field] = { message }
    })

    return formErrors
}

/**
 * Helper function to check if response is API error response
 */
const isApiErrorResponse = (response: any): response is ApiErrorResponse => {
    return (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        response.success === false &&
        'error' in response &&
        typeof response.error === 'string'
    )
}
