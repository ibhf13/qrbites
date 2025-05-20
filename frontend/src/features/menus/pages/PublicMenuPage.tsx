import React, { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, LoadingSpinner, Typography, Box, FlexBox, Badge } from '@/components/common'
import { QrCodeIcon, ClockIcon, ShareIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'
import env from '@/config/env'

interface PublicMenuData {
    menu: {
        id: string
        name: string
        description?: string
        imageUrl?: string
        restaurant: {
            id: string
            name: string
            logoUrl?: string
            description?: string
            address?: string
            phone?: string
            website?: string
            socialMedia?: {
                instagram?: string
                facebook?: string
                twitter?: string
            }
        }
        isActive?: boolean
        viewCount?: number
        lastUpdated?: string
        categories?: Array<{
            id: string
            name: string
            description?: string
        }>
    }
}

const fetchPublicMenuImage = async (menuId: string, restaurantId?: string): Promise<PublicMenuData> => {
    const queryParams = new URLSearchParams()

    if (restaurantId) queryParams.append('restaurant', restaurantId)

    const response = await fetch(
        `${env.apiUrl || 'http://localhost:5000'}/api/public/menus/${menuId}?${queryParams.toString()}`,
        {
            headers: {
                'X-QR-Scan': 'true',
                'X-User-Agent': navigator.userAgent,
                'X-Referrer': document.referrer || 'direct',
                'X-Timestamp': new Date().toISOString()
            }
        }
    )

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch menu`)
    }

    const data = await response.json()

    const menu = data.data

    return {
        menu: {
            id: menu._id,
            name: menu.name,
            description: menu.description,
            imageUrl: menu.imageUrl,
            restaurant: {
                id: menu.restaurantId._id || menu.restaurantId,
                name: menu.restaurantId.name || 'Unknown Restaurant',
                logoUrl: menu.restaurantId.logoUrl,
                description: menu.restaurantId.description,
                address: menu.restaurantId.address,
                phone: menu.restaurantId.phone,
                website: menu.restaurantId.website,
                socialMedia: menu.restaurantId.socialMedia
            },
            isActive: menu.isActive,
            viewCount: menu.viewCount,
            lastUpdated: menu.updatedAt || menu.createdAt,
            categories: menu.categories || []
        }
    }
}


const MenuLoading: React.FC = () => {

    return (
        <Box className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
            <Card
                variant="elevated"
                className="max-w-md w-full text-center"
                contentPadding="xl"
            >
                <Box className="flex flex-col items-center gap-6">
                    <Box className="relative">
                        <LoadingSpinner size="lg" />
                        <Box className="absolute inset-0 animate-pulse">
                            <QrCodeIcon className="w-16 h-16 text-primary-300 dark:text-primary-700 opacity-30" />
                        </Box>
                    </Box>
                    <Box className="text-center">
                        <Typography variant="heading" className="text-neutral-900 dark:text-neutral-100 mb-2">
                            Loading Menu
                        </Typography>
                        <Typography variant="body" color="muted" className="text-neutral-600 dark:text-neutral-400">
                            Preparing your digital menu experience...
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Box>
    )
}

const MenuError: React.FC<{ onRetry?: () => void; error?: Error }> = ({ onRetry, error }) => {

    return (
        <Box className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
            <Card
                variant="outlined"
                className="max-w-md w-full text-center border-error-200 dark:border-error-800"
                contentPadding="xl"
            >
                <Box className="flex flex-col items-center gap-6">
                    <Box className="relative">
                        <QrCodeIcon className="w-20 h-20 text-error-400 dark:text-error-500" />
                        <Box className="absolute -top-2 -right-2 w-6 h-6 bg-error-100 dark:bg-error-900 rounded-full flex items-center justify-center">
                            <span className="text-error-600 dark:text-error-400 text-sm">!</span>
                        </Box>
                    </Box>
                    <Box className="text-center">
                        <Typography variant="heading" className="text-error-700 dark:text-error-300 mb-2">
                            Menu Unavailable
                        </Typography>
                        <Typography variant="body" className="text-neutral-700 dark:text-neutral-300 mb-4">
                            {error?.message || 'The menu you\'re looking for is currently unavailable'}
                        </Typography>
                        <Typography variant="body" color="muted" className="text-neutral-600 dark:text-neutral-400">
                            The menu might have been moved, removed, or is temporarily unavailable.
                        </Typography>
                    </Box>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
                        >
                            Try Again
                        </button>
                    )}
                </Box>
            </Card>
        </Box>
    )
}

const MenuHeader: React.FC<{ menuData: PublicMenuData }> = ({ menuData }) => {
    const [isShareOpen, setIsShareOpen] = useState(false)
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${menuData.menu.name} - ${menuData.menu.restaurant.name}`,
                    text: `Check out this menu from ${menuData.menu.restaurant.name}`,
                    url: window.location.href
                })
            } catch (error) {
                console.log('Share failed:', error)
            }
        } else {
            navigator.clipboard.writeText(window.location.href)
            setIsShareOpen(true)
            setTimeout(() => setIsShareOpen(false), 2000)
        }
    }

    return (
        <Box className="bg-white dark:bg-neutral-800 shadow-lg dark:shadow-2xl sticky top-0 z-20 border-b border-neutral-200 dark:border-neutral-700">
            <Box className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <FlexBox align="center" justify="between" className="py-4 sm:py-6">
                    <FlexBox align="center" gap="lg" className="flex-1 min-w-0">
                        {menuData.menu.restaurant.logoUrl && (
                            <Box className="flex-shrink-0">
                                <img
                                    src={menuData.menu.restaurant.logoUrl}
                                    alt={menuData.menu.restaurant.name}
                                    className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl object-cover shadow-md ring-2 ring-primary-100 dark:ring-primary-900"
                                />
                            </Box>
                        )}
                        <Box className="min-w-0 flex-1">
                            <Typography variant="heading" className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
                                {menuData.menu.restaurant.name}
                            </Typography>
                            <Typography variant="heading" className="text-base sm:text-lg lg:text-xl text-primary-600 dark:text-primary-400 truncate">
                                {menuData.menu.name}
                            </Typography>
                            {menuData.menu.description && (
                                <Typography variant="body" className="text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                                    {menuData.menu.description}
                                </Typography>
                            )}
                        </Box>
                    </FlexBox>

                    <FlexBox align="center" gap="sm" className="flex-shrink-0 ml-4">
                        <FlexBox align="center" gap="xs" className="text-neutral-500 dark:text-neutral-400 text-sm hidden sm:flex">
                            <ClockIcon className="w-4 h-4" />
                            <span>{currentTime}</span>
                        </FlexBox>
                        <button
                            onClick={handleShare}
                            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
                            title="Share menu"
                        >
                            <ShareIcon className="w-5 h-5" />
                        </button>
                    </FlexBox>
                </FlexBox>

                <FlexBox align="center" gap="md" className="pb-4 flex-wrap">
                    {menuData.menu.isActive && (
                        <Badge variant="filled" color="success" className="text-xs" label="Active" />
                    )}
                    {menuData.menu.viewCount && (
                        <Typography variant="caption" className="text-neutral-500 dark:text-neutral-400">
                            {menuData.menu.viewCount} views
                        </Typography>
                    )}
                    {menuData.menu.lastUpdated && (
                        <Typography variant="caption" className="text-neutral-500 dark:text-neutral-400">
                            Updated {new Date(menuData.menu.lastUpdated).toLocaleDateString()}
                        </Typography>
                    )}
                </FlexBox>
            </Box>

            {isShareOpen && (
                <Box className="absolute top-full left-4 right-4 mt-2 z-30">
                    <Card variant="elevated" className="p-3 bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800">
                        <Typography variant="body" className="text-success-800 dark:text-success-200 text-center">
                            Menu link copied to clipboard!
                        </Typography>
                    </Card>
                </Box>
            )}
        </Box>
    )
}

