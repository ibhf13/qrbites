
export interface Menu {
    _id: string
    name: string
    description?: string
    imageUrl?: string
    imageUrls?: string[]
    restaurantId: string
    isActive: boolean
    qrCodeUrl?: string
    categories?: string[]
    createdAt: string
    updatedAt: string
}

export interface MenuFormData {
    name: string
    description?: string
    image?: File
    images?: File[]
    restaurantId: string
    isActive: boolean
    categories?: string[]
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

