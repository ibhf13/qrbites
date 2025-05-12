import React from 'react'
import { Link } from 'react-router-dom'
import { Restaurant } from '../types/restaurant.types'

interface RestaurantCardProps {
    restaurant: Restaurant
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
    restaurant,
    onEdit,
    onDelete
}) => {
    const { _id, name, description, logoUrl, location, stats, isActive } = restaurant

    // Format date from ISO string
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date)
    }

    // Handle card actions with click stop propagation to prevent navigation
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        onEdit(_id)
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        onDelete(_id)
    }

    return (
        <Link
            to={`/restaurants/${_id}`}
            className="block rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
        >
            <div className="relative h-40 overflow-hidden rounded-t-lg bg-gray-100">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt={`${name} logo`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-blue-50">
                        <span className="text-4xl font-bold text-blue-300">
                            {name.substring(0, 2).toUpperCase()}
                        </span>
                    </div>
                )}
                {!isActive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                        Inactive
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">{name}</h3>
                    <div className="flex">
                        <button
                            onClick={handleEdit}
                            aria-label="Edit restaurant"
                            className="p-1 text-gray-500 hover:text-blue-600 mr-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleDelete}
                            aria-label="Delete restaurant"
                            className="p-1 text-gray-500 hover:text-red-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{description}</p>
                )}

                <div className="space-y-2">
                    {location && (
                        <div className="flex items-center text-sm text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="line-clamp-1">
                                {[location.city, location.state].filter(Boolean).join(', ')}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>
                            {stats?.menuCount || 0} Menu{(stats?.menuCount || 0) !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                    Updated {formatDate(restaurant.updatedAt)}
                </div>
            </div>
        </Link>
    )
} 