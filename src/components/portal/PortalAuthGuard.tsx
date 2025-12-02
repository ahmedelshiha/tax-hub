'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PortalLayoutSkeleton } from './layout/PortalLayoutSkeleton'

interface PortalAuthGuardProps {
    children: React.ReactNode
}

/**
 * PortalAuthGuard - Ensures user is authenticated before rendering portal content
 * Handles session loading state and redirects unauthenticated users
 */
export function PortalAuthGuard({ children }: PortalAuthGuardProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    // CRITICAL FIX: Move router.push to useEffect to prevent infinite loop
    // Calling router.push() during render is a state mutation that causes re-renders
    useEffect(() => {
        if (isClient && status === 'unauthenticated') {
            router.push('/api/auth/signin?callbackUrl=/portal')
        }
    }, [isClient, status, router])

    // While session is loading, show skeleton to avoid hydration mismatch
    if (!isClient || status === 'loading') {
        return <PortalLayoutSkeleton />
    }

    // If not authenticated, show skeleton while redirecting
    if (status === 'unauthenticated') {
        return <PortalLayoutSkeleton />
    }

    // If authenticated, render children
    if (status === 'authenticated' && session) {
        return <>{children}</>
    }

    // Fallback (should not reach here)
    return <PortalLayoutSkeleton />
}
