import React from 'react'
import { Button } from '@/components/common/buttons'
import { Typography, FlexBox } from '@/components/common'

interface MenusPageHeaderProps {
    title: string
    onAddMenu: () => void
    isFormOpen: boolean
    className?: string
}

export const MenusPageHeader: React.FC<MenusPageHeaderProps> = ({
    title,
    onAddMenu,
    isFormOpen,
    className = ''
}) => {
    return (
        <FlexBox
            justify="between"
            align="center"
            className={`w-full ${className}`}
        >
            <Typography
                as="h1"
                variant="title"
                color="neutral"
                className="text-xl sm:text-2xl font-bold line-clamp-1"
            >
                {title}
            </Typography>
            <Button
                onClick={onAddMenu}
                variant={isFormOpen ? 'outline' : 'primary'}
                className="min-w-[100px] sm:min-w-[120px] flex-shrink-0"
            >
                <span className="hidden sm:inline">
                    {isFormOpen ? 'Cancel' : 'Add Menu'}
                </span>
                <span className="sm:hidden">
                    {isFormOpen ? 'Cancel' : 'Add'}
                </span>
            </Button>
        </FlexBox>
    )
}

export default MenusPageHeader 