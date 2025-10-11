import { apiRequest, ApiResponse } from '@/config/api'
import { Menu, MenuListResponse, MenuFormData } from '../types/menu.types'
import { buildQueryString, buildFormData, withErrorHandling } from '@/utils/apiUtils'

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
    return withErrorHandling(async () => {
        const queryString = buildQueryString({
            restaurantId: params.restaurantId,
            page: params.page || 1,
            limit: params.limit || 10,
            name: params.name
        })

        const response = await apiRequest<Menu[]>({
            method: 'GET',
            url: `/api/menus?${queryString}`
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
    }, 'Failed to fetch menus')
}

export const getMenu = async (id: string): Promise<ApiResponse<Menu>> => {
    return withErrorHandling(async () => {
        return apiRequest<Menu>({
            method: 'GET',
            url: `/api/menus/${id}`
        })
    }, `Failed to fetch menu with id: ${id}`)
}

export const createMenu = async (data: MenuFormData): Promise<ApiResponse<Menu>> => {
    return withErrorHandling(async () => {
        const formData = buildFormData({
            name: data.name,
            restaurantId: data.restaurantId,
            isActive: data.isActive,
            description: data.description,
            categories: data.categories,
            images: data.image
        })

        return apiRequest<Menu>({
            method: 'POST',
            url: '/api/menus',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }, 'Failed to create menu')
}

export const updateMenu = async (id: string, data: Partial<MenuFormData>): Promise<ApiResponse<Menu>> => {
    return withErrorHandling(async () => {
        const formData = buildFormData({
            name: data.name,
            description: data.description,
            isActive: data.isActive,
            categories: data.categories,
            images: data.image
        })

        return apiRequest<Menu>({
            method: 'PUT',
            url: `/api/menus/${id}`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }, `Failed to update menu with id: ${id}`)
}

export const deleteMenu = async (id: string): Promise<ApiResponse<DeleteMenuResponse>> => {
    return withErrorHandling(async () => {
        return apiRequest<DeleteMenuResponse>({
            method: 'DELETE',
            url: `/api/menus/${id}`
        })
    }, `Failed to delete menu with id: ${id}`)
}

