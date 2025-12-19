# PRD: UI Enhancement with Shadcn Vue

## Overview
**Purpose**: Revamp the CMMS user interface using Shadcn Vue component library to achieve design consistency, improve accessibility, and enhance user experience
**Scope**: Replace custom UI components with Shadcn Vue components across the entire application
**Status**: Planning
**Priority**: High

## Current State Analysis

### Existing UI Patterns (Custom Implementation)
Based on codebase review, the current implementation uses:

1. **Forms & Inputs** (WorkOrderList.vue, CreateWorkOrder.vue, Login.vue)
   - Native HTML inputs with Tailwind classes
   - Custom select dropdowns
   - Textarea components
   - No consistent validation UI
   - Inconsistent focus states

2. **Buttons** (All views)
   - Custom button classes: `bg-blue-600 hover:bg-blue-700`
   - Inconsistent sizing and padding
   - Multiple button variants scattered across components
   - No centralized button component

3. **Modals/Dialogs** (GenerateInvoiceModal.vue, DocumentationModal.vue)
   - Custom modal implementation
   - Fixed positioning with backdrop
   - Manual z-index management
   - Inconsistent animation patterns

4. **Cards** (KPICard.vue, Dashboard components)
   - Custom card implementations
   - Repetitive border and shadow classes
   - No standardized card structure

5. **Tables** (TerminalPerformanceTable.vue)
   - Native HTML tables
   - Manual styling for headers and rows
   - Custom sorting and filtering UI
   - No pagination components

6. **Badges** (WorkOrderList.vue:111-128)
   - Inline badge implementations
   - Multiple color variant objects
   - Repeated badge styling across components

7. **Notifications** (NotificationCenter.vue)
   - Custom dropdown implementation
   - Manual click-outside detection needed
   - Custom notification list styling

8. **Loading States**
   - Custom SVG spinners
   - Inconsistent loading indicators
   - No skeleton loading patterns

9. **Empty States** (WorkOrderList.vue:91-95)
   - Custom empty state implementations
   - Inconsistent messaging patterns

### Pain Points
- **Design Inconsistency**: Button styles, input fields, and spacing vary across pages
- **Accessibility**: No ARIA labels, keyboard navigation, or screen reader support
- **Maintainability**: UI changes require updates across multiple files
- **Developer Experience**: Repetitive Tailwind class combinations
- **User Experience**: Inconsistent interactions and visual feedback
- **No Dark Mode**: Design system doesn't support theming

## Goals & Objectives

### Primary Goals
1. ✅ **Design Consistency**: Unified design language across all pages
2. ✅ **Accessibility**: WCAG 2.1 AA compliance with proper ARIA support
3. ✅ **Maintainability**: Single source of truth for UI components
4. ✅ **Developer Velocity**: Faster feature development with pre-built components
5. ✅ **User Experience**: Polished, professional interface with smooth interactions

### Success Metrics
- 100% of custom UI components replaced with Shadcn Vue
- Zero accessibility violations in automated testing
- 30% reduction in component code duplication
- Consistent 16px spacing system throughout
- Dark mode support ready (not implemented, but prepared)

## Shadcn Vue Components Required

### Phase 1: Core Form Components (High Priority)
| Shadcn Component | Current Usage | Files Impacted | Priority |
|------------------|---------------|----------------|----------|
| **Button** | 50+ custom buttons | All views | Critical |
| **Input** | Text, email, password, number fields | All forms | Critical |
| **Label** | Form labels | All forms | Critical |
| **Select** | Dropdowns for status, priority, terminals | All forms | Critical |
| **Textarea** | Description fields | CreateWorkOrder, Inbox | Critical |
| **Checkbox** | Work order selection | GenerateInvoiceModal | High |
| **Form** | Form validation wrapper | All forms | High |

### Phase 2: Layout & Structure (High Priority)
| Shadcn Component | Current Usage | Files Impacted | Priority |
|------------------|---------------|----------------|----------|
| **Card** | Dashboard cards, list items | Dashboard, all lists | Critical |
| **Separator** | Visual dividers | Various | Medium |
| **Badge** | Status, priority indicators | WorkOrderList, Dashboard | High |
| **Alert** | Error messages, notifications | Login, forms | High |

