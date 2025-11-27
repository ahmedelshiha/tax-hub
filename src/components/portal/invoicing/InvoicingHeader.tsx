/**
 * InvoicingHeader Component
 * 
 * Page header with back button, title, and create action
 * ~60 lines, uses Oracle Fusion ActionHeader
 */

'use client'

import { ActionHeader } from '@/components/ui-oracle'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

export interface InvoicingHeaderProps {
    onCreateClick: () => void
}

export function InvoicingHeader({ onCreateClick }: InvoicingHeaderProps) {
    return (
        <ActionHeader
            title="Invoicing"
            description="Create and manage invoices"
            primaryAction={
                <Button onClick={onCreateClick}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                </Button>
            }
            secondaryActions={
                <Link href="/portal">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back to Portal</span>
                    </Button>
                </Link>
            }
        />
    )
}
