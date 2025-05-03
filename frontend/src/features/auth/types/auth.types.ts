export interface RegisterRequest {
    email: string
    password: string
}

// RegisterFormData is now the same as RegisterRequest since we don't need confirmPassword
export type RegisterFormData = RegisterRequest

export interface User {
    _id: string
    email: string
    role: string
}

export interface RegisterResponse {
    success: boolean
    data: {
        _id: string
        email: string
        created: string // ISO date string
    }
}

export interface LoginRequest {
    email: string
    password: string
    rememberMe?: boolean
}

export type LoginFormData = LoginRequest

export interface LoginResponse {
    success: boolean
    data: {
        token: string
        user: User
    }
}

export interface ErrorResponse {
    success: false
    error: {
        message: string
        code?: string
        stack?: string // Development environment only
    }
}

export type AuthResponse = RegisterResponse | LoginResponse | ErrorResponse 