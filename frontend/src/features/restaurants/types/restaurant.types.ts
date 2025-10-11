import { Menu } from "@/features/menus/types/menu.types"

export interface ContactInfo {
    phone: string
    email?: string
    website?: string
}

export interface Location {
    street: string
    houseNumber: string
    city: string
    zipCode: string
}

export interface BusinessHours {
    day: number
    open?: string
    close?: string
    closed: boolean
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
    isActive: boolean
    createdAt: string
    updatedAt: string
    menus?: Menu[]
}

export interface RestaurantFormData {
    id?: string
    name: string
    description?: string
    contact: ContactInfo
    location: Location
    hours: BusinessHours[]
    logo?: File
    logoUrl?: string
    isActive?: boolean
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