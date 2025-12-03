import { describe, it, expect, beforeEach } from 'vitest'
import { useBusinessContext } from '@/stores/business-context.store'

describe('Business Context Store', () => {
    beforeEach(() => {
        useBusinessContext.getState().clearContext()
    })

    const mockBusinesses = [
        { id: 'biz-1', name: 'Business 1', status: 'ACTIVE' },
        { id: 'biz-2', name: 'Business 2', status: 'PENDING' },
    ]

    it('should initialize with empty state', () => {
        const state = useBusinessContext.getState()
        expect(state.businesses).toEqual([])
        expect(state.activeBusinessId).toBeNull()
        expect(state.activeBusiness).toBeNull()
    })

    it('should set businesses and auto-select first one', () => {
        useBusinessContext.getState().setBusinesses(mockBusinesses)

        const state = useBusinessContext.getState()
        expect(state.businesses).toEqual(mockBusinesses)
        expect(state.activeBusinessId).toBe('biz-1')
        expect(state.activeBusiness).toEqual(mockBusinesses[0])
    })

    it('should change active business', () => {
        useBusinessContext.getState().setBusinesses(mockBusinesses)
        useBusinessContext.getState().setActiveBusiness('biz-2')

        const state = useBusinessContext.getState()
        expect(state.activeBusinessId).toBe('biz-2')
        expect(state.activeBusiness).toEqual(mockBusinesses[1])
    })

    it('should preserve active business when updating list if it still exists', () => {
        useBusinessContext.getState().setBusinesses(mockBusinesses)
        useBusinessContext.getState().setActiveBusiness('biz-2')

        // Update with same list or list containing active biz
        useBusinessContext.getState().setBusinesses([...mockBusinesses, { id: 'biz-3', name: 'Business 3', status: 'ACTIVE' }])

        const state = useBusinessContext.getState()
        expect(state.activeBusinessId).toBe('biz-2')
    })

    it('should reset to first business if active business is removed', () => {
        useBusinessContext.getState().setBusinesses(mockBusinesses)
        useBusinessContext.getState().setActiveBusiness('biz-2')

        // Update list excluding biz-2
        useBusinessContext.getState().setBusinesses([mockBusinesses[0]])

        const state = useBusinessContext.getState()
        expect(state.activeBusinessId).toBe('biz-1')
        expect(state.activeBusiness).toEqual(mockBusinesses[0])
    })

    it('should not change active business if id does not exist', () => {
        useBusinessContext.getState().setBusinesses(mockBusinesses)
        useBusinessContext.getState().setActiveBusiness('non-existent')

        const state = useBusinessContext.getState()
        expect(state.activeBusinessId).toBe('biz-1') // Still default
    })
})
