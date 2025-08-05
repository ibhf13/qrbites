import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { Box, FlexBox, Typography } from '../layout'
import { Button } from '../buttons'

export interface DropdownMenuItem {
    id: string
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: () => void
    variant?: 'default' | 'danger' | 'primary'
    disabled?: boolean
    divider?: boolean
}

export interface DropdownMenuProps {
    trigger: React.ReactNode
    items: DropdownMenuItem[]
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
    className?: string
    menuClassName?: string
    size?: 'sm' | 'md' | 'lg'
    closeOnItemClick?: boolean
}

const sizeClasses = {
    sm: 'min-w-20',
    md: 'min-w-32',
    lg: 'min-w-40'
}

const menuItemVariantMap = {
    default: 'ghost' as const,
    danger: 'danger' as const,
    primary: 'primary' as const
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
    trigger,
    items,
    isOpen: controlledOpen,
    onOpenChange,
    placement = 'bottom-right',
    className,
    menuClassName,
    size = 'md',
    closeOnItemClick = true
}) => {
    const [internalOpen, setInternalOpen] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
    const dropdownRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setIsOpen = onOpenChange || setInternalOpen

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)

            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, setIsOpen])

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false)
                triggerRef.current?.focus()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey)

            return () => document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [isOpen, setIsOpen])

    const calculateMenuPosition = () => {
        if (!triggerRef.current) return { top: 0, left: 0 }

        const rect = triggerRef.current.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

        let top = rect.bottom + scrollTop
        let left = rect.left + scrollLeft

        switch (placement) {
            case 'bottom-right':
                left = rect.right + scrollLeft
                break
            case 'bottom-left':
                left = rect.left + scrollLeft
                break
            case 'top-right':
                top = rect.top + scrollTop
                left = rect.right + scrollLeft
                break
            case 'top-left':
                top = rect.top + scrollTop
                left = rect.left + scrollLeft
                break
        }

        return { top, left }
    }

    const handleTriggerClick = (event?: React.MouseEvent) => {
        if (event) {
            event.stopPropagation()
            event.preventDefault()
        }

        if (!isOpen) {
            const position = calculateMenuPosition()

            setMenuPosition(position)
        }

        setIsOpen(!isOpen)
    }

    const handleItemClick = (item: DropdownMenuItem) => {
        if (item.disabled) return

        item.onClick()

        if (closeOnItemClick) {
            setIsOpen(false)
        }
    }

    const handleMenuKeyDown = (event: React.KeyboardEvent) => {
        if (!isOpen) return

        const menuItems = dropdownRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])')

        if (!menuItems) return

        const currentIndex = Array.from(menuItems).findIndex(item => item === document.activeElement)

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0

                    ; (menuItems[nextIndex] as HTMLElement).focus()
                break
            case 'ArrowUp':
                event.preventDefault()
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1

                    ; (menuItems[prevIndex] as HTMLElement).focus()
                break
            case 'Home':
                event.preventDefault()
                    ; (menuItems[0] as HTMLElement).focus()
                break
            case 'End':
                event.preventDefault()
                    ; (menuItems[menuItems.length - 1] as HTMLElement).focus()
                break
        }
    }

    const renderMenuItems = () => {
        return items.map((item, index) => (
            <React.Fragment key={item.id}>
                {item.divider && index > 0 && (
                    <Box
                        my="xs"
                        className="border-t border-neutral-200 dark:border-neutral-700"
                    />
                )}

                <Button
                    variant={menuItemVariantMap[item.variant || 'default']}
                    size="sm"
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    fullWidth
                    className={cn(
                        'justify-start h-auto py-1.5 px-2',
                        'focus:ring-1 focus:ring-primary-500 focus:ring-inset',
                        'min-h-0 text-xs',
                        item.variant === 'danger' && 'text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20'
                    )}
                    role="menuitem"
                    tabIndex={isOpen ? 0 : -1}
                >
                    <FlexBox align="center" gap="xs" className="w-full">
                        {item.icon && (
                            <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                        )}
                        <Typography variant="caption" className="truncate text-left text-xs">
                            {item.label}
                        </Typography>
                    </FlexBox>
                </Button>
            </React.Fragment>
        ))
    }

    return (
        <Box className={cn('relative', className)}>
            <Box
                ref={triggerRef}
                onClick={handleTriggerClick}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md cursor-pointer"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleTriggerClick()
                    }
                }}
            >
                {trigger}
            </Box>

            {isOpen && (
                <Box
                    ref={dropdownRef}
                    bg="white"
                    shadow="lg"
                    border="light"
                    rounded="md"
                    className={cn(
                        'fixed z-[9999] dark:bg-neutral-800 dark:border-neutral-700',
                        'focus:outline-none p-1 opacity-100',
                        sizeClasses[size],
                        menuClassName
                    )}
                    style={{
                        top: `${menuPosition.top + 4}px`,
                        left: placement.includes('right') ? `${menuPosition.left - 120}px` : `${menuPosition.left}px`,
                        transform: placement.includes('top') ? 'translateY(-100%)' : 'translateY(0)',
                        display: 'block'
                    }}
                    role="menu"
                    onKeyDown={handleMenuKeyDown}
                    tabIndex={-1}
                >
                    <FlexBox direction="col" className="space-y-0.5">
                        {renderMenuItems()}
                    </FlexBox>
                </Box>
            )}
        </Box>
    )
}

export default DropdownMenu 