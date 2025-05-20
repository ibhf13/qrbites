import type { DesignTokens } from '../types/designTokens'

const colors = {
    primary: {
        50: '#f3f8ed',
        100: '#e4efd8',
        200: '#cae1b5',
        300: '#9fc87e',
        400: '#88b863',
        500: '#6a9c46',
        600: '#507c34',
        700: '#3f5f2c',
        800: '#354d27',
        900: '#304225',
        950: '#162310',
    },
    secondary: {
        50: '#fef4f2',
        100: '#ffe6e1',
        200: '#ffd1c8',
        300: '#ffb2a2',
        400: '#fd846c',
        500: '#f55d3e',
        600: '#e34120',
        700: '#bf3216',
        800: '#9d2d17',
        900: '#832c1a',
        950: '#471308',
    },
    accent: {
        50: '#f3f8ed',
        100: '#e4efd8',
        200: '#cae1b5',
        300: '#9fc87e',
        400: '#88b863',
        500: '#6a9c46',
        600: '#507c34',
        700: '#3f5f2c',
        800: '#354d27',
        900: '#304225',
        950: '#162310',
    },
    neutral: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617'
    },
    success: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
        950: '#022c22'
    },
    warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03'
    },
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a'
    },
    info: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554'
    },
    surface: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        elevated: '#ffffff',
        overlay: 'rgba(15, 23, 42, 0.05)',
        glass: 'rgba(255, 255, 255, 0.1)',
        mint: '#f0fdf2',
        lime: '#fefce8'
    },
    brand: {
        mint: '#A3EBB1',
        lime: '#ECF87F',
        sage: '#84cc16',
        emerald: '#10b981',
        teal: '#14b8a6',
        cyan: '#06b6d4',
        sky: '#0ea5e9',
        indigo: '#6366f1'
    }
}

const typography = {
    fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Roboto', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'monospace']
    },
    fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
        '5xl': '48px',
        '6xl': '60px',
        '7xl': '72px',
        '8xl': '96px',
        '9xl': '128px'
    },
    fontWeight: {
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900
    },
    lineHeight: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
    },
    letterSpacing: {
        tighter: '-0.8px',
        tight: '-0.4px',
        normal: '0px',
        wide: '0.4px',
        wider: '0.8px',
        widest: '1.6px'
    }
}

const spacing = {
    '0': '0px',
    '1': '6px',
    '2': '12px',
    '3': '18px',
    '4': '24px',
    '5': '30px',
    '6': '36px',
    '7': '42px',
    '8': '48px',
    '9': '54px',
    '10': '60px',
    '11': '66px',
    '12': '72px',
    '14': '84px',
    '16': '96px',
    '18': '108px',
    '20': '120px',
    '24': '144px',
    '28': '168px',
    '32': '192px',
    '36': '216px',
    '40': '240px',
    '44': '264px',
    '48': '288px',
    '52': '312px',
    '56': '336px',
    '60': '360px',
    '64': '384px',
    '72': '432px',
    '80': '480px',
    '88': '528px',
    '96': '576px',
    '112': '672px',
    '128': '768px'
}

const shadows = {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 50px 100px -20px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    none: '0 0 #0000',
    glow: '0 0 20px rgba(163, 235, 177, 0.4)',
    glowSecondary: '0 0 20px rgba(236, 248, 127, 0.4)',
    elevated: '0 8px 30px rgba(0, 0, 0, 0.12)',
    soft: '0 2px 8px rgba(0, 0, 0, 0.08)',
    crisp: '0 1px 3px rgba(0, 0, 0, 0.2)'
}

const borderRadius = {
    none: '0px',
    xs: '2px',
    sm: '4px',
    base: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',
    full: '9999px'
}

const transitions = {
    none: 'none',
    all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    default: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: '200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
    bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: '400ms cubic-bezier(0.175, 0.885, 0.32, 1.275)'
}


const backdropBlur = {
    none: '0px',
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '40px'
}

const keyframes = {
    fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' }
    },
    fadeInUp: {
        '0%': { opacity: '0', transform: 'translateY(20px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' }
    },
    fadeInDown: {
        '0%': { opacity: '0', transform: 'translateY(-20px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' }
    },
    scaleIn: {
        '0%': { opacity: '0', transform: 'scale(0.95)' },
        '100%': { opacity: '1', transform: 'scale(1)' }
    },
    slideInRight: {
        '0%': { opacity: '0', transform: 'translateX(20px)' },
        '100%': { opacity: '1', transform: 'translateX(0)' }
    },
    slideInLeft: {
        '0%': { opacity: '0', transform: 'translateX(-20px)' },
        '100%': { opacity: '1', transform: 'translateX(0)' }
    },
    pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.8' }
    },
    float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-8px)' }
    },
    glow: {
        '0%, 100%': { boxShadow: '0 0 20px rgba(163, 235, 177, 0.4)' },
        '50%': { boxShadow: '0 0 30px rgba(163, 235, 177, 0.6)' }
    },
    glowSecondary: {
        '0%, 100%': { boxShadow: '0 0 20px rgba(236, 248, 127, 0.4)' },
        '50%': { boxShadow: '0 0 30px rgba(236, 248, 127, 0.6)' }
    }
}

const animation = {
    'fade-in': 'fadeIn 0.4s ease-out',
    'fade-in-up': 'fadeInUp 0.5s ease-out',
    'fade-in-down': 'fadeInDown 0.5s ease-out',
    'scale-in': 'scaleIn 0.3s ease-out',
    'slide-in-right': 'slideInRight 0.4s ease-out',
    'slide-in-left': 'slideInLeft 0.4s ease-out',
    'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    'float': 'float 3s ease-in-out infinite',
    'glow': 'glow 2s ease-in-out infinite alternate',
    'glow-secondary': 'glowSecondary 2s ease-in-out infinite alternate'
}

const safelist = [
    'animate-pulse',
    'animate-spin',
    'animate-fade-in',
    'animate-fade-in-up',
    'animate-fade-in-down',
    'animate-scale-in',
    'animate-slide-in-right',
    'animate-slide-in-left',
    'animate-float',
    'animate-glow',
    'animate-glow-secondary',
    'transition-all',
    'transition-colors',
    'transition-transform',
    'transition-opacity',
    'duration-75',
    'duration-100',
    'duration-150',
    'duration-200',
    'duration-300',
    'duration-500',
    'duration-700',
    'duration-1000',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'ease-linear',
    'scale-95',
    'scale-100',
    'scale-105',
    'rotate-0',
    'rotate-180',
    '-translate-y-0.5',
    '-translate-y-1',
    '-translate-y-2',
    'translate-y-0',
    'hover:scale-[1.02]',
    'active:scale-95',
    'active:scale-98'
]

const tailwindConfig = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class'
}

const tokens: DesignTokens = {
    colors,
    typography,
    spacing,
    shadows,
    borderRadius,
    transitions,
    keyframes,
    animation,
    backdropBlur,
    safelist,
    tailwindConfig
}

export default tokens