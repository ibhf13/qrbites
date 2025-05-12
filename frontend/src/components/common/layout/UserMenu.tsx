import { useAuth, useLogout } from '@/features/auth'
import {
    ArrowRightOnRectangleIcon,
    CogIcon,
    UserIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from './UIElements'

const UserMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const { user } = useAuth()
    const { logout } = useLogout()

    // Close the menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Handle escape key to close menu
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        document.addEventListener('keydown', handleEscapeKey)
        return () => {
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [])

    // Get user initials for avatar
    const getUserInitials = (): string => {
        if (!user?.email) return 'U'

        const parts = user.email.split('@')[0].split(/[._-]/)
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase()
        }
        return parts[0].substring(0, 2).toUpperCase()
    }

    const handleLogout = () => {
        setIsOpen(false)
        logout()
    }

    const menuItems = [
        {
            label: 'Profile',
            path: '/profile',
            icon: <UserIcon className="mr-3 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        },
        {
            label: 'Settings',
            path: '/settings',
            icon: <CogIcon className="mr-3 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        }
    ]

    return (
        <div className="relative" ref={menuRef}>
            <button
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="User menu"
            >
                <Avatar initials={getUserInitials()} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-md shadow-md z-30 overflow-hidden">
                    <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                            {user?.email ? user.email.split('@')[0] : 'User'}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                            {user?.email || 'user@example.com'}
                        </p>
                    </div>

                    <ul className="py-1">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className="flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                        <li className="border-t border-neutral-200 dark:border-neutral-700 mt-1 pt-1">
                            <button
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                onClick={handleLogout}
                            >
                                <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    )
}

export default UserMenu 