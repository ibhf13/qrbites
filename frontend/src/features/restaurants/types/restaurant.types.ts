export interface ContactInfo {
    phone: string
    email?: string
    website?: string
}

export interface Location {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
}

export interface BusinessHours {
    day: number
    open?: string
    close?: string
    closed: boolean
}

export interface RestaurantStats {
    menuCount: number
}

export interface Restaurant {
    _id: string
    name: string
    description?: string
    userId: string
    contact: ContactInfo
    location: Location
    hours: BusinessHours[]
    logoUrl?: string
    bannerImage?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    menus?: string[] // Virtual field from backend
    stats?: RestaurantStats // Stats from backend
}

export interface RestaurantFormData {
    id?: string
    name: string
    description?: string
    contact: ContactInfo
    location: Location
    hours: BusinessHours[]
    logo?: File
    bannerImage?: File
    isActive?: boolean
}

export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
}

export type RestaurantFormMode = 'create' | 'edit'

export interface RestaurantFormProps {
    mode: RestaurantFormMode
    initialData?: Partial<RestaurantFormData>
    onSubmit: (data: RestaurantFormData) => Promise<void>
}

export interface FormStepProps {
    onNext: () => void
    onBack: () => void
    isLastStep: boolean
    isSubmitting: boolean
} 