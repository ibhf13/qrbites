import { Restaurant, restaurantService } from '@api/restaurant'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const RestaurantList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)

    const { data, isLoading, error } = useQuery({
        queryKey: ['restaurants'],
        queryFn: () => restaurantService.getRestaurants()
    })

    const restaurants = data?.data || []

    const openRestaurantDetails = (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedRestaurant(null)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
                Error loading restaurants. Please try again.
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Your Restaurants</h1>
                <Link
                    to="/dashboard/restaurants/new"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    Add Restaurant
                </Link>
            </div>

            {restaurants.length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-600 mb-4">No restaurants yet</h3>
                    <p className="text-gray-500 mb-6">Create your first restaurant to get started</p>
                    <Link
                        to="/dashboard/restaurants/new"
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                    >
                        Add Your First Restaurant
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map((restaurant) => (
                        <div
                            key={restaurant._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition"
                        >
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">{restaurant.name}</h2>
                                <p className="text-gray-600 mb-4">{restaurant.description}</p>
                                <div className="flex items-center text-gray-500 mb-2">
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="truncate">{restaurant.address}</span>
                                </div>
                                <div className="flex items-center text-gray-500">
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>{restaurant.phone}</span>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex justify-between">
                                <button
                                    onClick={() => openRestaurantDetails(restaurant)}
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    View Details
                                </button>
                                <Link
                                    to={`/dashboard/menus?restaurantId=${restaurant._id}`}
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Manage Menus
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Restaurant Details Modal */}
            {isModalOpen && selectedRestaurant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
                            <h3 className="text-xl font-bold text-gray-800">Restaurant Details</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Name</h4>
                                <p className="text-gray-800">{selectedRestaurant.name}</p>
                            </div>
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                                <p className="text-gray-800">{selectedRestaurant.description}</p>
                            </div>
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Address</h4>
                                <p className="text-gray-800">{selectedRestaurant.address}</p>
                            </div>
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Contact</h4>
                                <p className="text-gray-800">{selectedRestaurant.phone}</p>
                                <p className="text-gray-800">{selectedRestaurant.email}</p>
                            </div>
                            {selectedRestaurant.website && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Website</h4>
                                    <a
                                        href={selectedRestaurant.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 hover:underline"
                                    >
                                        {selectedRestaurant.website}
                                    </a>
                                </div>
                            )}
                            {selectedRestaurant.openingHours && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Opening Hours</h4>
                                    <p className="text-gray-800">{selectedRestaurant.openingHours}</p>
                                </div>
                            )}
                        </div>
                        <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <Link
                                to={`/dashboard/restaurants/edit/${selectedRestaurant._id}`}
                                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                            >
                                Edit Restaurant
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RestaurantList 