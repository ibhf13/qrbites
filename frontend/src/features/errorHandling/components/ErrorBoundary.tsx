/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ErrorInfo, ReactNode } from 'react'
import ErrorDisplay from './ErrorDisplay'
import { Box, Typography, ErrorTriangleIcon } from '@/components/common'
import { ApiErrorResponse } from '@/config/api'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    showDetails?: boolean
    level?: 'page' | 'section' | 'component'
    enableAutoRetry?: boolean
    retryDelay?: number
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
    errorId: string
    apiError?: ApiErrorResponse
    retryCount: number
    isRetrying: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private maxRetries = 3
    private retryTimeout: NodeJS.Timeout | null = null

    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
            retryCount: 0,
            isRetrying: false
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Check if this is an API error
        let apiError: ApiErrorResponse | undefined

        if ('response' in error && typeof error.response === 'object') {
            const response = error.response as any

            if (response?.data && 'success' in response.data && response.data.success === false) {
                apiError = response.data as ApiErrorResponse
            }
        }

        return {
            hasError: true,
            error,
            errorId,
            apiError
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo })

        // Call custom error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }

        // Log error appropriately
        this.logError(error, errorInfo)

        // Auto-retry for certain error types if enabled
        if (this.props.enableAutoRetry && this.shouldAutoRetry(error)) {
            this.scheduleAutoRetry()
        }
    }

    componentWillUnmount(): void {
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout)
        }
    }

    private logError = (error: Error, errorInfo: ErrorInfo): void => {
        if (process.env.NODE_ENV === 'development') {
            console.group('🚨 Error Boundary Caught Error')
            console.error('Error:', error)
            console.error('Error Info:', errorInfo)
            console.error('Component Stack:', errorInfo.componentStack)

            if (this.state.apiError) {
                console.error('API Error Details:', this.state.apiError)
            }

            console.groupEnd()
        } else {
            // In production, log essential info for monitoring
            const errorReport = {
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                errorId: this.state.errorId,
                apiError: this.state.apiError,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString()
            }

            // Send to error tracking service (implement based on your monitoring solution)
            console.error('Error Boundary:', errorReport)
        }
    }

    private shouldAutoRetry = (error: Error): boolean => {
        // Only auto-retry for network errors or temporary server errors
        if ('code' in error && error.code === 'NETWORK_ERROR') {
            return true
        }

        if (this.state.apiError) {
            // Auto-retry for rate limit errors (after delay)
            if (error.message?.includes('429') || this.state.apiError.error?.includes('Too many requests')) {
                return true
            }

            // Auto-retry for server errors (500+)
            if ('response' in error && typeof error.response === 'object') {
                const status = (error.response as any)?.status

                return status >= 500
            }
        }

        return false
    }

    private scheduleAutoRetry = (): void => {
        if (this.state.retryCount >= this.maxRetries) {
            return
        }

        this.setState({ isRetrying: true })

        const delay = this.props.retryDelay || this.calculateRetryDelay()

        this.retryTimeout = setTimeout(() => {
            this.resetError()
            this.setState({ isRetrying: false })
        }, delay)
    }

    private calculateRetryDelay = (): number => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(1000 * Math.pow(2, this.state.retryCount), 8000)
    }

    resetError = (): void => {
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout)
            this.retryTimeout = null
        }

        this.setState(prevState => ({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
            apiError: undefined,
            retryCount: prevState.retryCount + 1,
            isRetrying: false
        }))
    }

    private getErrorMessage = (): ReactNode => {
        const { error, apiError } = this.state
        const { showDetails = false } = this.props

        // Use API error message if available
        if (apiError?.error) {
            const message = apiError.error

            // Show validation details if available
            if (apiError.details && Object.keys(apiError.details).length > 0) {
                return (
                    <Box className="space-y-2">
                        <Typography as="p" variant="body">{message}</Typography>
                        <Box className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded text-sm">
                            <Typography as="p" variant="caption" className="font-medium mb-2">
                                Details:
                            </Typography>
                            {Object.entries(apiError.details).map(([field, detail]) => (
                                <Typography key={field} as="p" variant="caption" className="text-error-600">
                                    • {field}: {String(detail)}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                )
            }

            return message
        }

        // Fallback to general error message
        const baseMessage = error?.message || 'An unexpected error occurred'

        if (showDetails && process.env.NODE_ENV === 'development') {
            return (
                <Box className="space-y-2">
                    <Typography as="p" variant="body">{baseMessage}</Typography>
                    <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium mb-2">
                            Technical Details
                        </summary>
                        <Box className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded text-xs font-mono overflow-auto max-h-32">
                            <Box className="mb-2">
                                <strong>Error ID:</strong> {this.state.errorId}
                            </Box>
                            <Box className="mb-2">
                                <strong>Stack:</strong>
                                <pre className="whitespace-pre-wrap mt-1">{error?.stack}</pre>
                            </Box>
                            {this.state.errorInfo && (
                                <Box>
                                    <strong>Component Stack:</strong>
                                    <pre className="whitespace-pre-wrap mt-1">{this.state.errorInfo.componentStack}</pre>
                                </Box>
                            )}
                        </Box>
                    </details>
                </Box>
            )
        }

        return baseMessage
    }

    private getErrorTitle = (): string => {
        const { level = 'component' } = this.props
        const { apiError } = this.state

        // Custom titles for API errors
        if (apiError) {
            if (apiError.error === 'Validation error') {
                return 'Validation Failed'
            }

            if (apiError.error.includes('Too many requests')) {
                return 'Rate Limit Exceeded'
            }

            if (apiError.error.includes('Not authorized') || apiError.error.includes('Invalid token')) {
                return 'Authentication Required'
            }
        }

        // Default titles by level
        const defaultTitles = {
            page: 'Something went wrong',
            section: 'Section failed to load',
            component: 'Component error'
        }

        return defaultTitles[level]
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            const { level = 'component' } = this.props
            const { isRetrying, retryCount } = this.state

            const errorVariants = {
                page: 'full',
                section: 'banner',
                component: 'inline'
            } as const

            const canRetry = retryCount < this.maxRetries && !isRetrying
            const retryText = isRetrying ? 'Retrying...' : 'Try Again'

            return (
                <ErrorDisplay
                    title={this.getErrorTitle()}
                    message={this.getErrorMessage()}
                    onRetry={canRetry ? this.resetError : undefined}
                    variant={errorVariants[level]}
                    className={level === 'component' ? 'my-4' : ''}
                    icon={<ErrorTriangleIcon />}
                    retryText={retryText}
                />
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary