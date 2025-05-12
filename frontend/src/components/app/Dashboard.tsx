import RecentActivityFeed from '@/components/app/RecentActivityFeed'
import { Button } from '@/components/common/buttons/Button'
import StatCard from '@/components/common/cards/StatCard'
import { Skeleton } from '@/components/common/feedback'
import PageContainer from '@/components/common/layout/PageContainer'
import { useAuth } from '@/features/auth'
import { getUserInfo } from '@/features/profile/api/profile.api'
import { UserInfoResponse } from '@/features/profile/types/profile.types'
import {
    BuildingStorefrontIcon,
    CogIcon,
    DocumentTextIcon,
    PlusIcon,
    UserIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'

const Dashboard: React.FC = () => {
    const { user } = useAuth()
    const [userData, setUserData] = useState<UserInfoResponse['data'] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Fetch user data and stats
        const fetchUserInfo = async () => {
            try {
                const response = await getUserInfo()

                if (response.success) {
                    setUserData(response.data)
                } else {
                    setError(response.error || 'Failed to fetch user data')
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
                setError('Network error. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchUserInfo()
    }, [user])

    const quickActions = [
        {
            label: 'Create Restaurant',
            icon: <PlusIcon className="w-5 h-5" />,
            href: '/restaurants/new',
            primary: true
        },
        {
            label: 'Manage Profile',
            icon: <UserIcon className="w-5 h-5" />,
            href: '/profile'
        },
        {
            label: 'Settings',
            icon: <CogIcon className="w-5 h-5" />,
            href: '/settings'
        }
    ]

    if (error && !loading) {
        return (
            <PageContainer title="Dashboard" subtitle="Welcome to your QR Bites dashboard">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                    <p>{error}</p>
                    {error === 'Your session has expired. Please log in again.' && (
                        <div className="mt-3">
                            <Button
                                variant="primary"
                                onClick={() => window.location.href = '/login'}
                            >
                                Log In
                            </Button>
                        </div>
                    )}
                </div>

                {/* Show fallback content */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
                        Welcome to QR Bites!
                    </h1>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        Please sign in to see your personal dashboard
                    </p>
                </div>
            </PageContainer>
        )
    }

    return (
        <PageContainer title="Dashboard" subtitle="Welcome to your QR Bites dashboard">
            {/* Greeting */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
                    Welcome{userData?.profile?.firstName ? `, ${userData.profile.firstName}` : ''}!
                </h1>
                <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                    Here's an overview of your QR Bites activity
                </p>
            </div>

            {/* Quick Stats */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-neutral-700 dark:text-neutral-300">
                    Your Stats
                </h2>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(2)].map((_, index) => (
                            <Skeleton key={index} className="h-24 w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Restaurants"
                            value={userData?.stats?.restaurantCount || 0}
                            icon={<BuildingStorefrontIcon className="w-6 h-6" />}
                            iconBgColor="bg-blue-100"
                            iconColor="text-blue-600"
                        />
                        <StatCard
                            title="Menus"
                            value={userData?.stats?.menuCount || 0}
                            icon={<DocumentTextIcon className="w-6 h-6" />}
                            iconBgColor="bg-green-100"
                            iconColor="text-green-600"
                        />
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-neutral-700 dark:text-neutral-300">
                    Quick Actions
                </h2>
                <div className="flex flex-wrap gap-4">
                    {quickActions.map((action, index) => (
                        <a
                            key={index}
                            href={action.href}
                            className="no-underline"
                        >
                            <Button
                                variant={action.primary ? "primary" : "secondary"}
                                leftIcon={action.icon}
                            >
                                {action.label}
                            </Button>
                        </a>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-neutral-700 dark:text-neutral-300">
                    Recent Activity
                </h2>
                <RecentActivityFeed />
            </div>
        </PageContainer>
    )
}

export default Dashboard 