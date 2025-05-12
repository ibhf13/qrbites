import React, { useEffect, useState } from 'react'
import { SearchBar } from '../../../components/common/navigation'
import { useDebounce } from '../../../hooks'
import { SortOption } from '../hooks/useRestaurantList'

interface RestaurantListFiltersProps {
    onSearch: (term: string) => void
    onSortChange: (sortBy: SortOption) => void
    sortBy: SortOption
    sortOrder: 'asc' | 'desc'
    isLoading?: boolean
}

export const RestaurantListFilters: React.FC<RestaurantListFiltersProps> = ({
    onSearch,
    onSortChange,
    sortBy,
    sortOrder,
    isLoading = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    // Pass debounced search term to parent
    useEffect(() => {
        onSearch(debouncedSearchTerm)
    }, [debouncedSearchTerm, onSearch])

    // Custom search handler
    const handleSearch = (term: string) => {
        setSearchTerm(term)
    }

    return (
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="w-full sm:max-w-md">
                <SearchBar
                    placeholder="Search restaurants..."
                    onSearch={handleSearch}
                    className={isLoading ? "opacity-70 pointer-events-none" : ""}
                />
            </div>

            <div className="flex items-center gap-2">
                <span className="text-gray-500">Sort by:</span>
                <div className="relative inline-block">
                    <select
                        className="bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        disabled={isLoading}
                        aria-label="Sort restaurants"
                    >
                        <option value="name">Name {sortBy === 'name' && (sortOrder === 'asc' ? '(A-Z)' : '(Z-A)')}</option>
                        <option value="createdAt">Date Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? '(Oldest)' : '(Newest)')}</option>
                        <option value="updatedAt">Last Updated {sortBy === 'updatedAt' && (sortOrder === 'asc' ? '(Oldest)' : '(Newest)')}</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
} 