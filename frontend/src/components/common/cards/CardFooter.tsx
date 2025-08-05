import React from 'react'
import { Box } from '../layout'
import { Skeleton } from '../feedback'

interface CardFooterProps {
    footer?: React.ReactNode
    loading?: boolean
}

export const CardFooter: React.FC<CardFooterProps> = ({
    footer,
    loading = false
}) => {
    if (!footer) return null

    return (
        <Box className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700">
            {loading ? (
                <Skeleton variant="text" className="h-4 w-1/3" />
            ) : (
                footer
            )}
        </Box>
    )
}

export default CardFooter