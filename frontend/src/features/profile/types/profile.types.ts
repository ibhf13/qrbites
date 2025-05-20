import { ApiResponse } from '@/config/api'

export interface Location {
    street?: string
    houseNumber?: string
    city?: string
    zipCode?: string
    country?: string
    coordinates?: {
        latitude: number
        longitude: number
    }
}

export interface NotificationPreferences {
    email: boolean
    sms: boolean
    push: boolean
}

export interface UserPreferences {
    language: 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt'
    timezone: string
    notifications: NotificationPreferences
}

export interface SocialLinks {
    website?: string
    twitter?: string
    instagram?: string
    linkedin?: string
}

export interface UserProfile {
    firstName?: string
    lastName?: string
    displayName?: string
    phone?: string
    bio?: string
    dateOfBirth?: string
    location?: Location
    preferences?: UserPreferences
    socialLinks?: SocialLinks
    isPublic?: boolean
}

export interface UserInfo {
    _id: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    avatarUrl?: string
    role: string
    profile?: UserProfile
    stats?: {
        restaurantCount: number
        menuCount: number
    }
    createdAt: string
    updatedAt: string
}

export interface ProfileData {
    _id: string
    userId: string
    firstName?: string
    lastName?: string
    displayName?: string
    phone?: string
    profilePicture?: string
    bio?: string
    dateOfBirth?: string
    location?: Location
    preferences?: UserPreferences
    socialLinks?: SocialLinks
    isPublic: boolean
    isVerified: boolean
    lastProfileUpdate: string
    createdAt: string
    updatedAt: string
    fullName?: string
    formattedAddress?: string
}

export type UserInfoResponse = ApiResponse<UserInfo>
export type ProfileResponse = ApiResponse<ProfileData>
export type ProfileUpdateResponse = ApiResponse<ProfileData>
export type ChangePasswordResponse = ApiResponse<{ message: string }>
export type AvatarUploadResponse = ApiResponse<{ avatarUrl: string }>
export type PrivacyUpdateResponse = ApiResponse<{ isPublic: boolean }>

export interface BasicInfoFormData {
    firstName?: string
    lastName?: string
    displayName?: string
    phone?: string
    bio?: string
    dateOfBirth?: string
}

export interface LocationFormData {
    street?: string
    houseNumber?: string
    city?: string
    zipCode?: string
    country?: string
}

export interface PreferencesFormData extends UserPreferences { }

export interface SocialLinksFormData extends SocialLinks { }

export interface PrivacyFormData {
    isPublic: boolean
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
}

export interface PasswordChangeFormData extends ChangePasswordRequest {
    confirmNewPassword: string
}

export interface ProfileState {
    profile: ProfileData | null
    isLoading: boolean
    error: string | null
}

export interface ProfileActions {
    updateProfile: (data: Partial<UserProfile>) => Promise<void>
    changePassword: (data: ChangePasswordRequest) => Promise<void>
    uploadAvatar: (formData: FormData) => Promise<void>
    updatePrivacySettings: (data: PrivacyFormData) => Promise<void>
    refreshProfile: () => Promise<void>
} 