import { Component, ErrorInfo, ReactNode } from 'react'
import ErrorDisplay from './ErrorDisplay'
import { ErrorTriangleIcon } from './Icon'
import { Box, Typography } from '@/components/common'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    showDetails?: boolean
    level?: 'page' | 'section' | 'component'
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
    errorId: string
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private retryCount = 0
    private maxRetries = 3

    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
            errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo })

        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }

        if (process.env.NODE_ENV === 'development') {
            console.group('🚨 Error Boundary Caught Error')
            console.error('Error:', error)
            console.error('Error Info:', errorInfo)
            console.error('Component Stack:', errorInfo.componentStack)
            console.groupEnd()
        } else {
            console.error('Error caught by ErrorBoundary:', error.message)
        }
    }

    resetError = (): void => {
        this.retryCount += 1

        if (this.retryCount <= this.maxRetries) {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                errorId: ''
            })
        }
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            const { level = 'component', showDetails = false } = this.props
            const { error, errorInfo, errorId } = this.state

            const errorVariants = {
                page: 'full',
                section: 'banner',
                component: 'inline'
            }

            const errorTitles = {
                page: 'Something went wrong',
                section: 'Section failed to load',
                component: 'Component error'
            }

            const getErrorMessage = () => {
                const baseMessage = error?.message || 'An unexpected error occurred'

                if (showDetails && errorInfo && process.env.NODE_ENV === 'development') {
                    return (
                        <Box className="space-y-2">
                            <Typography as="p" variant="body">{baseMessage}</Typography>
                            <details className="mt-2">
                                <summary className="cursor-pointer text-sm font-medium mb-2">
                                    Technical Details
                                </summary>
                                <Box className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded text-xs font-mono overflow-auto max-h-32">
                                    <Box className="mb-2">
                                        <strong>Error ID:</strong> {errorId}
                                    </Box>
                                    <Box className="mb-2">
                                        <strong>Stack:</strong>
                                        <pre className="whitespace-pre-wrap mt-1">{error?.stack}</pre>
                                    </Box>
                                    <Box>
                                        <strong>Component Stack:</strong>
                                        <pre className="whitespace-pre-wrap mt-1">{errorInfo.componentStack}</pre>
                                    </Box>
                                </Box>
                            </details>
                        </Box>
                    )
                }

                return baseMessage
            }

            const canRetry = this.retryCount < this.maxRetries

            return (
                <ErrorDisplay
                    title={errorTitles[level]}
                    message={getErrorMessage()}
                    onRetry={canRetry ? this.resetError : undefined}
                    variant={errorVariants[level] as any}
                    className={level === 'component' ? 'my-4' : ''}
                    icon={<ErrorTriangleIcon />}
                />
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary