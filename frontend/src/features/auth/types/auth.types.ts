import { ReactNode } from 'react'

export interface User {
    _id: string
    email: string
    role: string
}

export interface LoginRequest {
    email: string
    password: string
    rememberMe?: boolean
}

export interface RegisterRequest {
    email: string
    password: string
}

export type LoginFormData = LoginRequest
export type RegisterFormData = RegisterRequest

export interface ApiLoginResponseData {
    _id: string
    email: string
    role: string
    token: string
}

export interface ApiRegisterResponseData {
    _id: string
    email: string
    role: string
    token: string
}

export interface LoginResponse {
    success: boolean
    data: ApiLoginResponseData
}

export interface RegisterResponse {
    success: boolean
    data: ApiRegisterResponseData
}

export interface ErrorResponse {
    success: false
    error: {
        message: string
        code?: string
        stack?: string
    }
}

export type AuthResponse = RegisterResponse | LoginResponse | ErrorResponse

export interface AuthContextType {
    isAuthenticated: boolean
    user: User | null
    loading: boolean
    error: string | null
    login: (data: LoginRequest) => Promise<void>
    register: (data: RegisterRequest) => Promise<void>
    logout: () => void
    clearError: () => void
}

export interface AuthProviderProps {
    children: ReactNode
}

export interface AuthOperationResult {
    success: boolean
    error?: string
}

export type ProtectionLevel = 'auth' | 'guest' | 'admin' | 'none'

export interface AuthProtectionConfig {
    protectionLevel?: ProtectionLevel
    redirectPath?: string
}

export interface AuthProtectionState {
    isAuthorized: boolean
    isLoading: boolean
}

export interface StoredAuthData {
    token: string
    user: User
}

export type StorageType = 'localStorage' | 'sessionStorage' 