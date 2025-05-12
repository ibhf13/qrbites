import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Navigation item type definition
export interface NavItem {
    path: string
    label: string
    icon: React.ReactNode
    children?: NavItem[]
    requiredRole?: string | string[]
}

// Navigation group for organizing related items
export interface NavGroup {
    id: string
    label: string
    icon?: React.ReactNode
    items: NavItem[]
    expanded?: boolean
    requiredRole?: string | string[]
}

// Context state definition
interface NavigationContextType {
    isCollapsed: boolean
    toggleCollapse: () => void
    expandedGroups: string[]
    toggleGroup: (groupId: string) => void
    isGroupExpanded: (groupId: string) => boolean
    isMobile: boolean
}

// Props for the provider component
interface NavigationProviderProps {
    children: ReactNode
    defaultCollapsed?: boolean
}

// Create the context with a default undefined value
const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

// Provider component that will wrap the application
export const NavigationProvider: React.FC<NavigationProviderProps> = ({
    children,
    defaultCollapsed = false
}) => {
    // Get the saved collapse state from localStorage, or use default
    const [isCollapsed, setIsCollapsed] = useState<boolean>(
        localStorage.getItem('sidebarCollapsed') === 'true' || defaultCollapsed
    )

    // Track expanded navigation groups
    const [expandedGroups, setExpandedGroups] = useState<string[]>([])

    // Track if the view is mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    const location = useLocation()

    // Save the collapse state to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isCollapsed.toString())
    }, [isCollapsed])

    // Check for mobile viewport on resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)

            // Auto-collapse on mobile
            if (mobile && !isCollapsed) {
                setIsCollapsed(true)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [isCollapsed])

    // Close sidebar on route change in mobile view
    useEffect(() => {
        if (isMobile) {
            setIsCollapsed(true)
        }
    }, [location, isMobile])

    // Toggle the collapsed state
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed)
    }

    // Toggle a navigation group's expanded/collapsed state
    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prevGroups =>
            prevGroups.includes(groupId)
                ? prevGroups.filter(id => id !== groupId)
                : [...prevGroups, groupId]
        )
    }

    // Check if a navigation group is expanded
    const isGroupExpanded = (groupId: string): boolean => {
        return expandedGroups.includes(groupId)
    }

    // Context value
    const value = {
        isCollapsed,
        toggleCollapse,
        expandedGroups,
        toggleGroup,
        isGroupExpanded,
        isMobile
    }

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    )
}

// Custom hook to use the navigation context
export const useNavigation = (): NavigationContextType => {
    const context = useContext(NavigationContext)
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider')
    }
    return context
} 