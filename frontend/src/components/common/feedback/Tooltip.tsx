import React, { useEffect, useRef, useState } from 'react'
import { Typography, Box } from '@/components/common'
import { getTooltipVariantClasses } from '@/utils/designTokenUtils'
import { cn } from '@/utils/cn'

type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
type TooltipVariant = 'default' | 'light' | 'error' | 'warning' | 'success' | 'info'

interface TooltipProps {
    children: React.ReactNode
    content: string | React.ReactNode
    placement?: TooltipPlacement
    variant?: TooltipVariant
    disabled?: boolean
    className?: string
    delay?: number
    maxWidth?: string
    interactive?: boolean
    showArrow?: boolean
}

const tooltipPositions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 -translate-y-2 mb-2',
    'top-start': 'bottom-full left-0 -translate-y-2 mb-2',
    'top-end': 'bottom-full right-0 -translate-y-2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 translate-x-2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 translate-y-2 mt-2',
    'bottom-start': 'top-full left-0 translate-y-2 mt-2',
    'bottom-end': 'top-full right-0 translate-y-2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 -translate-x-2 mr-2'
}

const arrowPositions = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    'top-start': 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    'top-end': 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'bottom-start': 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'bottom-end': 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2'
}

const Tooltip: React.FC<TooltipProps> = ({
    children,
    content,
    placement = 'top',
    variant = 'default',
    disabled = false,
    className,
    delay = 300,
    maxWidth = 'max-w-xs',
    interactive = false,
    showArrow = true,
}) => {
    const [isVisible, setIsVisible] = useState(false)
    const [actualPlacement, setActualPlacement] = useState(placement)
    const timeoutRef = useRef<number | null>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    useEffect(() => {
        if (isVisible && tooltipRef.current && triggerRef.current) {
            const tooltip = tooltipRef.current
            const trigger = triggerRef.current
            const rect = trigger.getBoundingClientRect()
            const tooltipRect = tooltip.getBoundingClientRect()
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            }

            let newPlacement = placement

            if (placement.includes('top') && rect.top - tooltipRect.height < 10) {
                newPlacement = placement.replace('top', 'bottom') as TooltipPlacement
            } else if (placement.includes('bottom') && rect.bottom + tooltipRect.height > viewport.height - 10) {
                newPlacement = placement.replace('bottom', 'top') as TooltipPlacement
            }

            if (placement.includes('right') && rect.right + tooltipRect.width > viewport.width - 10) {
                newPlacement = placement.replace('right', 'left') as TooltipPlacement
            } else if (placement.includes('left') && rect.left - tooltipRect.width < 10) {
                newPlacement = placement.replace('left', 'right') as TooltipPlacement
            }

            setActualPlacement(newPlacement)
        }
    }, [isVisible, placement])

    const handleMouseEnter = () => {
        if (disabled) return

        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = window.setTimeout(() => {
            setIsVisible(true)
        }, delay)
    }

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }

        if (!interactive) {
            setIsVisible(false)
        }
    }

    const handleTooltipMouseEnter = () => {
        if (interactive && timeoutRef.current) {
            window.clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }

    const handleTooltipMouseLeave = () => {
        if (interactive) {
            setIsVisible(false)
        }
    }

    const handleFocus = () => {
        if (!disabled) setIsVisible(true)
    }

    const handleBlur = () => {
        setIsVisible(false)
    }

    return (
        <Box
            ref={triggerRef}
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            {children}

            {isVisible && content && (
                <Box
                    ref={tooltipRef}
                    role="tooltip"
                    className={cn(
                        'absolute z-50 px-3 py-2 rounded-lg shadow-lg',
                        'transition-all duration-200 ease-out transform',
                        maxWidth,
                        getTooltipVariantClasses(variant),
                        tooltipPositions[actualPlacement],
                        className
                    )}
                    onMouseEnter={handleTooltipMouseEnter}
                    onMouseLeave={handleTooltipMouseLeave}
                >
                    {typeof content === 'string' ? (
                        <Typography
                            variant="caption"
                            className={cn(
                                'font-medium',
                                variant === 'light'
                                    ? 'text-neutral-900 dark:text-neutral-800'
                                    : 'text-white'
                            )}
                        >
                            {content}
                        </Typography>
                    ) : (
                        content
                    )}

                    {showArrow && (
                        <Box
                            className={cn(
                                'absolute w-2 h-2 transform rotate-45',
                                getTooltipVariantClasses(variant),
                                arrowPositions[actualPlacement]
                            )}
                        />
                    )}
                </Box>
            )}
        </Box>
    )
}

export default Tooltip