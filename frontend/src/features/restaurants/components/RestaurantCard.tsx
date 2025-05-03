import { Button, Card } from '@/components/common'
import React from 'react'
import { Link } from 'react-router-dom'
import { Restaurant } from '../types'

interface RestaurantCardProps {
    restaurant: Restaurant
}

/**
 * Card component to display restaurant information
 */
export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
    const { _id, name, description, logoUrl, location, created } = restaurant

    // Format creation date
    const formattedDate = new Date(created).toLocaleDateString()

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300" noPadding>
            <div className="p-5">
                <div className="flex items-center mb-4">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={`${name} logo`}
                            className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-4">
                            {name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-display font-semibold text-neutral-800">{name}</h3>
                        {location?.city && (
                            <p className="text-sm text-neutral-500">{location.city}, {location.state}</p>
                        )}
                    </div>
                </div>

                {description && (
                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{description}</p>
                )}

                <div className="flex justify-between items-center text-sm text-neutral-500">
                    <span>Created: {formattedDate}</span>
                </div>

                <div className="mt-4">
                    <Link
                        to={`/restaurants/${_id}`}
                        className="w-full"
                    >
                        <Button isFullWidth>
                            Manage
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    )
} 