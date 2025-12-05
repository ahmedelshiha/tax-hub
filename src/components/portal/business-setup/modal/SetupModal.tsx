'use client'

import { useState, Suspense } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { CountryFlagSelector, type Country } from '../fields/CountryFlagSelector'
import { ExistingEntityTab } from '../tabs/ExistingEntityTab'
import { NewEntityTab } from '../tabs/NewEntityTab'
import { SetupErrorBoundary } from '../components/SetupErrorBoundary'
import { SetupModalSkeleton } from '../components/LoadingStates'
import type { SetupFormData } from '../types/setup'

export interface SetupModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onComplete?: (data: SetupFormData) => void | Promise<void>
}

type TabType = 'existing' | 'new'

/**
 * Simplified single-step business setup modal
 * Based on LEDGERS design - completes in ~30 seconds
 * 
 * Features:
 * - Country selector in header
 * - Tab-based entity type selection
 * - Searchable department dropdown
 * - Dark theme with mobile optimization
 * - Error boundary for graceful failures
 */
export function SetupModal({ open, onOpenChange, onComplete }: SetupModalProps) {
    const [selectedCountry, setSelectedCountry] = useState<Country['code']>('AE')
    const [activeTab, setActiveTab] = useState<TabType>('existing')
    const [formData, setFormData] = useState<Partial<SetupFormData>>({
        country: 'AE',
        businessType: 'existing'
    })

    const handleCountryChange = (country: Country['code']) => {
        setSelectedCountry(country)
        setFormData(prev => ({ ...prev, country }))
    }

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab)
        setFormData(prev => ({ ...prev, businessType: tab }))
    }

    const handleSubmit = async (data: SetupFormData) => {
        if (onComplete) {
            await onComplete(data)
        }
        onOpenChange(false)
    }

    const handleClose = () => {
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
                    max-w-2xl w-[95vw] sm:w-full
                    p-0 gap-0
                    bg-gray-900 text-white
                    border border-gray-800
                    shadow-2xl
                    max-h-[90vh] sm:max-h-[85vh]
                    overflow-hidden
                    flex flex-col
                "
                onInteractOutside={(e) => e.preventDefault()}
            >
                <SetupErrorBoundary>
                    {/* Header with Country Selector */}
                    <div className="
                        flex items-center justify-between
                        px-4 sm:px-6 py-3 sm:py-4
                        border-b border-gray-800
                        flex-shrink-0
                    ">
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                            <h2 className="text-lg sm:text-xl font-semibold">
                                Business Setup
                            </h2>
                            <CountryFlagSelector
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                className="ml-0 sm:ml-2"
                            />
                        </div>

                        <button
                            onClick={handleClose}
                            className="
                                p-2 rounded-lg
                                hover:bg-gray-800
                                transition-colors
                                min-w-[44px] min-h-[44px]
                                flex items-center justify-center
                            "
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs - Mobile optimized with larger touch targets */}
                    <div className="
                        flex border-b border-gray-800
                        px-4 sm:px-6
                        flex-shrink-0
                    ">
                        <button
                            onClick={() => handleTabChange('existing')}
                            className={`
                                px-3 sm:px-4 py-3 sm:py-3 
                                font-medium text-sm
                                border-b-2 transition-colors
                                min-h-[44px]
                                ${activeTab === 'existing'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                                }
                            `}
                        >
                            Existing Business
                        </button>
                        <button
                            onClick={() => handleTabChange('new')}
                            className={`
                                px-3 sm:px-4 py-3 sm:py-3 
                                font-medium text-sm
                                border-b-2 transition-colors
                                min-h-[44px]
                                ${activeTab === 'new'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                                }
                            `}
                        >
                            New Business
                        </button>
                    </div>

                    {/* Tab Content - Scrollable on mobile */}
                    <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                        <Suspense fallback={<SetupModalSkeleton />}>
                            {activeTab === 'existing' ? (
                                <ExistingEntityTab
                                    country={selectedCountry}
                                    formData={formData}
                                    onFormDataChange={setFormData}
                                    onSubmit={handleSubmit}
                                />
                            ) : (
                                <NewEntityTab
                                    country={selectedCountry}
                                    formData={formData}
                                    onFormDataChange={setFormData}
                                    onSubmit={handleSubmit}
                                />
                            )}
                        </Suspense>
                    </div>
                </SetupErrorBoundary>
            </DialogContent>
        </Dialog>
    )
}
