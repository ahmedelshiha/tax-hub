'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { SetupModal } from '@/components/portal/business-setup/modal'

/**
 * Business Setup Page - Now uses simplified SetupModal
 * Route: /portal/business-setup
 * 
 * This page opens the SetupModal immediately.
 * Replaces the old multi-step SetupOrchestrator wizard.
 */
export default function BusinessSetupPage() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(true)

    const handleComplete = useCallback((data: any) => {
        toast.success('Business setup completed successfully!')
        // Redirect to the new business entity page
        if (data?.entityId) {
            router.push(`/portal/businesses/${data.entityId}`)
        } else {
            router.push('/portal')
        }
    }, [router])

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open)
        if (!open) {
            // If modal closed without completing, go back to portal
            router.push('/portal')
        }
    }, [router])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <SetupModal
                open={isOpen}
                onOpenChange={handleOpenChange}
                onComplete={handleComplete}
            />
        </div>
    )
}