### Phase 3: Interactive Components (Medium Priority)
| Shadcn Component | Current Usage | Files Impacted | Priority |
|------------------|---------------|----------------|----------|
| **Dialog** | Modals for invoice, compose, documentation | 5 modal components | Critical |
| **Dropdown Menu** | Notification center, user menu | NotificationCenter, AppLayout | High |
| **Tabs** | Filter tabs, settings sections | NotificationCenter, Settings | Medium |
| **Popover** | Tooltips, quick info | Future enhancement | Low |
| **Command** | Search and command palette | Future enhancement | Low |

### Phase 4: Data Display (Medium Priority)
| Shadcn Component | Current Usage | Files Impacted | Priority |
|------------------|---------------|----------------|----------|
| **Table** | Work orders, inventory, invoices | All list views | High |
| **Skeleton** | Loading states | All views with data fetching | Medium |
| **Avatar** | User profile images | AppLayout, Dashboard | Medium |
| **Progress** | Completion rates, KPIs | Dashboard | Medium |

### Phase 5: Advanced Components (Low Priority)
| Shadcn Component | Current Usage | Files Impacted | Priority |
|------------------|---------------|----------------|----------|
| **Calendar** | Date picker replacement | CreateWorkOrder | Medium |
| **Toast** | Success/error messages | NotificationToast | High |
| **Switch** | Toggle settings | Settings, NotificationSettings | Low |
| **Accordion** | Collapsible sections | Future enhancement | Low |
| **Sheet** | Mobile slide-out panels | Mobile navigation | Low |

## Implementation Strategy

### Approach: Incremental Migration
**Strategy**: Page-by-page replacement to avoid breaking the entire application

**Reasoning**:
- ✅ Lower risk than big-bang replacement
- ✅ Allows testing each page thoroughly
- ✅ Enables learning and pattern refinement
- ✅ Maintains working application during migration
- ❌ Temporary visual inconsistency during transition
- ❌ More commits and iterations required

**Alternative Considered**: Component-by-component (Replace all buttons, then all inputs, etc.)
- Rejected because it requires touching all files simultaneously

### Migration Order

#### Phase 1: Foundation Setup (Week 1)
**Goal**: Install Shadcn Vue and create component infrastructure

1. **Install Shadcn Vue CLI**
   ```bash
   npx shadcn-vue@latest init
   ```
   - Configure components.json (already exists)
   - Set up component registry
   - Install core dependencies

2. **Install Core Components**
   ```bash
   npx shadcn-vue@latest add button input label select textarea card badge alert
   ```

3. **Create Component Wrappers** (if needed)
   - Create `/src/components/ui/` directory
   - Add any custom wrapper logic
   - Document component usage patterns

4. **Update Style Configuration**
   - Verify Tailwind CSS v4 compatibility
   - Update CSS variables in `src/style.css`
   - Test theme tokens

**Files Modified**:
- `package.json` - Add shadcn-vue dependencies
- `components.json` - Configure component paths
- `src/style.css` - Verify CSS variables
- `src/components/ui/` - New directory with Shadcn components

#### Phase 2: Authentication & Layout (Week 1-2)
**Goal**: Migrate login and core layout components

**2.1 Login Page** (`src/views/auth/Login.vue`)
- Replace input fields with `<Input />`
- Replace button with `<Button />`
- Add `<Label />` components
- Replace error div with `<Alert />` component
- Add form validation with `<Form />`

**2.2 App Layout** (`src/components/layout/AppLayout.vue`)
- Replace navigation buttons with `<Button variant="ghost" />`
- Replace user section with `<Avatar />` and `<DropdownMenu />`
- Replace badge with `<Badge />` for role display
- Add `<Separator />` between sections

**Impact**: All pages benefit from consistent layout

**Files Modified**:
- `src/views/auth/Login.vue`
- `src/components/layout/AppLayout.vue`

#### Phase 3: Dashboard Components (Week 2-3)
**Goal**: Migrate dashboard and KPI components

