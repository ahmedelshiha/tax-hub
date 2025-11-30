/**
 * Portal Layout Store
 * Centralized state management for portal dashboard layout
 * Mirrors admin layout store pattern for consistency
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PortalLayoutState {
    // Sidebar state
    sidebarCollapsed: boolean
    sidebarWidth: number
    expandedGroups: string[]

    // Dashboard state
    activeTab: string
    widgetPreferences: Record<string, { visible: boolean; order: number }>

    // Entity selection
    selectedEntityId: string | null

    // Actions
    actions: {
        setSidebarCollapsed: (collapsed: boolean) => void
        setSidebarWidth: (width: number) => void
        toggleGroup: (groupName: string) => void
        setActiveTab: (tab: string) => void
        setSelectedEntity: (entityId: string | null) => void
        updateWidgetPreference: (widgetId: string, preference: { visible?: boolean; order?: number }) => void
        resetWidgetPreferences: () => void
    }
}

export const usePortalLayoutStore = create<PortalLayoutState>()(
    persist(
        (set) => ({
            // Initial state
            sidebarCollapsed: false,
            sidebarWidth: 256,
            expandedGroups: [],
            activeTab: 'overview',
            widgetPreferences: {},
            selectedEntityId: null,

            // Actions
            actions: {
                setSidebarCollapsed: (collapsed) =>
                    set({ sidebarCollapsed: collapsed }),

                setSidebarWidth: (width) =>
                    set({ sidebarWidth: width }),

                toggleGroup: (groupName) =>
                    set((state) => ({
                        expandedGroups: state.expandedGroups.includes(groupName)
                            ? state.expandedGroups.filter((g) => g !== groupName)
                            : [...state.expandedGroups, groupName],
                    })),

                setActiveTab: (tab) =>
                    set({ activeTab: tab }),

                setSelectedEntity: (entityId) =>
                    set({ selectedEntityId: entityId }),

                updateWidgetPreference: (widgetId, preference) =>
                    set((state) => ({
                        widgetPreferences: {
                            ...state.widgetPreferences,
                            [widgetId]: {
                                ...(state.widgetPreferences[widgetId] || { visible: true, order: 0 }),
                                ...preference,
                            },
                        },
                    })),

                resetWidgetPreferences: () =>
                    set({ widgetPreferences: {} }),
            },
        }),
        {
            name: 'portal-layout-storage',
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
                sidebarWidth: state.sidebarWidth,
                expandedGroups: state.expandedGroups,
                activeTab: state.activeTab,
                widgetPreferences: state.widgetPreferences,
                // Don't persist selectedEntityId - should be session-specific
            }),
        }
    )
)

// Sidebar selectors
export const usePortalSidebarCollapsed = () =>
    usePortalLayoutStore((state) => state.sidebarCollapsed)

export const usePortalSidebarWidth = () =>
    usePortalLayoutStore((state) => state.sidebarWidth)

export const usePortalExpandedGroups = () =>
    usePortalLayoutStore((state) => state.expandedGroups)

// Dashboard selectors
export const usePortalActiveTab = () =>
    usePortalLayoutStore((state) => state.activeTab)

export const usePortalSelectedEntity = () =>
    usePortalLayoutStore((state) => state.selectedEntityId)

export const usePortalWidgetPreferences = () =>
    usePortalLayoutStore((state) => state.widgetPreferences)

// Actions selector
export const usePortalLayoutActions = () =>
    usePortalLayoutStore((state) => state.actions)
