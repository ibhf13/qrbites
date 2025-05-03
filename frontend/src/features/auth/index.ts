// Feature exports for auth module

// Context
export { AuthProvider, useAuth } from './contexts/AuthContext'

// Hooks
export { useAuthProtect } from './hooks/useAuthProtect'
export { useLogin } from './hooks/useLogin'
export { useRegister } from './hooks/useRegister'

// API
export { loginUser, logoutUser, registerUser } from './api/auth.api'

// Types
export type {
    ErrorResponse, LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse
} from './types/auth.types'

// Components
export { default as LoginForm } from './components/LoginForm'
export { isAuthenticated, default as ProtectedRoute } from './components/ProtectedRoute'
export { default as RegisterForm } from './components/RegisterForm'

