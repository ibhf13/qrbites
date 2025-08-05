import React from 'react'
import { Box, FlexBox, Typography } from '../'
import { Skeleton } from '../feedback'

interface CardHeaderProps {
    title?: string
    subtitle?: string
    headerAction?: React.ReactNode
    loading?: boolean
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    title,
    subtitle,
    headerAction,
    loading = false
}) => {
    const hasHeader = title || subtitle || headerAction

    if (!hasHeader) return null

    return (
        <Box className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <FlexBox justify="between" align="center">
                <Box className="min-w-0 flex-1">
                    {title && (
                        <Typography
                            variant="heading"
                            className="truncate"
                            color="neutral"
                        >
                            {loading ? <Skeleton variant="text" className="h-6 w-3/4" /> : title}
                        </Typography>
                    )}
                    {subtitle && (
                        <Typography
                            variant="caption"
                            className="mt-1 truncate"
                            color="muted"
                        >
                            {loading ? <Skeleton variant="text" className="h-4 w-1/2" /> : subtitle}
                        </Typography>
                    )}
                </Box>
                {headerAction && !loading && (
                    <Box className="ml-4 flex-shrink-0">
                        {headerAction}
                    </Box>
                )}
            </FlexBox>
        </Box>
    )
}

export default CardHeader