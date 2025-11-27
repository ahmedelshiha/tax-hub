/**
 * Invoice Formatting Utilities
 * 
 * Reusable formatters for currency, dates, and status
 * ~50 lines, pure functions
 */

import { format } from 'date-fns'
import type { StatusVariant } from '@/components/ui-oracle'

/**
 * Format currency using Intl.NumberFormat
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format invoice date
 */
export function formatInvoiceDate(date: string): string {
  return format(new Date(date), 'MMM dd, yyyy')
}

/**
 * Get status badge variant for Oracle Fusion StatusBadge
 */
export function getStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    case 'overdue':
      return 'danger'
    case 'draft':
      return 'neutral'
    default:
      return 'neutral'
  }
}

/**
 * Capitalize first letter of status
 */
export function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
