import { NavItem as NavItemType, useNavigation } from '@/contexts/NavigationContext'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import React from 'react'
import Tooltip from '../feedback/Tooltip'
import NavItem from './NavItem'

interface NavGroupProps {
    id: string
    label: string
    icon: React.ReactNode
    items: NavItemType[]
}

const NavGroup: React.FC<NavGroupProps> = ({
    id,
    label,
    icon,
    items,
}) => {
    const { isCollapsed, toggleGroup, isGroupExpanded } = useNavigation()
    const expanded = isGroupExpanded(id)

    const handleToggle = () => {
        toggleGroup(id)
    }

    return (
        <div className="mb-1">
            <Tooltip
                content={label}
                placement="right"
                disabled={!isCollapsed}
            >
                <button
                    onClick={handleToggle}
                    className={`
            w-full flex items-center justify-between px-4 py-2.5 rounded-md text-sm text-neutral-700 dark:text-neutral-300
            hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
          `}
                    aria-expanded={expanded ? true : false}
                    aria-controls={`nav-group-${id}`}
                >
                    <div className="flex items-center">
                        <span className="flex-shrink-0">{icon}</span>
                        {!isCollapsed && (
                            <span className="ml-3 truncate">{label}</span>
                        )}
                    </div>

                    {!isCollapsed && (
                        <ChevronDownIcon
                            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        />
                    )}
                </button>
            </Tooltip>

            {/* Nested navigation items */}
            {(expanded || isCollapsed) && (
                <ul
                    id={`nav-group-${id}`}
                    className={`
            mt-1 space-y-1 
            ${isCollapsed ? 'pl-0' : 'pl-6'}
            ${expanded || isCollapsed ? 'block' : 'hidden'}
          `}
                    role="menu"
                >
                    {items.map((item) => (
                        <NavItem
                            key={item.path}
                            path={item.path}
                            label={item.label}
                            icon={item.icon}
                        />
                    ))}
                </ul>
            )}
        </div>
    )
}

export default NavGroup 