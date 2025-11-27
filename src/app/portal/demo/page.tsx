/**
 * Oracle Fusion UI Demo Page
 * 
 * Demonstrates all 15 Oracle Fusion UI components
 * Shows modular architecture in action
 */

'use client'

import { useState } from 'react'
import { Plus, Download, Settings, FileText, DollarSign, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    PageLayout,
    ActionHeader,
    ContentSection,
    DetailPanel,
    KPICard,
    KPIGrid,
    StatusBadge,
    TrendIndicator,
    EmptyState,
    SearchBox,
    FilterChip,
    FilterBar,
    LoadingSkeleton,
    StatusMessage,
    type Filter,
} from '@/components/ui-oracle'

export default function OracleFusionDemoPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilters, setActiveFilters] = useState<Filter[]>([
        { id: '1', label: 'Status', value: 'Active', variant: 'primary' },
        { id: '2', label: 'Type', value: 'Invoice' },
    ])
    const [detailPanelOpen, setDetailPanelOpen] = useState(false)
    const [showLoading, setShowLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(true)

    const handleRemoveFilter = (id: string) => {
        setActiveFilters(activeFilters.filter((f) => f.id !== id))
    }

    const handleClearAllFilters = () => {
        setActiveFilters([])
    }

    return (
        <PageLayout title="Oracle Fusion UI Demo" maxWidth="7xl">
            {/* ActionHeader Component Demo */}
            <ActionHeader
                title="Oracle Fusion UI Component Library"
                description="15 production-ready, modular components following Oracle Fusion design patterns"
                primaryAction={
                    <Button onClick={() => setDetailPanelOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Open Detail Panel
                    </Button>
                }
                secondaryActions={
                    <>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </>
                }
            />

            <div className="space-y-8">
                {/* Status Messages Demo */}
                <ContentSection title="Status Messages" transparent>
                    <div className="space-y-3">
                        {showSuccess && (
                            <StatusMessage
                                variant="success"
                                title="All Components Created Successfully!"
                                dismissible
                                onDismiss={() => setShowSuccess(false)}
                            >
                                15 Oracle Fusion UI components are now available: 4 layout, 5 data display, 3 filters, and 2 feedback components.
                            </StatusMessage>
                        )}
                        <StatusMessage variant="info">
                            This is an informational message. All components support dark mode, TypeScript, and accessibility.
                        </StatusMessage>
                        <StatusMessage variant="warning" title="Performance Optimization">
                            Each component is 50-120 lines, making them easy to maintain, test, and lazy-load.
                        </StatusMessage>
                    </div>
                </ContentSection>

                {/* KPI Grid Demo */}
                <ContentSection title="KPI Cards & Grid" transparent>
                    <KPIGrid columns={4}>
                        <KPICard
                            label="Total Revenue"
                            value="$124,592"
                            trend={12.5}
                            comparisonText="vs last month"
                            icon={DollarSign}
                            variant="success"
                        />
                        <KPICard
                            label="Active Clients"
                            value="348"
                            trend={-3.2}
                            comparisonText="vs last month"
                            icon={Users}
                            variant="default"
                        />
                        <KPICard
                            label="Documents"
                            value="2,451"
                            trend={18.7}
                            comparisonText="vs last month"
                            icon={FileText}
                            variant="info"
                        />
                        <KPICard
                            label="Completion Rate"
                            value="94.2%"
                            trend={0}
                            comparisonText="no change"
                            variant="default"
                            onClick={() => alert('KPI Card clicked!')}
                        />
                    </KPIGrid>
                </ContentSection>

                {/* Search & Filters Demo */}
                <ContentSection title="Search & Filters" transparent>
                    <div className="space-y-4">
                        <SearchBox
                            value={searchQuery}
                            onSearch={setSearchQuery}
                            placeholder="Search invoices, clients, documents..."
                        />
                        <FilterBar
                            filters={activeFilters}
                            onRemoveFilter={handleRemoveFilter}
                            onClearAll={handleClearAllFilters}
                        >
                            {/* Filter panel content would go here */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Status</label>
                                    <select className="w-full px-3 py-2 border rounded-md">
                                        <option>All</option>
                                        <option>Active</option>
                                        <option>Pending</option>
                                        <option>Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Type</label>
                                    <select className="w-full px-3 py-2 border rounded-md">
                                        <option>All</option>
                                        <option>Invoice</option>
                                        <option>Receipt</option>
                                        <option>Contract</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Date Range</label>
                                    <select className="w-full px-3 py-2 border rounded-md">
                                        <option>Last 30 days</option>
                                        <option>Last 90 days</option>
                                        <option>This year</option>
                                    </select>
                                </div>
                            </div>
                        </FilterBar>
                    </div>
                </ContentSection>

                {/* Status Badges & Trend Indicators Demo */}
                <ContentSection title="Status Badges & Trend Indicators" transparent>
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge variant="success" showDot>Paid</StatusBadge>
                            <StatusBadge variant="warning" showDot>Pending</StatusBadge>
                            <StatusBadge variant="danger" showDot>Overdue</StatusBadge>
                            <StatusBadge variant="info" showDot>Processing</StatusBadge>
                            <StatusBadge variant="neutral">Draft</StatusBadge>
                            <StatusBadge variant="pending" showDot size="sm">Pending Review</StatusBadge>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <TrendIndicator value={12.5} size="sm" />
                            <TrendIndicator value={-8.3} />
                            <TrendIndicator value={0} size="lg" />
                            <TrendIndicator value={24.7} showSign />
                        </div>
                    </div>
                </ContentSection>

                {/* Loading States Demo */}
                <ContentSection title="Loading Skeletons">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium mb-3">Card Skeleton</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setShowLoading(true)
                                    setTimeout(() => setShowLoading(false), 3000)
                                }}
                                className="mb-4"
                            >
                                {showLoading ? 'Loading...' : 'Show Loading State'}
                            </Button>
                            {showLoading ? (
                                <LoadingSkeleton variant="card" count={2} />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ContentSection title="Sample Card 1" description="This is actual content">
                                        <p className="text-sm text-gray-600">Content loaded successfully!</p>
                                    </ContentSection>
                                    <ContentSection title="Sample Card 2" description="More content here">
                                        <p className="text-sm text-gray-600">Everything is working!</p>
                                    </ContentSection>
                                </div>
                            )}
                        </div>
                    </div>
                </ContentSection>

                {/* Empty State Demo */}
                <ContentSection title="Empty States">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <EmptyState
                            icon={FileText}
                            title="No documents found"
                            description="Get started by uploading your first document or try adjusting your filters."
                            action={{
                                label: 'Upload Document',
                                onClick: () => alert('Upload clicked!'),
                            }}
                            secondaryAction={{
                                label: 'Clear Filters',
                                onClick: handleClearAllFilters,
                            }}
                        />
                    </div>
                </ContentSection>

                {/* ContentSection Variants Demo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ContentSection
                        title="Card Style Section"
                        description="With border and shadow"
                        actions={
                            <Button variant="outline" size="sm">Action</Button>
                        }
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            This ContentSection component uses card styling for clear visual separation.
                        </p>
                    </ContentSection>

                    <ContentSection
                        title="Transparent Section"
                        description="No card styling"
                        transparent
                        actions={
                            <Button variant="outline" size="sm">Action</Button>
                        }
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            This ContentSection is transparent, blending with the page background.
                        </p>
                    </ContentSection>
                </div>

                {/* Component Stats */}
                <ContentSection title="Oracle Fusion UI Library Stats" transparent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">15</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Components</div>
                        </div>
                        <div className="p-6 bg-green-50 dark:bg-green-950/30 rounded-lg">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">~1,450</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Lines of Code</div>
                        </div>
                        <div className="p-6 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">50-120</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Lines per Component</div>
                        </div>
                    </div>
                </ContentSection>
            </div>

            {/* DetailPanel Demo */}
            <DetailPanel
                open={detailPanelOpen}
                onClose={() => setDetailPanelOpen(false)}
                title="Detail Panel Example"
                width="lg"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDetailPanelOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setDetailPanelOpen(false)}>
                            Save Changes
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <StatusMessage variant="info">
                        This is a slide-out detail panel. Perfect for quick views and forms without navigating away.
                    </StatusMessage>

                    <div className="space-y-4">
                        <h3 className="font-semibold">Component Features</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>Slides in from the right with smooth animation</li>
                            <li>Overlay backdrop dims the background</li>
                            <li>Escape key to close</li>
                            <li>Click outside to close</li>
                            <li>Scrollable content area</li>
                            <li>Optional footer for actions</li>
                            <li>Configurable widths (sm, md, lg, xl)</li>
                            <li>Locks body scroll when open</li>
                        </ul>
                    </div>

                    <KPIGrid columns={2}>
                        <KPICard label="Example Metric" value="100%" variant="success" />
                        <KPICard label="Another Metric" value="42" trend={10} />
                    </KPIGrid>
                </div>
            </DetailPanel>
        </PageLayout>
    )
}
