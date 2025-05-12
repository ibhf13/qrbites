import React from 'react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}) => {
    // Calculate which page numbers to show
    const getPageNumbers = () => {
        const maxPagesToShow = 5
        const pageNumbers: (number | string)[] = []

        if (totalPages <= maxPagesToShow) {
            // If we have fewer pages than our max, show all pages
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i)
            }
        } else {
            // Always show first page
            pageNumbers.push(1)

            // Calculate start and end of pagination range
            let start = Math.max(2, currentPage - 1)
            let end = Math.min(totalPages - 1, currentPage + 1)

            // Adjust the range if at boundaries
            if (currentPage <= 2) {
                end = 4
            } else if (currentPage >= totalPages - 1) {
                start = totalPages - 3
            }

            // Add ellipsis after first if needed
            if (start > 2) {
                pageNumbers.push('...')
            }

            // Add the page range
            for (let i = start; i <= end; i++) {
                pageNumbers.push(i)
            }

            // Add ellipsis before last if needed
            if (end < totalPages - 1) {
                pageNumbers.push('...')
            }

            // Always show last page
            if (totalPages > 1) {
                pageNumbers.push(totalPages)
            }
        }

        return pageNumbers
    }

    const pageNumbers = getPageNumbers()

    if (totalPages <= 1) {
        return null
    }

    return (
        <nav aria-label="Page navigation" className={`flex justify-center mt-6 ${className}`}>
            <ul className="inline-flex items-center -space-x-px">
                {/* Previous page button */}
                <li>
                    <button
                        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`block px-3 py-2 ml-0 leading-tight border rounded-l-lg 
              ${currentPage === 1
                                ? 'text-gray-400 bg-white border-gray-300 cursor-not-allowed'
                                : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'}`
                        }
                        aria-label="Previous page"
                    >
                        <span className="sr-only">Previous</span>
                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </li>

                {/* Page numbers */}
                {pageNumbers.map((page, index) => (
                    <li key={`page-${page}-${index}`}>
                        {typeof page === 'number' ? (
                            <button
                                onClick={() => onPageChange(page)}
                                className={`px-3 py-2 leading-tight border ${currentPage === page
                                        ? 'z-10 text-blue-600 border-blue-300 bg-blue-50'
                                        : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                                aria-current={currentPage === page ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        ) : (
                            <span className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300">
                                {page}
                            </span>
                        )}
                    </li>
                ))}

                {/* Next page button */}
                <li>
                    <button
                        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`block px-3 py-2 leading-tight border rounded-r-lg 
              ${currentPage === totalPages
                                ? 'text-gray-400 bg-white border-gray-300 cursor-not-allowed'
                                : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'}`
                        }
                        aria-label="Next page"
                    >
                        <span className="sr-only">Next</span>
                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </li>
            </ul>
        </nav>
    )
} 