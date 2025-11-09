/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { getAuthToken } from '@/features/auth/utils/authStorage'
import env from './env'

export interface ApiSuccessResponse<T = any> {
    success: true
    data: T
    total?: number
    page?: number
    limit?: number
}

export interface ApiErrorResponse {
    success: false
    error: string
    details?: Record<string, any>
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

export interface RateLimitInfo {
    limit: number
    remaining: number
    reset: number
    retryAfter?: number
}

export interface EnhancedAxiosError extends AxiosError {
    rateLimitInfo?: RateLimitInfo
}

const apiClient: AxiosInstance = axios.create({
    baseURL: env.apiUrl || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
})

apiClient.interceptors.request.use(
    (config) => {
        const token = getAuthToken()

        if (process.env.NODE_ENV === 'development' && config.url?.includes('/api/auth/')) {
            console.log('🔐 Auth request:', {
                url: config.url,
                method: config.method,
                hasToken: !!token,
                tokenLength: token?.length || 0,
                data: config.data,
                headers: config.headers
            })
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            const errorData = error.response?.data as ApiErrorResponse

            if (process.env.NODE_ENV === 'development') {
                console.log('🚫 Authentication error 401:', {
                    url: error.config?.url,
                    hasAuthHeader: !!(error.config?.headers?.Authorization),
                    error: errorData?.error || 'Unauthorized'
                })
            }
        }

        // Attach rate limit metadata for error handling
        if (error.response?.status === 429) {
            const headers = error.response.headers
            const rateLimitInfo: RateLimitInfo = {
                limit: parseInt(headers['x-ratelimit-limit'] || '0'),
                remaining: parseInt(headers['x-ratelimit-remaining'] || '0'),
                reset: parseInt(headers['x-ratelimit-reset'] || '0'),
                retryAfter: parseInt(headers['retry-after'] || '0')
            }

                // Attach metadata to error
                ; (error as EnhancedAxiosError).rateLimitInfo = rateLimitInfo

            if (process.env.NODE_ENV === 'development') {
                console.log('⏱️ Rate limit hit:', {
                    url: error.config?.url,
                    limit: rateLimitInfo.limit,
                    remaining: rateLimitInfo.remaining,
                    retryAfter: rateLimitInfo.retryAfter
                })
            }
        }

        return Promise.reject(error)
    }
)

// Simplified apiRequest function - consistent error handling
export const apiRequest = async <T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
        const response = await apiClient(config)

        return response.data as ApiResponse<T>
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                const serverError = error.response.data

                if (process.env.NODE_ENV === 'development' && config.url?.includes('/api/')) {
                    console.log('🛠️ API error:', {
                        url: config.url,
                        status: error.response.status,
                        error: serverError
                    })
                }

                // Return QrBites API error format if available
                if (typeof serverError === 'object' && 'success' in serverError && serverError.success === false) {
                    return serverError as ApiErrorResponse
                }

                // Fallback for non-standard responses
                return {
                    success: false,
                    error: typeof serverError === 'object' && serverError.message
                        ? serverError.message
                        : typeof serverError === 'string'
                            ? serverError
                            : `Server error (${error.response.status})`
                } as ApiErrorResponse
            }

            // Network errors
            if (error.request) {
                return {
                    success: false,
                    error: 'No response received from server. Please check your internet connection.'
                } as ApiErrorResponse
            }
        }

        // Unknown errors
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        } as ApiErrorResponse
    }
}

export const extractRateLimitInfo = (error: EnhancedAxiosError): RateLimitInfo | null => {
    return error?.rateLimitInfo || null
}

export interface QueryParams {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    order?: 'asc' | 'desc'
    [key: string]: unknown
}

export type ApiListSuccessResponse<T = unknown> =
    ApiSuccessResponse<T> & Required<Pick<ApiSuccessResponse, 'total' | 'page' | 'limit'>>

const cleanParams = (obj: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null))

export const buildListParams = (params: QueryParams = {}) => cleanParams(params)



export default apiClient