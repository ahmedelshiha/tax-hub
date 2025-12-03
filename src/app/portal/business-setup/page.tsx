'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import SetupOrchestrator from '@/components/portal/business-setup/core/SetupOrchestrator'

/**
 * Business Setup Page - Standalone Mode
 * Full-page business account setup wizard
 * Route: /portal/business-setup
 */
export default function BusinessSetupPage() {
    const router = useRouter()

    const handleComplete = (entityId: string) => {
        toast.success('Business setup completed successfully!')
        // Redirect to the new business entity page
        router.push(`/portal/businesses/${entityId}`)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Standalone mode - SetupOrchestrator renders without modal wrapper */}
            <SetupOrchestrator onComplete={handleComplete} />
        </div>
    )
}
