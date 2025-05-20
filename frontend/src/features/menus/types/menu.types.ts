export interface Menu {
    _id: string
    name: string
    description?: string
    imageUrl?: string
    restaurantId: string | { _id: string; name: string }
    isActive: boolean
    qrCodeUrl?: string
    createdAt: string
    updatedAt: string
}

export interface MenuFormData {
    name: string
    description?: string
    image?: File
    restaurantId: string
    isActive: boolean
}

export interface MenuUpdateData extends Partial<Omit<MenuFormData, 'restaurantId'>> {
    imageUrl?: string
}

export interface MenuFilters {
    search?: string
    isActive?: boolean
    page?: number
    limit?: number
}

export interface MenuListResponse {
    success: boolean
    data: Menu[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

