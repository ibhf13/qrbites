export type ColorVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type VariantStyle = 'filled' | 'outlined' | 'light' | 'ghost'

export const sizes = {
    xs: {
        text: 'text-xs',
        px: 'px-1.5',
        py: 'py-0.5',
        h: 'h-4',
        min: 'min-w-4',
        gap: 'gap-1',
        icon: 'w-3 h-3',
        rounded: 'rounded'
    },
    sm: {
        text: 'text-sm',
        px: 'px-2',
        py: 'py-1',
        h: 'h-6',
        min: 'min-w-5',
        gap: 'gap-1.5',
        icon: 'w-4 h-4',
        rounded: 'rounded-md'
    },
    md: {
        text: 'text-base',
        px: 'px-3',
        py: 'py-2',
        h: 'h-8',
        min: 'min-w-6',
        gap: 'gap-2',
        icon: 'w-5 h-5',
        rounded: 'rounded-lg'
    },
    lg: {
        text: 'text-lg',
        px: 'px-4',
        py: 'py-3',
        h: 'h-10',
        min: 'min-w-8',
        gap: 'gap-2.5',
        icon: 'w-6 h-6',
        rounded: 'rounded-lg'
    },
    xl: {
        text: 'text-xl',
        px: 'px-6',
        py: 'py-4',
        h: 'h-12',
        min: 'min-w-10',
        gap: 'gap-3',
        icon: 'w-8 h-8',
        rounded: 'rounded-xl'
    }
}

export const animations = {
    transition: 'transition-all duration-200',
    hover: 'hover:-translate-y-0.5 active:translate-y-0',
    focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    interactive: 'hover:scale-[1.02] active:scale-95',
    smooth: 'transition-all duration-300 ease-out',
    fast: 'transition-all duration-150 ease-out',
    slow: 'transition-all duration-500 ease-out'
}

export const shadows = {
    none: 'shadow-none',
    xs: 'shadow-xs',
    sm: 'shadow-sm',
    base: 'shadow-base',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    elevated: 'shadow-elevated',
    glow: 'shadow-glow',
    glowSecondary: 'shadow-glowSecondary',
    glowAccent: 'shadow-glowAccent'
}

export const getColorClasses = (color: ColorVariant, variant: VariantStyle = 'filled') => {
    switch (variant) {
        case 'filled':
            return {
                bg: `bg-${color}-600 dark:bg-${color}-500`,
                text: color === 'secondary' ? 'text-neutral-900' : 'text-white',
                border: `border-${color}-600 dark:border-${color}-500`,
                hover: `hover:bg-${color}-700 dark:hover:bg-${color}-600`,
                focus: `focus-visible:ring-${color}-500`,
                shadow: shadows.base
            }
        case 'outlined':
            return {
                bg: 'bg-transparent',
                text: `text-${color}-600 dark:text-${color}-400`,
                border: `border-2 border-${color}-600 dark:border-${color}-400`,
                hover: `hover:bg-${color}-600 hover:text-white dark:hover:bg-${color}-400 dark:hover:text-neutral-900`,
                focus: `focus-visible:ring-${color}-500`,
                shadow: ''
            }
        case 'light':
            return {
                bg: `bg-${color}-100 dark:bg-${color}-900/30`,
                text: `text-${color}-800 dark:text-${color}-300`,
                border: `border-${color}-200 dark:border-${color}-800`,
                hover: `hover:bg-${color}-200 dark:hover:bg-${color}-800/50`,
                focus: `focus-visible:ring-${color}-500`,
                shadow: ''
            }
        case 'ghost':
            return {
                bg: 'bg-transparent',
                text: `text-${color}-600 dark:text-${color}-400`,
                border: 'border-transparent',
                hover: `hover:bg-${color}-100 dark:hover:bg-${color}-900/20`,
                focus: `focus-visible:ring-${color}-500`,
                shadow: ''
            }
        default:
            return {
                bg: `bg-${color}-600`,
                text: 'text-white',
                border: `border-${color}-600`,
                hover: `hover:bg-${color}-700`,
                focus: `focus-visible:ring-${color}-500`,
                shadow: shadows.base
            }
    }
}

export const getFormFieldClasses = (hasError: boolean = false) => ({
    base: 'w-full rounded-md py-2 border text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 placeholder-neutral-400 dark:placeholder-neutral-500',
    disabled: 'disabled:bg-neutral-100 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400 disabled:cursor-not-allowed',
    focus: animations.focus,
    border: hasError
        ? 'border-error-300 dark:border-error-600 focus-visible:ring-error-500 focus-visible:border-error-500'
        : 'border-neutral-300 dark:border-neutral-600 focus-visible:ring-primary-500 focus-visible:border-primary-500',
    padding: {
        left: (hasIcon: boolean) => hasIcon ? 'pl-10' : 'pl-4',
        right: (hasIcon: boolean) => hasIcon ? 'pr-10' : 'pr-4'
    }
})

export const getFormLabelClasses = () =>
    'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1'

export const getFormErrorClasses = () =>
    'mt-1 text-sm text-error-600 dark:text-error-400'

export const getFormHelperClasses = () =>
    'mt-1 text-sm text-neutral-500 dark:text-neutral-400'

