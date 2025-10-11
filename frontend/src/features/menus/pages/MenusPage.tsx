import { useParams } from 'react-router-dom'
import { PageContainer, Paper, Typography, IconButton } from '@/components/common'
import { QRCodeViewer } from '@/features/qr/components/QRCodeViewer'
import { useMenuList, useMenuForm, useMenuActions } from '../hooks'
import { MenuListContainer, MenuFormDialog } from '../components'
import { PlusIcon } from '@heroicons/react/24/outline'
import { ErrorDisplay } from '@/features/errorHandling/components'

const MenusPage = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>()

    const { menus, isLoading, refreshList } = useMenuList({ restaurantId: restaurantId ?? '' })
    const menuActions = useMenuActions({ menus, refreshList })

    const menuForm = useMenuForm({
        restaurantId: restaurantId || '',
        onSuccess: refreshList
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
                title="Restaurant Menus"
                padding="md"
                className='bg-white dark:bg-neutral-900 '
                headerClassName='py-2 px-2 md:px-4'
                contentClassName='p-0 '
                actions={
                    <IconButton
                        onClick={menuForm.toggleForm}
                        variant={menuForm.isFormOpen ? 'outline' : 'primary'}
                        icon={PlusIcon}
                        className="flex-shrink-0 px-2"
                    >
                        <Typography
                            variant="body"
                            color="neutral"
                            className="hidden sm:inline pl-1"
                        >
                            {menuForm.isFormOpen ? 'Cancel' : 'Add Menu'}
                        </Typography>
                        <Typography
                            variant="body"
                            color="neutral"
                            className="sm:hidden"
                        >
                            {menuForm.isFormOpen ? 'Cancel' : 'Add'}
                        </Typography>
                    </IconButton>

                }
            >
                <MenuListContainer
                    menus={menus}
                    isLoading={isLoading}
                    onEdit={menuActions.handleEdit}
                    onDelete={menuActions.handleDelete}
                    onGenerateQR={menuActions.handleGenerateQR}
                    onRegenerateQR={menuActions.handleRegenerateQR}
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

            <QRCodeViewer
                isOpen={menuActions.qrViewerOpen && !!menuActions.selectedQRMenu}
                qrCodeUrl={menuActions.selectedQRMenu?.qrCodeUrl || ''}
                menuName={menuActions.selectedQRMenu?.name || ''}
                targetUrl={`${window.location.origin}/view/menu/${menuActions.selectedQRMenu?._id}`}
                onClose={menuActions.closeQRViewer}
            />
        </PageContainer>
    )
}

export default MenusPage 