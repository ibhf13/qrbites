import { Button, FormInput } from '@/components/common'
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

    const searchIcon = (
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
    )

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex">
                <div className="flex-grow mr-2">
                    <FormInput
                        placeholder="Search restaurants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={searchIcon}
                        aria-label="Search restaurants"
                        containerClassName="mb-0"
                    />
                </div>
                <Button type="submit" variant="primary">
                    Search
                </Button>
            </div>
        </form>
    )
} 