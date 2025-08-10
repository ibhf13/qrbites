import React, { useState } from 'react'
import { cn } from '@/utils/cn'
import { Box, FlexBox } from '../layout'
import { Button } from '../buttons/Button'
import { IconButton } from '../buttons/IconButton'
import { ActionItem, actionPositionClasses } from './Card.types'

interface CardActionsProps {
    actions: ActionItem[]
    showActionsOnHover?: boolean
    actionPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    loading?: boolean
    actionDirection?: 'col' | 'row'
}

export const CardActions: React.FC<CardActionsProps> = ({
    actions,
    showActionsOnHover = true,
    actionPosition = 'top-right',
    loading = false,
    actionDirection,
}) => {
    const [showMobileMenu, setShowMobileMenu] = useState(false)

    if (!actions?.length || loading) return null

    const MenuIcon = ({ className }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
        </svg>
    )

    return (
        <>
            <Box
                className={cn(
                    'hidden sm:flex absolute z-20 transition-all duration-300',
                    actionPositionClasses[actionPosition],
                    showActionsOnHover ? 'opacity-0 group-hover:opacity-100 delay-100' : 'opacity-100'
                )}
            >
                <FlexBox
                    gap="xs"
                    direction={actionDirection}
                    className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-neutral-100/50 p-1 dark:bg-neutral-900/95 dark:border-neutral-800/50"
                >
                    {actions.map((action, index) => (
                        <IconButton
                            key={index}
                            icon={action.icon}
                            variant={action.variant || 'ghost'}
                            size="sm"
                            ariaLabel={action.label}
                            tooltip={action.label}
                            onClick={action.onClick}
                            disabled={action.disabled}
                        />
                    ))}
                </FlexBox>
            </Box>

            <Box
                className={cn(
                    'sm:hidden absolute z-20 transition-all duration-300 opacity-100',
                    actionPositionClasses[actionPosition]
                )}
            >
                <Box className="relative">
                    <IconButton
                        icon={MenuIcon}
                        variant="ghost"
                        size="sm"
                        ariaLabel="More actions"
                        tooltip="More actions"
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowMobileMenu(!showMobileMenu)
                        }}
                        rounded
                        className="bg-white/95 backdrop-blur-md shadow-lg border border-neutral-100/50 dark:bg-neutral-900/95 dark:border-neutral-800/50"
                        padding="p-2"
                    />

                    {showMobileMenu && (
                        <Box
                            className="absolute top-full mt-1 right-0 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 min-w-[120px] z-30"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {actions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    size="xs"
                                    fullWidth
                                    onClick={(e) => {
                                        action.onClick(e)
                                        setShowMobileMenu(false)
                                    }}
                                    disabled={action.disabled}
                                    className={cn(
                                        'justify-start gap-2 rounded-none px-3 py-1.5 h-auto',
                                        action.variant === 'danger' && 'text-error-600 dark:text-error-400',
                                        action.variant === 'primary' && 'text-primary-600 dark:text-primary-400'
                                    )}
                                >
                                    <action.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{action.label.split(' ')[0]}</span>
                                </Button>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </>
    )
}

export default CardActions