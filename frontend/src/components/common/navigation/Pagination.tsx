import React from 'react'
import { Button } from '../buttons'
import { FlexBox, Typography } from '../layout'

export interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    className?: string
    showPrevNext?: boolean
    maxVisiblePages?: number
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className,
    showPrevNext = true,
    maxVisiblePages = 5
}) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    const halfVisible = Math.floor(maxVisiblePages / 2)

    let visiblePages = pages

    if (totalPages > maxVisiblePages) {
        const start = Math.max(1, currentPage - halfVisible)
        const end = Math.min(totalPages, start + maxVisiblePages - 1)

        visiblePages = pages.slice(start - 1, end)
    }

    const showFirstEllipsis = visiblePages[0] > 1
    const showLastEllipsis = visiblePages[visiblePages.length - 1] < totalPages

    return (
        <FlexBox align="center" justify="center" gap="xs" className={className}>
            {showPrevNext && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3"
                >
                    Previous
                </Button>
            )}

            {showFirstEllipsis && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(1)}
                        className="w-9 h-9 p-0"
                    >
                        1
                    </Button>
                    <Typography as="p" variant="body" color="muted" className="px-2">
                        ...
                    </Typography>
                </>
            )}

            {visiblePages.map((page) => (
                <Button
                    key={page}
                    variant={page === currentPage ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="w-9 h-9 p-0"
                    aria-current={page === currentPage ? 'page' : undefined}
                >
                    {page}
                </Button>
            ))}

            {showLastEllipsis && (
                <>
                    <Typography as="p" variant="body" color="muted" className="px-2">
                        ...
                    </Typography>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(totalPages)}
                        className="w-9 h-9 p-0"
                    >
                        {totalPages}
                    </Button>
                </>
            )}

            {showPrevNext && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3"
                >
                    Next
                </Button>
            )}
        </FlexBox>
    )
}

export default Pagination