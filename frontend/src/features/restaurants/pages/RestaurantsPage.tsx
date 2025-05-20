import { useState } from 'react'
import {
    IconButton,
    ErrorDisplay,
    Pagination,
    PageContainer,
    Paper,
    Typography,
    ConfirmationDialog,
    Box,
    FlexBox,
    Grid
} from '@/components/common'
import { useRestaurantList } from '../hooks/useRestaurantList'
import { Restaurant } from '../types/restaurant.types'
import { RestaurantCard, RestaurantFormDialog } from '../components'
import RestaurantListSkeleton from '../components/RestaurantListSkeleton'
import { PlusIcon } from '@heroicons/react/24/outline'

const RestaurantsPage = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null)

    const {
        restaurants,
        isLoading,
        error,
        totalCount,
        currentPage,
        totalPages,
        setPage,
        deleteRestaurant
    } = useRestaurantList()

    const handleDelete = async (restaurant: Restaurant) => {
        setRestaurantToDelete(restaurant)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!restaurantToDelete) return

        try {
            await deleteRestaurant(restaurantToDelete._id)
            setDeleteDialogOpen(false)
            setRestaurantToDelete(null)
        } catch (error) {
            console.error('Error deleting restaurant:', error)
        }
    }

    const handleEdit = (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant)
        setFormMode('edit')
        setIsFormOpen(true)
    }

    const handleAddNew = () => {
        setSelectedRestaurant(null)
        setFormMode('create')
        setIsFormOpen(true)
    }

    const handleFormClose = () => {
        setIsFormOpen(false)
        setSelectedRestaurant(null)
    }

    return (
        <PageContainer maxWidth='7xl' padding='sm'>
            <Paper
                title="Restaurants"
                padding='md'
                className='bg-white dark:bg-neutral-900'
                actions={
                    <IconButton
                        onClick={handleAddNew}
                        variant="primary"
                        icon={PlusIcon}
                        className="flex-shrink-0"
                    >
                        <Typography
                            variant="body"
                            color="neutral"
                            className="hidden sm:inline"
                        >
                            Add Restaurant
                        </Typography>
                        <Typography
                            variant="body"
                            color="neutral"
                            className="sm:hidden"
                        >
                            Add
                        </Typography>
                    </IconButton>
                }
            >
                <Box className="space-y-4 bg-white dark:bg-neutral-900 -mx-2 sm:-mx-4 md:-mx-6">
                    {isLoading ? (
                        <RestaurantListSkeleton count={6} gridLayout={true} />
                    ) : error ? (
                        <Box className="px-2 sm:px-4 md:px-6">
                            <ErrorDisplay
                                variant="banner"
                                message={error}
                                title="Error loading restaurants"
                                className="text-sm sm:text-base"
                            />
                        </Box>
                    ) : (
                        <>
                            <FlexBox
                                justify="between"
                                align="center"
                                className="px-2 sm:px-4 md:px-6"
                            >
                                <Typography
                                    as="p"
                                    variant="body"
                                    color="neutral"
                                    className="text-sm sm:text-base"
                                >
                                    <span className="hidden sm:inline">
                                        Showing {restaurants.length} of {totalCount} restaurants
                                    </span>
                                    <span className="sm:hidden">
                                        {restaurants.length} of {totalCount}
                                    </span>
                                </Typography>
                            </FlexBox>

                            <Box className="px-2 sm:px-4 md:px-6">
                                <Grid
                                    cols={1}
                                    colsSm={2}
                                    colsMd={3}
                                    colsLg={3}
                                    colsXl={3}
                                    gap="sm"
                                    responsive={true}
                                    className="sm:gap-4"
                                >
                                    {restaurants.map((restaurant) => (
                                        <RestaurantCard
                                            key={restaurant._id}
                                            restaurant={restaurant}
                                            onEdit={() => handleEdit(restaurant)}
                                            onDelete={() => handleDelete(restaurant)}
                                        />
                                    ))}
                                </Grid>
                            </Box>
                        </>
                    )}

                    {totalPages > 1 && (
                        <Box className="px-2 sm:px-4 md:px-6">
                            <FlexBox
                                direction="col"
                                gap="sm"
                                className="sm:flex-row sm:justify-between sm:items-center pt-2"
                            >
                                <Typography
                                    as="p"
                                    variant="body"
                                    color="neutral"
                                    className="text-sm sm:text-base text-center sm:text-left"
                                >
                                    <span className="hidden sm:inline">
                                        Page {currentPage} of {totalPages} ({totalCount} total items)
                                    </span>
                                    <span className="sm:hidden">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </Typography>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                    maxVisiblePages={3}
                                    className="justify-center sm:justify-end"
                                />
                            </FlexBox>
                        </Box>
                    )}
                </Box>
            </Paper>

            <RestaurantFormDialog
                isOpen={isFormOpen}
                onClose={handleFormClose}
                mode={formMode}
                restaurantData={selectedRestaurant || undefined}
            />

            <ConfirmationDialog
                isOpen={deleteDialogOpen}
                onCancel={() => {
                    setDeleteDialogOpen(false)
                    setRestaurantToDelete(null)
                }}
                onConfirm={confirmDelete}
                type="danger"
                title="Delete Restaurant"
                message={`Are you sure you want to delete "${restaurantToDelete?.name}"? This action cannot be undone and will permanently remove all associated data including menus and QR codes.`}
                confirmText="Delete Restaurant"
                cancelText="Cancel"
            />
        </PageContainer>
    )
}

export default RestaurantsPage