/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiErrorResponse } from '@/config/api'

/**
 * Checks if the response is a rate limit error
 */
export const isRateLimitError = (response: any): boolean => {
    let errorMessage = ''

    if (response?.response?.status === 429 || response?.status === 429) return true

    if (isApiErrorResponse(response)) {
        errorMessage = response.error
    } else if (response?.response?.data && isApiErrorResponse(response.response.data)) {
        errorMessage = response.response.data.error
    }

    return errorMessage.includes('Too many requests')
}

/**
 * Gets rate limit retry information from response
 */
export const getRateLimitRetryAfter = (response: any): { headerSeconds?: number; bodyMinutes?: number } => {
    const result: { headerSeconds?: number; bodyMinutes?: number } = {}

    // Check response headers for retry-after (in seconds)
    if (response?.response?.headers?.['retry-after']) {
        const retryAfter = parseInt(response.response.headers['retry-after'], 10)

        if (!isNaN(retryAfter)) result.headerSeconds = retryAfter
    }

    // Check response body for retry info (QrBites format - in minutes)
    let apiError: ApiErrorResponse | null = null

    if (isApiErrorResponse(response)) {
        apiError = response
    } else if (response?.response?.data && isApiErrorResponse(response.response.data)) {
        apiError = response.response.data
    }

    if (apiError?.details?.retryAfter && typeof apiError.details.retryAfter === 'number') {
        result.bodyMinutes = apiError.details.retryAfter
    }

    return result
}

/**
 * Gets user-friendly rate limit information
 */
export const getRateLimitInfo = (response: any): { retryAfter?: number; message: string } => {
    const defaultMessage = 'Too many requests. Please wait and try again.'

    if (!isRateLimitError(response)) return { message: defaultMessage }

    const retryInfo = getRateLimitRetryAfter(response)

    // Prefer QrBites API format (minutes in body)
    if (retryInfo.bodyMinutes) {
        const minutes = retryInfo.bodyMinutes

        return {
            retryAfter: minutes,
            message: `Too many requests. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`
        }
    }

    // Fallback to header format (seconds, convert to minutes)
    if (retryInfo.headerSeconds) {
        const minutes = Math.ceil(retryInfo.headerSeconds / 60)

        return {
            retryAfter: minutes,
            message: `Too many requests. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`
        }
    }

    return { message: defaultMessage }
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
