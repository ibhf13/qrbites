import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { changePassword, getUserInfo, updateUserProfile, uploadAvatar } from '../api/profile.api'
import { ChangePasswordRequest, UserProfile } from '../types/profile.types'

export const useProfileData = () => {
    const queryClient = useQueryClient()

    const profileQuery = useQuery({
        queryKey: ['userProfile'],
        queryFn: getUserInfo,
        retry: 1
    })

    const updateProfileMutation = useMutation({
        mutationFn: (profileData: UserProfile) => updateUserProfile(profileData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] })
        }
    })

    const changePasswordMutation = useMutation({
        mutationFn: (passwordData: ChangePasswordRequest) => changePassword(passwordData)
    })

    const uploadAvatarMutation = useMutation({
        mutationFn: (formData: FormData) => uploadAvatar(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] })
        }
    })

    return {
        profileData: profileQuery.data?.data,
        isLoading: profileQuery.isLoading,
        isError: profileQuery.isError,
        error: profileQuery.error,
        updateProfile: updateProfileMutation.mutate,
        isUpdating: updateProfileMutation.isPending,
        updateError: updateProfileMutation.error,
        changePassword: changePasswordMutation.mutate,
        isChangingPassword: changePasswordMutation.isPending,
        passwordChangeError: changePasswordMutation.error,
        passwordChangeSuccess: changePasswordMutation.isSuccess,
        uploadAvatar: uploadAvatarMutation.mutate,
        isUploadingAvatar: uploadAvatarMutation.isPending,
        avatarUploadError: uploadAvatarMutation.error
    }
} 