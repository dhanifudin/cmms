# Phase 6: Invoice Management Migration Plan

## Overview
**Goal**: Migrate all invoice-related pages to use Shadcn Vue components
**Estimated Effort**: 4 files, ~1535 total lines
**Status**: Planning Complete, Ready for Execution

## Files Analysis

### 1. InvoiceList.vue (360 lines)
**Current State**: Using native HTML elements
**Complexity**: Medium

#### Components to Replace:
- **Header Button** (Lines 12-19)
  - Custom button → `<Button>` with icon

- **Filters Card** (Lines 24-83)
  - Native div → `<Card><CardContent>`
  - Native labels → `<Label>`
  - Native selects → `<Select><SelectTrigger><SelectValue><SelectContent><SelectItem>`
  - Native input → `<Input>` with search icon

- **Stats Cards** (Lines 86-134)
  - 4x custom divs → `<Card><CardContent>`
  - Keep icon structure (already using lucide icons)

- **Invoice Table** (Lines 137-235)
  - Native table → `<Table><TableHeader><TableRow><TableHead><TableBody><TableCell>`
  - Custom status badges → `<Badge>` with variants
  - Native buttons → `<Button variant="ghost">` or `<Button variant="link">`

- **Empty State** (Lines 230-234)
  - Custom div → `<Alert>` or keep as custom (it's simple)

#### Import Additions Needed:
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
```

#### Key Changes:
1. Replace generate button with Shadcn Button
2. Convert filters section to Card with Select components
3. Convert stats cards to Card components
4. Convert table to Shadcn Table
5. Convert status badges to Badge component
6. Remove SelectItem with empty value="" to avoid errors

---

### 2. InvoiceDetail.vue (370 lines)
**Current State**: Using native HTML elements
**Complexity**: Medium-High

#### Current Structure Analysis Needed:
- Invoice header section
- Cost breakdown sections
- Work order line items table
- Action buttons

#### Components to Replace:
- Header buttons → `<Button>` variants
- All section divs → `<Card><CardHeader><CardTitle><CardContent>`
- Section dividers → `<Separator>`
- Tables → `<Table>` components
- Status badges → `<Badge>`
- Action buttons → `<Button>` with variants

#### Import Additions Needed:
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
```

---

### 3. GenerateInvoiceModal.vue (546 lines)
**Current State**: Custom modal implementation
**Complexity**: High (largest file)

#### Current Structure Analysis Needed:
- Modal overlay and container
- Invoice type selection
- Work order selection with checkboxes
- Date range pickers
- Recipient selection
- Preview/summary section

#### Components to Replace:
- **Modal Structure**
  - Custom fixed overlay → `<Dialog><DialogContent>`
  - Custom modal header → `<DialogHeader><DialogTitle><DialogDescription>`
  - Custom modal footer → `<DialogFooter>`

- **Form Elements**
  - Native selects → `<Select>` components
  - Native checkboxes → `<Checkbox>` components
  - Native inputs → `<Input>` components
  - Native labels → `<Label>` components

- **Work Order List**
  - Custom divs → `<Card>` for each work order
  - Status badges → `<Badge>`
  - Checkboxes → `<Checkbox>`

#### Import Additions Needed:
```typescript
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
```

#### Key Challenges:
1. Complex form state management with multiple sections
2. Work order selection with checkboxes (need proper v-model binding)
3. Preview/summary calculations
4. Multi-step form flow (if present)

---

### 4. StatusUpdateModal.vue (259 lines)
**Current State**: Custom modal implementation
**Complexity**: Low-Medium

#### Components to Replace:
- Custom modal → `<Dialog><DialogContent>`
- Modal header → `<DialogHeader><DialogTitle>`
- Modal footer → `<DialogFooter>`
- Status select → `<Select>` component
- Notes textarea → `<Textarea>` component
- Buttons → `<Button>` components

#### Import Additions Needed:
```typescript
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
```

---

## Migration Order & Strategy

### Step 1: InvoiceList.vue (Highest Impact)
**Priority**: Start here - most visible page
**Approach**:
1. Read full file first
2. Replace header button
3. Migrate filters section
4. Convert stats cards
5. Migrate table
6. Test filtering and navigation

### Step 2: StatusUpdateModal.vue (Easiest)
**Priority**: Quick win, simple modal
**Approach**:
1. Read full file
2. Replace modal structure with Dialog
3. Convert form elements
4. Replace buttons
5. Test modal open/close and form submission

### Step 3: InvoiceDetail.vue (Complex but important)
**Priority**: High - needed for invoice viewing
**Approach**:
1. Read full file to understand structure
2. Migrate header and action buttons
3. Convert all sections to Cards
4. Add Separators between sections
5. Migrate tables to Shadcn Table
6. Test data display and actions

### Step 4: GenerateInvoiceModal.vue (Most Complex)
**Priority**: Last - most complex
**Approach**:
1. Read full file to understand multi-step flow
2. Replace modal structure with Dialog
3. Migrate form sections one by one
4. Convert work order list with Checkbox components
5. Test checkbox selection and form submission
6. Verify invoice generation flow

---

## Common Patterns to Follow

### Select Components (Avoid Empty Value Error)
```vue
<!-- ❌ DON'T -->
<SelectItem value="">All Status</SelectItem>

<!-- ✅ DO -->
<Select v-model="filters.status">
  <SelectTrigger>
    <SelectValue placeholder="All Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="draft">Draft</SelectItem>
    <!-- No empty value option -->
  </SelectContent>
</Select>
```

### Badge Variants
```vue
<Badge variant="default">Paid</Badge>
<Badge variant="destructive">Overdue</Badge>
<Badge variant="outline">Draft</Badge>
<Badge variant="secondary">Pending</Badge>
```

### Table Pattern
```vue
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow v-for="item in items" :key="item.id">
      <TableCell>{{ item.value }}</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Dialog Pattern
```vue
<Dialog v-model:open="showModal">
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>

    <!-- Content -->

    <DialogFooter>
      <Button variant="outline" @click="showModal = false">Cancel</Button>
      <Button @click="handleSubmit">Submit</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Testing Checklist

After each file migration:
- [ ] Page renders without errors
- [ ] All interactive elements work (buttons, dropdowns, etc.)
- [ ] Filters work correctly
- [ ] Modals open/close properly
- [ ] Forms submit successfully
- [ ] Data displays correctly
- [ ] Responsive design works on mobile
- [ ] No console errors
- [ ] Build succeeds

---

## Risk Assessment

### Low Risk
- ✅ StatusUpdateModal.vue - Simple modal conversion
- ✅ InvoiceList.vue filters - Straightforward Select replacement

### Medium Risk
- ⚠️ InvoiceList.vue table - Large table, needs careful migration
- ⚠️ InvoiceDetail.vue - Multiple sections to convert

### High Risk
- 🔴 GenerateInvoiceModal.vue - Complex form with checkboxes and multi-step flow
  - **Mitigation**: Test checkbox v-model binding thoroughly
  - **Mitigation**: Break into smaller sections
  - **Mitigation**: Test form submission at each step

---

## Expected Outcomes

### Before Migration
- Custom HTML/CSS across all invoice pages
- Inconsistent styling and interactions
- No accessibility features
- Hard to maintain

### After Migration
- Consistent Shadcn Vue components
- Unified design language
- Built-in accessibility (ARIA labels, keyboard navigation)
- Easier to maintain and extend
- Professional appearance
- Better user experience

---

## Estimated Timeline

| File | Lines | Est. Time | Notes |
|------|-------|-----------|-------|
| InvoiceList.vue | 360 | 45 min | Straightforward, similar to InventoryList |
| StatusUpdateModal.vue | 259 | 20 min | Simple modal, quick conversion |
| InvoiceDetail.vue | 370 | 35 min | Multiple sections but predictable |
| GenerateInvoiceModal.vue | 546 | 60 min | Complex, needs careful testing |
| **Testing & Fixes** | - | 30 min | Integration testing, bug fixes |
| **Total** | 1535 | ~3 hours | Including testing |

---

## Ready to Execute?

**Status**: ✅ Plan complete and ready
**Next Action**: Begin with InvoiceList.vue migration
**Confidence**: High (similar patterns to Phase 5)

Shall I proceed with the migration?
