import React from 'react'
import { FormDialog } from '@/components/common/dialogs'
import { MenuForm } from './MenuForm'
import { Menu } from '../types/menu.types'

interface MenuFormDialogProps {
    isOpen: boolean
    onClose: () => void
    mode: 'create' | 'edit'
    restaurantId: string
    menuData?: Menu
}

const MenuFormDialog: React.FC<MenuFormDialogProps> = ({
    isOpen,
    onClose,
    mode,
    restaurantId,
    menuData
}) => {
    const title = mode === 'create'
        ? 'Add New Menu'
        : `Edit Menu: ${menuData?.name || ''}`

    return (
        <FormDialog
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="2xl"
        >
            <MenuForm
                initialData={
                    mode === 'edit' && menuData
                        ? {
                            name: menuData.name,
                            description: menuData.description || '',
                            isActive: menuData.isActive,
                        }
                        : undefined
                }
                onCancel={onClose}
                mode={mode}
                restaurantId={restaurantId}
                menuId={mode === 'edit' ? menuData?._id : undefined}
                existingImageUrl={mode === 'edit' ? menuData?.imageUrl : undefined}
            />
        </FormDialog>
    )
}

export default MenuFormDialog 