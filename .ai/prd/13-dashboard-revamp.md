# PRD: Dashboard Revamp with Shadcn Components

## Overview
**Purpose**: Revamp the CMMS dashboard to use modern Shadcn Vue components with responsive design, eliminate header duplication, and improve user experience
**Scope**: Complete redesign of dashboard layout, components, and responsive behavior
**Status**: Planning
**Priority**: High
**Inspiration**: [Shadcn Dashboard Example](https://ui.shadcn.com/examples/dashboard)

## Current State Analysis

### Existing Dashboard Structure
Based on code review of current dashboard implementation:

**Current Layout Issues:**
1. **Header Duplication**: Both `AppLayout.vue` and `Dashboard.vue` have headers
   - `AppLayout.vue:82-102`: Top bar with page title and notifications
   - `Dashboard.vue:4-18`: Dashboard header with user greeting and datetime
   - Creates redundant information and visual clutter

2. **Inconsistent Component Usage**: Mix of custom components and Shadcn components
   - Stats grid uses custom divs instead of `<Card />` components
   - Custom badge styling with object-based color mapping
   - Inconsistent spacing and layout patterns

3. **Limited Responsive Design**:
   - Basic responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`)
   - No mobile-first design considerations
   - Sidebar doesn't adapt well to smaller screens

4. **Component Structure Issues**:
   - Large monolithic dashboard component (342 lines)
   - Inline styling logic mixed with component code
   - No clear separation of concerns

### Current Component Inventory

**Dashboard Components:**
- `src/views/dashboard/Dashboard.vue` (342 lines) - Main dashboard
- `src/components/dashboard/KPICard.vue` - Stats cards (not currently used)
- `src/components/dashboard/NotificationAlerts.vue` - Priority notifications  
- `src/components/dashboard/QuickActionsPanel.vue` - Action buttons
- `src/components/layout/AppLayout.vue` (250 lines) - Main layout wrapper

**Shadcn Components Already Used:**
- ✅ `Button`, `Badge`, `Avatar`, `Select`, `Separator` in AppLayout
- ❌ No Shadcn components in Dashboard.vue (all custom divs)

## Goals & Objectives

### Primary Goals
1. ✅ **Eliminate Header Duplication**: Single, unified header across application
2. ✅ **Modern Component Library**: Replace all custom components with Shadcn Vue
3. ✅ **Responsive Design**: Mobile-first design that adapts to all screen sizes
4. ✅ **Component Architecture**: Modular, reusable dashboard components
5. ✅ **Performance**: Faster rendering with optimized component structure

### User Experience Goals
- **Consistent Interface**: Unified design language across all dashboard elements
- **Mobile Accessibility**: Full functionality on mobile devices (320px+)
- **Fast Navigation**: Quick access to key information and actions
- **Clear Hierarchy**: Logical information architecture and visual hierarchy
- **Reduced Cognitive Load**: Simplified interface with clear visual cues

### Technical Goals
- **Code Reduction**: 40% reduction in dashboard component complexity
- **Reusability**: Dashboard components usable across different views
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Faster initial render with lazy loading

## Design Specification

### Layout Structure
Inspired by [Shadcn Dashboard](https://ui.shadcn.com/examples/dashboard), implement:

```
┌─────────────────────────────────────────────────────────┐
│ Header (Single, unified across app)                     │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│ │ KPI     │ │ KPI     │ │ KPI     │ │ KPI     │         │
│ │ Card 1  │ │ Card 2  │ │ Card 3  │ │ Card 4  │         │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────────┐ ┌───────────────────────┐ │
│ │ Work Orders Overview      │ │ Quick Actions         │ │
│ │ - Recent/My Work Orders   │ │ - Create Work Order   │ │
│ │ - Status breakdown        │ │ - Generate Invoice    │ │
│ │ - Pending approvals       │ │ - View Reports        │ │
│ └───────────────────────────┘ └───────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────────┐ ┌───────────────────────┐ │
│ │ Performance Chart         │ │ Notifications & Alerts│ │
│ │ - Completion trends       │ │ - Low stock alerts    │ │
│ │ - Terminal performance    │ │ - Overdue items       │ │
│ └───────────────────────────┘ │ - Recent activity     │ │
│                               └───────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

**Mobile (320px - 767px):**
```
┌─────────────────┐
│ Header          │
├─────────────────┤
│ KPI Card 1      │
│ KPI Card 2      │
│ KPI Card 3      │
│ KPI Card 4      │
├─────────────────┤
│ Work Orders     │
├─────────────────┤
│ Quick Actions   │
├─────────────────┤
│ Notifications   │
├─────────────────┤
│ Performance     │
└─────────────────┘
```

**Tablet (768px - 1023px):**
```
┌─────────────────────────────┐
│ Header                      │
├─────────────────────────────┤
│ KPI 1    │ KPI 2    │ KPI 3 │
├─────────────────────────────┤
│ Work Orders      │ Actions  │
├─────────────────────────────┤
│ Performance      │ Alerts   │
└─────────────────────────────┘
```

**Desktop (1024px+):**
```
┌─────────────────────────────────────────┐
│ Header                                  │
├─────────────────────────────────────────┤
│ KPI1 │ KPI2 │ KPI3 │ KPI4               │
├─────────────────────────────────────────┤
│ Work Orders         │ Quick Actions     │
│                     │ Notifications     │
│                     │ Performance       │
└─────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Header Consolidation (Day 1)

**1.1 Remove Dashboard Header Duplication**
- Remove header section from `Dashboard.vue` (lines 4-18)
- Move user greeting to sidebar or welcome card
- Consolidate datetime display in main header

**Files Modified:**
- `src/views/dashboard/Dashboard.vue` - Remove duplicate header
- `src/components/layout/AppLayout.vue` - Enhance main header

**1.2 Enhanced Main Header**
```vue
<!-- AppLayout.vue: Enhanced header -->
<div class="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
  <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
    <div class="flex items-center space-x-4">
      <Button variant="ghost" size="icon" class="lg:hidden" @click="toggleSidebar">
        <Menu class="w-6 h-6" />
      </Button>
      <div>
        <h1 class="text-lg font-semibold">{{ currentPageTitle }}</h1>
        <p class="text-sm text-muted-foreground lg:hidden">{{ currentDateTime }}</p>
      </div>
    </div>
    
    <div class="flex items-center space-x-4">
      <div class="hidden lg:block text-sm text-muted-foreground">{{ currentDateTime }}</div>
      <NotificationCenter />
      <UserMenu />
    </div>
  </div>
</div>
```

### Phase 2: Shadcn Component Migration (Day 2-3)

**2.1 Install Required Shadcn Components**
```bash
npx shadcn-vue@latest add card tabs chart progress skeleton alert
```

**2.2 KPI Cards with Shadcn**
Replace stats grid with proper `<Card />` components:

```vue
<!-- New KPI Card Component -->
<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium">{{ title }}</CardTitle>
      <component :is="icon" class="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold">{{ value }}</div>
      <p class="text-xs text-muted-foreground">
        <span :class="changeColor">{{ change }}</span> from last month
      </p>
    </CardContent>
  </Card>
</template>
```

**2.3 Work Orders Section Enhancement**
```vue
<Card>
  <CardHeader>
    <CardTitle>{{ isWorker ? 'My Work Orders' : 'Recent Work Orders' }}</CardTitle>
    <CardDescription>Track and manage work order progress</CardDescription>
  </CardHeader>
  <CardContent>
    <div class="space-y-3">
      <div v-for="order in displayWorkOrders" :key="order.id" 
           class="flex items-center justify-between p-3 border rounded-md hover:bg-accent cursor-pointer"
           @click="navigateToOrder(order.id)">
        <div class="space-y-1">
          <p class="text-sm font-medium">{{ order.title }}</p>
          <div class="flex items-center space-x-2 text-xs text-muted-foreground">
            <Badge variant="outline">{{ order.type }}</Badge>
            <span>Terminal {{ order.terminalId?.slice(-1) }}</span>
            <span>Due: {{ formatDate(order.dueDate) }}</span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Badge :variant="getPriorityVariant(order.priority)">{{ order.priority }}</Badge>
          <Badge :variant="getStatusVariant(order.status)">{{ formatStatus(order.status) }}</Badge>
        </div>
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <Button variant="outline" class="w-full" as-child>
      <router-link to="/work-orders">View All Work Orders</router-link>
    </Button>
  </CardFooter>
</Card>
```

**Files Modified:**
- `src/views/dashboard/Dashboard.vue` - Complete Shadcn migration
- `src/components/dashboard/KPICard.vue` - Rewrite with Shadcn components

### Phase 3: Responsive Layout Implementation (Day 4-5)

**3.1 Mobile-First Grid System**
```vue
<template>
  <div class="space-y-6">
    <!-- KPI Cards - Responsive Grid -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard v-for="kpi in dashboardStats" :key="kpi.title" v-bind="kpi" />
    </div>
    
    <!-- Main Content - Responsive Layout -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- Work Orders - Full width on mobile, 2 cols on large screens -->
      <div class="md:col-span-2 lg:col-span-2">
        <WorkOrdersSection />
        <PendingApprovalsSection v-if="isSupervisor" />
      </div>
      
      <!-- Sidebar - Stack on mobile, sidebar on desktop -->
      <div class="space-y-6">
        <QuickActionsCard />
        <NotificationsCard />
        <LowStockAlertCard v-if="isAdmin" />
        <RecentActivityCard />
      </div>
    </div>
  </div>
</template>
```

**3.2 Component Modularization**
Break down large Dashboard.vue into focused components:

```
src/components/dashboard/
├── KPICard.vue (rewritten)
├── WorkOrdersSection.vue (new)
├── PendingApprovalsSection.vue (new) 
├── QuickActionsCard.vue (enhanced)
├── NotificationsCard.vue (new)
├── LowStockAlertCard.vue (new)
├── RecentActivityCard.vue (new)
└── PerformanceChart.vue (enhanced)
```

**Files Created:**
- `src/components/dashboard/WorkOrdersSection.vue`
- `src/components/dashboard/PendingApprovalsSection.vue`
- `src/components/dashboard/NotificationsCard.vue`
- `src/components/dashboard/LowStockAlertCard.vue`
- `src/components/dashboard/RecentActivityCard.vue`

### Phase 4: Performance & Polish (Day 6-7)

**4.1 Lazy Loading & Performance**
```vue
<script setup lang="ts">
// Lazy load heavy components
const PerformanceChart = defineAsyncComponent(() => 
  import('@/components/dashboard/PerformanceChart.vue')
)

// Skeleton loading states
const isLoading = ref(true)

onMounted(async () => {
  try {
    await Promise.all([
      workOrderStore.fetchWorkOrders(),
      inventoryStore.fetchInventoryItems(),
      dashboardStore.refreshDashboard()
    ])
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div v-if="isLoading" class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Skeleton v-for="i in 4" :key="i" class="h-[120px]" />
    </div>
    <div class="grid gap-6 md:grid-cols-3">
      <Skeleton class="md:col-span-2 h-[400px]" />
      <Skeleton class="h-[400px]" />
    </div>
  </div>
  
  <DashboardContent v-else />
</template>
```

**4.2 Accessibility Enhancements**
```vue
<!-- Screen reader friendly cards -->
<Card role="region" :aria-label="`${title} metric card`">
  <CardHeader>
    <CardTitle class="text-sm font-medium">
      <span class="sr-only">{{ title }} metric: </span>{{ title }}
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div class="text-2xl font-bold" :aria-label="`Current value: ${value}`">{{ value }}</div>
    <p class="text-xs text-muted-foreground">
      <span class="sr-only">{{ changeType === 'increase' ? 'Increased' : 'Decreased' }} by </span>
      <span :class="changeColor">{{ change }}</span>
      <span class="sr-only"> compared to </span> from last month
    </p>
  </CardContent>
</Card>

<!-- Keyboard navigation for work orders -->
<div 
  v-for="(order, index) in displayWorkOrders" 
  :key="order.id"
  class="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
  :tabindex="0"
  role="button"
  :aria-label="`Work order ${order.title}, ${order.status}, priority ${order.priority}`"
  @click="navigateToOrder(order.id)"
  @keydown.enter="navigateToOrder(order.id)"
  @keydown.space.prevent="navigateToOrder(order.id)"
>
```

**Files Modified:**
- All dashboard components - Add accessibility attributes
- `src/views/dashboard/Dashboard.vue` - Add loading states and lazy loading

## Component API Specifications

### KPICard Component
```typescript
interface KPICardProps {
  title: string
  value: string | number
  change: string
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: Component
  description?: string
}
```

### WorkOrdersSection Component  
```typescript
interface WorkOrdersSectionProps {
  isWorker: boolean
  workOrders: WorkOrder[]
  maxItems?: number
}
```

### Badge Variants Mapping
```typescript
const statusVariants: Record<WorkOrderStatus, BadgeVariant> = {
  draft: 'secondary',
  pending_approval: 'warning', 
  assigned: 'default',
  in_progress: 'default',
  submitted_for_review: 'warning',
  completed: 'success',
  rejected: 'destructive',
  revision_required: 'destructive'
}

const priorityVariants: Record<Priority, BadgeVariant> = {
  low: 'secondary',
  normal: 'default', 
  high: 'warning',
  urgent: 'destructive'
}
```

## Mobile Design Considerations

### Mobile Navigation
- **Collapsible sidebar**: Touch-friendly toggle button
- **Bottom navigation**: Consider adding bottom nav for key actions on mobile
- **Gesture support**: Swipe gestures for sidebar and cards

### Mobile Cards
```vue
<!-- Mobile-optimized KPI cards -->
<Card class="p-4 space-y-3"> <!-- Larger padding on mobile -->
  <CardHeader class="pb-2">
    <div class="flex items-center justify-between">
      <CardTitle class="text-base">{{ title }}</CardTitle> <!-- Larger text -->
      <component :is="icon" class="h-5 w-5 text-muted-foreground" />
    </div>
  </CardHeader>
  <CardContent class="space-y-2">
    <div class="text-3xl font-bold">{{ value }}</div> <!-- Larger value -->
    <p class="text-sm text-muted-foreground">{{ change }} from last month</p>
  </CardContent>
</Card>
```

### Mobile Work Orders
```vue
<!-- Mobile-friendly work order list -->
<div class="space-y-3">
  <Card v-for="order in workOrders" :key="order.id" class="p-4">
    <div class="space-y-3">
      <div class="flex items-start justify-between">
        <div class="space-y-1 flex-1 min-w-0">
          <h4 class="font-medium truncate">{{ order.title }}</h4>
          <p class="text-sm text-muted-foreground">Terminal {{ order.terminalId?.slice(-1) }}</p>
        </div>
        <Badge :variant="getStatusVariant(order.status)" class="ml-2">
          {{ formatStatus(order.status) }}
        </Badge>
      </div>
      
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <Badge variant="outline">{{ order.type }}</Badge>
          <Badge :variant="getPriorityVariant(order.priority)">{{ order.priority }}</Badge>
        </div>
        <span class="text-xs text-muted-foreground">{{ formatDate(order.dueDate) }}</span>
      </div>
      
      <Button variant="outline" size="sm" class="w-full">View Details</Button>
    </div>
  </Card>
</div>
```

## Testing Strategy

### Responsive Testing
```bash
# Test breakpoints
- 320px (mobile small)
- 375px (mobile medium) 
- 768px (tablet)
- 1024px (desktop small)
- 1440px (desktop large)
- 1920px (desktop extra large)
```

### Performance Testing
- **Initial Load**: < 2 seconds on 3G
- **Component Render**: < 100ms per card
- **Data Refresh**: < 500ms for API calls
- **Memory Usage**: < 50MB for dashboard

### Accessibility Testing
- [ ] Screen reader navigation (NVDA, JAWS, VoiceOver)
- [ ] Keyboard-only navigation
- [ ] Color contrast validation (4.5:1 minimum)
- [ ] Focus indicators visible
- [ ] Touch targets ≥ 44px
- [ ] Form labels properly associated

## Success Metrics

### Technical Metrics
- [ ] **Code Reduction**: 40% reduction in dashboard component lines
- [ ] **Component Reuse**: All cards reusable across dashboard variants  
- [ ] **Performance**: Lighthouse score > 90
- [ ] **Bundle Size**: < 10KB increase from Shadcn components
- [ ] **Accessibility**: Zero axe-core violations

### User Experience Metrics  
- [ ] **Mobile Usability**: All features accessible on 320px screens
- [ ] **Navigation Speed**: < 3 clicks to reach any dashboard action
- [ ] **Visual Consistency**: Consistent spacing, typography, and colors
- [ ] **Loading Experience**: Skeleton states for all async content
- [ ] **Error Handling**: Graceful fallbacks for failed API calls

### Business Metrics
- [ ] **Task Completion**: Users can complete primary tasks on mobile
- [ ] **Information Discovery**: Key metrics visible without scrolling on desktop
- [ ] **Action Conversion**: Quick actions easily accessible
- [ ] **Error Reduction**: Fewer user errors due to improved UI clarity

## Migration Risks & Mitigation

### Risk 1: Breaking Changes During Component Migration
**Likelihood**: Medium  
**Impact**: High

**Mitigation**:
- Migrate one section at a time (KPI cards → Work Orders → Sidebar)
- Keep old components as fallbacks until migration complete
- Extensive testing after each migration phase
- Feature flag new components during transition

### Risk 2: Mobile Layout Performance
**Likelihood**: Low  
**Impact**: Medium

**Mitigation**:
- Lazy load non-critical components
- Use CSS containment for layout performance
- Optimize images and icons with proper sizing
- Test on low-end devices

### Risk 3: User Confusion from Layout Changes
**Likelihood**: Medium  
**Impact**: Low

**Mitigation**:
- Maintain familiar information hierarchy
- Keep existing color coding for status/priority
- Add subtle animations for smooth transitions
- Document changes in release notes

## Dependencies & Prerequisites

### Shadcn Components Required
```bash
npx shadcn-vue@latest add card badge button tabs chart progress skeleton alert separator avatar
```

### Development Dependencies
- Vue 3.5+ (already installed ✅)
- Tailwind CSS v4 (already installed ✅)
- TypeScript (already installed ✅)
- Vite (already installed ✅)

### Browser Support
- Chrome/Edge 90+
- Firefox 88+  
- Safari 14+
- Mobile Safari 14+
- Chrome Mobile 90+

## Timeline & Deliverables

### Week 1: Foundation & Header (Days 1-2)
**Day 1:**
- [ ] Remove header duplication
- [ ] Enhance main header component
- [ ] Update navigation logic

**Day 2:**  
- [ ] Install required Shadcn components
- [ ] Migrate KPI cards to Shadcn
- [ ] Test responsive grid system

**Deliverables**: Clean header, Shadcn KPI cards

### Week 2: Component Migration (Days 3-5)
**Day 3:**
- [ ] Migrate work orders section
- [ ] Create work orders card component
- [ ] Add proper badges and status indicators

**Day 4:**
- [ ] Migrate sidebar components
- [ ] Create notification cards
- [ ] Implement quick actions card

**Day 5:**
- [ ] Create pending approvals component
- [ ] Implement low stock alerts
- [ ] Create recent activity component

**Deliverables**: All dashboard sections using Shadcn components

### Week 3: Polish & Performance (Days 6-7)
**Day 6:**
- [ ] Implement responsive design
- [ ] Add mobile optimizations
- [ ] Test all breakpoints

**Day 7:**
- [ ] Add loading states and skeletons
- [ ] Implement accessibility features
- [ ] Performance optimization
- [ ] Final testing

**Deliverables**: Production-ready responsive dashboard

## Open Questions

### Technical Decisions
1. **Chart Library**: Use Shadcn Charts or keep current chart implementation?
   - **Recommendation**: Start with current, migrate to Shadcn Charts in Phase 2

2. **Animation Library**: Use Framer Motion or CSS animations?
   - **Recommendation**: CSS animations for performance, Framer Motion for complex interactions

3. **State Management**: Keep current Pinia setup or add dashboard-specific composables?
   - **Recommendation**: Keep Pinia, add dashboard-specific composables for UI state

### Design Decisions  
1. **Color Scheme**: Adjust to match Shadcn defaults or keep current brand colors?
   - **Decision Needed**: Review with stakeholders

2. **Card Density**: How much information per card on mobile?
   - **Recommendation**: Maximum 3 data points per mobile card

3. **Navigation**: Add bottom navigation for mobile or keep sidebar only?
   - **Decision Needed**: User testing required

### Process Questions
1. **Rollout Strategy**: Gradual rollout or all-at-once replacement?
   - **Recommendation**: Gradual rollout with feature flag

2. **User Feedback**: How to collect feedback during migration?
   - **Recommendation**: Add feedback button to new dashboard

## Appendix

### A. Current vs. New Component Mapping

| Current Implementation | New Shadcn Component | Status |
|----------------------|---------------------|---------|
| Custom stats divs | `<Card><CardHeader><CardContent>` | ✅ Planned |
| Custom badges | `<Badge variant="...">` | ✅ Planned |  
| Custom buttons | `<Button variant="...">` | ✅ Already used |
| Custom modal | `<Dialog><DialogContent>` | ✅ Planned |
| Custom table | `<Table><TableHeader><TableBody>` | ✅ Future |
| Custom loading | `<Skeleton>` | ✅ Planned |

### B. Mobile Breakpoint Specifications

```css
/* Mobile First Approach */
.dashboard-grid {
  /* Base: Mobile (320px+) */
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  /* Small tablet */
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  /* Tablet */
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  /* Desktop */
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr) 300px;
    gap: 2rem;
  }
}
```

### C. Component File Structure

```
src/
├── views/
│   └── dashboard/
│       └── Dashboard.vue (simplified, orchestrator)
├── components/
│   ├── layout/
│   │   └── AppLayout.vue (enhanced header)
│   └── dashboard/
│       ├── KPICard.vue (rewritten)
│       ├── WorkOrdersSection.vue (new)
│       ├── PendingApprovalsSection.vue (new)
│       ├── QuickActionsCard.vue (enhanced)
│       ├── NotificationsCard.vue (new)
│       ├── LowStockAlertCard.vue (new)
│       ├── RecentActivityCard.vue (new)
│       └── PerformanceChart.vue (enhanced)
```

---

## Status
**Current**: Planning Complete  
**Next Action**: Begin Phase 1 Implementation  
**Target Completion**: 2 weeks from start date

## Version History
- **v1.0** (Current): Initial dashboard revamp planning
- **Next**: Implementation Phase 1