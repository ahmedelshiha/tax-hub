'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

const badgeVariants = cva(
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                verification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }
        },
        defaultVariants: {
            variant: 'pending'
        }
    }
)

const iconMap = {
    verification: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    pending: AlertCircle
}

export interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
    text?: string
    showIcon?: boolean
    className?: string
}

/**
 * Status badge component matching LEDGERS color scheme
 * 
 * @example
 * ```tsx
 * <StatusBadge variant="verification" text="Under Verification" />
 * <StatusBadge variant="approved" />
 * ```
 */
export function StatusBadge({
    variant = 'pending',
    text,
    showIcon = true,
    className = ''
}: StatusBadgeProps) {
    const Icon = variant ? iconMap[variant] : iconMap.pending

    const defaultText = {
        verification: 'Under Verification',
        approved: 'Approved',
        rejected: 'Rejected',
        pending: 'Pending'
    }[variant || 'pending']

    return (
        <span
            className={badgeVariants({ variant, className })}
            role="status"
            aria-label={text || defaultText}
        >
            {showIcon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {text || defaultText}
        </span>
    )
}
