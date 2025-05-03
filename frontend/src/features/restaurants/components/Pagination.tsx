import React from 'react'
import { PaginationData } from '../types'

interface PaginationProps {
    pagination: PaginationData
    onPageChange: (page: number) => void
}

/**
 * Pagination component for navigating through restaurant pages
 */
export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
    const { page, pages, total } = pagination

    if (total === 0 || pages <= 1) {
        return null
    }

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers: number[] = []
        const maxPagesToShow = 5 // Max number of page buttons to show

        // Always show first page
        pageNumbers.push(1)

        // Handle page range
        if (pages <= maxPagesToShow) {
            // If total pages is less than max, show all
            for (let i = 2; i <= pages; i++) {
                pageNumbers.push(i)
            }
        } else {
            // More complex pagination with ellipsis
            if (page > 3) {
                pageNumbers.push(-1) // Ellipsis placeholder
            }

            // Show current page and surrounding pages
            const startPage = Math.max(2, page - 1)
            const endPage = Math.min(pages - 1, page + 1)

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i)
            }

            if (page < pages - 2) {
                pageNumbers.push(-1) // Ellipsis placeholder
            }

            // Always show last page if not already included
            if (!pageNumbers.includes(pages)) {
                pageNumbers.push(pages)
            }
        }

        return pageNumbers
    }

    return (
        <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-neutral-500">
                Showing <span className="font-medium">{Math.min(total, (page - 1) * pagination.limit + 1)}-{Math.min(page * pagination.limit, total)}</span> of <span className="font-medium">{total}</span> restaurants
            </div>

            <nav className="flex items-center space-x-1">
                {/* Previous button */}
                <button
                    onClick={() => page > 1 && onPageChange(page - 1)}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded-md ${page === 1
                        ? 'text-neutral-300 cursor-not-allowed'
                        : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                    aria-label="Previous page"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((pageNum, index) =>
                    pageNum === -1 ? (
                        // Ellipsis
                        <span key={`ellipsis-${index}`} className="px-3 py-1">
                            ...
                        </span>
                    ) : (
                        // Page number
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`px-3 py-1 rounded-md ${pageNum === page
                                ? 'bg-primary-600 text-white'
                                : 'text-neutral-700 hover:bg-neutral-100'
                                }`}
                            aria-current={pageNum === page ? 'page' : undefined}
                        >
                            {pageNum}
                        </button>
                    )
                )}

                {/* Next button */}
                <button
                    onClick={() => page < pages && onPageChange(page + 1)}
                    disabled={page === pages}
                    className={`px-3 py-1 rounded-md ${page === pages
                        ? 'text-neutral-300 cursor-not-allowed'
                        : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                    aria-label="Next page"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
            </nav>
        </div>
    )
} 