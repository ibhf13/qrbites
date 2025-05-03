import React from 'react'

// Container component
export interface ContainerProps {
    children: React.ReactNode
    className?: string
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none'
    padding?: boolean
}

export const Container: React.FC<ContainerProps> = ({
    children,
    className = '',
    maxWidth = 'lg',
    padding = true,
}) => {
    const getMaxWidthClass = (): string => {
        switch (maxWidth) {
            case 'xs':
                return 'max-w-screen-xs'
            case 'sm':
                return 'max-w-screen-sm'
            case 'md':
                return 'max-w-screen-md'
            case 'lg':
                return 'max-w-screen-lg'
            case 'xl':
                return 'max-w-screen-xl'
            case '2xl':
                return 'max-w-screen-2xl'
            case 'full':
                return 'max-w-full'
            case 'none':
                return ''
            default:
                return 'max-w-screen-lg'
        }
    }

    const paddingClass = padding ? 'px-4 sm:px-6 md:px-8' : ''

    return (
        <div
            className={`
        mx-auto
        w-full
        ${getMaxWidthClass()}
        ${paddingClass}
        ${className}
      `}
        >
            {children}
        </div>
    )
}

// Row component
export interface RowProps {
    children: React.ReactNode
    className?: string
    spacing?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
    justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
    alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
    noWrap?: boolean
}

export const Row: React.FC<RowProps> = ({
    children,
    className = '',
    spacing = 4,
    justifyContent = 'start',
    alignItems = 'start',
    noWrap = false,
}) => {
    const getSpacingClass = (): string => {
        if (spacing === 0) return ''
        return `-mx-${spacing / 2}`
    }

    const getJustifyContentClass = (): string => {
        switch (justifyContent) {
            case 'start':
                return 'justify-start'
            case 'end':
                return 'justify-end'
            case 'center':
                return 'justify-center'
            case 'between':
                return 'justify-between'
            case 'around':
                return 'justify-around'
            case 'evenly':
                return 'justify-evenly'
            default:
                return 'justify-start'
        }
    }

    const getAlignItemsClass = (): string => {
        switch (alignItems) {
            case 'start':
                return 'items-start'
            case 'end':
                return 'items-end'
            case 'center':
                return 'items-center'
            case 'baseline':
                return 'items-baseline'
            case 'stretch':
                return 'items-stretch'
            default:
                return 'items-start'
        }
    }

    const getWrapClass = (): string => {
        return noWrap ? 'flex-nowrap' : 'flex-wrap'
    }

    // Add spacing to direct children (columns) using React.Children.map
    const childrenWithSpacing = React.Children.map(children, child => {
        if (React.isValidElement(child) && spacing !== 0) {
            return React.cloneElement(child, {
                ...child.props,
                className: `${child.props.className || ''} px-${spacing / 2}`
            })
        }
        return child
    })

    return (
        <div
            className={`
        flex
        ${getWrapClass()}
        ${getSpacingClass()}
        ${getJustifyContentClass()}
        ${getAlignItemsClass()}
        ${className}
      `}
        >
            {childrenWithSpacing}
        </div>
    )
}

// Column component
export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto' | 'full'
export type ColOrder = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'first' | 'last' | 'none'
export type ColOffset = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export interface ColProps {
    children: React.ReactNode
    className?: string
    span?: ColSpan
    sm?: ColSpan
    md?: ColSpan
    lg?: ColSpan
    xl?: ColSpan
    offset?: ColOffset
    order?: ColOrder
}

export const Col: React.FC<ColProps> = ({
    children,
    className = '',
    span = 'full',
    sm,
    md,
    lg,
    xl,
    offset,
    order,
}) => {
    const getSpanClass = (size: ColSpan | undefined, breakpoint: string = ''): string => {
        if (size === undefined) return ''

        const prefix = breakpoint ? `${breakpoint}:` : ''

        if (size === 'auto') return `${prefix}w-auto`
        if (size === 'full') return `${prefix}w-full`

        return `${prefix}w-${size}/12`
    }

    const getOffsetClass = (): string => {
        if (offset === undefined) return ''
        if (offset === 0) return 'ml-0'
        return `ml-${offset}/12`
    }

    const getOrderClass = (): string => {
        if (order === undefined) return ''

        if (order === 'first') return 'order-first'
        if (order === 'last') return 'order-last'
        if (order === 'none') return 'order-none'

        return `order-${order}`
    }

    return (
        <div
            className={`
        ${getSpanClass(span)}
        ${getSpanClass(sm, 'sm')}
        ${getSpanClass(md, 'md')}
        ${getSpanClass(lg, 'lg')}
        ${getSpanClass(xl, 'xl')}
        ${getOffsetClass()}
        ${getOrderClass()}
        ${className}
      `}
        >
            {children}
        </div>
    )
}

// Example usage:
// <Container>
//   <Row gapX="4" gapY="6">
//     <Col span={12} md={6} lg={4}>Column 1</Col>
//     <Col span={12} md={6} lg={4}>Column 2</Col>
//     <Col span={12} md={6} lg={4}>Column 3</Col>
//   </Row>
// </Container> 