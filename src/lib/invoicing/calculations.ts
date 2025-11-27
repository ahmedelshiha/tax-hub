/**
 * Invoice Calculation Utilities
 * 
 * Reusable functions for calculating invoice metrics
 * ~60 lines, pure functions, fully testable
 */

export interface Invoice {
    id: string
    invoiceNumber: string
    date: string
    amount: number
    status: 'paid' | 'pending' | 'overdue' | 'draft'
    currency: string
    pdfUrl?: string
    description?: string
    dueDate?: string
}

/**
 * Calculate total amount from array of invoices
 */
export function calculateTotalAmount(invoices: Invoice[]): number {
    return invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
}

/**
 * Calculate paid amount (only paid invoices)
 */
export function calculatePaidAmount(invoices: Invoice[]): number {
    return invoices
        .filter((invoice) => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.amount, 0)
}

/**
 * Calculate pending amount (pending + overdue invoices)
 */
export function calculatePendingAmount(invoices: Invoice[]): number {
    return invoices
        .filter((invoice) => invoice.status === 'pending' || invoice.status === 'overdue')
        .reduce((sum, invoice) => sum + invoice.amount, 0)
}

/**
 * Count invoices by status
 */
export function countByStatus(invoices: Invoice[], status: string): number {
    if (status === 'pending_overdue') {
        return invoices.filter((inv) => inv.status === 'pending' || inv.status === 'overdue').length
    }
    return invoices.filter((inv) => inv.status === status).length
}

/**
 * Get all unique statuses from invoices
 */
export function getUniqueStatuses(invoices: Invoice[]): string[] {
    return Array.from(new Set(invoices.map((inv) => inv.status)))
}
