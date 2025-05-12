import { useNavigation } from '@/contexts/NavigationContext'
import { useNotificationContext } from '@/contexts/NotificationContext'
import { useTheme } from '@/contexts/ThemeContext'
import {
    Bars3Icon,
    BellIcon,
    MoonIcon,
    SunIcon
} from '@heroicons/react/24/outline'
import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Badge, NotificationsPanel } from '../feedback'
import { Breadcrumb } from '../navigation'
import { IconButton } from './UIElements'
import UserMenu from './UserMenu'

interface HeaderProps {
    actions?: React.ReactNode
}

// Map routes to their display titles - extracted to a constant to reduce clutter
const ROUTE_TITLES = [
    { path: '/restaurants', title: 'Restaurant Dashboard' },
    { path: '/restaurants/manage', title: 'Manage Restaurants' },
    { path: '/restaurants/menus', title: 'Restaurant Menus' },
    { path: '/restaurants/orders', title: 'Orders' },
    { path: '/profile', title: 'My Profile' },
    { path: '/qr-codes', title: 'QR Codes' },
    { path: '/qr-codes/generate', title: 'Generate QR Code' },
    { path: '/settings', title: 'Settings' }
]

const Header: React.FC<HeaderProps> = ({ actions }) => {
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const location = useLocation()
    const { theme, toggleTheme } = useTheme()
    const { toggleCollapse, isMobile } = useNavigation()
    const { notifications } = useNotificationContext()

    // Find current page title by checking if the current path starts with any of the defined paths
    // Sort by path length descending to match more specific paths first
    const currentTitle = ROUTE_TITLES
        .sort((a, b) => b.path.length - a.path.length)
        .find(route => location.pathname.startsWith(route.path))?.title || 'Dashboard'

    // Count unread notifications
    const unreadNotificationsCount = notifications.length

    const handleNotificationsToggle = () => setNotificationsOpen(!notificationsOpen)

    return (
        <header className="bg-white dark:bg-neutral-800 shadow-sm">
            <div className="h-16 flex items-center justify-between px-4 md:px-6">
                {/* Left side - Mobile menu button, page title and breadcrumbs */}
                <div className="flex items-center overflow-hidden">
                    {isMobile && (
                        <IconButton
                            icon={<Bars3Icon className="h-5 w-5" />}
                            onClick={toggleCollapse}
                            label="Toggle menu"
                            className="mr-3"
                        />
                    )}

                    <div className="flex flex-col overflow-hidden">
                        <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                            {currentTitle}
                        </h1>
                        <div className="text-sm -mt-1">
                            <Breadcrumb className="text-xs opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Right side - theme toggle, notifications, and user menu */}
                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* Theme toggle */}
                    <IconButton
                        icon={theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                        onClick={toggleTheme}
                        label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    />

                    {/* Notifications */}
                    <div className="relative">
                        <IconButton
                            icon={<BellIcon className="h-5 w-5" />}
                            onClick={handleNotificationsToggle}
                            label="Notifications"
                            aria-expanded={notificationsOpen}
                        />
                        {unreadNotificationsCount > 0 && (
                            <Badge
                                count={unreadNotificationsCount}
                                className="absolute -top-1 -right-1"
                                aria-label={`${unreadNotificationsCount} unread notifications`}
                            />
                        )}
                        <NotificationsPanel
                            isOpen={notificationsOpen}
                            onClose={() => setNotificationsOpen(false)}
                        />
                    </div>

                    {/* User menu */}
                    <UserMenu />

                    {/* Custom actions passed from parent */}
                    {actions}
                </div>
            </div>
        </header>
    )
}

export default Header 