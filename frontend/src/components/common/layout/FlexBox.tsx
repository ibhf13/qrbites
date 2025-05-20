import React from 'react'
import { cn } from '@/utils/cn'

type Direction = 'row' | 'col' | 'row-reverse' | 'col-reverse'
type Justify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
type Align = 'start' | 'end' | 'center' | 'baseline' | 'stretch'
type Wrap = 'nowrap' | 'wrap' | 'wrap-reverse'
type Gap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface FlexBoxProps extends React.HTMLAttributes<HTMLDivElement> {
    direction?: Direction
    justify?: Justify
    align?: Align
    wrap?: Wrap
    gap?: Gap
    gapX?: Gap
    gapY?: Gap
    grow?: boolean
    shrink?: boolean
    responsive?: boolean
    directionSm?: Direction
    directionMd?: Direction
    directionLg?: Direction
    justifySm?: Justify
    justifyMd?: Justify
    justifyLg?: Justify
    alignSm?: Align
    alignMd?: Align
    alignLg?: Align
    wrapSm?: Wrap
    wrapMd?: Wrap
    wrapLg?: Wrap
    mobileFirst?: boolean
}

const directionMap: Record<Direction, string> = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse'
}

const responsiveDirectionMap = {
    sm: {
        row: 'sm:flex-row',
        col: 'sm:flex-col',
        'row-reverse': 'sm:flex-row-reverse',
        'col-reverse': 'sm:flex-col-reverse'
    },
    md: {
        row: 'md:flex-row',
        col: 'md:flex-col',
        'row-reverse': 'md:flex-row-reverse',
        'col-reverse': 'md:flex-col-reverse'
    },
    lg: {
        row: 'lg:flex-row',
        col: 'lg:flex-col',
        'row-reverse': 'lg:flex-row-reverse',
        'col-reverse': 'lg:flex-col-reverse'
    }
}

const justifyMap: Record<Justify, string> = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
}

const responsiveJustifyMap = {
    sm: {
        start: 'sm:justify-start',
        end: 'sm:justify-end',
        center: 'sm:justify-center',
        between: 'sm:justify-between',
        around: 'sm:justify-around',
        evenly: 'sm:justify-evenly'
    },
    md: {
        start: 'md:justify-start',
        end: 'md:justify-end',
        center: 'md:justify-center',
        between: 'md:justify-between',
        around: 'md:justify-around',
        evenly: 'md:justify-evenly'
    },
    lg: {
        start: 'lg:justify-start',
        end: 'lg:justify-end',
        center: 'lg:justify-center',
        between: 'lg:justify-between',
        around: 'lg:justify-around',
        evenly: 'lg:justify-evenly'
    }
}

const alignMap: Record<Align, string> = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
}

const responsiveAlignMap = {
    sm: {
        start: 'sm:items-start',
        end: 'sm:items-end',
        center: 'sm:items-center',
        baseline: 'sm:items-baseline',
        stretch: 'sm:items-stretch'
    },
    md: {
        start: 'md:items-start',
        end: 'md:items-end',
        center: 'md:items-center',
        baseline: 'md:items-baseline',
        stretch: 'md:items-stretch'
    },
    lg: {
        start: 'lg:items-start',
        end: 'lg:items-end',
        center: 'lg:items-center',
        baseline: 'lg:items-baseline',
        stretch: 'lg:items-stretch'
    }
}

const wrapMap: Record<Wrap, string> = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse'
}

const responsiveWrapMap = {
    sm: {
        nowrap: 'sm:flex-nowrap',
        wrap: 'sm:flex-wrap',
        'wrap-reverse': 'sm:flex-wrap-reverse'
    },
    md: {
        nowrap: 'md:flex-nowrap',
        wrap: 'md:flex-wrap',
        'wrap-reverse': 'md:flex-wrap-reverse'
    },
    lg: {
        nowrap: 'lg:flex-nowrap',
        wrap: 'lg:flex-wrap',
        'wrap-reverse': 'lg:flex-wrap-reverse'
    }
}

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

export const FlexBox = React.forwardRef<HTMLDivElement, FlexBoxProps>(({
    direction = 'row',
    justify = 'start',
    align = 'stretch',
    wrap = 'nowrap',
    gap = 'none',
    gapX,
    gapY,
    grow = false,
    shrink = true,
    responsive = false,
    mobileFirst = true,
    directionSm,
    directionMd,
    directionLg,
    justifySm,
    justifyMd,
    justifyLg,
    alignSm,
    alignMd,
    alignLg,
    wrapSm,
    wrapMd,
    wrapLg,
    className,
    children,
    ...rest
}, ref) => {
    const getResponsiveClasses = () => {
        if (mobileFirst && responsive) {
            return [
                'flex',
                'flex-col',
                'sm:flex-row',
                justifyMap[justify],
                alignMap[align],
                wrapMap[wrap]
            ].filter(Boolean).join(' ')
        }

        if (responsive) {
            return [
                'flex',
                'flex-col sm:flex-row',
                justifyMap[justify],
                alignMap[align],
                wrapMap[wrap]
            ].filter(Boolean).join(' ')
        }

        return [
            'flex',
            directionMap[direction],
            justifyMap[justify],
            alignMap[align],
            wrapMap[wrap],
            directionSm && responsiveDirectionMap.sm[directionSm],
            directionMd && responsiveDirectionMap.md[directionMd],
            directionLg && responsiveDirectionMap.lg[directionLg],
            justifySm && responsiveJustifyMap.sm[justifySm],
            justifyMd && responsiveJustifyMap.md[justifyMd],
            justifyLg && responsiveJustifyMap.lg[justifyLg],
            alignSm && responsiveAlignMap.sm[alignSm],
            alignMd && responsiveAlignMap.md[alignMd],
            alignLg && responsiveAlignMap.lg[alignLg],
            wrapSm && responsiveWrapMap.sm[wrapSm],
            wrapMd && responsiveWrapMap.md[wrapMd],
            wrapLg && responsiveWrapMap.lg[wrapLg]
        ].filter(Boolean).join(' ')
    }

    return (
        <div
            ref={ref}
            className={cn(
                getResponsiveClasses(),
                gapX ? gapXMap[gapX] : gapY ? gapYMap[gapY] : gapMap[gap],
                gapY && gapYMap[gapY],
                grow && 'flex-grow',
                !shrink && 'flex-shrink-0',
                className
            )}
            {...rest}
        >
            {children}
        </div>
    )
})

FlexBox.displayName = 'FlexBox'

export default FlexBox