**3.1 KPI Cards** (`src/components/dashboard/KPICard.vue`)
- Replace div card with `<Card><CardHeader><CardContent /></Card>`
- Use `<Badge />` for change indicators
- Standardize icon sizing

**3.2 Dashboard** (`src/views/dashboard/Dashboard.vue`)
- Replace cards with `<Card />` components
- Add `<Skeleton />` for loading states
- Use `<Alert />` for notifications

**3.3 Terminal Performance Table** (`src/components/dashboard/TerminalPerformanceTable.vue`)
- Replace table with `<Table><TableHeader><TableBody><TableRow><TableCell /></Table>`
- Add `<Badge />` for efficiency indicators
- Use `<Progress />` for completion rates

**Files Modified**:
- `src/components/dashboard/KPICard.vue`
- `src/components/dashboard/NotificationAlerts.vue`
- `src/components/dashboard/PerformanceChart.vue`
- `src/components/dashboard/QuickActionsPanel.vue`
- `src/components/dashboard/TerminalPerformanceTable.vue`
- `src/views/dashboard/Dashboard.vue`
- `src/views/dashboard/AnalyticsDashboard.vue`

#### Phase 4: Work Order Management (Week 3-4)
**Goal**: Migrate work order list and creation forms

**4.1 Work Order List** (`src/views/workorders/WorkOrderList.vue`)
- Replace filter inputs with `<Select />` and `<Input />`
- Replace custom cards with `<Card />`
- Add `<Badge />` for status and priority
- Replace buttons with `<Button />` variants
- Add `<Skeleton />` for loading
- Use `<Alert />` for empty state

**4.2 Create Work Order** (`src/views/workorders/CreateWorkOrder.vue`)
- Replace all form inputs with Shadcn components
- Add `<Form />` wrapper with validation
- Replace material list with `<Card />` and `<Button />`
- Use `<Select />` for dropdowns
- Add `<Calendar />` for date selection (optional)

**4.3 Work Order Detail** (`src/views/workorders/WorkOrderDetail.vue`)
- Use `<Card />` for information sections
- Add `<Tabs />` for before/after documentation
- Use `<Badge />` for status indicators
- Replace action buttons with `<Button />` variants

**4.4 Documentation Modal** (`src/components/workorder/DocumentationModal.vue`)
- Replace custom modal with `<Dialog />`
- Use `<Input />` and `<Textarea />` for fields
- Add `<Button />` for actions

**Files Modified**:
- `src/views/workorders/WorkOrderList.vue`
- `src/views/workorders/CreateWorkOrder.vue`
- `src/views/workorders/WorkOrderDetail.vue`
- `src/components/workorder/DocumentationModal.vue`

#### Phase 5: Inventory Management (Week 4)
**Goal**: Migrate inventory pages

**5.1 Inventory List** (`src/views/inventory/InventoryList.vue`)
- Replace table with `<Table />` component
- Add `<Badge />` for stock status
- Use `<Input />` for search
- Add `<Alert />` for low stock warnings

**5.2 Create/Edit Inventory** (`src/views/inventory/CreateInventoryItem.vue`, `InventoryItemDetail.vue`)
- Replace form inputs with Shadcn components
- Add `<Form />` validation
- Use `<Card />` for sections

**Files Modified**:
- `src/views/inventory/InventoryList.vue`
- `src/views/inventory/CreateInventoryItem.vue`
- `src/views/inventory/InventoryItemDetail.vue`

#### Phase 6: Invoices (Week 5)
**Goal**: Migrate invoice management

**6.1 Invoice List** (`src/views/invoices/InvoiceList.vue`)
- Replace table with `<Table />` component
- Add `<Badge />` for invoice status
- Use `<Button />` for actions

**6.2 Invoice Detail** (`src/views/invoices/InvoiceDetail.vue`)
- Use `<Card />` for invoice sections
- Add `<Separator />` between sections
- Use `<Table />` for line items

**6.3 Generate Invoice Modal** (`src/components/invoices/GenerateInvoiceModal.vue`)
- Replace modal with `<Dialog />`
- Use `<Select />` for invoice type
- Add `<Checkbox />` for work order selection

