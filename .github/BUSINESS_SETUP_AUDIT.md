# Business Setup Modal/Wizard - Complete Audit

**Date:** 2025-12-04  
**Purpose:** Comprehensive audit of the business setup wizard architecture

---

## 🎯 Main Client Page for Adding New Business

### **Primary Entry Point:** `/portal` (Dashboard)
**File:** `src/app/portal/page.tsx`

**How to Add Business:**
1. **Via Button Click:** Line 123-129
   ```tsx
   <Button
     size="sm"
     onClick={() => setSetupWizardOpen(true)}
   >
     <Plus className="h-4 w-4 mr-2" />
     Add Business
   </Button>
   ```

2. **Via Modal State:**
   - `setupWizardOpen` state controls the wizard modal (line 57)
   - `SetupWizard` component renders as a Dialog modal (lines 85-89)
   - On completion, calls `handleSetupComplete()` callback

---

## 📂 Architecture Overview

### **Component Hierarchy**

```
/portal/page.tsx (Main Client Page)
  └── <SetupWizard> (Modal)
        └── SetupOrchestrator.tsx (Core Orchestrator)
              ├── <SetupProvider> (Context Provider)
              │     └── SetupContext.tsx
              ├── <SetupProgress> (Progress Indicator)
              └── <WizardContent> (Multi-step Form)
                    ├── Step 1: CountrySelectionStep
                    ├── Step 2: BusinessTypeSelectionStep
                    ├── Step 3: LicenseVerificationStep
                    ├── Step 4: BusinessDetailsStep
                    ├── Step 5: DocumentUploadStep
                    ├── Step 6: ReviewConfirmStep
                    └── Step 7: SubmissionStatusStep
```

---

## 🗂️ File Structure

### **Core Components**
```
src/components/portal/business-setup/
├── core/
│   ├── SetupOrchestrator.tsx     ⭐ MAIN WIZARD COMPONENT
│   ├── SetupContext.tsx           (State Management)
│   └── SetupProgress.tsx          (Progress Bar UI)
├── steps/
│   ├── CountrySelectionStep.tsx
│   ├── BusinessTypeSelectionStep.tsx
│   ├── LicenseVerificationStep.tsx
│   ├── BusinessDetailsStep.tsx
│   ├── DocumentUploadStep.tsx
│   ├── ReviewConfirmStep.tsx
│   ├── SubmissionStatusStep.tsx
│   └── index.ts
├── types/
│   └── setup.ts                   (TypeScript interfaces)
├── services/
│   ├── draft.service.ts           (Auto-save drafts)
│   ├── entity-setup.service.ts    (API calls)
│   └── [other services]
├── hooks/
│   ├── useKeyboardNavigation.ts   (Keyboard shortcuts)
│   └── [other hooks]
├── schemas/
│   └── [validation schemas]
├── fields/
│   └── [form field components]
├── shared/
│   └── [shared UI components]
└── index.ts                       (Main export)
```

---

## 🔧 Key Components Breakdown

### 1. **SetupOrchestrator.tsx** (Main Component)
- **Location:** `src/components/portal/business-setup/core/SetupOrchestrator.tsx`
- **Purpose:** Main wizard orchestration and rendering
- **Features:**
  - Lazy loads all step components for performance
  - Supports both modal and standalone page modes
  - Handles navigation (next/prev/goto)
  - Auto-save drafts every 30 seconds
  - Keyboard shortcuts support

**Key Props:**
```typescript
interface SetupWizardProps {
  open: boolean              // Modal open state
  onOpenChange: (open: boolean) => void
  onComplete?: (entityId: string) => void
}
```

**Usage Modes:**
- **Modal Mode:** When `open` prop is provided (used in portal dashboard)
- **Standalone Mode:** When `open` is undefined (could be used as dedicated page)

---

### 2. **SetupContext.tsx** (State Management)
- **Location:** `src/components/portal/business-setup/core/SetupContext.tsx`
- **Purpose:** Centralized state management for the entire wizard

