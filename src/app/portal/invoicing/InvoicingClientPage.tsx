/**
 * InvoicingPage Component
 * 
 * Main container for invoicing page
 * ~110 lines, orchestrates all child components
 */

'use client'

import { useState } from 'react'
import { PageLayout } from '@/components/ui-oracle'
import { useInvoicing } from '@/hooks/useInvoicing'
import { filterInvoices } from '@/lib/invoicing'
import { InvoicingHeader } from '@/components/portal/invoicing/InvoicingHeader'
import { InvoicingKPIs } from '@/components/portal/invoicing/InvoicingKPIs'
import { InvoicingFilters } from '@/components/portal/invoicing/InvoicingFilters'
import { InvoicingTable } from '@/components/portal/invoicing/InvoicingTable'
import { CreateInvoiceModal } from '@/components/portal/invoicing/modals/CreateInvoiceModal'

export default function InvoicingPage() {
  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // React Query hook
  const {
    invoices,
    isLoading,
    error,
    createInvoice,
    isCreating,
    downloadInvoice,
    payInvoice,
  } = useInvoicing()

  // Filter invoices based on search and status
  const filteredInvoices = filterInvoices(invoices, searchQuery, statusFilter)

  return (
    <PageLayout title="Invoicing" maxWidth="7xl">
      <div className="space-y-6">
        {/* Header with create button */}
        <InvoicingHeader onCreateClick={() => setCreateModalOpen(true)} />

        {/* KPI Cards */}
        <InvoicingKPIs invoices={filteredInvoices} />

        {/* Search and status filters */}
        <InvoicingFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
        />

        {/* Invoice table */}
        <InvoicingTable
          invoices={filteredInvoices}
          loading={isLoading}
          error={error}
          onDownload={downloadInvoice}
          onPay={payInvoice}
          onCreateClick={() => setCreateModalOpen(true)}
        />

        {/* Create invoice modal */}
        <CreateInvoiceModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={(data) => {
            createInvoice(data)
            setCreateModalOpen(false)
          }}
          isCreating={isCreating}
        />
      </div>
    </PageLayout>
  )
}
