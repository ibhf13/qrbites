

// Re-export all error handling utilities from focused modules
export type { ErrorSeverity } from './errorLogger'

// Re-export validation utilities
export {
    isValidationError,
    getValidationErrors,
    getFirstValidationError,
    mapValidationErrorsToForm
} from './errorValidation'

// Re-export authentication utilities
export {
    isAuthenticationError,
    isAuthorizationError,
    getAuthErrorMessage,
    getContextAuthErrorMessage,
    AUTH_ERROR_MESSAGES
} from './errorAuth'

// Re-export network utilities
export {
    isNetworkError,
    isServerError,
    getNetworkErrorMessage,
    shouldRetryNetworkOperation,
    NETWORK_ERROR_MESSAGES
} from './errorNetwork'

// Re-export HTTP utilities
export {
    isApiErrorResponse,
    isApiSuccessResponse,
    getHttpStatusMessage,
    isClientError,
    isServerError as isHttpServerError,
    getHttpErrorSeverity
} from './errorHttp'

// Re-export rate limiting utilities
export {
    isRateLimitError,
    getRateLimitInfo,
    getRateLimitRetryAfter
} from './errorRateLimit'

// Re-export file upload utilities
export {
    isFileUploadError,
    getFileUploadErrorType,
    getFileUploadErrorMessage
} from './errorFileUpload'

// Re-export context utilities
export {
    getContextErrorMessage,
    ERROR_MESSAGES
} from './errorContext'

// Re-export logging utilities
export {
    getErrorSeverity,
    getErrorType,
    logError,
    logApiError,
    createReactQueryErrorHandler
} from './errorLogger'

// Re-export main error handler
export {
    ErrorHandler,
    createErrorHandler
} from './errorHandler'

// Re-export error message utilities
export {
    getUserFriendlyErrorMessage
} from './errorMessages'

// Legacy compatibility - re-export shouldRetryOperation from network module
export { shouldRetryNetworkOperation as shouldRetryOperation } from './errorNetwork'

// Import all utilities for default export
import {
    isValidationError,
    getValidationErrors,
    getFirstValidationError,
    mapValidationErrorsToForm
} from './errorValidation'

import {
    isAuthenticationError,
    isAuthorizationError,
    getAuthErrorMessage,
    getContextAuthErrorMessage,
    AUTH_ERROR_MESSAGES
} from './errorAuth'

import {
    isNetworkError,
    isServerError,
    getNetworkErrorMessage,
    shouldRetryNetworkOperation,
    NETWORK_ERROR_MESSAGES
} from './errorNetwork'

import {
    isApiErrorResponse,
    isApiSuccessResponse,
    getHttpStatusMessage,
    isClientError,
    isServerError as isHttpServerError,
    getHttpErrorSeverity
} from './errorHttp'

import {
    isRateLimitError,
    getRateLimitInfo,
    getRateLimitRetryAfter
} from './errorRateLimit'

import {
    isFileUploadError,
    getFileUploadErrorType,
    getFileUploadErrorMessage
} from './errorFileUpload'

import {
    getContextErrorMessage,
    ERROR_MESSAGES
} from './errorContext'

import {
    getErrorSeverity,
    getErrorType,
    logError,
    logApiError,
    createReactQueryErrorHandler
} from './errorLogger'

import {
    ErrorHandler,
    createErrorHandler
} from './errorHandler'

import {
    getUserFriendlyErrorMessage
} from './errorMessages'

// Default export for backward compatibility
export default {
    // Validation utilities
    isValidationError,
    getValidationErrors,
    getFirstValidationError,
    mapValidationErrorsToForm,

    // Authentication utilities
    isAuthenticationError,
    isAuthorizationError,
    getAuthErrorMessage,
    getContextAuthErrorMessage,
    AUTH_ERROR_MESSAGES,

    // Network utilities
    isNetworkError,
    isServerError,
    getNetworkErrorMessage,
    shouldRetryOperation: shouldRetryNetworkOperation,
    NETWORK_ERROR_MESSAGES,

    // HTTP utilities
    isApiErrorResponse,
    isApiSuccessResponse,
    getHttpStatusMessage,
    isClientError,
    isHttpServerError,
    getHttpErrorSeverity,

    // Rate limiting utilities
    isRateLimitError,
    getRateLimitInfo,
    getRateLimitRetryAfter,

    // File upload utilities
    isFileUploadError,
    getFileUploadErrorType,
    getFileUploadErrorMessage,

    // Context utilities
    getContextErrorMessage,
    ERROR_MESSAGES,

    // Logging utilities
    getErrorSeverity,
    getErrorType,
    logError,
    logApiError,
    createReactQueryErrorHandler,

    // Main error handler
    ErrorHandler,
    createErrorHandler,

    // Error message utilities
    getUserFriendlyErrorMessage
}