**State:**
- `currentStep`: Current step number (1-7)
- `completedSteps`: Array of completed step numbers
- `formData`: All form data (typed as `SetupFormData`)
- `isLoading`: API submission state
- `isSavingDraft`: Draft save operation state
- `lastSavedAt`: Timestamp of last auto-save
- `validationErrors`: Field-level validation errors
- `showHelpPanel`: Help panel visibility

**Actions:**
- `updateFormData()`: Update form fields
- `goToStep()`: Jump to specific step
- `nextStep()` / `prevStep()`: Navigate between steps
- `saveDraft()`: Manual save draft
- `submitSetup()`: Final submission to API
- `setValidationErrors()` / `clearValidationErrors()`
- `markStepComplete()`: Mark step as done

**Auto-save Feature:**
- Automatically saves draft every 30 seconds (line 55-64)
- Loads saved draft on mount (line 21-30)
- Persists to localStorage via `draftService`

---

### 3. **SetupProgress.tsx** (Progress Indicator)
- **Location:** `src/components/portal/business-setup/core/SetupProgress.tsx`
- **Purpose:** Visual progress indicator showing current step
- Shows: Step number, title, description, completion status

---

## 📝 Wizard Steps

### **Step 1: Country Selection**
- **File:** `CountrySelectionStep.tsx`
- **Fields:** Country selection (AE, SA, EG)

### **Step 2: Business Type Selection**
- **File:** `BusinessTypeSelectionStep.tsx`
- **Options:** 
  - Existing Business
  - New Business
  - Individual/Freelancer

### **Step 3: License Verification**
- **File:** `LicenseVerificationStep.tsx`
- **Features:**
  - License number lookup
  - Auto-population of business details
  - Activity selection

### **Step 4: Business Details**
- **File:** `BusinessDetailsStep.tsx`
- **Fields:**
  - Economic zone
  - Legal form
  - Tax ID
  - Contact information

### **Step 5: Document Upload**
- **File:** `DocumentUploadStep.tsx`
- **Features:**
  - Drag & drop file upload
  - Multiple document support
  - Upload progress tracking

### **Step 6: Review & Confirm**
- **File:** `ReviewConfirmStep.tsx`
- **Features:**
  - Summary of all entered data
  - Terms acceptance
  - Edit capability (jump back to steps)

### **Step 7: Submission Status**
- **File:** `SubmissionStatusStep.tsx`
- **States:**
  - Submitting
  - Success (redirect to entity page)
  - Error (retry option)

---

## 🔄 Data Flow

### **1. User Opens Wizard**
```
Portal Dashboard → Click "Add Business" → setSetupWizardOpen(true)
```

### **2. During Wizard**
```
User Input → updateFormData() → Auto-save draft (30s) → localStorage
```

### **3. On Submission**
```
Review Step → submitSetup() → entitySetupService.submitSetup()
  ↓
API Call to /api/entities/setup
  ↓
Success → onComplete(entityId) → Close modal → Refresh dashboard
```

### **4. Error Handling**
```
API Error → setValidationErrors() → Display errors in UI → Allow retry
```

---

## 🎨 UI/UX Features

### **1. Keyboard Shortcuts**
- Implemented via `useKeyboardNavigation` hook
- Shortcuts displayed at bottom of wizard
- Navigation hotkeys available

### **2. Auto-save Drafts**
- Saves to localStorage every 30 seconds
- Loads on wizard open
- User sees "Saved at HH:MM:SS" indicator

### **3. Help Panel**
- Toggle via help button
- Context-sensitive help per step

### **4. Validation**
- Real-time field validation
- Error messages below fields
- Prevents proceeding with errors

### **5. Responsive Design**
- Works on mobile, tablet, desktop
- Modal adapts to screen size
- Touch-friendly controls

---

## 🔗 Integration Points

