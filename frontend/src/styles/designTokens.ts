export const colors = {
    // Primary colors - Refined deep teal that looks appetizing and professional
    primary: {
        50: '#ebfffc',
        100: '#cefff8',
        200: '#9ffff0',
        300: '#67f5e2',
        400: '#38dccf',
        500: '#17bdb2',
        600: '#0c9892',
        700: '#0c7975',
        800: '#0f5f5e',
        900: '#104f4d',
        950: '#023334',
    },
    // Secondary colors - Warm plum purple for accent elements
    secondary: {
        50: '#fbf6ff',
        100: '#f5eaff',
        200: '#edd5ff',
        300: '#e2b5ff',
        400: '#d387fa',
        500: '#c05df5',
        600: '#a941e3',
        700: '#8e31c1',
        800: '#752a9d',
        900: '#60227e',
        950: '#42114d',
    },
    // Accent colors - Vibrant orange-red for calls to action
    accent: {
        50: '#fff8ed',
        100: '#ffedd4',
        200: '#ffd9a8',
        300: '#ffbf71',
        400: '#ff9939',
        500: '#ff7614',
        600: '#ed5f07',
        700: '#c54708',
        800: '#9c3a0f',
        900: '#7e3210',
        950: '#461705',
    },
    // Neutral colors - Warmer grays with a slight beige undertone for comfort
    neutral: {
        50: '#fafaf8',
        100: '#f5f5f1',
        200: '#e7e6e1',
        300: '#d5d3cc',
        400: '#b1afa6',
        500: '#908d83',
        600: '#726f65',
        700: '#575551',
        800: '#3a3834',
        900: '#1f1d1b',
        950: '#0f0e0d',
    },
    // Food-themed complementary colors
    complementary: {
        mint: {
            light: '#e0f5e9',
            medium: '#a7e1c4',
            dark: '#5bb98e',
        },
        tomato: {
            light: '#fde3e3',
            medium: '#f5a8a8',
            dark: '#e05252',
        },
        lemon: {
            light: '#fffaea',
            medium: '#fff0c0',
            dark: '#ffd763',
        },
        blueberry: {
            light: '#e8eeff',
            medium: '#bdc9ff',
            dark: '#6c7bff',
        },
    },
    // Semantic colors - Enhanced for better visibility
    success: '#0cb67a', // Slightly more vibrant green
    warning: '#ff9500', // More visible orange
    error: '#e03131',   // Deeper red for better contrast
    info: '#228be6',    // Brighter blue for information
}

export const typography = {
    fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
    },
    fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
        '5xl': '3rem',     // 48px
    },
    fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
    lineHeight: {
        none: 1,
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
        loose: 2,
    },
}

export const spacing = {
    '0': '0',
    '0.5': '0.125rem', // 2px
    '1': '0.25rem',    // 4px
    '1.5': '0.375rem', // 6px
    '2': '0.5rem',     // 8px
    '2.5': '0.625rem', // 10px
    '3': '0.75rem',    // 12px
    '3.5': '0.875rem', // 14px
    '4': '1rem',       // 16px
    '5': '1.25rem',    // 20px
    '6': '1.5rem',     // 24px
    '8': '2rem',       // 32px
    '10': '2.5rem',    // 40px
    '12': '3rem',      // 48px
    '16': '4rem',      // 64px
    '20': '5rem',      // 80px
    '24': '6rem',      // 96px
    '32': '8rem',      // 128px
    '40': '10rem',     // 160px
    '48': '12rem',     // 192px
    '56': '14rem',     // 224px
    '64': '16rem',     // 256px
}

export const breakpoints = {
    mobile: '640px',
    tablet: '1024px',
    desktop: '1025px',
}

export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.07), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.18)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
    // New elegant shadow options
    card: '0 4px 12px rgba(0, 0, 0, 0.05)',
    hover: '0 10px 20px rgba(0, 0, 0, 0.08)',
    button: '0 2px 8px rgba(0, 0, 0, 0.12)',
    dropdown: '0 8px 16px rgba(0, 0, 0, 0.1)',
    focus: '0 0 0 3px rgba(23, 189, 178, 0.35)',
    none: 'none',
}

export const borderRadius = {
    none: '0',
    sm: '0.125rem',  // 2px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
}

export const zIndices = {
    '0': 0,
    '10': 10,
    '20': 20,
    '30': 30,
    '40': 40,
    '50': 50,
    '60': 60,
    auto: 'auto',
}

export const transitions = {
    DEFAULT: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    // New transition options
    bounce: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)', // Slight bounce for interactive elements
    slide: '250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth slide
    emphasis: '250ms cubic-bezier(0.17, 0.67, 0.83, 0.67)', // Emphasized animation
}

// New gradient options that match the color palette
export const gradients = {
    primary: {
        horizontal: 'linear-gradient(to right, #17bdb2, #0c7975)',
        vertical: 'linear-gradient(to bottom, #17bdb2, #0c7975)',
        diagonal: 'linear-gradient(135deg, #17bdb2, #0c7975)',
    },
    secondary: {
        horizontal: 'linear-gradient(to right, #c05df5, #8e31c1)',
        vertical: 'linear-gradient(to bottom, #c05df5, #8e31c1)',
        diagonal: 'linear-gradient(135deg, #c05df5, #8e31c1)',
    },
    accent: {
        horizontal: 'linear-gradient(to right, #ff7614, #c54708)',
        vertical: 'linear-gradient(to bottom, #ff7614, #c54708)',
        diagonal: 'linear-gradient(135deg, #ff7614, #c54708)',
    },
    // Food-themed gradients
    fresh: 'linear-gradient(135deg, #5bb98e, #38dccf)',
    warm: 'linear-gradient(135deg, #e05252, #ff9939)',
    vibrant: 'linear-gradient(135deg, #ff7614, #ffd763)',
    cool: 'linear-gradient(135deg, #6c7bff, #38dccf)',
} 