import apiClient from './client'

export interface Menu {
    _id: string
    name: string
    description?: string
    isActive: boolean
    categories: string[]
    restaurantId: string
    qrCodeUrl?: string
    createdAt: string
    updatedAt: string
}

export interface MenuItem {
    _id: string
    name: string
    description?: string
    price: number
    category?: string
    isAvailable: boolean
    image?: string
    menuId: string
    createdAt: string
    updatedAt: string
}

export interface CreateMenuData {
    name: string
    description?: string
    categories?: string[]
    restaurantId: string
}

export interface UpdateMenuData {
    name?: string
    description?: string
    categories?: string[]
    isActive?: boolean
}

export interface CreateMenuItemData {
    name: string
    description?: string
    price: number
    category?: string
    isAvailable?: boolean
    menuId: string
    image?: File
}

export interface MenuResponse {
    success: boolean
    data: Menu
}

export interface MenusResponse {
    success: boolean
    data: Menu[]
}

export interface MenuItemResponse {
    success: boolean
    data: MenuItem
}

export interface MenuItemsResponse {
    success: boolean
    data: MenuItem[]
}

export const menuService = {
    async getMenus(restaurantId?: string) {
        const url = restaurantId ? `/menus?restaurantId=${restaurantId}` : '/menus'
        const response = await apiClient.get<MenusResponse>(url)
        return response.data
    },

    async getMenu(id: string) {
        const response = await apiClient.get<MenuResponse>(`/menus/${id}`)
        return response.data
    },

    async createMenu(menuData: CreateMenuData) {
        const response = await apiClient.post<MenuResponse>('/menus', menuData)
        return response.data
    },

    async updateMenu(id: string, menuData: UpdateMenuData) {
        const response = await apiClient.put<MenuResponse>(`/menus/${id}`, menuData)
        return response.data
    },

    async deleteMenu(id: string) {
        const response = await apiClient.delete<{ success: boolean }>(`/menus/${id}`)
        return response.data
    },

    async getMenuItems(menuId: string) {
        const response = await apiClient.get<MenuItemsResponse>(`/menu-items?menuId=${menuId}`)
        return response.data
    },

    async getMenuItem(id: string) {
        const response = await apiClient.get<MenuItemResponse>(`/menu-items/${id}`)
        return response.data
    },

    async createMenuItem(menuItemData: CreateMenuItemData) {
        // For file uploads, we need to use FormData
        const formData = new FormData()
        Object.entries(menuItemData).forEach(([key, value]) => {
            if (value !== undefined) {
                formData.append(key, value)
            }
        })

        const response = await apiClient.post<MenuItemResponse>('/menu-items', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    },

    async deleteMenuItem(id: string) {
        const response = await apiClient.delete<{ success: boolean }>(`/menu-items/${id}`)
        return response.data
    },

    // Get the QR code for a menu
    async getMenuQrCode(id: string) {
        const response = await apiClient.get<{ success: boolean, data: { qrCodeUrl: string } }>(`/menus/${id}/qrcode`)
        return response.data
    }
} 