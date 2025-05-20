import React from 'react'
import { cn } from '@/utils/cn'

type Columns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Gap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type Justify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
type Align = 'start' | 'end' | 'center' | 'baseline' | 'stretch'

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    cols?: Columns
    colsSm?: Columns
    colsMd?: Columns
    colsLg?: Columns
    colsXl?: Columns
    rows?: number
    gap?: Gap
    gapX?: Gap
    gapY?: Gap
    justify?: Justify
    align?: Align
    auto?: boolean
    responsive?: boolean
    minColWidth?: string
}

const columnMap: Record<Columns, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12'
}

const responsiveColumnMap = {
    sm: {
        1: 'sm:grid-cols-1',
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-3',
        4: 'sm:grid-cols-4',
        5: 'sm:grid-cols-5',
        6: 'sm:grid-cols-6',
        7: 'sm:grid-cols-7',
        8: 'sm:grid-cols-8',
        9: 'sm:grid-cols-9',
        10: 'sm:grid-cols-10',
        11: 'sm:grid-cols-11',
        12: 'sm:grid-cols-12'
    },
    md: {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
        5: 'md:grid-cols-5',
        6: 'md:grid-cols-6',
        7: 'md:grid-cols-7',
        8: 'md:grid-cols-8',
        9: 'md:grid-cols-9',
        10: 'md:grid-cols-10',
        11: 'md:grid-cols-11',
        12: 'md:grid-cols-12'
    },
    lg: {
        1: 'lg:grid-cols-1',
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
        5: 'lg:grid-cols-5',
        6: 'lg:grid-cols-6',
        7: 'lg:grid-cols-7',
        8: 'lg:grid-cols-8',
        9: 'lg:grid-cols-9',
        10: 'lg:grid-cols-10',
        11: 'lg:grid-cols-11',
        12: 'lg:grid-cols-12'
    },
    xl: {
        1: 'xl:grid-cols-1',
        2: 'xl:grid-cols-2',
        3: 'xl:grid-cols-3',
        4: 'xl:grid-cols-4',
        5: 'xl:grid-cols-5',
        6: 'xl:grid-cols-6',
        7: 'xl:grid-cols-7',
        8: 'xl:grid-cols-8',
        9: 'xl:grid-cols-9',
        10: 'xl:grid-cols-10',
        11: 'xl:grid-cols-11',
        12: 'xl:grid-cols-12'
    }
} as const

const gapMap: Record<Gap, string> = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12'
}

const gapXMap: Record<Gap, string> = {
    none: 'gap-x-0',
    xs: 'gap-x-1',
    sm: 'gap-x-2',
    md: 'gap-x-4',
    lg: 'gap-x-6',
    xl: 'gap-x-8',
    '2xl': 'gap-x-12'
}

const gapYMap: Record<Gap, string> = {
    none: 'gap-y-0',
    xs: 'gap-y-1',
    sm: 'gap-y-2',
    md: 'gap-y-4',
    lg: 'gap-y-6',
    xl: 'gap-y-8',
    '2xl': 'gap-y-12'
}

const justifyMap: Record<Justify, string> = {
    start: 'justify-items-start',
    end: 'justify-items-end',
    center: 'justify-items-center',
    between: 'justify-items-stretch',
    around: 'justify-items-stretch',
    evenly: 'justify-items-stretch'
}

const alignMap: Record<Align, string> = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
}

export const Grid: React.FC<GridProps> = ({
    cols = 1,
    colsSm,
    colsMd,
    colsLg,
    colsXl,
    rows,
    gap = 'md',
    gapX,
    gapY,
    justify,
    align,
    auto = false,
    responsive = true,
    minColWidth,
    className,
    children,
    ...rest
}) => {
    const getResponsiveClasses = () => {
        if (auto) return 'grid grid-cols-auto'
        if (minColWidth) return `grid grid-cols-[repeat(auto-fit,minmax(${minColWidth},1fr))]`

        if (responsive) {
            const baseClass = 'grid grid-cols-1'
            const responsiveClasses = []

            if (colsSm !== undefined) {
                responsiveClasses.push(responsiveColumnMap.sm[colsSm])
            } else if (cols > 1) {
                responsiveClasses.push(cols > 2 ? 'sm:grid-cols-2' : `sm:${columnMap[cols]}`)
            }

            if (colsMd !== undefined) {
                responsiveClasses.push(responsiveColumnMap.md[colsMd])
            } else if (cols > 2) {
                responsiveClasses.push(cols > 3 ? 'md:grid-cols-3' : `md:${columnMap[cols]}`)
            }

            if (colsLg !== undefined) {
                responsiveClasses.push(responsiveColumnMap.lg[colsLg])
            } else if (cols > 3) {
                responsiveClasses.push(`lg:${columnMap[cols]}`)
            }

            if (colsXl !== undefined) {
                responsiveClasses.push(responsiveColumnMap.xl[colsXl])
            } else if (cols > 4) {
                responsiveClasses.push(`xl:${columnMap[cols]}`)
            }

            return [baseClass, ...responsiveClasses].join(' ')
        }

        return [
            'grid',
            columnMap[cols],
            colsSm && responsiveColumnMap.sm[colsSm],
            colsMd && responsiveColumnMap.md[colsMd],
            colsLg && responsiveColumnMap.lg[colsLg],
            colsXl && responsiveColumnMap.xl[colsXl]
        ].filter(Boolean).join(' ')
    }

    return (
        <div
            className={cn(
                getResponsiveClasses(),
                rows && `grid-rows-${rows}`,
                gapX ? gapXMap[gapX] : gapY ? gapYMap[gapY] : gapMap[gap],
                gapY && gapYMap[gapY],
                justify && justifyMap[justify],
                align && alignMap[align],
                className
            )}
            {...rest}
        >
            {children}
        </div>
    )
}

Grid.displayName = 'Grid'

export default Grid