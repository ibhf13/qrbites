import { apiRequest } from '@/config/api'
import {
    ChangePasswordRequest,
    ChangePasswordResponse,
    UserInfoResponse,
    UserProfile
} from '../types/profile.types'

export const getUserInfo = async (): Promise<UserInfoResponse> => {
    return apiRequest<UserInfoResponse>({
        method: 'GET',
        url: '/api/auth/me'
    })
}

export const updateUserProfile = async (profileData: UserProfile): Promise<UserInfoResponse> => {
    return apiRequest<UserInfoResponse>({
        method: 'PUT',
        url: '/api/auth/profile',
        data: profileData
    })
}

export const changePassword = async (passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    return apiRequest<ChangePasswordResponse>({
        method: 'PUT',
        url: '/api/auth/password',
        data: passwordData
    })
}

export const uploadAvatar = async (formData: FormData): Promise<{ success: boolean; data: { avatarUrl: string } }> => {
    return apiRequest({
        method: 'POST',
        url: '/api/auth/avatar',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
} 