### **1. Portal Dashboard** (`/portal/page.tsx`)
**Line 85-89:**
```tsx
<SetupWizard
  open={setupWizardOpen}
  onOpenChange={setSetupWizardOpen}
  onComplete={handleSetupComplete}
/>
```

**Callback on Completion (Line 68-72):**
```tsx
const handleSetupComplete = (entityId: string) => {
  setSetupWizardOpen(false);
  toast.success("Business setup completed successfully!");
  router.refresh();
};
```

### **2. Alternative Route** (`/portal/setup`)
- **File:** `src/app/portal/setup/page.tsx`
- **Purpose:** Redirects to `/portal/business-setup` (currently not implemented)
- **Note:** This route currently just redirects - could be used for standalone wizard

---

## 📡 API Integration

### **Entity Setup Service**
**File:** `src/components/portal/business-setup/services/entity-setup.service.ts`

**Main Method:**
```typescript
submitSetup(formData: SetupFormData): Promise<{
  success: boolean
  entityId?: string
  error?: string
}>
```

**API Endpoint:** `/api/entities/setup` (POST)

**Payload:** Complete `SetupFormData` object

---

## 💾 Data Persistence

### **Draft Service**
**File:** `src/components/portal/business-setup/services/draft.service.ts`

**Methods:**
- `saveLocal()`: Save to localStorage
- `loadLocal()`: Load from localStorage
- `clearLocal()`: Clear saved draft

**Storage Key:** `business-setup-draft`

**Stored Data:**
```typescript
{
  formData: SetupFormData
  currentStep: number
  completedSteps: number[]
  updatedAt: string (ISO timestamp)
}
```

---

## 🎯 Answer to Your Question

### **Main Client Page to Add New Business:**

**Page:** `/portal` (Portal Dashboard)  
**File:** `src/app/portal/page.tsx`  
**Component:** `PortalDashboardPage`  
**Button Location:** Line 123-129

**How it works:**
1. User clicks "Add Business" button on dashboard
2. Sets `setupWizardOpen` state to `true`
3. Renders `<SetupWizard>` component as modal dialog
4. User completes 7-step wizard
5. On success, calls `handleSetupComplete(entityId)`
6. Modal closes, dashboard refreshes with new business

**Alternative Access:**
- Could also create a dedicated route at `/portal/business-setup` for standalone mode
- Setup wizard supports both modal and full-page modes
- Currently only modal mode is actively used

---

## ✅ Production-Ready Features

- ✅ **Type Safety:** Full TypeScript coverage
- ✅ **State Management:** Context API with proper hooks
- ✅ **Performance:** Lazy loading of step components
- ✅ **UX:** Auto-save, validation, keyboard shortcuts
- ✅ **Error Handling:** Comprehensive error states
- ✅ **Accessibility:** ARIA labels, keyboard navigation
- ✅ **Responsive:** Works on all device sizes
- ✅ **Data Persistence:** LocalStorage draft saving
- ✅ **API Integration:** Proper service layer

---

## 🚀 Enhancement Opportunities

1. **Progress Persistence:** Save progress to backend (currently localStorage only)
2. **Multi-language:** Add i18n support for steps
3. **Conditional Steps:** Dynamic step flow based on business type
4. **File Upload:** Direct S3 upload vs. base64
5. **Analytics:** Track completion rates, drop-off points
6. **Validation Schema:** Zod/Yup schema validation
7. **Testing:** Add comprehensive test coverage

---

## 📊 Summary

**Main Entry Point:** `/portal/page.tsx` - "Add Business" button  
**Core Component:** `SetupOrchestrator.tsx`  
**Total Steps:** 7 (Country → Type → License → Details → Documents → Review → Status)  
**State Management:** React Context (`SetupProvider`)  
**Mode:** Modal dialog (can also work as standalone page)  
**Auto-save:** Yes (every 30 seconds to localStorage)  
**API Endpoint:** `/api/entities/setup`

The business setup wizard is a **production-ready, comprehensive solution** for onboarding new business entities through a guided, multi-step process.
