import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useRestaurant } from '@/features/restaurants/hooks/useRestaurants'
import { FlexBox, Typography, } from '../layout'
import { cn } from '@/utils/cn'

export interface BreadcrumbItem {
    label: string
    path: string
}

interface BreadcrumbProps {
    items?: BreadcrumbItem[]
    className?: string
}

const routeLabels = {
    restaurants: 'My Restaurants',
    menus: 'Menus',
    create: 'Create',
    profile: 'Profile'
}

const useBreadcrumbItems = (customItems: BreadcrumbItem[], pathname: string) => {
    if (customItems.length > 0) {
        return customItems
    }

    const segments = pathname
        .split('/')
        .filter(segment => segment)

    const breadcrumbItems: BreadcrumbItem[] = []

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        const path = `/${segments.slice(0, i + 1).join('/')}`

        const isRestaurantId = segment.match(/^[a-f\d]{24}$/i)
        const isAfterRestaurants = i > 0 && segments[i - 1] === 'restaurants'

        if (isRestaurantId && isAfterRestaurants) {
            breadcrumbItems.push({
                label: '',
                path
            })
        } else {
            const label = routeLabels[segment as keyof typeof routeLabels] ||
                segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

            breadcrumbItems.push({
                label,
                path
            })
        }
    }

    return breadcrumbItems
}

const RestaurantBreadcrumbItem: React.FC<{
    restaurantId: string
    path: string
    isLast: boolean
}> = ({ restaurantId, path, isLast }) => {
    const { data: restaurant, isLoading } = useRestaurant(restaurantId)

    const displayName = isLoading
        ? 'Loading...'
        : restaurant?.name || 'Restaurant'

    return isLast ? (
        <Typography
            as="p"
            variant="body"
            color="muted"
            className="truncate"
            aria-current="page"
        >
            {displayName}
        </Typography>
    ) : (
        <Link
            to={path}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 truncate transition-colors duration-200"
        >
            <Typography as="p" variant="body" color="primary">
                {displayName}
            </Typography>
        </Link>
    )
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items = [], className }) => {
    const location = useLocation()
    const breadcrumbItems = useBreadcrumbItems(items, location.pathname)

    const allItems = [
        { label: 'Home', path: '/' },
        ...breadcrumbItems
    ]

    return (
        <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
            <FlexBox
                align="center"
                gap="xs"
            >
                {allItems.map((item, index) => {
                    const pathSegments = item.path.split('/').filter(Boolean)
                    const currentSegment = pathSegments[pathSegments.length - 1]
                    const isRestaurantItem = currentSegment?.match(/^[a-f\d]{24}$/i) &&
                        pathSegments.length >= 2 &&
                        pathSegments[pathSegments.length - 2] === 'restaurants'

                    const restaurantId = isRestaurantItem ? currentSegment : null
                    const isLast = index === allItems.length - 1

                    return (
                        <FlexBox
                            key={item.path}
                            align="center"
                        >
                            {index > 0 && (
                                <ChevronRightIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500 mx-1" aria-hidden="true" />
                            )}

                            {index === 0 && (
                                <HomeIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mr-1" aria-hidden="true" />
                            )}

                            {restaurantId ? (
                                <RestaurantBreadcrumbItem
                                    restaurantId={restaurantId}
                                    path={item.path}
                                    isLast={isLast}
                                />
                            ) : isLast ? (
                                <Typography
                                    as="p"
                                    variant="body"
                                    color="muted"
                                    className="truncate"
                                    aria-current="page"
                                >
                                    {item.label}
                                </Typography>
                            ) : (
                                <Link
                                    to={item.path}
                                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 truncate transition-colors duration-200"
                                >
                                    <Typography as="p" variant="body" color="primary">
                                        {item.label}
                                    </Typography>
                                </Link>
                            )}
                            <meta itemProp="position" content={String(index + 1)} />
                        </FlexBox>
                    )
                })}
            </FlexBox>
        </nav>
    )
}

export default Breadcrumb