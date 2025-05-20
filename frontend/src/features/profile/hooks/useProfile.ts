import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import {
    changePassword,
    getMyProfile,
    getUserInfo,
    updateUserProfile
} from '../api/profile.api'
import {
    BasicInfoFormData,
    ChangePasswordRequest,
    UserProfile
} from '../types/profile.types'
import { updateStoredUser } from '../utils/storage'

export const useProfile = () => {
    const queryClient = useQueryClient()

    const profileQuery = useQuery({
        queryKey: ['profile'],
        queryFn: getMyProfile,
        select: (response) => response.success ? response.data : null,
        retry: (failureCount, error: any) => {
            if (error?.status === 401) return false

            return failureCount < 3
        }
    })

    const userInfoQuery = useQuery({
        queryKey: ['user', 'info'],
        queryFn: getUserInfo,
        select: (response) => response.success ? response.data : null,
        retry: (failureCount, error: any) => {
            if (error?.error?.code === '401') return false

            return failureCount < 3
        }
    })

    const updateProfileMutation = useMutation({
        mutationFn: (data: Partial<UserProfile>) => updateUserProfile(data),
        onSuccess: (response) => {
            if (response.success && response.data) {
                queryClient.setQueryData(['profile'], response)
                queryClient.invalidateQueries({ queryKey: ['profile', 'user'] })

                if (response.data) {
                    updateStoredUser(response.data)
                }
            }
        }
    })

    const changePasswordMutation = useMutation({
        mutationFn: changePassword
    })



    const updateBasicInfo = useCallback(async (data: BasicInfoFormData) => {
        return updateProfileMutation.mutateAsync(data)
    }, [updateProfileMutation])

    const changeUserPassword = useCallback(async (data: ChangePasswordRequest) => {
        return changePasswordMutation.mutateAsync(data)
    }, [changePasswordMutation])

    const refreshProfile = useCallback(async () => {
        return queryClient.invalidateQueries({ queryKey: ['profile', 'user'] })
    }, [queryClient])



    return {
        profile: profileQuery.data,
        userInfo: userInfoQuery.data,
        isLoading: profileQuery.isLoading || userInfoQuery.isLoading,
        isError: profileQuery.isError || userInfoQuery.isError,
        error: profileQuery.error || userInfoQuery.error,
        updateBasicInfo,
        isUpdating: updateProfileMutation.isPending,
        updateError: updateProfileMutation.error,
        changePassword: changeUserPassword,
        isChangingPassword: changePasswordMutation.isPending,
        passwordChangeError: changePasswordMutation.error,
        refreshProfile
    } as const
} 