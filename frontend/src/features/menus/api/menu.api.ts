import { apiRequest, ApiResponse } from '@/config/api'
import { Menu, MenuListResponse, MenuFormData } from '../types/menu.types'

interface GetMenusParams {
    restaurantId: string
    page?: number
    limit?: number
    name?: string
}

interface DeleteMenuResponse {
    message: string
}

export const getMenus = async (params: GetMenusParams): Promise<MenuListResponse> => {
    const queryParams = new URLSearchParams({
        restaurantId: params.restaurantId,
        page: (params.page || 1).toString(),
        limit: (params.limit || 10).toString(),
    })

    if (params.name) {
        queryParams.append('name', params.name)
    }

    const response = await apiRequest<Menu[]>({
        method: 'GET',
        url: `/api/menus?${queryParams.toString()}`
    })

    if (response.success) {
        return {
            success: true,
            data: response.data,
            pagination: {
                page: response.page || 1,
                limit: response.limit || 10,
                total: response.total || 0,
                pages: Math.ceil((response.total || 0) / (response.limit || 10))
            }
        }
    }

    return {
        success: false,
        data: [],
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
        }
    }
}

export const getMenu = async (id: string): Promise<ApiResponse<Menu>> => {
    return apiRequest<Menu>({
        method: 'GET',
        url: `/api/menus/${id}`
    })
}

export const createMenu = async (data: MenuFormData): Promise<ApiResponse<Menu>> => {
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('restaurantId', data.restaurantId)
    formData.append('isActive', data.isActive.toString())

    if (data.description) {
        formData.append('description', data.description)
    }

    if (data.image) {
        formData.append('images', data.image)
    }

    return apiRequest<Menu>({
        method: 'POST',
        url: '/api/menus',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export const updateMenu = async (id: string, data: Partial<MenuFormData>): Promise<ApiResponse<Menu>> => {
    const formData = new FormData()

    if (data.name) formData.append('name', data.name)
    if (data.description) formData.append('description', data.description)
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString())

    if (data.image) {
        formData.append('images', data.image)
    }

    return apiRequest<Menu>({
        method: 'PUT',
        url: `/api/menus/${id}`,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export const deleteMenu = async (id: string): Promise<ApiResponse<DeleteMenuResponse>> => {
    return apiRequest<DeleteMenuResponse>({
        method: 'DELETE',
        url: `/api/menus/${id}`
    })
}

