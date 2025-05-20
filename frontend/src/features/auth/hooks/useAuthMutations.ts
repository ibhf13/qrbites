import { ApiResponse } from '@/config/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { loginUser, registerUser } from '../api/auth.api'
import {
    ApiLoginResponseData,
    ApiRegisterResponseData,
    LoginRequest,
    RegisterRequest
} from '../types/auth.types'
import { clearAuthData, storeAuthData } from '../utils/authStorage'


export const useLoginMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (userData: LoginRequest) => loginUser(userData),
        onSuccess: (response: ApiResponse<ApiLoginResponseData>, variables) => {
            if (response.success && 'data' in response) {
                const { token, _id, email, role } = response.data
                const user = { _id, email, role }
                const storageType = variables.rememberMe ? 'localStorage' : 'sessionStorage'

                storeAuthData(token, user, storageType)

                console.log('✅ Login successful, token stored')

                queryClient.invalidateQueries({ queryKey: ['user'] })
                queryClient.invalidateQueries({ queryKey: ['profile'] })
            } else {
                console.error('❌ Login failed: Invalid response format', response)
                throw new Error('Invalid response format from server')
            }
        },
        onError: (error: any) => {
            console.error('❌ Login error:', error)
            clearAuthData()
            throw error
        }
    })
}


export const useRegisterMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (userData: RegisterRequest) => registerUser(userData),
        onSuccess: (response: ApiResponse<ApiRegisterResponseData>) => {
            if (response.success) {
                console.log('✅ Registration successful')
                queryClient.invalidateQueries({ queryKey: ['user'] })
                queryClient.invalidateQueries({ queryKey: ['profile'] })
            } else {
                console.log('❌ Registration failed:', response)
                throw new Error('Registration failed')
            }
        },
        onError: (error: any) => {
            console.log('❌ Registration error:', error)
            throw error
        }
    })
}


export const useLogoutAction = () => {
    const queryClient = useQueryClient()

    return () => {
        try {
            console.log('🚪 Logging out, clearing auth data')
            clearAuthData()
            queryClient.clear()
        } catch (error) {
            console.log('🚪 Logout encountered error, clearing local auth data anyway')
            clearAuthData()
            queryClient.clear()
        }
    }
} 