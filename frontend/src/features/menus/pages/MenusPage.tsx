import { useParams } from 'react-router-dom'
import { PageContainer, Paper } from '@/components/common/layout'
import { ErrorDisplay } from '@/components/common/feedback'
import { QRCodeViewer } from '@/features/qr/components/QRCodeViewer'
import { useMenuList, useMenuForm, useMenuActions } from '../hooks'
import { MenuListContainer, MenusPageHeader, MenuFormDialog } from '../components'

const MenusPage = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>()

    const { menus, isLoading, error, refreshList } = useMenuList({
        restaurantId: restaurantId || ''
    })

    const menuForm = useMenuForm({
        restaurantId: restaurantId || '',
        onSuccess: refreshList
    })

    const menuActions = useMenuActions({
        menus,
        refreshList
    })

    if (!restaurantId) {
        return (
            <PageContainer maxWidth="7xl" padding="sm" background="neutral" fullHeight>
                <Paper title="Restaurant Menus" padding="md">
                    <ErrorDisplay
                        message="Restaurant ID is required to view menus"
                        variant="banner"
                        className="mt-4"
                    />
                </Paper>
            </PageContainer>
        )
    }

    return (
        <PageContainer maxWidth="7xl" padding="sm" fullHeight>
            <Paper
                padding="md"
                className='bg-white dark:bg-neutral-900'
                actions={
                    <MenusPageHeader
                        title="Restaurant Menus"
                        onAddMenu={menuForm.toggleForm}
                        isFormOpen={menuForm.isFormOpen}
                    />
                }
            >
                <MenuListContainer
                    menus={menus}
                    isLoading={isLoading}
                    error={error}
                    onEdit={menuActions.handleEdit}
                    onDelete={menuActions.handleDelete}
                    onGenerateQR={menuActions.handleGenerateQR}
                    onViewQR={menuActions.handleViewQR}
                    onView={menuActions.handleView}
                />
            </Paper>

            <MenuFormDialog
                isOpen={menuForm.isFormOpen}
                onClose={menuForm.closeForm}
                mode="create"
                restaurantId={restaurantId}
            />

            <MenuFormDialog
                isOpen={menuActions.isEditFormOpen}
                onClose={menuActions.closeEditForm}
                mode="edit"
                restaurantId={restaurantId}
                menuData={menuActions.editMenuData || undefined}
            />

            {menuActions.qrViewerOpen && menuActions.selectedQRMenu && (
                <QRCodeViewer
                    menuId={menuActions.selectedQRMenu._id}
                    qrCodeUrl={menuActions.selectedQRMenu.qrCodeUrl || ''}
                    menuName={menuActions.selectedQRMenu.name}
                    targetUrl={`${window.location.origin}/view/menu/${menuActions.selectedQRMenu._id}`}
                    onClose={menuActions.closeQRViewer}
                />
            )}
        </PageContainer>
    )
}

export default MenusPage 