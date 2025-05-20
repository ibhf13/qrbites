export interface ColorScale {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
}

export interface SurfaceColors {
    primary: string
    secondary: string
    tertiary: string
    elevated: string
    overlay: string
    glass: string
    mint: string
    lime: string
}

export interface BrandColors {
    mint: string
    lime: string
    sage: string
    emerald: string
    teal: string
    cyan: string
    sky: string
    indigo: string
}

export interface Colors {
    primary: ColorScale
    secondary: ColorScale
    accent: ColorScale
    neutral: ColorScale
    success: ColorScale
    warning: ColorScale
    error: ColorScale
    info: ColorScale
    surface: SurfaceColors
    brand: BrandColors
}

export interface Typography {
    fontFamily: {
        sans: string[]
        display: string[]
        mono: string[]
    }
    fontSize: Record<string, string>
    fontWeight: Record<string, number>
    lineHeight: Record<string, number>
    letterSpacing: Record<string, string>
}

export interface DesignTokens {
    colors: Colors
    typography: Typography
    spacing: Record<string, string>
    shadows: Record<string, string>
    borderRadius: Record<string, string>
    transitions: Record<string, string>
    keyframes: Record<string, Record<string, Record<string, string>>>
    animation: Record<string, string>
    backdropBlur: Record<string, string>
    safelist: string[]
    tailwindConfig: {
        content: string[]
        darkMode: string
    }
}

