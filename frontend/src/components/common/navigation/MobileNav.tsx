import { IconButton } from '../buttons'
import { Badge } from '../feedback'
import { FlexBox, Box, Typography } from '../layout'
import { useAuthContext } from '@/features/auth'
import {
    Bars3Icon,
    BuildingStorefrontIcon,
    HomeIcon,
    QrCodeIcon,
    UserIcon
} from '@heroicons/react/24/outline'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface NavItemData {
    path: string
    label: string
    icon: React.ReactNode
    badge?: {
        count?: number
        color?: 'primary' | 'accent' | 'warning' | 'error'
    }
}

const MobileNav: React.FC = () => {
    const { isAuthenticated } = useAuthContext()

    const publicNavItems: NavItemData[] = [
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

    const authNavItems: NavItemData[] = [
        {
            path: '/restaurants',
            label: 'Dashboard',
            icon: <HomeIcon className="w-6 h-6" />
        },
        {
            path: '/restaurants/manage',
            label: 'Restaurants',
            icon: <BuildingStorefrontIcon className="w-6 h-6" />,
            badge: {
                count: 3,
                color: 'primary'
            }
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

    const navItems = isAuthenticated ? authNavItems : publicNavItems

    const NavItemComponent: React.FC<{ item: NavItemData }> = ({ item }) => (
        <NavLink
            to={item.path}
            className={({ isActive }) => cn(
                'relative flex flex-col items-center justify-center w-full h-full transition-colors duration-200',
                {
                    'text-primary-600 dark:text-primary-400': isActive,
                    'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200': !isActive
                }
            )}
            aria-label={item.label}
        >
            <FlexBox direction="col" gap="xs" className="flex flex-col items-center justify-center w-full h-full">
                <Box className="relative">
                    {item.icon}
                    {item.badge && item.badge.count && item.badge.count > 0 && (
                        <Box className="absolute -top-1 -right-1">
                            <Badge
                                count={item.badge.count}
                                color={item.badge.color || 'primary'}
                                size="xs"
                                variant="filled"
                            />
                        </Box>
                    )}
                </Box>
                <Typography
                    variant="caption"
                    className="font-medium"
                    color="neutral"
                >
                    {item.label}
                </Typography>
            </FlexBox>
        </NavLink>
    )

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 z-10">
            <FlexBox align="center" justify="around" className="h-16">
                {navItems.map(item => (
                    <NavItemComponent key={item.path} item={item} />
                ))}

                {isAuthenticated && (
                    <FlexBox className="flex flex-col items-center justify-center w-full h-full">
                        <IconButton
                            icon={Bars3Icon}
                            onClick={() => { }}
                            variant="ghost"
                            size="sm"
                            className="mb-1 p-0 hover:bg-transparent"
                        />
                        <Typography
                            variant="caption"
                            className="font-medium"
                            color="neutral"
                        >
                            More
                        </Typography>
                    </FlexBox>
                )}
            </FlexBox>
        </nav>
    )
}

export default MobileNav