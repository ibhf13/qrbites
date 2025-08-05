import { DropdownMenu, type DropdownMenuItem } from '@/components/common/navigation'
import { useAuthContext, useLogoutAction } from '@/features/auth'
import {
    ArrowRightOnRectangleIcon,
    UserIcon
} from '@heroicons/react/24/outline'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from './Avatar'
import { FlexBox } from '@/components/common'

const UserMenu: React.FC = () => {
    const { user } = useAuthContext()
    const { logout } = useLogoutAction()
    const navigate = useNavigate()

    const getUserInitials = (): string => {
        if (!user?.email) return 'U'

        const parts = user.email.split('@')[0].split(/[._-]/)

        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase()
        }

        return parts[0].substring(0, 2).toUpperCase()
    }

    const handleLogout = () => {
        logout()
    }

    const handleProfileClick = () => {
        navigate('/profile')
    }

    const menuItems: DropdownMenuItem[] = [
        {
            id: 'profile',
            label: 'Profile',
            icon: UserIcon,
            onClick: handleProfileClick,
            variant: 'default'
        },
        {
            id: 'logout',
            label: 'Logout',
            icon: ArrowRightOnRectangleIcon,
            onClick: handleLogout,
            variant: 'danger',
            divider: true
        }
    ]

    const trigger = (
        <FlexBox align="center" gap="sm" >
            <Avatar initials={getUserInitials()} />
        </FlexBox>
    )

    return (
        <DropdownMenu
            trigger={trigger}
            items={menuItems}
            size="sm"
            className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
        />
    )
}

export default UserMenu 