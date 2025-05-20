import { IconButton } from '@/components/common/buttons'
import { useTheme } from '@/contexts/ThemeContext'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { forwardRef } from 'react'

export const ThemeToggleButton = forwardRef<HTMLButtonElement, { className?: string }>(({ className = '' }, ref) => {
    const { theme, toggleTheme } = useTheme()
    const icon = theme === 'dark' ? SunIcon : MoonIcon

    return (
        <IconButton
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            icon={icon}
            ariaLabel={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className={className}
            ref={ref}
        >
            <span className="sr-only">
                {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            </span>
        </IconButton>
    )
})

export default ThemeToggleButton 