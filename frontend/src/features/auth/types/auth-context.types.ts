import { ReactNode } from 'react'
import { LoginRequest, RegisterRequest } from './auth.types'

export interface User {
    _id: string
    email: string
    role: string
}

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