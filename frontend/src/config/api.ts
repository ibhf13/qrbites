import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import env from './env'

// Create a default axios instance with common configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: env.apiUrl || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 seconds
})

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Get token from storage (preference for localStorage, fallback to sessionStorage)
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')

        // Debug token usage
        if (config.url && config.url.includes('/api/auth/me')) {
            console.log('🔑 Token check for profile request:', {
                url: config.url,
                hasToken: !!token,
                tokenPrefix: token ? token.substring(0, 10) + '...' : 'none'
            })
        }

        // If token exists, add to authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Debug auth errors
        if (error.response?.status === 401) {
            const errorData = error.response?.data as Record<string, any> || {}

            console.log('🚫 Authentication error 401:', {
                url: error.config?.url,
                hasAuthHeader: !!(error.config?.headers?.Authorization),
                message: errorData.message || 'Unauthorized'
            })

            // Clear auth data
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            sessionStorage.removeItem('auth_token')
            sessionStorage.removeItem('user')

            // Could redirect to login page or dispatch an action
        }

        return Promise.reject(error)
    }
)

/**
 * Helper function to make API requests with standardized error handling
 * Transforms all errors into a consistent format with success: false and error object
 */
export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
    try {
        const response = await apiClient(config)
        return response.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle Axios errors
            if (error.response) {
                // The server responded with a status code outside of 2xx
                const serverError = error.response.data

                // Debug response errors for auth endpoints
                if (config.url && (
                    config.url.includes('/api/auth/me') ||
                    config.url.includes('/api/auth/profile') ||
                    config.url.includes('/api/auth/password')
                )) {
                    console.log('🛑 API error:', {
                        url: config.url,
                        status: error.response.status,
                        error: serverError
                    })
                }

                // If the error already has the expected format, use it directly
                if (typeof serverError === 'object' && 'success' in serverError && serverError.success === false) {
                    throw serverError
                }

                // Otherwise, convert to our error format
                throw {
                    success: false,
                    error: {
                        message: typeof serverError === 'object' && serverError.message
                            ? serverError.message
                            : 'Server error occurred',
                        code: error.response.status.toString(),
                        data: serverError // Include original error data
                    }
                }
            } else if (error.request) {
                // Request was made but no response received (network error)
                throw {
                    success: false,
                    error: {
                        message: 'No response received from server',
                        code: 'NETWORK_ERROR'
                    }
                }
            }
        }

        // For non-Axios errors or unhandled cases
        throw {
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'An unexpected error occurred',
                code: 'UNKNOWN_ERROR'
            }
        }
    }
}

export default apiClient 