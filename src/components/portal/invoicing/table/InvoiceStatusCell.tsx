/**
 * InvoiceStatusCell Component
 * 
 * Displays status badge using Oracle Fusion StatusBadge
 * ~40 lines
 */

import { StatusBadge } from '@/components/ui-oracle'
import { getStatusVariant, formatStatus } from '@/lib/invoicing'

export interface InvoiceStatusCellProps {
    status: string
}

export function InvoiceStatusCell({ status }: InvoiceStatusCellProps) {
    return (
        <StatusBadge variant={getStatusVariant(status)} showDot>
            {formatStatus(status)}
        </StatusBadge>
    )
}
