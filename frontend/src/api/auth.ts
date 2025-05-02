import apiClient from './client'

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    name: string
    email: string
    password: string
}

export interface AuthResponse {
    success: boolean
    data: {
        token: string
        user: {
            id: string
            name: string
            email: string
        }
    }
}

export const authService = {
    async login(credentials: LoginCredentials) {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
        return response.data
    },

    async register(userData: RegisterData) {
        const response = await apiClient.post<AuthResponse>('/auth/register', userData)
        return response.data
    },

    async getProfile() {
        const response = await apiClient.get<AuthResponse>('/auth/me')
        return response.data
    },

    logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }
}

export const setAuthToken = (token: string) => {
    localStorage.setItem('token', token)
}

export const getAuthToken = (): string | null => {
    return localStorage.getItem('token')
}

export const isAuthenticated = (): boolean => {
    return !!getAuthToken()
} 