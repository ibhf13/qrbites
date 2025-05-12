import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface SearchResult {
    id: string
    title: string
    description?: string
    path: string
    category?: string
}

interface SearchBarProps {
    placeholder?: string
    className?: string
    onSearch?: (term: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search...',
    className = '',
    onSearch
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const resultsRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    // Mock search results - replace with actual API call
    useEffect(() => {
        if (searchTerm.trim().length > 2) {
            // Mock results - replace with real API call
            const mockResults: SearchResult[] = [
                { id: '1', title: 'Dashboard', path: '/' },
                { id: '2', title: 'Restaurant Menu', description: 'Manage your menu items', path: '/restaurants/menus' },
                { id: '3', title: 'Settings', description: 'Account settings', path: '/settings' },
                { id: '4', title: 'QR Codes', description: 'Manage your QR codes', path: '/qr-codes' },
            ].filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description?.toLowerCase().includes(searchTerm.toLowerCase()))
            )

            setResults(mockResults)
            setIsOpen(mockResults.length > 0)
            setSelectedIndex(-1)
        } else {
            setResults([])
            setIsOpen(false)
        }
    }, [searchTerm])

    // Handle click outside to close results
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(e.target as Node) &&
                resultsRef.current &&
                !resultsRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Down arrow
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        }
        // Up arrow
        else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => Math.max(prev - 1, -1))
        }
        // Enter
        else if (e.key === 'Enter') {
            if (selectedIndex >= 0 && selectedIndex < results.length) {
                navigate(results[selectedIndex].path)
                setIsOpen(false)
                setSearchTerm('')
            } else if (searchTerm.trim()) {
                handleSearch()
            }
        }
        // Escape
        else if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    const handleSearch = () => {
        onSearch?.(searchTerm)
        setIsOpen(false)
    }

    const handleResultClick = (result: SearchResult) => {
        navigate(result.path)
        setIsOpen(false)
        setSearchTerm('')
    }

    const clearSearch = () => {
        setSearchTerm('')
        setResults([])
        inputRef.current?.focus()
    }

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => searchTerm.trim().length > 2 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2 border rounded-lg text-sm 
                    border-neutral-200 dark:border-neutral-700
                    bg-white dark:bg-neutral-800 
                    text-neutral-900 dark:text-neutral-100
                    focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Search"
                    aria-expanded={isOpen}
                    aria-autocomplete="list"
                    aria-controls={isOpen ? 'search-results' : undefined}
                    aria-activedescendant={selectedIndex >= 0 ? `result-${results[selectedIndex].id}` : undefined}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                {searchTerm && (
                    <button
                        className="absolute right-3 top-2.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        onClick={clearSearch}
                        aria-label="Clear search"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div
                    ref={resultsRef}
                    id="search-results"
                    className="absolute z-10 mt-1 w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-80 overflow-y-auto"
                    role="listbox"
                >
                    <ul className="py-1">
                        {results.map((result, index) => (
                            <li
                                key={result.id}
                                id={`result-${result.id}`}
                                role="option"
                                aria-selected={index === selectedIndex}
                                className={`px-4 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 
                          ${index === selectedIndex ? 'bg-neutral-100 dark:bg-neutral-700' : ''}`}
                                onClick={() => handleResultClick(result)}
                            >
                                <div className="font-medium text-neutral-900 dark:text-neutral-100">{result.title}</div>
                                {result.description && (
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                        {result.description}
                                    </div>
                                )}
                                {result.category && (
                                    <div className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                                        {result.category}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default SearchBar 