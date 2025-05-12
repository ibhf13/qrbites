import {
    BuildingStorefrontIcon,
    Cog6ToothIcon,
    HomeIcon,
    QrCodeIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline'
import React from 'react'

export interface NavigationItem {
    id: string
    label: string
    path: string
    icon?: React.ReactNode
}

export interface NavigationGroup {
    id: string
    label: string
    icon?: React.ReactNode
    items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
    {
        id: 'main',
        label: 'Main',
        items: [
            {
                id: 'dashboard',
                label: 'Dashboard',
                path: '/dashboard',
                icon: <HomeIcon className="w-5 h-5" />
            },
            {
                id: 'profile',
                label: 'My Profile',
                path: '/profile',
                icon: <UserCircleIcon className="w-5 h-5" />
            }
        ]
    },
    {
        id: 'restaurant',
        label: 'Restaurants',
        icon: <BuildingStorefrontIcon className="w-5 h-5" />,
        items: [
            {
                id: 'restaurants-list',
                label: 'My Restaurants',
                path: '/restaurants',
                icon: <BuildingStorefrontIcon className="w-5 h-5" />
            },
            {
                id: 'create-restaurant',
                label: 'Create Restaurant',
                path: '/restaurants/create',
                icon: <QrCodeIcon className="w-5 h-5" />
            }
        ]
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: <Cog6ToothIcon className="w-5 h-5" />,
        items: [
            {
                id: 'account-settings',
                label: 'Account Settings',
                path: '/settings/account',
                icon: <UserCircleIcon className="w-5 h-5" />
            }
        ]
    }
]

export default navigationGroups 