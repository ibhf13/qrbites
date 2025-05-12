import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export interface BreadcrumbItem {
    label: string
    path: string
}

interface BreadcrumbProps {
    items?: BreadcrumbItem[]
    className?: string
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items = [], className = '' }) => {
    const location = useLocation()

    // If no items provided, generate from current path
    const breadcrumbItems = items.length > 0
        ? items
        : location.pathname
            .split('/')
            .filter(segment => segment)
            .map((segment, index, segments) => {
                const path = `/${segments.slice(0, index + 1).join('/')}`
                return {
                    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
                    path
                }
            })

    // Always include home as first item
    const allItems = [
        { label: 'Home', path: '/' },
        ...breadcrumbItems
    ]

    return (
        <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
            <ol
                className="flex items-center space-x-1"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
            >
                {allItems.map((item, index) => (
                    <li
                        key={item.path}
                        className="flex items-center"
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                    >
                        {index > 0 && (
                            <ChevronRightIcon className="h-4 w-4 text-neutral-400 mx-1" aria-hidden="true" />
                        )}

                        {index === 0 && (
                            <HomeIcon className="h-4 w-4 text-neutral-500 mr-1" aria-hidden="true" />
                        )}

                        {index === allItems.length - 1 ? (
                            <span
                                className="text-neutral-600 dark:text-neutral-400 truncate"
                                aria-current="page"
                                itemProp="name"
                            >
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                to={item.path}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 truncate"
                                itemProp="item"
                            >
                                <span itemProp="name">{item.label}</span>
                            </Link>
                        )}
                        <meta itemProp="position" content={String(index + 1)} />
                    </li>
                ))}
            </ol>
        </nav>
    )
}

export default Breadcrumb 