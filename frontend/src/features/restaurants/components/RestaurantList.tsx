import { MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useRestaurantList } from '../hooks/useRestaurantList'
import { Restaurant } from '../types/restaurant.types'
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog'
import { RestaurantCard } from './RestaurantCard'
import RestaurantCreationForm from './RestaurantCreationForm'
import RestaurantEditForm from './RestaurantEditForm'

export const RestaurantList = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [restaurantToDelete, setRestaurantToDelete] = useState<string | null>(null)
    const {
        restaurants,
        isLoading,
        error,
        totalCount,
        currentPage,
        totalPages,
        setPage,
        handleSearch,
        sortBy,
        order,
        setSorting,
        deleteRestaurant
    } = useRestaurantList()

    const handleDelete = async (id: string) => {
        setRestaurantToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!restaurantToDelete) return

        try {
            await deleteRestaurant(restaurantToDelete)
            // Refresh the page to show updated data
            window.location.reload()
        } catch (error) {
            console.error('Error deleting restaurant:', error)
        }
    }

    const handleEdit = (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant)
        setIsFormOpen(true)
    }

    const handleFormClose = () => {
        setIsFormOpen(false)
        setSelectedRestaurant(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Restaurants</h1>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Restaurant
                </button>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search restaurants..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            handleSearch(e.target.value)
                        }}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <select
                    value={`${sortBy}-${order}`}
                    onChange={(e) => {
                        const [newSortBy] = e.target.value.split('-')
                        setSorting(newSortBy as any)
                    }}
                    className="block w-[200px] pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="updatedAt-desc">Recently Updated</option>
                    <option value="updatedAt-asc">Least Recently Updated</option>
                </select>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">
                            Showing {restaurants.length} of {totalCount} restaurants
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant._id}
                                restaurant={restaurant}
                                onEdit={() => handleEdit(restaurant)}
                                onDelete={() => handleDelete(restaurant._id)}
                            />
                        ))}
                    </div>
                </>
            )}

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages} ({totalCount} total items)
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setPage(page)}
                                disabled={page === currentPage}
                                className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${page === currentPage
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Dialog */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-xl font-semibold">
                                {selectedRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
                            </h2>
                            <button
                                onClick={handleFormClose}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            {selectedRestaurant ? (
                                <RestaurantEditForm
                                    restaurant={selectedRestaurant}
                                    onClose={handleFormClose}
                                />
                            ) : (
                                <RestaurantCreationForm onClose={handleFormClose} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                isOpen={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false)
                    setRestaurantToDelete(null)
                }}
                onConfirm={confirmDelete}
                title="Delete Restaurant"
                message="Are you sure you want to delete this restaurant? This action cannot be undone."
                confirmText="Delete Restaurant"
                cancelText="Cancel"
            />
        </div>
    )
} 