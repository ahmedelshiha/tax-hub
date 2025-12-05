'use client'

import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton loading state for the SetupModal.
 * Shows shimmer animation while content loads.
 */
export function SetupModalSkeleton() {
    return (
        <div className="p-6 space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-7 w-48 bg-gray-700" />
                    <Skeleton className="h-8 w-20 bg-gray-700 rounded-full" />
                </div>
                <Skeleton className="h-8 w-8 bg-gray-700 rounded-lg" />
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-4 border-b border-gray-800 pb-3">
                <Skeleton className="h-8 w-32 bg-gray-700" />
                <Skeleton className="h-8 w-28 bg-gray-700" />
            </div>

            {/* Form fields skeleton */}
            <div className="space-y-5">
                {/* License field */}
                <div>
                    <Skeleton className="h-4 w-28 bg-gray-700 mb-2" />
                    <div className="flex gap-2">
                        <Skeleton className="h-11 flex-1 bg-gray-800" />
                        <Skeleton className="h-11 w-24 bg-gray-700" />
                    </div>
                </div>

                {/* Business name field */}
                <div>
                    <Skeleton className="h-4 w-32 bg-gray-700 mb-2" />
                    <Skeleton className="h-11 w-full bg-gray-800" />
                </div>

                {/* Department dropdown */}
                <div>
                    <Skeleton className="h-4 w-44 bg-gray-700 mb-2" />
                    <Skeleton className="h-11 w-full bg-gray-800" />
                </div>

                {/* Terms checkbox */}
                <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-4 w-4 bg-gray-700 mt-1" />
                        <Skeleton className="h-4 w-64 bg-gray-700" />
                    </div>
                </div>

                {/* Submit button */}
                <Skeleton className="h-11 w-full bg-gray-700 mt-4" />
            </div>
        </div>
    )
}

/**
 * Skeleton for entity cards on dashboard
 */
export function EntityCardSkeleton() {
    return (
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 animate-pulse">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <Skeleton className="h-5 w-40 bg-gray-200 dark:bg-gray-700 mb-2" />
                    <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
                </div>
                <Skeleton className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="flex gap-4 mt-4">
                <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700" />
            </div>
        </div>
    )
}

/**
 * Simple loading spinner
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    }

    return (
        <div className={`${sizeClasses[size]} animate-spin`}>
            <svg
                className="text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    )
}

export default SetupModalSkeleton
