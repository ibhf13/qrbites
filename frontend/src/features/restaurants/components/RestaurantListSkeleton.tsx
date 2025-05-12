import React from 'react'

interface RestaurantListSkeletonProps {
    count?: number
    gridLayout?: boolean
}

export const RestaurantListSkeleton: React.FC<RestaurantListSkeletonProps> = ({
    count = 6,
    gridLayout = true
}) => {
    const skeletons = Array.from({ length: count }).map((_, index) => (
        <div
            key={`skeleton-${index}`}
            className={`animate-pulse rounded-lg bg-white shadow overflow-hidden`}
        >
            {/* Image skeleton */}
            <div className="h-40 bg-gray-200"></div>

            <div className="p-4">
                {/* Title and actions row */}
                <div className="flex justify-between items-center mb-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex space-x-1">
                        <div className="h-6 w-6 bg-gray-200 rounded"></div>
                        <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    </div>
                </div>

                {/* Description */}
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>

                {/* Details */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    ))

    if (gridLayout) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {skeletons}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {skeletons}
        </div>
    )
} 