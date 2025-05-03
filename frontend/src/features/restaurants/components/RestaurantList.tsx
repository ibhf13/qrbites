import React from 'react'
import { Restaurant } from '../types'
import { RestaurantCard } from './RestaurantCard'

interface RestaurantListProps {
    restaurants: Restaurant[]
    isLoading: boolean
}

/**
 * Component to display a grid of restaurant cards
 */
export const RestaurantList: React.FC<RestaurantListProps> = ({
    restaurants,
    isLoading
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-md p-5 h-48 animate-pulse"
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-neutral-200 mr-4" />
                            <div className="flex-1">
                                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-neutral-200 rounded w-1/2" />
                            </div>
                        </div>
                        <div className="h-4 bg-neutral-200 rounded w-full mb-4" />
                        <div className="h-4 bg-neutral-200 rounded w-full mb-4" />
                        <div className="mt-4">
                            <div className="h-8 bg-neutral-200 rounded w-full" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (restaurants.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm mt-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                </svg>
                <h3 className="text-lg font-medium text-neutral-700 mt-4">No restaurants found</h3>
                <p className="text-neutral-500 mt-1">Try adjusting your search or create a new restaurant</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
        </div>
    )
} 