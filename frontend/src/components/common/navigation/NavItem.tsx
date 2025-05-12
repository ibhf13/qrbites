import { useNavigation } from '@/contexts/NavigationContext'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { Tooltip } from '../feedback'

interface NavItemProps {
    path: string
    label: string
    icon: React.ReactNode
    onClick?: () => void
    end?: boolean
}

const NavItem: React.FC<NavItemProps> = ({
    path,
    label,
    icon,
    onClick,
    end = false,
}) => {
    const { isCollapsed } = useNavigation()

    return (
        <li>
            <Tooltip
                content={label}
                placement="right"
                disabled={!isCollapsed}
            >
                <NavLink
                    to={path}
                    end={end}
                    className={({ isActive }) => `
            flex items-center px-4 py-2.5 rounded-md text-sm transition-colors duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
            ${isActive
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
                        }
          `}
                    onClick={onClick}
                    aria-label={isCollapsed ? label : undefined}
                    role="menuitem"
                >
                    <span className="flex-shrink-0">{icon}</span>
                    {!isCollapsed && (
                        <span className="ml-3 truncate">{label}</span>
                    )}
                </NavLink>
            </Tooltip>
        </li>
    )
}

export default NavItem 