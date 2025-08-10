import { useEffect, useState } from 'react'

interface WindowSize {
    width: number
    height: number
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    isSmallScreen: boolean
    breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const

const getBreakpoint = (width: number): WindowSize['breakpoint'] => {
    if (width >= BREAKPOINTS['2xl']) return '2xl'
    if (width >= BREAKPOINTS.xl) return 'xl'
    if (width >= BREAKPOINTS.lg) return 'lg'
    if (width >= BREAKPOINTS.md) return 'md'
    if (width >= BREAKPOINTS.sm) return 'sm'

    return 'xs'
}

const getWindowSize = (): WindowSize => {
    const defaultWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
    const defaultHeight = typeof window !== 'undefined' ? window.innerHeight : 768

    const width = defaultWidth
    const height = defaultHeight
    const breakpoint = getBreakpoint(width)

    return {
        width,
        height,
        isMobile: width < BREAKPOINTS.sm,
        isTablet: width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg,
        isSmallScreen: width < BREAKPOINTS.md,
        breakpoint,
    }
}

export const useWindowSize = (): WindowSize => {
    const [windowSize, setWindowSize] = useState<WindowSize>(getWindowSize)

    useEffect(() => {
        const handleResize = () => {
            setWindowSize(getWindowSize())
        }

        handleResize()

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return windowSize
}

export default useWindowSize

export type { WindowSize }
export { BREAKPOINTS }