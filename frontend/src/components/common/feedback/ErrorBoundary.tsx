import { Component, ErrorInfo, ReactNode } from 'react'
import ErrorDisplay from './ErrorDisplay'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null
        }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }

        // Log the error to an error reporting service
        console.error('Error caught by ErrorBoundary:', error, errorInfo)
    }

    resetError = (): void => {
        this.setState({
            hasError: false,
            error: null
        })
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <ErrorDisplay
                    title="Something went wrong"
                    message={this.state.error?.message || 'An unexpected error occurred'}
                    onRetry={this.resetError}
                    variant="full"
                />
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary 