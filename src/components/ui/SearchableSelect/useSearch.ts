import { useCallback, useMemo, useState } from 'react'

export interface UseSearchOptions<T> {
    items: T[]
    searchKeys: (keyof T)[]
    debounceMs?: number
    caseSensitive?: boolean
}

export interface UseSearchResult<T> {
    query: string
    setQuery: (query: string) => void
    filteredItems: T[]
    clearQuery: () => void
    isSearching: boolean
    highlightMatches: (text: string) => string
}

/**
 * Custom hook for search functionality with debouncing
 * Used by SearchableSelect component
 * 
 * @param options - Search configuration
 * @returns Search state and actions
 */
export function useSearch<T>({
    items,
    searchKeys,
    debounceMs = 300,
    caseSensitive = false
}: UseSearchOptions<T>): UseSearchResult<T> {
    const [query, setQueryState] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)

    // Debounced query update
    const setQuery = useCallback((newQuery: string) => {
        setQueryState(newQuery)
        setIsSearching(true)

        // Clear existing timeout
        const timeoutId = setTimeout(() => {
            setDebouncedQuery(newQuery)
            setIsSearching(false)
        }, debounceMs)

        return () => clearTimeout(timeoutId)
    }, [debounceMs])

    // Clear query
    const clearQuery = useCallback(() => {
        setQueryState('')
        setDebouncedQuery('')
        setIsSearching(false)
    }, [])

    // Filter items based on query
    const filteredItems = useMemo(() => {
        if (!debouncedQuery.trim()) {
            return items
        }

        const searchTerm = caseSensitive
            ? debouncedQuery.trim()
            : debouncedQuery.trim().toLowerCase()

        return items.filter(item => {
            return searchKeys.some(key => {
                const value = item[key]
                if (typeof value !== 'string') return false

                const itemValue = caseSensitive ? value : value.toLowerCase()
                return itemValue.includes(searchTerm)
            })
        })
    }, [items, debouncedQuery, searchKeys, caseSensitive])

    // Highlight matching text
    const highlightMatches = useCallback((text: string): string => {
        if (!debouncedQuery.trim()) return text

        const searchTerm = caseSensitive ? debouncedQuery : debouncedQuery.toLowerCase()
        const textToSearch = caseSensitive ? text : text.toLowerCase()

        const index = textToSearch.indexOf(searchTerm)
        if (index === -1) return text

        return text.slice(0, index) +
            '<mark>' + text.slice(index, index + searchTerm.length) + '</mark>' +
            text.slice(index + searchTerm.length)
    }, [debouncedQuery, caseSensitive])

    return {
        query,
        setQuery,
        filteredItems,
        clearQuery,
        isSearching,
        highlightMatches
    }
}