const MenuImage: React.FC<{ menuData: PublicMenuData }> = ({ menuData }) => {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)

    if (!menuData.menu.imageUrl) {
        return (
            <Box className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card
                    variant="outlined"
                    className="text-center border-dashed border-2 border-neutral-300 dark:border-neutral-600"
                    contentPadding="xl"
                >
                    <Box className="flex flex-col items-center gap-6 py-12">
                        <Box className="relative">
                            <QrCodeIcon className="w-24 h-24 text-neutral-400 dark:text-neutral-500" />
                            <Box className="absolute inset-0 bg-gradient-to-r from-primary-200 to-primary-300 dark:from-primary-800 dark:to-primary-700 opacity-20 rounded-lg blur-xl" />
                        </Box>
                        <Box className="text-center">
                            <Typography variant="heading" className="text-neutral-700 dark:text-neutral-300 mb-2">
                                Menu Image Unavailable
                            </Typography>
                            <Typography variant="body" className="text-neutral-600 dark:text-neutral-400 mb-4">
                                The digital menu image is currently not available.
                            </Typography>
                            <Typography variant="body" color="muted" className="text-neutral-500 dark:text-neutral-500">
                                Please contact the restaurant directly for menu information.
                            </Typography>
                        </Box>
                        {(menuData.menu.restaurant.phone || menuData.menu.restaurant.address) && (
                            <Box className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                <FlexBox direction="col" gap="sm">
                                    {menuData.menu.restaurant.phone && (
                                        <FlexBox align="center" gap="sm">
                                            <PhoneIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                                            <Typography variant="body" className="text-neutral-700 dark:text-neutral-300">
                                                {menuData.menu.restaurant.phone}
                                            </Typography>
                                        </FlexBox>
                                    )}
                                    {menuData.menu.restaurant.address && (
                                        <FlexBox align="center" gap="sm">
                                            <MapPinIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                                            <Typography variant="body" className="text-neutral-700 dark:text-neutral-300">
                                                {menuData.menu.restaurant.address}
                                            </Typography>
                                        </FlexBox>
                                    )}
                                </FlexBox>
                            </Box>
                        )}
                    </Box>
                </Card>
            </Box>
        )
    }

    const isPdf = menuData.menu.imageUrl.toLowerCase().includes('.pdf')

    return (
        <Box className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Card
                variant="elevated"
                className="overflow-hidden bg-white dark:bg-neutral-800 shadow-xl dark:shadow-2xl"
                contentPadding="none"
            >
                {isPdf ? (
                    <Box className="relative">
                        <iframe
                            src={menuData.menu.imageUrl}
                            title={`${menuData.menu.name} - Menu`}
                            className="w-full h-screen min-h-[600px] lg:min-h-[800px]"
                            onLoad={() => setImageLoaded(true)}
                        />
                        {!imageLoaded && (
                            <Box className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-700">
                                <LoadingSpinner size="lg" />
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box className="relative">
                        <img
                            src={menuData.menu.imageUrl}
                            alt={`${menuData.menu.name} - Menu`}
                            className="w-full h-auto object-contain transition-opacity duration-300"
                            style={{
                                maxHeight: '90vh',
                                opacity: imageLoaded ? 1 : 0
                            }}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                        />
                        {!imageLoaded && !imageError && (
                            <Box className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 min-h-[400px]">
                                <LoadingSpinner size="lg" />
                            </Box>
                        )}
                        {imageError && (
                            <Box className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 min-h-[400px]">
                                <Typography variant="body" className="text-neutral-600 dark:text-neutral-400">
                                    Failed to load menu image
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </Card>
        </Box>
    )
}

const MenuFooter: React.FC<{ menuData: PublicMenuData }> = ({ menuData }) => {
    const scanTime = new Date().toLocaleString()

    return (
        <Box className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 mt-8">
            <Box className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <FlexBox direction="col" gap="md" className="sm:flex-row sm:items-center sm:justify-between">
                    <FlexBox direction="col" gap="xs" className="sm:flex-row sm:items-center sm:gap-md">
                        <Typography variant="body" className="text-neutral-600 dark:text-neutral-400">
                            Powered by{' '}
                            <span className="font-semibold text-primary-600 dark:text-primary-400">
                                QrBites
                            </span>
                            {' '}Digital Menu Solutions
                        </Typography>
                        <Typography variant="caption" className="text-neutral-500 dark:text-neutral-500">
                            Transforming dining experiences
                        </Typography>
                    </FlexBox>

                    <FlexBox align="center" gap="md" className="text-sm text-neutral-500 dark:text-neutral-400">
                        <FlexBox align="center" gap="xs">
                            <QrCodeIcon className="w-4 h-4" />
                            <span>Scanned: {scanTime}</span>
                        </FlexBox>
                        <FlexBox align="center" gap="xs">
                            <span className="inline-block w-2 h-2 bg-success-500 rounded-full" />
                            <span>Live</span>
                        </FlexBox>
                    </FlexBox>
                </FlexBox>

                {(menuData.menu.restaurant.website || menuData.menu.restaurant.socialMedia) && (
                    <Box className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                        <FlexBox direction="col" gap="sm" className="sm:flex-row sm:items-center sm:justify-between">
                            <Typography variant="body" className="text-neutral-600 dark:text-neutral-400">
                                Connect with {menuData.menu.restaurant.name}
                            </Typography>
                            <FlexBox align="center" gap="md">
                                {menuData.menu.restaurant.website && (
                                    <a
                                        href={menuData.menu.restaurant.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200"
                                    >
                                        Website
                                    </a>
                                )}
                                {menuData.menu.restaurant.socialMedia?.instagram && (
                                    <a
                                        href={menuData.menu.restaurant.socialMedia.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200"
                                    >
                                        Instagram
                                    </a>
                                )}
                                {menuData.menu.restaurant.socialMedia?.facebook && (
                                    <a
                                        href={menuData.menu.restaurant.socialMedia.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200"
                                    >
                                        Facebook
                                    </a>
                                )}
                            </FlexBox>
                        </FlexBox>
                    </Box>
                )}
            </Box>
        </Box>
    )
}

const PublicMenuPage: React.FC = () => {
    const { menuId } = useParams<{ menuId: string }>() || ''
    const [searchParams] = useSearchParams()
    const restaurantId = searchParams.get('restaurant')

    const {
        data: menuData,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['public-menu', menuId, restaurantId],
        queryFn: () => fetchPublicMenuImage(menuId!, restaurantId || undefined),
        enabled: !!menuId,
        retry: 2,
        retryDelay: 1000,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000
    })

    if (isLoading) {
        return <MenuLoading />
    }

    if (error || !menuData) {
        return <MenuError onRetry={() => refetch()} error={error as Error} />
    }

    return (
        <Box className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
            <MenuHeader menuData={menuData} />
            <MenuImage menuData={menuData} />
            <MenuFooter menuData={menuData} />
        </Box>
    )
}

export default PublicMenuPage 