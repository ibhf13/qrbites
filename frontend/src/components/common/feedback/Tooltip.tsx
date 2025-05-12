import React, { useEffect, useRef, useState } from 'react'

type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left'

interface TooltipProps {
    children: React.ReactNode
    content: string
    placement?: TooltipPlacement
    disabled?: boolean
    className?: string
    delay?: number
}

const Tooltip: React.FC<TooltipProps> = ({
    children,
    content,
    placement = 'top',
    disabled = false,
    className = '',
    delay = 300,
}) => {
    const [isVisible, setIsVisible] = useState(false)
    const timeoutRef = useRef<number | null>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current)
            }
        }
    }, [])

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
        setIsVisible(false)
    }

    // Handle focus events for accessibility
    const handleFocus = () => {
        if (!disabled) setIsVisible(true)
    }

    const handleBlur = () => {
        setIsVisible(false)
    }

    // Get tooltip positioning classes
    const getPositionClasses = () => {
        switch (placement) {
            case 'top':
                return 'bottom-full left-1/2 -translate-x-1/2 -translate-y-2 mb-2'
            case 'right':
                return 'left-full top-1/2 -translate-y-1/2 translate-x-2 ml-2'
            case 'bottom':
                return 'top-full left-1/2 -translate-x-1/2 translate-y-2 mt-2'
            case 'left':
                return 'right-full top-1/2 -translate-y-1/2 -translate-x-2 mr-2'
            default:
                return 'bottom-full left-1/2 -translate-x-1/2 -translate-y-2 mb-2'
        }
    }

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            {children}

            {isVisible && content && (
                <div
                    ref={tooltipRef}
                    role="tooltip"
                    className={`
            absolute z-50 px-2 py-1 text-xs font-medium
            text-white bg-neutral-800 dark:bg-neutral-700
            rounded-md shadow-sm whitespace-nowrap
            transition-opacity duration-200
            ${getPositionClasses()}
            ${className}
          `}
                >
                    {content}
                    <div
                        className={`
              absolute w-2 h-2 bg-neutral-800 dark:bg-neutral-700
              transform rotate-45
              ${placement === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' : ''}
              ${placement === 'right' ? 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2' : ''}
              ${placement === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
              ${placement === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2' : ''}
            `}
                    />
                </div>
            )}
        </div>
    )
}

export default Tooltip 