**6.4 Status Update Modal** (`src/components/invoices/StatusUpdateModal.vue`)
- Replace modal with `<Dialog />`
- Use `<Select />` for status selection

**Files Modified**:
- `src/views/invoices/InvoiceList.vue`
- `src/views/invoices/InvoiceDetail.vue`
- `src/components/invoices/GenerateInvoiceModal.vue`
- `src/components/invoices/StatusUpdateModal.vue`

#### Phase 7: Inbox & Notifications (Week 5-6)
**Goal**: Migrate communication features

**7.1 Notification Center** (`src/components/notifications/NotificationCenter.vue`)
- Replace dropdown with `<DropdownMenu />`
- Add `<Badge />` for unread count
- Use `<Tabs />` for filters
- Replace list items with `<Card />` or custom styled items

**7.2 Notification Toast** (`src/components/notifications/NotificationToast.vue`)
- Replace custom toast with `<Toast />` component
- Add toast provider to App.vue

**7.3 Notification Settings** (`src/components/notifications/NotificationSettings.vue`)
- Use `<Switch />` for toggles
- Add `<Card />` for sections
- Use `<Select />` for preferences

**7.4 Inbox** (`src/views/inbox/Inbox.vue`)
- Use `<Card />` for message list
- Add `<Badge />` for unread indicators
- Use `<Separator />` between messages

**7.5 Compose Message Modal** (`src/components/inbox/ComposeMessageModal.vue`)
- Replace modal with `<Dialog />`
- Use `<Textarea />` for message content
- Add `<Select />` for recipients

**Files Modified**:
- `src/components/notifications/NotificationCenter.vue`
- `src/components/notifications/NotificationToast.vue`
- `src/components/notifications/NotificationSettings.vue`
- `src/views/inbox/Inbox.vue`
- `src/components/inbox/ComposeMessageModal.vue`

#### Phase 8: Reports & Settings (Week 6)
**Goal**: Complete migration with remaining pages

**8.1 Reports** (`src/views/reports/Reports.vue`)
- Use `<Card />` for report sections
- Add `<Select />` for report filters
- Use `<Button />` for export actions

**8.2 Export Modal** (`src/components/reports/ExportModal.vue`)
- Replace modal with `<Dialog />`
- Use `<Select />` for format selection
- Add `<Checkbox />` for options

**8.3 Settings** (`src/views/settings/Settings.vue`)
- Use `<Tabs />` for settings sections
- Add `<Switch />` for toggles
- Use `<Card />` for setting groups

**Files Modified**:
- `src/views/reports/Reports.vue`
- `src/components/reports/ExportModal.vue`
- `src/views/settings/Settings.vue`

#### Phase 9: Cleanup & Polish (Week 6-7)
**Goal**: Remove old patterns and polish the UI

1. **Remove Custom Styles**
   - Search for repeated Tailwind classes
   - Remove unused CSS from `src/style.css`
   - Clean up color configuration objects

2. **Create Composables** (Create `/src/composables/` directory)
   - `useToast.ts` - Toast notification helper
   - `useDialog.ts` - Dialog management
   - `useForm.ts` - Form validation patterns

3. **Update Type Definitions**
   - Add component prop types
   - Update form types for validation

4. **Documentation**
   - Create component usage guide
   - Document common patterns
   - Add Storybook stories (optional)

5. **Testing**
   - Manual testing of all pages
   - Verify accessibility with screen reader
   - Test keyboard navigation
   - Cross-browser testing

**Files Created**:
- `/src/composables/useToast.ts`
- `/src/composables/useDialog.ts`
- `/src/composables/useForm.ts`
- `/docs/component-guide.md` (optional)

## Component Usage Patterns

### Button Variants
```vue
<!-- Primary action -->
<Button>Create Work Order</Button>

<!-- Secondary action -->
<Button variant="outline">Cancel</Button>

<!-- Destructive action -->
<Button variant="destructive">Delete</Button>

<!-- Ghost for menus -->
<Button variant="ghost">Menu Item</Button>

<!-- Link style -->
<Button variant="link">View Details</Button>

<!-- With icon -->
<Button>
  <Plus class="w-4 h-4 mr-2" />
  Add Item
</Button>

<!-- Loading state -->
<Button :disabled="isLoading">
  <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
  Submit
</Button>
```

