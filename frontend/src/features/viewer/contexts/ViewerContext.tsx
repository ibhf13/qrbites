import React, { createContext, useContext, useCallback, useMemo } from 'react'

interface ViewerContextType {
    scanTime: string
    formatScanTime: (date?: Date) => string
}

const ViewerContext = createContext<ViewerContextType | undefined>(undefined)

interface ViewerProviderProps {
    children: React.ReactNode
    initialScanTime?: Date
}

export const ViewerProvider: React.FC<ViewerProviderProps> = ({
    children,
    initialScanTime = new Date()
}) => {
    const formatScanTime = useCallback((date: Date = initialScanTime): string => {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }, [initialScanTime])

    const scanTime = useMemo(() => formatScanTime(initialScanTime), [formatScanTime, initialScanTime])

    const value = useMemo(() => ({
        scanTime,
        formatScanTime
    }), [scanTime, formatScanTime])

    return (
        <ViewerContext.Provider value={value}>
            {children}
        </ViewerContext.Provider>
    )
}

export const useViewer = (): ViewerContextType => {
    const context = useContext(ViewerContext)

    if (context === undefined) {
        throw new Error('useViewer must be used within a ViewerProvider')
    }

    return context
}