export const getCardVariantClasses = (variant: string) => {
    switch (variant) {
        case 'default':
            return `bg-white ${shadows.sm} border border-neutral-200/60 hover:${shadows.md} ${animations.hover} dark:bg-neutral-800 dark:border-neutral-700/60`
        case 'soft':
            return `bg-neutral-50 border border-neutral-200/60 ${shadows.sm} hover:${shadows.md} ${animations.hover} dark:bg-neutral-800/50 dark:border-neutral-700/60`
        case 'warm':
            return `bg-surface-mint border border-primary-200/60 ${shadows.sm} hover:${shadows.md} ${animations.hover} dark:bg-primary-950/20 dark:border-primary-800/60`
        case 'fresh':
            return `bg-surface-lime border border-secondary-200/60 ${shadows.sm} hover:${shadows.md} ${animations.hover} dark:bg-secondary-950/20 dark:border-secondary-800/60`
        case 'earth':
            return `bg-neutral-50 border border-neutral-200/60 ${shadows.sm} hover:${shadows.md} ${animations.hover} dark:bg-neutral-950/20 dark:border-neutral-800/60`
        case 'elevated':
            return `bg-white ${shadows.elevated} border border-neutral-200/30 hover:${shadows.lg} hover:-translate-y-2 dark:bg-neutral-800 dark:border-neutral-700/30`
        case 'outlined':
            return `bg-white border border-neutral-200 hover:border-neutral-300 hover:${shadows.sm} dark:bg-neutral-800 dark:border-neutral-700 dark:hover:border-neutral-600`
        case 'glass':
            return `bg-surface-glass hover:${shadows.glow} backdrop-blur-md border border-white/20 dark:border-neutral-700/30`
        default:
            return `bg-white ${shadows.sm} border border-neutral-200/60 hover:${shadows.md} ${animations.hover} dark:bg-neutral-800 dark:border-neutral-700/60`
    }
}

export const getPaddingClasses = (padding: string) => {
    switch (padding) {
        case 'none':
            return 'p-0'
        case 'sm':
            return 'p-3'
        case 'md':
            return 'p-4'
        case 'lg':
            return 'p-6'
        case 'xl':
            return 'p-8'
        default:
            return 'p-4'
    }
}

export const getSpinnerSizes = (size: SizeVariant | '2xl') => {
    const spinnerSizeMap = {
        xs: { spinner: 'h-3 w-3', other: 'h-4 w-4' },
        sm: { spinner: 'h-4 w-4', other: 'h-6 w-6' },
        md: { spinner: 'h-6 w-6', other: 'h-8 w-8' },
        lg: { spinner: 'h-8 w-8', other: 'h-12 w-12' },
        xl: { spinner: 'h-12 w-12', other: 'h-16 w-16' },
        '2xl': { spinner: 'h-16 w-16', other: 'h-20 w-20' }
    }

    return spinnerSizeMap[size] || spinnerSizeMap.md
}

export const getNotificationVariantClasses = (variant: string) => {
    switch (variant) {
        case 'success':
            return `bg-success-600 dark:bg-success-500 text-white ${shadows.lg} border-l-4 border-success-700`
        case 'error':
            return `bg-error-600 dark:bg-error-500 text-white ${shadows.lg} border-l-4 border-error-700`
        case 'warning':
            return `bg-warning-600 dark:bg-warning-500 text-white ${shadows.lg} border-l-4 border-warning-700`
        case 'info':
            return `bg-info-600 dark:bg-info-500 text-white ${shadows.lg} border-l-4 border-info-700`
        default:
            return `bg-neutral-800 dark:bg-neutral-700 text-white ${shadows.lg} border-l-4 border-neutral-600`
    }
}

export const getBadgeVariantClasses = (color: ColorVariant, variant: 'filled' | 'outlined' | 'light' | 'dot' | 'gradient') => {
    switch (variant) {
        case 'filled':
            return `bg-${color}-600 dark:bg-${color}-500 text-white ${shadows.sm}`
        case 'outlined':
            return `border-2 border-${color}-600 dark:border-${color}-400 text-${color}-600 dark:text-${color}-400 bg-transparent`
        case 'light':
            return `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-800 dark:text-${color}-300 border border-${color}-200 dark:border-${color}-800`
        case 'gradient':
            return `bg-gradient-to-r from-${color}-500 to-${color}-600 text-white ${shadows.sm}`
        case 'dot':
            return `bg-${color}-600 dark:bg-${color}-500`
        default:
            return `bg-${color}-600 dark:bg-${color}-500 text-white ${shadows.sm}`
    }
}

export const getSkeletonVariantClasses = (variant: string) => {
    switch (variant) {
        case 'text':
            return 'rounded'
        case 'circular':
            return 'rounded-full'
        case 'rectangular':
            return ''
        case 'rounded':
            return 'rounded-lg'
        case 'avatar':
            return 'rounded-full'
        case 'button':
            return 'rounded-lg'
        case 'card':
            return 'rounded-xl'
        default:
            return 'rounded'
    }
}

export const getTooltipVariantClasses = (variant: string) => {
    switch (variant) {
        case 'default':
            return 'bg-neutral-900 dark:bg-neutral-800 text-white border border-neutral-700 dark:border-neutral-600'
        case 'light':
            return `bg-white dark:bg-neutral-100 text-neutral-900 dark:text-neutral-800 border border-neutral-200 dark:border-neutral-300 ${shadows.lg}`
        case 'error':
            return 'bg-error-600 dark:bg-error-500 text-white border border-error-700 dark:border-error-400'
        case 'warning':
            return 'bg-warning-600 dark:bg-warning-500 text-white border border-warning-700 dark:border-warning-400'
        case 'success':
            return 'bg-success-600 dark:bg-success-500 text-white border border-success-700 dark:border-success-400'
        case 'info':
            return 'bg-info-600 dark:bg-info-500 text-white border border-info-700 dark:border-info-400'
        default:
            return 'bg-neutral-900 dark:bg-neutral-800 text-white border border-neutral-700 dark:border-neutral-600'
    }
}