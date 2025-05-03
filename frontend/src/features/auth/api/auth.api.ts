import { apiRequest } from '@/config/api'
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse
} from '../types/auth.types'

// Use a default API URL for now - environment variables will be configured properly later
const API_URL = 'http://localhost:5000'

export const registerUser = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    return apiRequest<RegisterResponse>({
        method: 'POST',
        url: '/api/auth/register',
        data: userData
    })
}

export const loginUser = async (userData: LoginRequest): Promise<LoginResponse> => {
    console.log('🔐 Login attempt:', { email: userData.email, rememberMe: userData.rememberMe })

    const response = await apiRequest<LoginResponse>({
        method: 'POST',
        url: '/api/auth/login',
        data: {
            email: userData.email,
            password: userData.password
        }
    })

    // Handle token storage based on rememberMe preference
    if (response.success) {
        const token = response.data.token
        const user = response.data.user

        if (userData.rememberMe) {
            console.log('📝 Storing auth in localStorage')
            localStorage.setItem('auth_token', token)
            localStorage.setItem('user', JSON.stringify(user))
        } else {
            console.log('📝 Storing auth in sessionStorage')
            sessionStorage.setItem('auth_token', token)
            sessionStorage.setItem('user', JSON.stringify(user))
        }

        // Verify token was stored correctly
        const storedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
        console.log('✅ Login successful, token stored:', !!storedToken)
    } else {
        console.log('❌ Login failed:', response)
    }

    return response
}

export const logoutUser = (): void => {
    console.log('🚪 Logging out, clearing auth data')
    // Clear authentication data from storage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('user')

    // Verify token was removed
    const tokenExists = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    console.log('🧹 Logout complete, token removed:', !tokenExists)
} 