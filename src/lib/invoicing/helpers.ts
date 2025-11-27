/**
 * Invoice Helper Utilities
 * 
 * Helper functions for invoice logic
 * ~40 lines
 */

import type { Invoice } from './calculations'

/**
 * Check if invoice is payable (pending or overdue)
 */
export function isPayable(invoice: Invoice): boolean {
    return invoice.status === 'pending' || invoice.status === 'overdue'
}

/**
 * Check if invoice has PDF available
 */
export function hasPDF(invoice: Invoice): boolean {
    return Boolean(invoice.pdfUrl)
}

/**
 * Check if invoice matches search query
 */
export function matchesSearch(invoice: Invoice, query: string): boolean {
    if (!query) return true

    const lowerQuery = query.toLowerCase()
    return (
        invoice.invoiceNumber.toLowerCase().includes(lowerQuery) ||
        (invoice.description?.toLowerCase().includes(lowerQuery) ?? false)
    )
}

/**
 * Check if invoice matches status filter
 */
export function matchesStatus(invoice: Invoice, statusFilter: string): boolean {
    if (statusFilter === 'all') return true
    return invoice.status === statusFilter
}

/**
 * Filter invoices by search and status
 */
export function filterInvoices(
    invoices: Invoice[],
    searchQuery: string,
    statusFilter: string
): Invoice[] {
    return invoices.filter(
        (invoice) => matchesSearch(invoice, searchQuery) && matchesStatus(invoice, statusFilter)
    )
}
