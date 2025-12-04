# React Error #185 Fix - December 4, 2025

## Issue Summary
The portal page was crashing in production with **React Error #185: Maximum update depth exceeded**. This error indicates an infinite re-render loop.

## Root Cause Analysis (Updated)
The issue had multiple contributing factors:

1. **BusinessSwitcher Dependency Loop** (Fixed in `9fb02718b`)
   - `useEffect` depended on `setBusinesses` (unstable store function)

2. **Unstable SetupContext** (Fixed in `current`)
   - `SetupContext.tsx` was creating a new `value` object on **every render**
   - This forced the entire wizard tree to re-render whenever the provider re-rendered
   - Combined with state updates, this created a rapid re-render cycle

3. **Unstable Prop References** (Fixed in `current`)
   - `BusinessSetupPage` passed a new `handleComplete` function on every render
   - This caused `SetupOrchestrator` -> `SetupProvider` to re-render
   - Triggering the unstable context issue above

4. **Broken Submission Logic** (Fixed in `current`)
   - `ReviewConfirmStep` submitted data but didn't advance the step
   - Potentially leaving the UI in a pending/submitting state

## The Complete Fix

### 1. BusinessSwitcher.tsx
Removed `setBusinesses` from dependency array.

### 2. SetupContext.tsx
Memoized the context value to ensure stability:
```typescript
const value = useMemo(() => ({
    // ... state and actions
}), [/* dependencies */]);
```

### 3. BusinessSetupPage.tsx
Memoized the callback prop:
```typescript
const handleComplete = useCallback((entityId: string) => {
    // ...
}, [router]);
```

### 4. ReviewConfirmStep.tsx
Fixed submission flow:
```typescript
const result = await actions.submitSetup();
if (result.success) actions.nextStep();
```

## Prevention Guidelines
Going forward, follow these rules to prevent similar issues:

### ✅ DO:
- **Always memoize Context values** (`useMemo`)
- **Always memoize props** passed to Context Providers (`useCallback`)
- Include **state values** in dependency arrays
- Use `useCallback` for event handlers passed as props

### ❌ DON'T:
- Pass new objects/functions directly to Context `value`
- Include Zustand store **setter functions** in dependency arrays
- Define functions inside render without `useCallback` if passed to children

### Example Pattern:
```typescript
// ❌ WRONG
const { data, setData } = useStore();
useEffect(() => {
  setData(newData);
}, [newData, setData]);  // setData shouldn't be here

// ✅ CORRECT
const { data, setData } = useStore();
useEffect(() => {
  setData(newData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [newData]);  // Only include the actual data dependency
```

## Verification
After deploying this fix:
1. Portal page loads without errors ✓
2. No "Maximum update depth exceeded" errors ✓
3. Business switcher works correctly ✓
4. Pre-commit checks pass ✓

## Related Issues
This is the same React Error #185 that was fixed in previous conversations (see conversation history):
- `d89da2b3` - Extend Integration Test Coverage
- `ebc0e02a` - Debugging Portal Infinite Loop
- `a32a36a8` - Fixing Portal Production Errors

The root cause was reintroduced in the latest commit when refactoring the business setup flow.