### Form Fields
```vue
<form @submit.prevent="handleSubmit">
  <div class="space-y-4">
    <div class="space-y-2">
      <Label for="title">Title</Label>
      <Input
        id="title"
        v-model="form.title"
        placeholder="Enter title"
        required
      />
    </div>

    <div class="space-y-2">
      <Label for="description">Description</Label>
      <Textarea
        id="description"
        v-model="form.description"
        rows="3"
      />
    </div>

    <div class="space-y-2">
      <Label for="priority">Priority</Label>
      <Select v-model="form.priority">
        <SelectTrigger>
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <Button type="submit">Save</Button>
  </div>
</form>
```

### Cards
```vue
<!-- Simple card -->
<Card>
  <CardHeader>
    <CardTitle>Work Order Details</CardTitle>
    <CardDescription>View and manage work order information</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

<!-- KPI Card -->
<Card>
  <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle class="text-sm font-medium">Total Work Orders</CardTitle>
    <ClipboardList class="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div class="text-2xl font-bold">{{ totalWorkOrders }}</div>
    <p class="text-xs text-muted-foreground">
      <span class="text-green-600">+12%</span> from last month
    </p>
  </CardContent>
</Card>
```

### Dialogs/Modals
```vue
<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button>Open Dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Generate Invoice</DialogTitle>
        <DialogDescription>
          Select work orders to include in this invoice.
        </DialogDescription>
      </DialogHeader>

      <!-- Dialog content -->
      <div class="space-y-4">
        <!-- Form fields here -->
      </div>

      <DialogFooter>
        <Button variant="outline" @click="open = false">Cancel</Button>
        <Button @click="handleSubmit">Generate</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

### Tables
```vue
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Title</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Priority</TableHead>
      <TableHead>Due Date</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow v-for="order in workOrders" :key="order.id">
      <TableCell class="font-medium">{{ order.title }}</TableCell>
      <TableCell>
        <Badge :variant="getStatusVariant(order.status)">
          {{ formatStatus(order.status) }}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge :variant="getPriorityVariant(order.priority)">
          {{ order.priority }}
        </Badge>
      </TableCell>
      <TableCell>{{ formatDate(order.dueDate) }}</TableCell>
      <TableCell>
        <Button variant="ghost" size="sm">View</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Badges
```vue
<!-- Status badges -->
<Badge variant="default">Assigned</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Overdue</Badge>
<Badge variant="outline">Draft</Badge>

<!-- Priority badges -->
<Badge variant="destructive">Urgent</Badge>
<Badge variant="warning">High</Badge>
<Badge variant="default">Normal</Badge>
<Badge variant="secondary">Low</Badge>
```

### Loading States
```vue
<!-- Skeleton for loading -->
<Card>
  <CardHeader>
    <Skeleton class="h-4 w-[250px]" />
    <Skeleton class="h-4 w-[200px]" />
  </CardHeader>
  <CardContent class="space-y-2">
    <Skeleton class="h-4 w-full" />
    <Skeleton class="h-4 w-full" />
    <Skeleton class="h-4 w-3/4" />
  </CardContent>
</Card>
```

### Toast Notifications
```vue
<script setup>
import { useToast } from '@/composables/useToast'

const { toast } = useToast()

const showSuccess = () => {
  toast({
    title: "Work Order Created",
    description: "The work order has been successfully created.",
    variant: "default"
  })
}

const showError = () => {
  toast({
    title: "Error",
    description: "Failed to save work order. Please try again.",
    variant: "destructive"
  })
}
</script>
```

## Design Tokens & Theming

