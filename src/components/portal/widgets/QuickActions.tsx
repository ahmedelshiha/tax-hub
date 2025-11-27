/**
 * Quick Actions Widget
 * 
 * Reusable component with common action buttons
 * ~70 lines, production-ready
 */

'use client'

import { ContentSection } from '@/components/ui-oracle'
import { Button } from '@/components/ui/button'
import { Plus, Upload, FileText, DollarSign, Calendar, CheckSquare } from 'lucide-react'

export interface QuickAction {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    onClick: () => void
    variant?: 'default' | 'outline'
}

export interface QuickActionsProps {
    actions?: QuickAction[]
    title?: string
    description?: string
}

const defaultActions: QuickAction[] = [
    {
        id: 'upload-document',
        label: 'Upload Document',
        icon: Upload,
        onClick: () => console.log('Upload document'),
    },
    {
        id: 'create-invoice',
        label: 'Create Invoice',
        icon: DollarSign,
        onClick: () => console.log('Create invoice'),
    },
    {
        id: 'book-meeting',
        label: 'Book Meeting',
        icon: Calendar,
        onClick: () => console.log('Book meeting'),
    },
    {
        id: 'add-task',
        label: 'Add Task',
        icon: CheckSquare,
        onClick: () => console.log('Add task'),
    },
]

export function QuickActionsWidget({
    actions = defaultActions,
    title = 'Quick Actions',
    description = 'Frequently used actions for faster workflow',
}: QuickActionsProps) {
    return (
        <ContentSection title={title} description={description}>
            <div className="grid grid-cols-2 gap-3">
                {actions.map((action) => {
                    const Icon = action.icon

                    return (
                        <Button
                            key={action.id}
                            variant={action.variant || 'outline'}
                            onClick={action.onClick}
                            className="h-auto py-4 flex-col gap-2"
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-sm">{action.label}</span>
                        </Button>
                    )
                })}
            </div>
        </ContentSection>
    )
}
