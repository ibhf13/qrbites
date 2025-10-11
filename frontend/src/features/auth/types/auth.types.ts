import { ReactNode } from 'react'

export interface DBProps {
    isActive?: boolean
    createdAt?: string
    updatedAt?: string
}

export interface AuthUser extends DBProps {
    _id: string
    email: string
    name: string
    role: string
    displayName?: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    name: string
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export interface AuthTokenResponse {
    _id: string
    email: string
    name: string
    displayName: string
    role: string
    token: string
}

export interface StoredAuthData {
    token: string
    user: AuthUser
}

export type StorageType = 'localStorage' | 'sessionStorage'

export interface LoginFormData {
    email: string
    password: string
    rememberMe?: boolean
}

export interface RegisterFormData {
    email: string
    password: string
    name: string
}

export interface ChangePasswordFormData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export interface AuthContextType {
    isAuthenticated: boolean
    user: AuthUser | null
    loading: boolean
    error: string | null
    login: (data: LoginRequest & { rememberMe?: boolean }) => Promise<AuthOperationResult>
    register: (data: RegisterRequest) => Promise<AuthOperationResult>
    changePassword: (data: ChangePasswordRequest) => Promise<AuthOperationResult>
    logout: () => void
    clearError: () => void
    refreshUser: () => Promise<void>
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

export interface AuthError extends Error {
    code?: 'INVALID_CREDENTIALS' | 'RATE_LIMITED' | 'NETWORK_ERROR' | 'TOKEN_EXPIRED' | 'VALIDATION_ERROR'
    details?: Record<string, string>
    status?: number
}

export interface JWTPayload {
    exp: number
    iat: number
    id: string
    email: string
}

export interface ProfileUpdateResult {
    success: boolean
    error?: string
}