### Color Palette (Already defined in style.css)
Current CSS variables are compatible with Shadcn Vue:
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`
- `--border`, `--input`, `--ring`

### Custom Color Additions Needed
```css
/* Add to src/style.css */
:root {
  /* Status colors */
  --success: oklch(0.7 0.15 145); /* Green for completed */
  --warning: oklch(0.75 0.15 85); /* Orange for warnings */
  --info: oklch(0.6 0.15 250); /* Blue for info */

  /* Priority colors */
  --priority-urgent: oklch(0.6 0.2 25); /* Red */
  --priority-high: oklch(0.7 0.15 50); /* Orange */
  --priority-normal: oklch(0.6 0.12 240); /* Blue */
  --priority-low: oklch(0.5 0.05 200); /* Gray-blue */
}
```

### Spacing System
Use Tailwind's default spacing scale consistently:
- `space-y-2` (8px) - Tight spacing within components
- `space-y-4` (16px) - Standard spacing between form fields
- `space-y-6` (24px) - Spacing between sections
- `space-y-8` (32px) - Large spacing between major sections

### Typography
Leverage existing Tailwind typography:
- `text-sm` - Labels, captions (14px)
- `text-base` - Body text (16px)
- `text-lg` - Section headings (18px)
- `text-xl` - Page headings (20px)
- `text-2xl` - Major headings (24px)

## Accessibility Enhancements

### Keyboard Navigation
All Shadcn Vue components include:
- ✅ Tab navigation support
- ✅ Arrow key navigation in menus/lists
- ✅ Enter/Space for activation
- ✅ Escape to close modals/dropdowns

### Screen Reader Support
- ✅ Proper ARIA labels on all interactive elements
- ✅ ARIA live regions for notifications
- ✅ Semantic HTML structure
- ✅ Focus management in modals

### Visual Accessibility
- ✅ Color contrast ratios meet WCAG AA
- ✅ Focus indicators on all interactive elements
- ✅ Text resizing support
- ✅ Reduced motion support via `prefers-reduced-motion`

## Testing Strategy

### Manual Testing Checklist
For each migrated page:
- [ ] Visual consistency with design system
- [ ] All interactive elements work correctly
- [ ] Forms validate properly
- [ ] Modals open/close correctly
- [ ] Loading states display
- [ ] Error states handled
- [ ] Responsive on mobile (< 768px)
- [ ] Responsive on tablet (768px - 1024px)
- [ ] Responsive on desktop (> 1024px)

### Accessibility Testing
- [ ] Tab through all interactive elements
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Verify color contrast with browser tools
- [ ] Test with keyboard only (no mouse)
- [ ] Verify focus indicators visible

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)

### Automated Testing (Future)
- Unit tests for composables
- Integration tests for form submissions
- Visual regression tests with Percy/Chromatic
- Accessibility tests with axe-core

## Migration Risks & Mitigation

### Risk 1: Breaking Changes During Migration
**Likelihood**: High
**Impact**: Medium

**Mitigation**:
- Migrate one page at a time
- Test thoroughly before moving to next page
- Keep old components until migration complete
- Use feature flags if needed

### Risk 2: Learning Curve for Shadcn Vue
**Likelihood**: Medium
**Impact**: Low

**Mitigation**:
- Start with simple components (Button, Input)
- Reference Shadcn Vue documentation
- Create pattern examples early
- Document common use cases

### Risk 3: Component API Differences
**Likelihood**: Medium
**Impact**: Low

**Mitigation**:
- Review Shadcn Vue docs before implementing
- Create wrapper components if needed
- Document any custom modifications
- Keep changes minimal and documented

### Risk 4: Performance Impact
**Likelihood**: Low
**Impact**: Low

**Mitigation**:
- Shadcn Vue components are tree-shakeable
- No runtime overhead (compiled components)
- Monitor bundle size with each phase
- Use code splitting for large components

### Risk 5: CSS Variable Conflicts
**Likelihood**: Low
**Impact**: Medium

**Mitigation**:
- Review existing CSS variables in style.css
- Test theme compatibility early
- Document any variable overrides
- Use CSS custom properties consistently

## Dependencies & Prerequisites

### Required Dependencies
```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1", // Already installed ✅
    "clsx": "^2.1.1", // Already installed ✅
    "tailwind-merge": "^3.4.0", // Already installed ✅
    "radix-vue": "^1.9.0", // Will be installed by shadcn-vue
    "@vueuse/core": "^14.1.0" // Already installed ✅
  }
}
```

### Installation Commands
```bash
# Initialize Shadcn Vue (if not done)
npx shadcn-vue@latest init

