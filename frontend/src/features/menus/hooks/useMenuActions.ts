import { useState } from 'react'
import { useNotificationContext } from '@/features/notifications/contexts/NotificationContext'
import { useDeleteMenu } from '../hooks'
import { useGenerateQRCode } from '@/features/qr'
import { Menu } from '../types/menu.types'

interface UseMenuActionsProps {
    menus: Menu[]
    refreshList: () => void
}

interface UseMenuActionsResult {
    qrViewerOpen: boolean
    selectedQRMenu: Menu | null
    closeQRViewer: () => void
    editMenuData: Menu | null
    isEditFormOpen: boolean
    closeEditForm: () => void
    handleEdit: (menuId: string) => void
    handleDelete: (menuId: string) => Promise<void>
    handleGenerateQR: (menuId: string) => Promise<void>
    handleViewQR: (menuId: string) => void
    handleView: (menuId: string) => void
    isDeletingMenu: boolean
    isGeneratingQR: boolean
}

export const useMenuActions = ({
    menus,
    refreshList
}: UseMenuActionsProps): UseMenuActionsResult => {
    const { showSuccess, showError } = useNotificationContext()

    const [qrViewerOpen, setQrViewerOpen] = useState(false)
    const [selectedQRMenu, setSelectedQRMenu] = useState<Menu | null>(null)

    const [editMenuData, setEditMenuData] = useState<Menu | null>(null)
    const [isEditFormOpen, setIsEditFormOpen] = useState(false)

    const deleteMutation = useDeleteMenu()
    const generateQRMutation = useGenerateQRCode()

    const handleEdit = (menuId: string) => {
        const menu = menus.find(m => m._id === menuId)

        if (menu) {
            setEditMenuData(menu)
            setIsEditFormOpen(true)
        } else {
            showError('Menu not found')
        }
    }

    const handleDelete = async (menuId: string) => {
        const menu = menus.find(m => m._id === menuId)
        const menuName = menu?.name || 'menu'

        if (window.confirm(`Are you sure you want to delete "${menuName}"? This action cannot be undone.`)) {
            try {
                await deleteMutation.mutateAsync(menuId)
                showSuccess(`Menu "${menuName}" deleted successfully!`)
                refreshList()
            } catch (error) {
                showError('Failed to delete menu')
                console.error('Delete menu error:', error)
            }
        }
    }

    const handleGenerateQR = async (menuId: string) => {
        try {
            await generateQRMutation.mutateAsync(menuId)
            showSuccess('QR code generated successfully!')
            refreshList()
        } catch (error) {
            showError('Failed to generate QR code')
            console.error('QR generation error:', error)
        }
    }

    const handleViewQR = (menuId: string) => {
        const menu = menus.find(m => m._id === menuId)

        if (menu?.qrCodeUrl) {
            setSelectedQRMenu(menu)
            setQrViewerOpen(true)
        } else {
            showError('QR code not available for this menu. Generate one first.')
        }
    }

    const handleView = (menuId: string) => {
        const targetUrl = `/view/menu/${menuId}`

        window.open(targetUrl, '_blank')
    }

    const closeQRViewer = () => {
        setQrViewerOpen(false)
        setSelectedQRMenu(null)
    }

    const closeEditForm = () => {
        setIsEditFormOpen(false)
        setEditMenuData(null)
    }

    return {
        qrViewerOpen,
        selectedQRMenu,
        closeQRViewer,
        editMenuData,
        isEditFormOpen,
        closeEditForm,
        handleEdit,
        handleDelete,
        handleGenerateQR,
        handleViewQR,
        handleView,
        isDeletingMenu: deleteMutation.isPending,
        isGeneratingQR: generateQRMutation.isPending
    }
}

export default useMenuActions 