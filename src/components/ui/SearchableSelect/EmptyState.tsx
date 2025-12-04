import { FileQuestion } from 'lucide-react'

export interface EmptyStateProps {
    query: string
    message?: string
}

/**
 * Empty state when no results found
 * Sub-component of SearchableSelect
 */
export function EmptyState({ query, message }: EmptyStateProps) {
    const defaultMessage = query
        ? `No results found for "${query}"`
        : 'No items available'

    return (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <FileQuestion className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {message || defaultMessage}
            </p>
            {query && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Try adjusting your search terms
                </p>
            )}
        </div>
    )
}