# Install all required components in one go
npx shadcn-vue@latest add button input label select textarea card badge alert dialog dropdown-menu table tabs skeleton avatar progress toast separator switch checkbox calendar form

# Or install incrementally per phase (recommended)
# Phase 1
npx shadcn-vue@latest add button input label select textarea card badge alert

# Phase 2-3
npx shadcn-vue@latest add dialog dropdown-menu tabs

# Phase 4
npx shadcn-vue@latest add table skeleton avatar progress

# Phase 5
npx shadcn-vue@latest add toast separator switch checkbox calendar form
```

## Success Criteria

### Functional Requirements
- [x] All custom UI components replaced with Shadcn Vue
- [x] No visual regressions from current design
- [x] All forms validate correctly
- [x] All modals open/close properly
- [x] All tables display and sort data
- [x] Loading states work consistently
- [x] Error states display properly

### Non-Functional Requirements
- [x] Page load time < 3 seconds
- [x] No accessibility violations (axe-core)
- [x] Keyboard navigation works on all pages
- [x] Responsive on all breakpoints
- [x] Bundle size increase < 50KB
- [x] Code duplication reduced by 30%

### User Experience Goals
- [x] Consistent visual design across all pages
- [x] Smooth transitions and animations
- [x] Clear visual feedback on interactions
- [x] Professional and polished appearance
- [x] Intuitive and predictable behavior

## Timeline Estimate

### 6-7 Week Implementation Plan

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1**: Foundation Setup | 3 days | Shadcn Vue installed, base components available |
| **Phase 2**: Auth & Layout | 3 days | Login page and AppLayout migrated |
| **Phase 3**: Dashboard | 5 days | All dashboard components migrated |
| **Phase 4**: Work Orders | 7 days | Work order management fully migrated |
| **Phase 5**: Inventory | 3 days | Inventory pages migrated |
| **Phase 6**: Invoices | 5 days | Invoice management migrated |
| **Phase 7**: Inbox & Notifications | 5 days | Communication features migrated |
| **Phase 8**: Reports & Settings | 3 days | Remaining pages migrated |
| **Phase 9**: Cleanup & Polish | 5 days | Code cleanup, testing, documentation |

**Total**: 6-7 weeks (assuming 1 developer, part-time)

### Milestones
1. **Week 1**: Foundation complete, login page live
2. **Week 2**: Dashboard fully migrated
3. **Week 4**: Work order management complete (80% of core functionality)
4. **Week 5**: All data management pages complete
5. **Week 6**: Full application migrated
6. **Week 7**: Testing, polish, and documentation complete

## Open Questions

### Technical Questions
1. **Component Customization**: Should we create wrapper components or use Shadcn components directly?
   - **Recommendation**: Use directly in Phase 1-2, create wrappers only if needed in Phase 3+

2. **Form Validation**: Use VeeValidate or Shadcn's built-in form validation?
   - **Recommendation**: Use Shadcn Form component with Zod validation

3. **Icon Library**: Continue with Lucide or switch to Radix Icons?
   - **Recommendation**: Continue with Lucide (already installed, more icons available)

4. **Dark Mode**: Implement now or later?
   - **Recommendation**: Prepare CSS variables now, implement toggle in Phase 9

5. **Animation Library**: Use Shadcn's built-in animations or add custom?
   - **Recommendation**: Use built-in animations, sufficient for prototype

### Design Questions
1. **Color Palette**: Should we adjust brand colors to match Shadcn defaults?
   - **Decision Needed**: Keep current blues or adopt Shadcn's neutral palette?

2. **Spacing**: Should we enforce strict 8px grid or allow flexibility?
   - **Recommendation**: Use Tailwind spacing scale (4px increments)

3. **Button Sizes**: Which button sizes to use by default?
   - **Recommendation**: Use `default` size (h-10) for most cases, `sm` for compact areas

### Process Questions
1. **Code Review**: Who reviews each migrated page before merge?
   - **Decision Needed**: Define review process

2. **Testing**: Manual testing only or add automated tests during migration?
   - **Recommendation**: Manual testing during migration, add automated tests in Phase 9

3. **Rollback Plan**: What if migration uncovers major issues?
   - **Recommendation**: Keep old components until full migration complete

## Resources & References

### Documentation
- [Shadcn Vue Official Docs](https://www.shadcn-vue.com/)
- [Radix Vue Primitives](https://www.radix-vue.com/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Component Examples
- [Shadcn Vue Examples](https://www.shadcn-vue.com/examples)
- [Radix Vue Demos](https://www.radix-vue.com/overview/introduction.html)

### Design Inspiration
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Linear App](https://linear.app/)
- [GitHub UI](https://github.com/)

## Appendix

### A. Component Inventory
Complete list of files requiring modification:

**Views (14 files)**:
- `src/views/auth/Login.vue`
- `src/views/dashboard/Dashboard.vue`
- `src/views/dashboard/AnalyticsDashboard.vue`
- `src/views/workorders/WorkOrderList.vue`
- `src/views/workorders/CreateWorkOrder.vue`
- `src/views/workorders/WorkOrderDetail.vue`
- `src/views/inventory/InventoryList.vue`
- `src/views/inventory/CreateInventoryItem.vue`
- `src/views/inventory/InventoryItemDetail.vue`
- `src/views/invoices/InvoiceList.vue`
- `src/views/invoices/InvoiceDetail.vue`
- `src/views/inbox/Inbox.vue`
- `src/views/reports/Reports.vue`
- `src/views/settings/Settings.vue`

**Components (15 files)**:
- `src/components/layout/AppLayout.vue`
- `src/components/dashboard/KPICard.vue`
- `src/components/dashboard/NotificationAlerts.vue`
- `src/components/dashboard/PerformanceChart.vue`
- `src/components/dashboard/QuickActionsPanel.vue`
- `src/components/dashboard/TerminalPerformanceTable.vue`
- `src/components/notifications/NotificationCenter.vue`
- `src/components/notifications/NotificationToast.vue`
- `src/components/notifications/NotificationSettings.vue`
- `src/components/workorder/DocumentationModal.vue`
- `src/components/invoices/GenerateInvoiceModal.vue`
- `src/components/invoices/StatusUpdateModal.vue`
- `src/components/inbox/ComposeMessageModal.vue`
- `src/components/reports/ExportModal.vue`
- `src/components/HelloWorld.vue` (Delete)

**Total**: 29 files to modify/delete

### B. Before/After Examples

#### Before: Custom Button
```vue
<button
  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
