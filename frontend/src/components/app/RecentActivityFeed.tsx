import { Skeleton } from '@/components/common/feedback'
import { getUserInfo } from '@/features/profile/api/profile.api'
import { formatDistanceToNow } from 'date-fns'
import React, { useEffect, useState } from 'react'

interface Activity {
    id: string
    type: 'restaurant_created' | 'menu_updated' | 'profile_updated'
    description: string
    timestamp: Date
}

const RecentActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await getUserInfo()

                if (response.success && response.data.stats) {
                    // Generate activities based on user stats
                    const newActivities: Activity[] = []

                    if (response.data.stats.restaurantCount > 0) {
                        newActivities.push({
                            id: '1',
                            type: 'restaurant_created',
                            description: `Created ${response.data.stats.restaurantCount} restaurant${response.data.stats.restaurantCount > 1 ? 's' : ''}`,
                            timestamp: new Date()
                        })
                    }

                    if (response.data.stats.menuCount > 0) {
                        newActivities.push({
                            id: '2',
                            type: 'menu_updated',
                            description: `Updated ${response.data.stats.menuCount} menu${response.data.stats.menuCount > 1 ? 's' : ''}`,
                            timestamp: new Date()
                        })
                    }

                    setActivities(newActivities)
                } else {
                    setError(response.error || 'Failed to fetch activities')
                }
            } catch (error) {
                console.error('Error fetching activities:', error)
                setError('Network error. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchActivities()
    }, [])

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p>{error}</p>
            </div>
        )
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                <p>No recent activity to show</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <div
                    key={activity.id}
                    className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm border border-neutral-200 dark:border-neutral-700"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                                {activity.description}
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default RecentActivityFeed 