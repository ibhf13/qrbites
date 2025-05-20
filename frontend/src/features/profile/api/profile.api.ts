import { apiRequest } from '@/config/api'
import {
    AvatarUploadResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    PrivacyFormData,
    PrivacyUpdateResponse,
    ProfileResponse,
    ProfileUpdateResponse,
    UserInfo,
    UserInfoResponse,
    UserProfile
} from '../types/profile.types'

export const getUserInfo = async (): Promise<UserInfoResponse> => {
    return apiRequest<UserInfo>({
        method: 'GET',
        url: '/api/auth/me'
    })
}

export const getMyProfile = async (): Promise<ProfileResponse> => {
    return apiRequest({
        method: 'GET',
        url: '/api/profile'
    })
}

export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<ProfileUpdateResponse> => {
    return apiRequest({
        method: 'PUT',
        url: '/api/profile',
        data: profileData
    })
}

export const changePassword = async (passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    return apiRequest<{ message: string }>({
        method: 'PUT',
        url: '/api/auth/password',
        data: passwordData
    })
}

export const updatePrivacySettings = async (privacyData: PrivacyFormData): Promise<PrivacyUpdateResponse> => {
    return apiRequest<{ isPublic: boolean }>({
        method: 'PUT',
        url: '/api/profile/privacy',
        data: privacyData
    })
}

export const getUserProfile = async (userId: string): Promise<ProfileResponse> => {
    return apiRequest({
        method: 'GET',
        url: `/api/profile/user/${userId}`
    })
}

export const uploadAvatar = async (formData: FormData): Promise<AvatarUploadResponse> => {
    return apiRequest<{ avatarUrl: string }>({
        method: 'POST',
        url: '/api/profile/picture',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
} 