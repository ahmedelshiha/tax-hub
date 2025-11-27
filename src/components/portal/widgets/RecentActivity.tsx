/**
 * Recent Activity Widget
 * 
 * Reusable component showing recent user activity
 * ~90 lines, production-ready
 */

'use client'

import {
    ContentSection,
    EmptyState,
    LoadingSkeleton,
    StatusBadge,
} from '@/components/ui-oracle'
import { Clock, FileText, DollarSign, CheckSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface ActivityItem {
    id: string
    type: 'document' | 'invoice' | 'task' | 'booking'
    title: string
    description: string
    timestamp: Date
    status?: 'success' | 'warning' | 'info' | 'pending'
}

export interface RecentActivityProps {
    activities?: ActivityItem[]
    loading?: boolean
    maxItems?: number
}

const activityIcons = {
    document: FileText,
    invoice: DollarSign,
    task: CheckSquare,
    booking: Clock,
}

export function RecentActivityWidget({
    activities = [],
    loading = false,
    maxItems = 5,
}: RecentActivityProps) {
    if (loading) {
        return (
            <ContentSection title="Recent Activity">
                <LoadingSkeleton variant="list" count={3} />
            </ContentSection>
        )
    }

    const displayActivities = activities.slice(0, maxItems)

    if (displayActivities.length === 0) {
        return (
            <ContentSection title="Recent Activity">
                <EmptyState
                    icon={Clock}
                    title="No recent activity"
                    description="Your recent actions will appear here"
                    variant="compact"
                />
            </ContentSection>
        )
    }

    return (
        <ContentSection title="Recent Activity">
            <div className="space-y-3">
                {displayActivities.map((activity) => {
                    const Icon = activityIcons[activity.type]

                    return (
                        <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                                <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {activity.title}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                            {activity.description}
                                        </p>
                                    </div>

                                    {activity.status && (
                                        <StatusBadge variant={activity.status} size="sm">
                                            {activity.status}
                                        </StatusBadge>
                                    )}
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </ContentSection>
    )
}
