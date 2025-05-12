import { useNavigation } from '@/contexts/NavigationContext'
import { useAuth } from '@/features/auth'
import {
    Bars3Icon,
    BuildingStorefrontIcon,
    HomeIcon,
    QrCodeIcon,
    UserIcon
} from '@heroicons/react/24/outline'
import React from 'react'
import { NavLink } from 'react-router-dom'

const MobileNav: React.FC = () => {
    const { toggleCollapse } = useNavigation()
    const { isAuthenticated } = useAuth()

    // Show different navigation items based on authentication status
    const publicNavItems = [
        {
            path: '/',
            label: 'Home',
            icon: <HomeIcon className="w-6 h-6" />
        },
        {
            path: '/login',
            label: 'Login',
            icon: <UserIcon className="w-6 h-6" />
        }
    ]

    // Main navigation items for mobile when authenticated
    const authNavItems = [
        {
            path: '/restaurants',
            label: 'Dashboard',
            icon: <HomeIcon className="w-6 h-6" />
        },
        {
            path: '/restaurants/manage',
            label: 'Restaurants',
            icon: <BuildingStorefrontIcon className="w-6 h-6" />
        },
        {
            path: '/qr-codes',
            label: 'QR Codes',
            icon: <QrCodeIcon className="w-6 h-6" />
        },
        {
            path: '/profile',
            label: 'Profile',
            icon: <UserIcon className="w-6 h-6" />
        }
    ]

    // Choose which nav items to display based on authentication status
    const navItems = isAuthenticated ? authNavItems : publicNavItems

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 z-10">
            <div className="flex items-center justify-around h-16">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex flex-col items-center justify-center w-full h-full
              ${isActive
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-neutral-600 dark:text-neutral-400'
                            }
            `}
                        aria-label={item.label}
                    >
                        <span className="mb-1">{item.icon}</span>
                        <span className="text-xs font-medium">{item.label}</span>
                    </NavLink>
                ))}

                {isAuthenticated && (
                    <button
                        onClick={toggleCollapse}
                        className="flex flex-col items-center justify-center w-full h-full text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                        aria-label="More"
                    >
                        <Bars3Icon className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">More</span>
                    </button>
                )}
            </div>
        </div>
    )
}

export default MobileNav 