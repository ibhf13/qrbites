import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createMenu,
    deleteMenu as deleteMenuApi,
    getMenu,
    getMenus,
    updateMenu
} from '../api/menu.api'
import { MenuFormData, MenuFilters } from '../types/menu.types'

interface GetMenusParams extends MenuFilters {
    restaurantId: string
}

export const useMenus = (params: GetMenusParams) => {
    return useQuery({
        queryKey: ['menus', params],
        queryFn: () => getMenus(params),
        enabled: !!params.restaurantId
    })
}

export const useMenu = (id: string) => {
    return useQuery({
        queryKey: ['menu', id],
        queryFn: () => getMenu(id),
        select: (response) => response.success ? response.data : null,
        enabled: !!id
    })
}

export const useCreateMenu = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createMenu,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menus'] })
        },
        onError: (error) => {
            console.error('Create menu error:', error)
            throw error
        }
    })
}

export const useUpdateMenu = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<MenuFormData> }) =>
            updateMenu(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menus'] })
        },
        onError: (error) => {
            console.error('Update menu error:', error)
            throw error
        }
    })
}

export const useDeleteMenu = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteMenuApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menus'] })
        },
        onError: (error) => {
            console.error('Delete menu error:', error)
            throw error
        }
    })
}




