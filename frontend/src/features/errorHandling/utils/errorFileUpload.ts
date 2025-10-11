/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiErrorResponse } from '@/config/api'

/**
 * Checks if the response is a file upload error
 */
export const isFileUploadError = (response: any): boolean => {
    const fileErrorPatterns = ['File size', 'File type', 'Invalid file', 'Too many files', 'File upload']
    let errorMessage = ''

    if (isApiErrorResponse(response)) {
        errorMessage = response.error
    } else if (response?.response?.data && isApiErrorResponse(response.response.data)) {
        errorMessage = response.response.data.error
    }

    return fileErrorPatterns.some(pattern => errorMessage.includes(pattern))
}

/**
 * Gets the type of file upload error
 */
export const getFileUploadErrorType = (response: any): string | null => {
    let errorMessage = ''

    if (isApiErrorResponse(response)) {
        errorMessage = response.error
    } else if (response?.response?.data && isApiErrorResponse(response.response.data)) {
        errorMessage = response.response.data.error
    }

    if (errorMessage.includes('File size')) return 'SIZE_LIMIT'
    if (errorMessage.includes('File type') || errorMessage.includes('Invalid file')) return 'INVALID_TYPE'
    if (errorMessage.includes('Too many files')) return 'FILE_COUNT_LIMIT'

    return null
}

/**
 * Gets user-friendly file upload error message
 */
export const getFileUploadErrorMessage = (response: any): string => {
    if (!isFileUploadError(response)) {
        return 'File upload failed. Please try again.'
    }

    const errorType = getFileUploadErrorType(response)
    const fileErrorMessages: Record<string, string> = {
        'SIZE_LIMIT': 'File size must be less than 5MB',
        'INVALID_TYPE': 'Please upload a JPEG or PNG image',
        'FILE_COUNT_LIMIT': 'Too many files. Maximum 10 images allowed'
    }

    return fileErrorMessages[errorType || ''] || 'File upload failed. Please try again.'
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
