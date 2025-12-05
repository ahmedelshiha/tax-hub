'use client'

/**
 * Entity Tree View Component
 * Displays parent/child entity hierarchy
 */

import { useState } from 'react'
import { ChevronRight, ChevronDown, Building2, Circle } from 'lucide-react'
import { StatusBadge, type EntityStatusType } from '@/components/portal/entities/StatusBadge'
import Link from 'next/link'

export interface EntityNode {
    id: string
    name: string
    status: EntityStatusType | string
    country: string
    legalForm?: string
    parentEntityId?: string | null
    children?: EntityNode[]
}

interface EntityTreeItemProps {
    entity: EntityNode
    level: number
}

function EntityTreeItem({ entity, level }: EntityTreeItemProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const hasChildren = entity.children && entity.children.length > 0

    return (
        <div>
            <Link
                href={`/portal/businesses/${entity.id}`}
                className={`
          group flex items-center gap-2 p-3 rounded-lg transition-colors
          hover:bg-gray-800 cursor-pointer
          ${level > 0 ? 'ml-' + (level * 6) : ''}
        `}
                style={{ marginLeft: level * 24 }}
            >
                {/* Expand/Collapse or Branch Icon */}
                {hasChildren ? (
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            setIsExpanded(!isExpanded)
                        }}
                        className="p-0.5 hover:bg-gray-700 rounded"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                    </button>
                ) : level > 0 ? (
                    <Circle className="w-3 h-3 text-gray-500" />
                ) : (
                    <div className="w-4" />
                )}

                {/* Entity Icon */}
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-gray-400" />
                </div>

                {/* Entity Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate group-hover:text-teal-400 transition-colors">
                        {entity.name}
                    </p>
                    <p className="text-xs text-gray-500">
                        {entity.country === 'AE' ? '🇦🇪' : entity.country === 'SA' ? '🇸🇦' : '🇪🇬'}
                        {entity.legalForm && ` • ${entity.legalForm}`}
                        {hasChildren && ` • ${entity.children!.length} branch${entity.children!.length > 1 ? 'es' : ''}`}
                    </p>
                </div>

                {/* Status Badge */}
                <StatusBadge status={entity.status} size="sm" />
            </Link>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div className="border-l border-gray-700 ml-4">
                    {entity.children!.map((child) => (
                        <EntityTreeItem key={child.id} entity={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

interface EntityTreeViewProps {
    entities: EntityNode[]
    onAddBranch?: (parentId: string) => void
}

export function EntityTreeView({ entities }: EntityTreeViewProps) {
    // Build tree structure from flat list
    const buildTree = (items: EntityNode[]): EntityNode[] => {
        const map = new Map<string, EntityNode>()
        const roots: EntityNode[] = []

        // Create map of all entities
        items.forEach((item) => {
            map.set(item.id, { ...item, children: [] })
        })

        // Build parent-child relationships
        items.forEach((item) => {
            const node = map.get(item.id)!
            if (item.parentEntityId && map.has(item.parentEntityId)) {
                const parent = map.get(item.parentEntityId)!
                parent.children = parent.children || []
                parent.children.push(node)
            } else {
                roots.push(node)
            }
        })

        return roots
    }

    const tree = buildTree(entities)

    if (entities.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No entities to display
            </div>
        )
    }

    return (
        <div className="space-y-1">
            {tree.map((entity) => (
                <EntityTreeItem key={entity.id} entity={entity} level={0} />
            ))}
        </div>
    )
}

export default EntityTreeView
