'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { CountryFlagSelector, COUNTRIES, type Country } from '../fields/CountryFlagSelector'
import { ExistingEntityTab } from '../tabs/ExistingEntityTab'
import { NewEntityTab } from '../tabs/NewEntityTab'
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
 * - Dark theme
 * - Single-page completion
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
        // TODO: Add unsaved changes warning
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
          max-w-2xl p-0 gap-0
          bg-gray-900 text-white
          border border-gray-800
          shadow-2xl
        "
                // Prevent close on outside click for better UX
                onInteractOutside={(e) => e.preventDefault()}
            >
                {/* Header with Country Selector */}
                <div className="
          flex items-center justify-between
          px-6 py-4
          border-b border-gray-800
        ">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold">
                            Business Account Setup
                        </h2>
                        <CountryFlagSelector
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            className="ml-2"
                        />
                    </div>

                    <button
                        onClick={handleClose}
                        className="
              p-2 rounded-lg
              hover:bg-gray-800
             transition-colors
            "
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="
          flex border-b border-gray-800
          px-6
        ">
                    <button
                        onClick={() => handleTabChange('existing')}
                        className={`
              px-4 py-3 font-medium text-sm
              border-b-2 transition-colors
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
              px-4 py-3 font-medium text-sm
              border-b-2 transition-colors
              ${activeTab === 'new'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-300'
                            }
            `}
                    >
                        New Business
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
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
                </div>
            </DialogContent>
        </Dialog>
    )
}
