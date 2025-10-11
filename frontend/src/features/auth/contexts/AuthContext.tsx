import React, { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'
import { AuthContextType, AuthProviderProps } from '../types/auth.types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const authState = useAuth()

    return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
}

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }

    return context
}