>
  <Plus class="w-4 h-4 mr-2" />
  Create Work Order
</button>
```

#### After: Shadcn Button
```vue
<Button>
  <Plus class="w-4 h-4 mr-2" />
  Create Work Order
</Button>
```

---

#### Before: Custom Modal
```vue
<div class="fixed inset-0 z-50 overflow-y-auto">
  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75" @click="close"></div>
    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
      <!-- Content -->
    </div>
  </div>
</div>
```

#### After: Shadcn Dialog
```vue
<Dialog v-model:open="open">
  <DialogTrigger as-child>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <!-- Content -->
  </DialogContent>
</Dialog>
```

### C. CSS Variable Migration Guide

No changes needed - existing CSS variables in `src/style.css` are compatible with Shadcn Vue.

**Existing (Keep)**:
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... etc */
}
```

**Additional (Optional for status colors)**:
```css
:root {
  --success: oklch(0.7 0.15 145);
  --warning: oklch(0.75 0.15 85);
  --info: oklch(0.6 0.15 250);
}
```

---

## Version History
- **v1.0** (2025-01-18): Initial UI enhancement plan
- **Next**: Approved plan, begin Phase 1 implementation

## Status
**Current**: Planning Phase
**Next Action**: User approval → Begin Phase 1 (Foundation Setup)
