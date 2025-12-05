'use client'

/**
 * @deprecated This wizard has been replaced by SetupModal.
 * Use SetupModal from '../modal/SetupModal' instead.
 * 
 * This file is kept for backwards compatibility only.
 */

import { SetupModal } from '../modal/SetupModal'

export interface SetupWizardProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onComplete?: () => void
}

/**
 * @deprecated Use SetupModal instead
 */
export default function SetupOrchestrator({
    open = true,
    onOpenChange = () => { },
    onComplete
}: Partial<SetupWizardProps>) {
    return (
        <SetupModal
            open={open}
            onOpenChange={onOpenChange}
            onComplete={onComplete ? async () => onComplete() : undefined}
        />
    )
}
