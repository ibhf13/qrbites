export interface UserInfoResponse {
    success: boolean
    data: {
        _id: string
        email: string
        role: string
        profile?: {
            firstName?: string
            lastName?: string
            phoneNumber?: string
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