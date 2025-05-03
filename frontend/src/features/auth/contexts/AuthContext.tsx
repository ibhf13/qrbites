import React, { createContext, useContext } from 'react'
import { useAuthState } from '../hooks/useAuthState'
import { AuthContextType, AuthProviderProps } from '../types/auth-context.types'

// Create auth context with undefined as default value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Use the custom hook for all auth state logic
    const authState = useAuthState()

    return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}