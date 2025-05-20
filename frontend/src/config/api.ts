import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { getAuthToken, clearAuthData } from '../features/auth/utils/authStorage'
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
    error: {
        message: string
        code: string
        data?: any
    }
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

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

        if (config.url && config.url.includes('/api/auth/')) {
            console.log('🔑 Auth request:', {
                url: config.url,
                hasToken: !!token,
                tokenPrefix: token ? token.substring(0, 10) + '...' : 'none'
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
        if (response.data && typeof response.data === 'object') {
            if (!('success' in response.data)) {
                response.data = {
                    success: true,
                    data: response.data
                }
            }
        }

        return response
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            const errorData = error.response?.data as Record<string, any> || {}

            console.log('🚫 Authentication error 401:', {
                url: error.config?.url,
                hasAuthHeader: !!(error.config?.headers?.Authorization),
                message: errorData.message || 'Unauthorized'
            })

            clearAuthData()
        }

        return Promise.reject(error)
    }
)


export const apiRequest = async <T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
        const response = await apiClient(config)

        return response.data as ApiResponse<T>
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                const serverError = error.response.data

                if (config.url && config.url.includes('/api/auth/')) {
                    console.log('🛑 API error:', {
                        url: config.url,
                        status: error.response.status,
                        error: serverError
                    })
                }

                if (typeof serverError === 'object' && 'success' in serverError && serverError.success === false) {
                    return serverError as ApiErrorResponse
                }

                return {
                    success: false,
                    error: {
                        message: typeof serverError === 'object' && serverError.message
                            ? serverError.message
                            : 'Server error occurred',
                        code: error.response.status.toString(),
                        data: serverError
                    }
                } as ApiErrorResponse
            } else if (error.request) {
                return {
                    success: false,
                    error: {
                        message: 'No response received from server',
                        code: 'NETWORK_ERROR'
                    }
                } as ApiErrorResponse
            }
        }

        return {
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'An unexpected error occurred',
                code: 'UNKNOWN_ERROR'
            }
        } as ApiErrorResponse
    }
}

export default apiClient 