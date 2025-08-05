import React from 'react'
import { getPaddingClasses } from '@/utils/designTokenUtils'
import { Box } from '../layout'
import { Skeleton } from '../feedback'

interface CardContentProps {
    children: React.ReactNode
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    loading?: boolean
}

export const CardContent: React.FC<CardContentProps> = ({
    children,
    padding = 'md',
    loading = false
}) => {
    return (
        <Box className={getPaddingClasses(padding)}>
            {loading ? (
                <Box className="space-y-3">
                    <Skeleton variant="text" className="h-6 w-3/4" />
                    <Skeleton variant="text" className="h-4 w-full" />
                    <Skeleton variant="text" className="h-4 w-2/3" />
                </Box>
            ) : (
                children
            )}
        </Box>
    )
}

export default CardContent