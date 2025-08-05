import React from 'react'
import { cn } from '@/utils/cn'
import { Box, Typography } from '../layout'
import { CardImageProps } from './Card.types'

interface CardImageComponentProps {
    image: CardImageProps
    className?: string
}

export const CardImage: React.FC<CardImageComponentProps> = ({
    image,
    className
}) => {


    const hasImage = image?.src || image?.placeholder

    if (!hasImage) return null

    return (
        <Box className={cn("relative overflow-hidden", className)}>
            <Box className="w-full overflow-hidden">
                {image?.src && !image?.loading ? (
                    <img
                        src={image.src}
                        alt={image.alt || ''}
                        className={cn(
                            'w-full h-full transition-transform duration-700 ease-out',
                            image.objectFit === 'contain' ? 'object-contain' :
                                image.objectFit === 'fill' ? 'object-fill' : 'object-cover',
                            'group-hover:scale-110',
                            {
                                'opacity-0': image?.loading,
                                'opacity-100': !image?.loading
                            },
                            image.className
                        )}
                    />
                ) : (
                    <Box className="flex items-center justify-center w-full h-36 bg-gray-300">
                        <Typography variant="title" className="font-bold text-gray-600 dark:text-gray-800 text-2xl">
                            {image.alt ? image.alt.substring(0, 2).toUpperCase() : 'R'}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    )
}

export default CardImage