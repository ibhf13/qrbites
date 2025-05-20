import { useEffect, useMemo, useRef, useState } from 'react'

interface UseVirtualizedListOptions {
    itemHeight: number
    overscan?: number
    initialScrollTop?: number
}

interface UseVirtualizedListReturn<T> {
    virtualItems: Array<{
        index: number
        item: T
        offsetTop: number
    }>
    totalHeight: number
    containerRef: React.RefObject<HTMLDivElement>
    scrollTo: (index: number) => void
}

export function useVirtualizedList<T>(
    items: T[],
    { itemHeight, overscan = 3, initialScrollTop = 0 }: UseVirtualizedListOptions
): UseVirtualizedListReturn<T> {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scrollTop, setScrollTop] = useState(initialScrollTop)

    const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight])

    useEffect(() => {
        const container = containerRef.current

        if (!container) return

        const handleScroll = () => {
            setScrollTop(container.scrollTop)
        }

        container.addEventListener('scroll', handleScroll)

        return () => {
            container.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const virtualItems = useMemo(() => {
        if (!items.length) return []

        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
        const endIndex = Math.min(
            items.length - 1,
            Math.ceil((scrollTop + (containerRef.current?.clientHeight || 0)) / itemHeight) + overscan
        )

        return Array.from({ length: endIndex - startIndex + 1 }, (_, i) => {
            const index = startIndex + i

            return {
                index,
                item: items[index],
                offsetTop: index * itemHeight,
            }
        })
    }, [items, scrollTop, itemHeight, overscan])

    const scrollTo = (index: number) => {
        if (containerRef.current) {
            containerRef.current.scrollTop = index * itemHeight
        }
    }

    return {
        virtualItems,
        totalHeight,
        containerRef,
        scrollTo,
    }
} 