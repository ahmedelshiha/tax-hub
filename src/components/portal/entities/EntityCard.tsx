'use client'

/**
 * Entity Card Component
 * Displays a single business entity with status badge and actions
 */

import { useState } from 'react'
import Link from 'next/link'
import { Building2, ChevronRight, MoreVertical, Copy, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge, type EntityStatusType } from './StatusBadge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const COUNTRY_FLAGS: Record<string, string> = {
    AE: '🇦🇪',
    SA: '🇸🇦',
    EG: '🇪🇬',
}

const COUNTRY_NAMES: Record<string, string> = {
    AE: 'UAE',
    SA: 'Saudi Arabia',
    EG: 'Egypt',
}

export interface EntityData {
    id: string
    name: string
    status: EntityStatusType | string
    country: string
    legalForm?: string
    createdAt?: string
    licenseExpiresAt?: string
}

interface EntityCardProps {
    entity: EntityData
    onClick?: () => void
    onClone?: (newEntity: EntityData) => void
}

export function EntityCard({ entity, onClick, onClone }: EntityCardProps) {
    const [showCloneDialog, setShowCloneDialog] = useState(false)
    const [cloneName, setCloneName] = useState(`${entity.name} (copy)`)
    const [isCloning, setIsCloning] = useState(false)

    const flag = COUNTRY_FLAGS[entity.country] || '🌍'
    const countryName = COUNTRY_NAMES[entity.country] || entity.country

    // Check if license is expiring soon (within 30 days)
    const isExpiringLicense = entity.licenseExpiresAt
        ? new Date(entity.licenseExpiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : false

    const handleClone = async () => {
        if (!cloneName.trim()) {
            toast.error('Please enter a name for the cloned entity')
            return
        }

        setIsCloning(true)
        try {
            const response = await fetch(`/api/portal/entities/${entity.id}/clone`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: cloneName.trim() }),
            })

            const data = await response.json()

            if (!data.success) {
                toast.error(data.error || 'Failed to clone entity')
                return
            }

            toast.success(`"${cloneName}" created successfully!`)
            setShowCloneDialog(false)

            if (onClone) {
                onClone({
                    id: data.data.entity.id,
                    name: data.data.entity.name,
                    status: data.data.entity.status,
                    country: data.data.entity.country,
                })
            }
        } catch (error) {
            toast.error('Failed to clone entity')
        } finally {
            setIsCloning(false)
        }
    }

    const content = (
        <div className="group flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
                {/* Entity Icon */}
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center relative">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    {isExpiringLicense && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-2.5 h-2.5 text-white" />
                        </div>
                    )}
                </div>

                {/* Entity Info */}
                <div>
                    <h3 className="font-medium text-white group-hover:text-teal-400 transition-colors">
                        {entity.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {flag} {countryName}
                        {entity.legalForm && ` • ${entity.legalForm}`}
                    </p>
                </div>
            </div>

            {/* Status Badge + Actions */}
            <div className="flex items-center gap-2">
                <StatusBadge status={entity.status} size="sm" />

                {/* Dropdown Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                            onClick={(e) => e.preventDefault()}
                        >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.preventDefault()
                                setShowCloneDialog(true)
                            }}
                            className="text-gray-200 hover:bg-gray-700 cursor-pointer"
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            Clone Entity
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" />
            </div>
        </div>
    )

    return (
        <>
            {/* Card with Link or Button */}
            {onClick ? (
                <button onClick={onClick} className="w-full text-left">
                    {content}
                </button>
            ) : (
                <Link href={`/portal/businesses/${entity.id}`}>
                    {content}
                </Link>
            )}

            {/* Clone Dialog */}
            <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
                <DialogContent className="bg-gray-900 border-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Clone Entity</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="clone-name">New Entity Name</Label>
                            <Input
                                id="clone-name"
                                value={cloneName}
                                onChange={(e) => setCloneName(e.target.value)}
                                placeholder="Enter name for cloned entity"
                                className="bg-gray-800 border-gray-700 text-white"
                            />
                        </div>
                        <p className="text-sm text-gray-400">
                            This will create a copy of &ldquo;{entity.name}&rdquo; with all its settings.
                            The new entity will be submitted for approval.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCloneDialog(false)}
                            className="border-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleClone}
                            disabled={isCloning || !cloneName.trim()}
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                            {isCloning ? 'Cloning...' : 'Clone Entity'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default EntityCard

