import { Paper } from '@/components/common/layout'
import { NavItem } from '@/components/common/navigation'
import { NotificationPanel } from '@/features/notifications'
import { BuildingStorefrontIcon, HomeIcon } from '@heroicons/react/24/outline'
import React from 'react'
import Logo from './Logo'
import { ThemeToggleButton } from './ThemeToggleButton'
import UserMenu from './UserMenu'
import { FlexBox, Box } from '@/components/common'

interface HeaderProps {
    actions?: React.ReactNode
}

const Header: React.FC<HeaderProps> = ({ actions }) => {

    const navigationItems = [
        {
            path: '/home',
            icon: <HomeIcon className="w-4 h-4" />,
            label: 'Home'
        },
        {
            path: '/',
            icon: <BuildingStorefrontIcon className="w-4 h-4" />,
            label: 'My Restaurants'
        }
    ]

    return (
        <header>
            <Paper
                variant="none"
                padding="none"
                className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 rounded-none h-12"
            >
                <FlexBox
                    align="center"
                    justify="between"
                    className="h-12 px-3"
                >
                    <FlexBox align="center" className='w-full' gap="sm" >
                        <Box className="flex-shrink-0">
                            <Logo size="sm" />
                        </Box>

                        <nav>
                            <FlexBox align="center" gap="sm" >
                                {navigationItems.map((item) => (
                                    <NavItem
                                        key={item.path}
                                        path={item.path}
                                        icon={item.icon}
                                        label={item.label}
                                        standalone={true}
                                    />
                                ))}
                            </FlexBox>
                        </nav>
                    </FlexBox>

                    <FlexBox align="center" gap="sm">
                        <ThemeToggleButton />

                        <NotificationPanel
                            maxItems={5}
                            triggerVariant="icon"
                            showBadge={true}
                            position="right"
                        />

                        <UserMenu />

                        {actions}
                    </FlexBox>
                </FlexBox>
            </Paper>
        </header>
    )
}

export default Header 