export interface UserInfoResponse {
    success: boolean
    error?: string
    data: {
        _id: string
        email: string
        role: string
        profile?: {
            firstName?: string
            lastName?: string
            phoneNumber?: string
        }
        stats?: {
            restaurantCount: number
            menuCount: number
        }
    }
}

export interface UserProfile {
    firstName: string
    lastName: string
    phoneNumber?: string
}

export interface ProfileFormData {
    firstName: string
    lastName: string
    phoneNumber?: string
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
}

export interface ChangePasswordResponse {
    success: boolean
    message: string
}

export interface PasswordChangeFormData {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
}

export interface AvatarUploadResponse {
    success: boolean
    data: {
        avatarUrl: string
    }
} 