/**
 * Workstation Layout Type Definitions
 * Types for the Oracle Fusion-inspired workstation redesign
 */

import { UserFilters } from './index'

/**
 * Props for WorkstationLayout component
 * Main 3-column layout container with responsive behavior
 */
export interface WorkstationLayoutProps {
  /** Sidebar content (left column) */
  sidebar: React.ReactNode
  /** Main content (center column) */
  main: React.ReactNode
  /** Insights panel content (right column) */
  insights: React.ReactNode
  /** Sidebar width in pixels (default: 280) */
  sidebarWidth?: number
  /** Insights panel width in pixels (default: 300) */
  insightsPanelWidth?: number
  /** Called when sidebar open/close state changes */
  onSidebarToggle?: (open: boolean) => void
  /** Called when insights panel open/close state changes */
  onInsightsToggle?: (open: boolean) => void
  /** CSS class name for the container */
  className?: string
}

/**
 * Props for WorkstationSidebar component
 * Fixed left sidebar with filters and quick stats
 */
export interface WorkstationSidebarProps {
  /** Whether sidebar is open (for mobile drawer) */
  isOpen?: boolean
  /** Called when sidebar close is requested */
  onClose?: () => void
  /** User filters state */
  filters?: UserFilters
  /** Called when filters change */
  onFiltersChange?: (filters: UserFilters) => void
  /** Quick statistics data */
  stats?: QuickStatsData
  /** Called when user clicks "Add User" */
  onAddUser?: () => void
  /** Called when filters are reset */
  onReset?: () => void
  /** CSS class name for the sidebar */
  className?: string
}

/**
 * Props for WorkstationMainContent component
 * Central area with user management and operations
 */
export interface WorkstationMainContentProps {
  /** Array of user items to display */
  users?: any[] // UserItem[]
  /** User statistics */
  stats?: any // UserStats
  /** Whether data is loading */
  isLoading?: boolean
  /** Called when user clicks "Add User" */
  onAddUser?: () => void
  /** Called when user initiates import */
  onImport?: () => void
  /** Called when bulk operation is requested */
  onBulkOperation?: (operation: string, value: string) => Promise<void>
  /** Called when user exports data */
  onExport?: () => void
  /** Called when user clicks refresh */
  onRefresh?: () => Promise<void>
  /** CSS class name for the container */
  className?: string
}

/**
 * Props for WorkstationInsightsPanel component
 * Right panel with analytics and insights
 */
export interface WorkstationInsightsPanelProps {
  /** Whether panel is open (for mobile) */
  isOpen?: boolean
  /** Called when panel close is requested */
  onClose?: () => void
  /** User statistics for analytics */
  stats?: any // UserStats
  /** Analytics data */
  analyticsData?: any
  /** CSS class name for the panel */
  className?: string
}

/**
 * Quick Statistics Data
 * Real-time stats displayed in sidebar
 */
export interface QuickStatsData {
  /** Total number of users */
  totalUsers: number
  /** Number of active users */
  activeUsers: number
  /** Number of pending approvals */
  pendingApprovals: number
  /** Number of in-progress workflows */
  inProgressWorkflows: number
  /** Last time stats were refreshed */
  refreshedAt: Date
}

/**
 * Workstation Context Type
 * State management for the entire workstation layout
 */
export interface WorkstationContextType {
  // Layout State
  sidebarOpen: boolean
  insightsPanelOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setInsightsPanelOpen: (open: boolean) => void

  // Main Content Layout
  mainContentLayout: 'full' | 'split'
  setMainContentLayout: (layout: 'full' | 'split') => void

  // Filter State
  selectedFilters: UserFilters
  setSelectedFilters: (filters: UserFilters) => void

  // Quick Stats
  quickStats: QuickStatsData | null
  quickStatsLoading: boolean
  refreshQuickStats: () => Promise<void>

  // User Selection State
  selectedUserIds: Set<string>
  setSelectedUserIds: (ids: Set<string>) => void
  toggleUserSelection: (userId: string) => void
  selectAllUsers: (userIds: string[]) => void
  clearSelection: () => void

  // Bulk Actions
  bulkActionType: string
  setBulkActionType: (type: string) => void
  bulkActionValue: string
  setBulkActionValue: (value: string) => void
  applyBulkAction: () => Promise<void>
  isApplyingBulkAction: boolean

  // General State
  isLoading: boolean
}

/**
 * Quick Stats Card Props
 */
export interface QuickStatsCardProps {
  /** Statistics data to display */
  stats: QuickStatsData
  /** Whether stats are being refreshed */
  isRefreshing?: boolean
  /** Called when user clicks refresh button */
  onRefresh?: () => Promise<void>
  /** CSS class name */
  className?: string
}

/**
 * Saved Views Button Props
 */
export interface SavedViewsButtonProps {
  /** Name of the saved view */
  name: string
  /** Icon name for the view */
  icon?: string
  /** Whether this view is currently active */
  isActive?: boolean
  /** Number of users in this view (optional badge) */
  count?: number
  /** Called when view is clicked */
  onClick: () => void
  /** CSS class name */
  className?: string
}
