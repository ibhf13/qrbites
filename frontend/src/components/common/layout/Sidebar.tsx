import { Button } from '@/components/common/buttons/Button'
import { NavGroup } from '@/components/common/navigation'
import { navigationGroups } from '@/config/navigation'
import { NavItem, useNavigation } from '@/contexts/NavigationContext'
import { useAuth, useLogout } from '@/features/auth'
import {
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import React from 'react'
import Logo from './Logo'

const Sidebar: React.FC = () => {
    const { isCollapsed, toggleCollapse, isMobile } = useNavigation()
    const { user } = useAuth()
    const { logout } = useLogout()

    return (
        <aside
            className={`
        fixed md:relative inset-y-0 left-0 z-20 flex flex-col
        border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobile && !isCollapsed ? 'shadow-xl' : ''}
        ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}
      `}
            aria-label="Sidebar"
        >
            {/* Sidebar header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className={`overflow-hidden ${isCollapsed ? 'w-8' : 'w-full'}`}>
                    <Logo size={isCollapsed ? 'sm' : 'md'} />
                </div>
                {isMobile && (
                    <button
                        onClick={toggleCollapse}
                        className="p-1.5 rounded-md text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <Bars3Icon className="w-5 h-5" />
                        ) : (
                            <XMarkIcon className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>

            {/* Navigation menu */}
            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
                <ul className="space-y-1">
                    {navigationGroups.map((group) => (
                        <NavGroup
                            key={group.id}
                            id={group.id}
                            label={group.label}
                            icon={group.icon || <span className="w-5 h-5 flex items-center justify-center">•</span>}
                            items={group.items as NavItem[]}
                        />
                    ))}
                </ul>
            </nav>

            {/* User and logout section */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                                {user?.email?.split('@')[0] || 'User'}
                            </p>
                            {user?.email && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                    {user.email}
                                </p>
                            )}
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        leftIcon={<ArrowRightOnRectangleIcon className="h-5 w-5" />}
                        aria-label="Logout"
                        className={isCollapsed ? 'p-1.5' : ''}
                    >
                        {!isCollapsed && 'Logout'}
                    </Button>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
