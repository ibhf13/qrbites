import {
    Pagination,
    RestaurantList,
    RestaurantSearch,
    useRestaurants
} from '@/features/restaurants'
import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Restaurant Dashboard Page
 * Main dashboard for restaurant owners to manage their restaurants
 */
const RestaurantDashboardPage: React.FC = () => {
    const {
        restaurants,
        pagination,
        isLoading,
        isError,
        queryParams,
        updateParams,
        goToPage
    } = useRestaurants()

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-neutral-800">Your Restaurants</h1>
                    <p className="text-neutral-500 mt-1">Manage all your restaurants in one place</p>
                </div>
                <Link
                    to="/restaurants/new"
                    className="mt-4 sm:mt-0 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-md transition-colors inline-flex items-center"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Add New Restaurant
                </Link>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <RestaurantSearch
                        onSearch={(params) => updateParams(params)}
                        initialValue={queryParams.name}
                    />

                    <div className="flex items-center">
                        <label htmlFor="sortOrder" className="block text-sm font-medium text-neutral-500 mr-2">
                            Sort by:
                        </label>
                        <select
                            id="sortOrder"
                            value={`${queryParams.sortBy}:${queryParams.order}`}
                            onChange={(e) => {
                                const [sortBy, order] = e.target.value.split(':')
                                updateParams({ sortBy, order: order as 'asc' | 'desc' })
                            }}
                            className="block py-2 px-3 border border-neutral-200 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                        >
                            <option value="created:desc">Newest first</option>
                            <option value="created:asc">Oldest first</option>
                            <option value="name:asc">Name (A-Z)</option>
                            <option value="name:desc">Name (Z-A)</option>
                        </select>
                    </div>
                </div>

                {/* Error state */}
                {isError && (
                    <div className="mt-8 bg-red-50 p-4 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Unable to load restaurants</h3>
                                <p className="text-sm text-red-700 mt-2">Please try again later or contact support if the problem persists.</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Restaurant list */}
                <RestaurantList
                    restaurants={restaurants}
                    isLoading={isLoading}
                />

                {/* Pagination */}
                {pagination && !isLoading && !isError && (
                    <Pagination
                        pagination={pagination}
                        onPageChange={goToPage}
                    />
                )}
            </div>
        </div>
    )
}

export default RestaurantDashboardPage 