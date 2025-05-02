import { authService, isAuthenticated, LoginCredentials, RegisterData, setAuthToken } from '@api/auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: user, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: authService.getProfile,
        enabled: isAuthenticated(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
        onSuccess: (data) => {
            if (data.success && data.data.token) {
                setAuthToken(data.data.token)
                queryClient.invalidateQueries({ queryKey: ['user'] })
            }
        },
    })

    const registerMutation = useMutation({
        mutationFn: (userData: RegisterData) => authService.register(userData),
        onSuccess: (data) => {
            if (data.success && data.data.token) {
                setAuthToken(data.data.token)
                queryClient.invalidateQueries({ queryKey: ['user'] })
            }
        },
    })

    const logout = useCallback(() => {
        authService.logout()
        queryClient.clear()
        navigate('/login')
    }, [navigate, queryClient])

    return {
        user: user?.data?.user,
        isAuthenticated: isAuthenticated(),
        isLoading,
        login: loginMutation.mutate,
        loginError: loginMutation.error,
        isLoginLoading: loginMutation.isPending,
        register: registerMutation.mutate,
        registerError: registerMutation.error,
        isRegisterLoading: registerMutation.isPending,
        logout,
    }
} 