import { apiRequest, ApiResponse } from "@/config/api"
import { AuthTokenResponse, AuthUser, ChangePasswordRequest, LoginRequest, RegisterRequest } from "../types/auth.types"
import { withErrorHandling } from "@/utils/apiUtils"

export const authApi = {
    register: (data: RegisterRequest): Promise<ApiResponse<AuthTokenResponse>> => {
        return withErrorHandling(async () => {
            return apiRequest<AuthTokenResponse>({
                method: 'POST',
                url: '/api/auth/register',
                data
            })
        }, 'Failed to register user')
    },

    login: (data: LoginRequest): Promise<ApiResponse<AuthTokenResponse>> => {
        return withErrorHandling(async () => {
            return apiRequest<AuthTokenResponse>({
                method: 'POST',
                url: '/api/auth/login',
                data
            })
        }, 'Failed to login')
    },

    getCurrentUser: (): Promise<ApiResponse<AuthUser>> => {
        return withErrorHandling(async () => {
            return apiRequest<AuthUser>({
                method: 'GET',
                url: '/api/auth/me'
            })
        }, 'Failed to fetch current user')
    },

    changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<Record<string, unknown>>> => {
        return withErrorHandling(async () => {
            return apiRequest<Record<string, unknown>>({
                method: 'PUT',
                url: '/api/auth/password',
                data
            })
        }, 'Failed to change password')
    }
}