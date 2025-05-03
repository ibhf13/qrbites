import React, { useState } from 'react'
import { RestaurantListRequest } from '../types'

interface RestaurantSearchProps {
    onSearch: (params: Partial<RestaurantListRequest>) => void
    initialValue?: string
}

/**
 * Search component for filtering restaurants
 */
export const RestaurantSearch: React.FC<RestaurantSearchProps> = ({
    onSearch,
    initialValue = ''
}) => {
    const [searchTerm, setSearchTerm] = useState(initialValue)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch({ name: searchTerm })
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search restaurants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    aria-label="Search restaurants"
                />
                <div className="absolute left-3 top-3.5 text-neutral-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <button
                    type="submit"
                    className="absolute right-2 top-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-1 rounded-md transition-colors"
                >
                    Search
                </button>
            </div>
        </form>
    )
} 