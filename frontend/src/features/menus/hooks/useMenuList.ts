import { useState } from 'react'
import { useNotificationContext } from '@/features/notifications/contexts/NotificationContext'

import { Menu } from '../types/menu.types'
import { useDeleteMenu, useMenus } from './useMenus'

interface UseMenuListOptions {
    restaurantId: string
    initialPage?: number
    initialLimit?: number
}

interface UseMenuListResult {
    menus: Menu[]
    isLoading: boolean
    error: string | null
    totalCount: number
    currentPage: number
    totalPages: number
    setPage: (page: number) => void
    refreshList: () => void
    deleteMenu: (id: string) => Promise<void>
}

export const useMenuList = (options: UseMenuListOptions): UseMenuListResult => {
    const [currentPage, setCurrentPage] = useState(options.initialPage || 1)
    const [limit] = useState(options.initialLimit || 10)
    const { showError } = useNotificationContext()

    const queryParams = {
        restaurantId: options.restaurantId,
        page: currentPage,
        limit,
    }

    const { data, isLoading, error, refetch } = useMenus(queryParams)
    const deleteMutation = useDeleteMenu()

    const deleteMenu = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id)
        } catch (err) {
            showError('Failed to delete menu')
            throw err
        }
    }

    const totalPages = data?.pagination?.pages || 1

    return {
        menus: data?.data || [],
        isLoading,
        error: error ? (error as Error).message : null,
        totalCount: data?.pagination?.total || 0,
        currentPage,
        totalPages,
        setPage: setCurrentPage,
        refreshList: () => refetch(),
        deleteMenu
    }
} 