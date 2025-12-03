"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface BreadcrumbItem {
    label: string
    href: string
}

interface BreadcrumbContextType {
    items: BreadcrumbItem[] | null
    setBreadcrumbs: (items: BreadcrumbItem[]) => void
    resetBreadcrumbs: () => void
    setDynamicLabel: (segment: string, label: string) => void
    dynamicLabels: Record<string, string>
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<BreadcrumbItem[] | null>(null)
    const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({})

    const setBreadcrumbs = React.useCallback((newItems: BreadcrumbItem[]) => {
        setItems(prev => {
            // Simple equality check to prevent unnecessary updates
            if (JSON.stringify(prev) === JSON.stringify(newItems)) return prev
            return newItems
        })
    }, [])

    const resetBreadcrumbs = React.useCallback(() => {
        setItems(null)
        setDynamicLabels({})
    }, [])

    const setDynamicLabel = React.useCallback((segment: string, label: string) => {
        setDynamicLabels(prev => {
            if (prev[segment] === label) return prev
            return {
                ...prev,
                [segment]: label
            }
        })
    }, [])

    // CRITICAL FIX: Only include state values in dependency array
    // Memoized callbacks (setBreadcrumbs, resetBreadcrumbs, setDynamicLabel) have stable references
    // and should NOT be included as dependencies to prevent infinite loops
    const contextValue = React.useMemo(() => ({
        items,
        setBreadcrumbs,
        resetBreadcrumbs,
        setDynamicLabel,
        dynamicLabels
    }), [items, dynamicLabels])

    return (
        <BreadcrumbContext.Provider value={contextValue}>
            {children}
        </BreadcrumbContext.Provider>
    )
}

export function useBreadcrumbs() {
    const context = useContext(BreadcrumbContext)
    if (context === undefined) {
        throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider')
    }
    return context
}
