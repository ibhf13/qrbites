import React from 'react'
import { NavLink } from 'react-router-dom'
import { Tooltip } from '../feedback'
import { Typography, FlexBox } from '../layout'
import { cn } from '@/utils/cn'

interface NavItemProps {
    path: string
    label: string
    icon: React.ReactNode
    onClick?: () => void
    end?: boolean
    standalone?: boolean
}

const NavItem: React.FC<NavItemProps> = ({
    path,
    label,
    icon,
    onClick,
    end = false,
    standalone = false,
}) => {
    const getActiveClasses = () => {
        return standalone
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
            : 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
    }

    const getInactiveClasses = () => {
        return standalone
            ? 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 hover:text-neutral-900 dark:hover:text-white'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
    }

    const navContent = (
        <NavLink
            to={path}
            end={end}
            className={({ isActive }) => cn(
                'flex items-center text-sm transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-offset-neutral-900',
                {

                    'px-1 sm:px-3 py-2 rounded-lg font-medium transition-all': standalone,
                    'px-1 sm:px-4 py-2.5 rounded-md': !standalone
                },
                isActive ? getActiveClasses() : getInactiveClasses()
            )}
            onClick={onClick}
            aria-label={label}
            role="menuitem"
        >
            <FlexBox align="center" gap={standalone ? 'sm' : 'md'}>
                <span className="flex-shrink-0">{icon}</span>
                {standalone && (
                    <Typography
                        as="p"
                        variant="body"
                        className={cn('truncate', {
                            'hidden sm:block': standalone
                        })}
                    >
                        {label}
                    </Typography>
                )}
            </FlexBox>
        </NavLink>
    )

    if (!standalone) {
        return (
            <li>
                <Tooltip
                    content={label}
                    placement="right"
                >
                    {navContent}
                </Tooltip>
            </li>
        )
    }

    return standalone ? navContent : <li>{navContent}</li>
}

export default NavItem