import { apiRequest, ApiResponse } from '@/config/api'
import {
    LoginRequest,
    RegisterRequest,
    User
} from '../types/auth.types'

interface ApiLoginResponse {
    _id: string
    email: string
    role: string
    token: string
}

interface ApiRegisterResponse {
    _id: string
    email: string
    role: string
    token: string
}

export const registerUser = async (userData: RegisterRequest): Promise<ApiResponse<ApiRegisterResponse>> => {
    return apiRequest<ApiRegisterResponse>({
        method: 'POST',
        url: '/api/auth/register',
        data: userData
    })
}

export const loginUser = async (userData: LoginRequest): Promise<ApiResponse<ApiLoginResponse>> => {
    return apiRequest<ApiLoginResponse>({
        method: 'POST',
        url: '/api/auth/login',
        data: {
            email: userData.email,
            password: userData.password
        }
    })
}