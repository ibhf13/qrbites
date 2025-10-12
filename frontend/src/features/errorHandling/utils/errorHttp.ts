/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiErrorResponse, ApiSuccessResponse } from '@/config/api'

/**
 * Checks if the response is an API error response
 */
export const isApiErrorResponse = (response: any): response is ApiErrorResponse => {
    return (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        response.success === false &&
        'error' in response &&
        typeof response.error === 'string'
    )
}

/**
 * Checks if the response is an API success response
 */
export const isApiSuccessResponse = <T>(response: any): response is ApiSuccessResponse<T> => {
    return (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        response.success === true &&
        'data' in response
    )
}

/**
 * Gets user-friendly message for HTTP status codes
 */
export const getHttpStatusMessage = (status: number): string => {
    switch (status) {
        case 400:
            return 'Bad request. Please check your input and try again.'
        case 401:
            return 'Authentication required. Please log in.'
        case 403:
            return 'You do not have permission to perform this action.'
        case 404:
            return 'The requested resource was not found.'
        case 409:
            return 'This resource already exists or there is a conflict.'
        case 422:
            return 'The provided data is invalid. Please check your input.'
        case 429:
            return 'Too many requests. Please wait and try again.'
        case 500:
            return 'Internal server error. Please try again later.'
        case 502:
            return 'Bad gateway. The server is temporarily unavailable.'
        case 503:
            return 'Service unavailable. Please try again later.'
        case 504:
            return 'Gateway timeout. Please try again later.'
        default:
            if (status >= 400 && status < 500) {
                return 'Client error. Please check your request and try again.'
            }

            if (status >= 500) {
                return 'Server error. Please try again later.'
            }

            return 'An unexpected error occurred.'
    }
}

/**
 * Checks if the status code indicates a client error (4xx)
 */
export const isClientError = (status: number): boolean => {
    return status >= 400 && status < 500
}

/**
 * Checks if the status code indicates a server error (5xx)
 */
export const isServerError = (status: number): boolean => {
    return status >= 500 && status < 600
}

/**
 * Gets error severity based on HTTP status code
 */
export const getHttpErrorSeverity = (status: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (status === 401 || status === 403) return 'critical'
    if (status >= 500) return 'high'
    if (status >= 400 && status < 500) return 'medium'

    return 'low'
}
