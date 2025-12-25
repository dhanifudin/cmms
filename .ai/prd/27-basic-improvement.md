# PRD-27: Enterprise CMMS Basic Improvements - Phase 1

**Document Version:** 1.0
**Date:** December 25, 2024
**Status:** Planned

## Overview

This document outlines Phase 1 of enterprise CMMS improvements, focusing on critical integration fixes and foundational enterprise features. These improvements address production blockers and establish the groundwork for enterprise-grade maintenance management.

## Business Requirements

### Problem Statement
The current CMMS implementation is 85% complete with excellent architectural foundation, but several critical integration points prevent production deployment:
1. Photo documentation is not persisted (memory-only storage)
2. Audit trails use hardcoded user IDs instead of actual authenticated users
3. Material consumption is not integrated with inventory management
4. No offline capability for field workers in remote terminals
5. No asset registry for equipment tracking
6. No SLA management for service level compliance

### Solution Overview
Implement foundational enterprise features in 4 priority areas:
1. **Critical Integration Fixes** - Production blockers
2. **Offline PWA Capability** - Field worker support
3. **Basic Asset Management** - Equipment tracking foundation
4. **SLA Management** - Service level compliance

---

## Implementation Scope

### 1. Critical Integration Fixes

#### 1.1 Photo Upload Service Integration
**Status**: Frontend Complete, Server Integration Missing
**Impact**: HIGH - Workers cannot complete documentation workflow

**Current State**:
- UI fully implemented in `DocumentationModal.vue`
- File validation (type, 10MB limit) working
- Camera capture support (`capture="environment"`) working
- Preview grid with captions working
- Photos only stored as `URL.createObjectURL()` (memory only)
- No server upload or persistence

**Required Implementation**:
```typescript
// src/services/uploadService.ts
export interface UploadService {
  uploadPhoto(file: File, metadata: PhotoMetadata): Promise<UploadedPhoto>;
  uploadPhotos(files: File[], metadata: PhotoMetadata): Promise<UploadedPhoto[]>;
  getPhotoUrl(photoId: string): string;
  deletePhoto(photoId: string): Promise<void>;
}

interface PhotoMetadata {
  workOrderId: string;
  submissionType: 'before' | 'after';
  caption?: string;
  timestamp: Date;
  userId: string;
}

interface UploadedPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  originalFilename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}
```

**Files to Modify**:
- `src/components/workorder/DocumentationModal.vue` (lines 414-470)
- `src/stores/workorder.ts` - Add photo upload service integration
- **New**: `src/services/uploadService.ts` - File upload service

**Mock Implementation Strategy**:
For prototype purposes, implement localStorage-based persistence with Base64 encoding:
- Store photo metadata in localStorage
- Store compressed thumbnails (max 100KB each)
- Full photos stored as Base64 in IndexedDB
- Clear old photos after 30 days

#### 1.2 Authentication System Integration
**Status**: Critical System Integrity Issue
**Impact**: HIGH - Multi-user system cannot function properly

**Found Issues** (5+ instances of hardcoded `'current-user'`):
```typescript
// Files requiring changes:
src/stores/template.ts:328     - createdBy: 'current-user'
src/stores/template.ts:1277    - approvedBy: 'current-user'
src/stores/category.ts:310     - createdBy: 'current-user'
src/stores/category.ts:585     - exportedBy: 'current-user'
src/stores/message.ts          - sender/receiver assignments
```

**Required Fix**:
```typescript
// Replace all instances:
// OLD: createdBy: 'current-user'
// NEW: createdBy: authStore.currentUser?.id || 'system'

// Create utility function:
// src/utils/auth.ts
export function getCurrentUserId(): string {
  const authStore = useAuthStore();
  return authStore.currentUser?.id || 'system';
}

export function getCurrentUserName(): string {
  const authStore = useAuthStore();
  return authStore.currentUser?.name || 'System';
}
```

**Files to Modify**:
- `src/stores/template.ts` - 2 locations
- `src/stores/category.ts` - 2 locations
- `src/stores/message.ts` - Multiple locations
- **New**: `src/utils/auth.ts` - Auth utility functions

#### 1.3 Material Consumption Integration
**Status**: Data Flow Broken
**Impact**: MEDIUM-HIGH - Inventory tracking inaccurate

**Current State**:
- Work orders specify material requirements
- Inventory exists with stock tracking
- No automatic stock deduction on work order completion
- Invoice material costs calculated but stock not updated

**Required Implementation**:
```typescript
// src/stores/workorder.ts - Enhanced submitDocumentation
const submitDocumentation = async (
  workOrderId: string,
  submissionData: DocumentationSubmission
) => {
  // ... existing validation ...

  // NEW: When submitting 'after' documentation, deduct materials
  if (submissionData.type === 'after') {
    const workOrder = workOrders.value.find(wo => wo.id === workOrderId);
    if (workOrder?.materialRequirements) {
      const inventoryStore = useInventoryStore();

      for (const material of workOrder.materialRequirements) {
        await inventoryStore.createStockMovement({
          itemId: material.itemId,
          type: 'consumption',
          quantity: -material.actualUsed || -material.quantity,
          reason: `Work Order ${workOrder.code} completion`,
          referenceId: workOrderId,
          referenceType: 'work_order',
          performedBy: getCurrentUserId()
        });
      }
    }
  }

  // ... existing submission logic ...
};
```

**Files to Modify**:
- `src/stores/workorder.ts` - submitDocumentation method
- `src/stores/inventory.ts` - Ensure createStockMovement handles work order references

---

### 2. Offline PWA Capability

#### 2.1 Service Worker Implementation
**Purpose**: Enable field workers to capture photos and complete checklists offline

**Core Features**:
- Offline work order viewing (cached assigned work orders)
- Offline photo capture with local queue
- Offline checklist completion
- Background sync when connectivity restored
- Conflict resolution for concurrent edits

**Technical Implementation**:
```typescript
// vite.config.ts - Add PWA plugin
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.cmms\..*\/workorders/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'workorder-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 }
            }
          }
        ]
      },
      manifest: {
        name: 'CMMS - Maintenance Management',
        short_name: 'CMMS',
        theme_color: '#1e40af',
        icons: [/* icon definitions */]
      }
    })
  ]
});
```

#### 2.2 Offline Data Store
```typescript
// src/stores/offline.ts
export const useOfflineStore = defineStore('offline', () => {
  // Pending uploads queue
  const pendingUploads = ref<PendingUpload[]>([]);

  // Offline work orders cache
  const cachedWorkOrders = ref<WorkOrder[]>([]);

  // Sync status
  const syncStatus = ref<'synced' | 'pending' | 'syncing' | 'error'>('synced');
  const lastSyncTime = ref<Date | null>(null);

  // Queue management
  const addToPendingQueue = (item: PendingUpload) => {
    pendingUploads.value.push(item);
    persistQueue();
  };

  const processPendingQueue = async () => {
    if (!navigator.onLine) return;

    syncStatus.value = 'syncing';
    for (const item of pendingUploads.value) {
      try {
        await processUpload(item);
        removeFromQueue(item.id);
      } catch (error) {
        item.retryCount++;
        if (item.retryCount > 3) {
          item.status = 'failed';
        }
      }
    }
    syncStatus.value = pendingUploads.value.length > 0 ? 'pending' : 'synced';
    lastSyncTime.value = new Date();
  };

  return {
    pendingUploads,
    cachedWorkOrders,
    syncStatus,
    lastSyncTime,
    addToPendingQueue,
    processPendingQueue
  };
});

interface PendingUpload {
  id: string;
  type: 'photo' | 'checklist' | 'documentation';
  workOrderId: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed';
}
```

#### 2.3 Offline UI Indicators
```vue
<!-- src/components/layout/OfflineIndicator.vue -->
<template>
  <Transition name="slide-down">
    <div
      v-if="!isOnline || hasPendingSync"
      class="fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm"
      :class="indicatorClass"
    >
      <div class="flex items-center justify-center gap-2">
        <component :is="statusIcon" class="h-4 w-4" />
        <span>{{ statusMessage }}</span>
        <Button
          v-if="hasPendingSync && isOnline"
          size="sm"
          variant="ghost"
          @click="syncNow"
        >
          Sync Now
        </Button>
      </div>
    </div>
  </Transition>
</template>
```

**Files to Create**:
- `src/stores/offline.ts` - Offline data management
- `src/components/layout/OfflineIndicator.vue` - Sync status UI
- `src/composables/useOfflineSync.ts` - Sync logic composable
- Update `vite.config.ts` - PWA configuration

---

### 3. Basic Asset Management Module

#### 3.1 Asset Data Model
```typescript
// src/types/asset.ts
export interface Asset {
  id: string;
  code: string;                    // Unique asset code (e.g., "GC-JKT-001")
  name: string;
  description?: string;

  // Classification
  category: AssetCategory;
  type: AssetType;
  criticality: 'critical' | 'important' | 'standard' | 'low';

  // Location
  terminalId: string;
  regionId: string;
  location: string;                // Physical location within terminal

  // Specifications
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  specifications?: Record<string, string>;

  // Lifecycle
  status: AssetStatus;
  acquisitionDate?: Date;
  warrantyExpiration?: Date;
  expectedLifeYears?: number;

  // Maintenance
  lastMaintenanceDate?: Date;
  nextScheduledMaintenance?: Date;
  maintenanceFrequency?: MaintenanceFrequency;

  // Metrics
  mtbf?: number;                   // Mean Time Between Failures (hours)
  mttr?: number;                   // Mean Time To Repair (hours)
  totalDowntime?: number;          // Total downtime (hours)

  // Cost tracking
  acquisitionCost?: number;
  currentValue?: number;
  totalMaintenanceCost?: number;

  // Relationships
  parentAssetId?: string;          // For hierarchical equipment
  linkedWorkOrderIds?: string[];
  linkedSparePartIds?: string[];

  // Documents
  manualUrl?: string;
  photoUrl?: string;
  qrCode?: string;

  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export type AssetStatus =
  | 'operational'
  | 'under_maintenance'
  | 'out_of_service'
  | 'decommissioned'
  | 'pending_installation';

export type AssetCategory =
  | 'pump'
  | 'compressor'
  | 'pipeline'
  | 'valve'
  | 'tank'
  | 'generator'
  | 'electrical'
  | 'instrumentation'
  | 'safety_system'
  | 'other';

export interface MaintenanceFrequency {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  interval?: number;
  unit?: 'days' | 'weeks' | 'months' | 'hours';
}
```

#### 3.2 Asset Store
```typescript
// src/stores/asset.ts
export const useAssetStore = defineStore('asset', () => {
  // State
  const assets = ref<Asset[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Filters
  const filters = ref<AssetFilters>({
    search: '',
    category: null,
    status: null,
    criticality: null,
    terminalId: null,
    regionId: null
  });

  // Pagination
  const pagination = ref<PaginationState>({
    currentPage: 1,
    pageSize: 25,
    totalItems: 0
  });

  // Computed
  const filteredAssets = computed(() => {
    return assets.value.filter(asset => {
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase();
        const matchesSearch =
          asset.name.toLowerCase().includes(search) ||
          asset.code.toLowerCase().includes(search) ||
          asset.serialNumber?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      if (filters.value.category && asset.category !== filters.value.category) return false;
      if (filters.value.status && asset.status !== filters.value.status) return false;
      if (filters.value.criticality && asset.criticality !== filters.value.criticality) return false;
      if (filters.value.terminalId && asset.terminalId !== filters.value.terminalId) return false;
      if (filters.value.regionId && asset.regionId !== filters.value.regionId) return false;

      return true;
    });
  });

  const paginatedAssets = computed(() => {
    const start = (pagination.value.currentPage - 1) * pagination.value.pageSize;
    const end = start + pagination.value.pageSize;
    return filteredAssets.value.slice(start, end);
  });

  const assetsByTerminal = computed(() => {
    return groupBy(assets.value, 'terminalId');
  });

  const criticalAssets = computed(() => {
    return assets.value.filter(a => a.criticality === 'critical');
  });

  const assetsNeedingMaintenance = computed(() => {
    const now = new Date();
    return assets.value.filter(asset => {
      if (!asset.nextScheduledMaintenance) return false;
      return new Date(asset.nextScheduledMaintenance) <= now;
    });
  });

  // Actions
  const createAsset = async (data: Partial<Asset>): Promise<Asset> => {
    const newAsset: Asset = {
      id: generateId(),
      code: generateAssetCode(data.category!, data.terminalId!),
      ...data,
      status: 'operational',
      createdAt: new Date(),
      createdBy: getCurrentUserId(),
      updatedAt: new Date(),
      updatedBy: getCurrentUserId()
    } as Asset;

    assets.value.push(newAsset);
    return newAsset;
  };

  const updateAsset = async (id: string, updates: Partial<Asset>): Promise<Asset> => {
    const index = assets.value.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Asset not found');

    assets.value[index] = {
      ...assets.value[index],
      ...updates,
      updatedAt: new Date(),
      updatedBy: getCurrentUserId()
    };

    return assets.value[index];
  };

  const linkWorkOrder = async (assetId: string, workOrderId: string) => {
    const asset = assets.value.find(a => a.id === assetId);
    if (!asset) throw new Error('Asset not found');

    if (!asset.linkedWorkOrderIds) asset.linkedWorkOrderIds = [];
    if (!asset.linkedWorkOrderIds.includes(workOrderId)) {
      asset.linkedWorkOrderIds.push(workOrderId);
    }
  };

  const recordMaintenance = async (assetId: string, maintenanceData: MaintenanceRecord) => {
    const asset = assets.value.find(a => a.id === assetId);
    if (!asset) throw new Error('Asset not found');

    asset.lastMaintenanceDate = maintenanceData.completedAt;
    asset.totalMaintenanceCost = (asset.totalMaintenanceCost || 0) + maintenanceData.cost;

    // Calculate next maintenance date based on frequency
    if (asset.maintenanceFrequency) {
      asset.nextScheduledMaintenance = calculateNextMaintenance(
        maintenanceData.completedAt,
        asset.maintenanceFrequency
      );
    }
  };

  const getAssetMetrics = (assetId: string): AssetMetrics => {
    const asset = assets.value.find(a => a.id === assetId);
    if (!asset) throw new Error('Asset not found');

    return {
      mtbf: asset.mtbf || 0,
      mttr: asset.mttr || 0,
      availability: calculateAvailability(asset),
      totalWorkOrders: asset.linkedWorkOrderIds?.length || 0,
      totalMaintenanceCost: asset.totalMaintenanceCost || 0,
      healthScore: calculateHealthScore(asset)
    };
  };

  return {
    assets,
    loading,
    error,
    filters,
    pagination,
    filteredAssets,
    paginatedAssets,
    assetsByTerminal,
    criticalAssets,
    assetsNeedingMaintenance,
    createAsset,
    updateAsset,
    linkWorkOrder,
    recordMaintenance,
    getAssetMetrics
  };
});
```

#### 3.3 Asset Views
**Files to Create**:
- `src/views/assets/AssetList.vue` - Asset registry with filtering
- `src/views/assets/AssetDetail.vue` - Asset details with maintenance history
- `src/views/assets/AssetCreate.vue` - Asset creation form
- `src/components/asset/AssetCard.vue` - Asset summary card
- `src/components/asset/AssetMetrics.vue` - Asset health metrics
- `src/components/asset/AssetTree.vue` - Hierarchical asset view

#### 3.4 Asset-Work Order Integration
```typescript
// Enhanced WorkOrder interface
interface WorkOrder {
  // ... existing fields ...

  // NEW: Asset linkage
  assetId?: string;
  assetCode?: string;
  assetName?: string;
}

// When creating work order, link to asset
const createWorkOrder = async (data: CreateWorkOrderForm) => {
  // ... existing logic ...

  if (data.assetId) {
    const assetStore = useAssetStore();
    await assetStore.linkWorkOrder(data.assetId, newWorkOrder.id);
  }
};
```

---

### 4. SLA Management

#### 4.1 SLA Data Model
```typescript
// src/types/sla.ts
export interface SLARule {
  id: string;
  name: string;
  description?: string;

  // Scope
  scope: SLAScope;
  terminalIds?: string[];
  regionIds?: string[];
  categoryIds?: string[];
  assetCriticalities?: ('critical' | 'important' | 'standard' | 'low')[];
  priorities?: Priority[];

  // Timing
  responseTimeMinutes: number;      // Max time to assign worker
  resolutionTimeMinutes: number;    // Max time to complete work order

  // Business hours
  useBusinessHours: boolean;
  businessHours?: BusinessHours;

  // Escalation
  escalationRules: EscalationRule[];

  // Status
  isActive: boolean;

  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

export type SLAScope = 'global' | 'regional' | 'terminal' | 'category' | 'custom';

export interface EscalationRule {
  id: string;
  level: number;                    // 1, 2, 3...
  triggerAfterMinutes: number;      // Minutes after SLA breach
  notifyRoles: UserRole[];
  notifyUserIds?: string[];
  autoReassign: boolean;
  reassignToRole?: UserRole;
}

export interface BusinessHours {
  timezone: string;
  schedule: WeeklySchedule;
  holidays: Date[];
}

export interface WeeklySchedule {
  monday: DaySchedule | null;
  tuesday: DaySchedule | null;
  wednesday: DaySchedule | null;
  thursday: DaySchedule | null;
  friday: DaySchedule | null;
  saturday: DaySchedule | null;
  sunday: DaySchedule | null;
}

export interface DaySchedule {
  startTime: string;  // "08:00"
  endTime: string;    // "17:00"
}

// SLA Status tracking per work order
export interface SLAStatus {
  workOrderId: string;
  ruleId: string;
  ruleName: string;

  // Response tracking
  responseDeadline: Date;
  respondedAt?: Date;
  responseBreached: boolean;

  // Resolution tracking
  resolutionDeadline: Date;
  resolvedAt?: Date;
  resolutionBreached: boolean;

  // Escalation tracking
  currentEscalationLevel: number;
  escalationHistory: EscalationEvent[];

  // Metrics
  responseTimeMinutes?: number;
  resolutionTimeMinutes?: number;
}

export interface EscalationEvent {
  level: number;
  triggeredAt: Date;
  notifiedUsers: string[];
  autoReassigned: boolean;
  reassignedTo?: string;
}
```

#### 4.2 SLA Store
```typescript
// src/stores/sla.ts
export const useSLAStore = defineStore('sla', () => {
  // State
  const rules = ref<SLARule[]>([]);
  const workOrderSLAStatuses = ref<Map<string, SLAStatus>>(new Map());

  // Computed
  const activeRules = computed(() => rules.value.filter(r => r.isActive));

  const breachedWorkOrders = computed(() => {
    return Array.from(workOrderSLAStatuses.value.values())
      .filter(s => s.responseBreached || s.resolutionBreached);
  });

  const atRiskWorkOrders = computed(() => {
    const now = new Date();
    const warningThreshold = 30; // minutes before deadline

    return Array.from(workOrderSLAStatuses.value.values())
      .filter(s => {
        if (s.responseBreached || s.resolutionBreached) return false;

        const responseRisk = !s.respondedAt &&
          differenceInMinutes(s.responseDeadline, now) <= warningThreshold;
        const resolutionRisk = !s.resolvedAt &&
          differenceInMinutes(s.resolutionDeadline, now) <= warningThreshold;

        return responseRisk || resolutionRisk;
      });
  });

  // Actions
  const findApplicableRule = (workOrder: WorkOrder): SLARule | null => {
    // Priority: Custom > Terminal > Regional > Category > Global
    const applicableRules = activeRules.value.filter(rule => {
      if (rule.priorities && !rule.priorities.includes(workOrder.priority)) return false;
      if (rule.terminalIds && !rule.terminalIds.includes(workOrder.terminalId)) return false;
      if (rule.regionIds && !rule.regionIds.includes(workOrder.regionId)) return false;
      if (rule.categoryIds && !rule.categoryIds.includes(workOrder.categoryId)) return false;
      return true;
    });

    // Return most specific rule
    return applicableRules.sort((a, b) => {
      const scopePriority = { custom: 5, terminal: 4, category: 3, regional: 2, global: 1 };
      return scopePriority[b.scope] - scopePriority[a.scope];
    })[0] || null;
  };

  const initializeSLA = async (workOrder: WorkOrder): Promise<SLAStatus | null> => {
    const rule = findApplicableRule(workOrder);
    if (!rule) return null;

    const now = new Date();
    const responseDeadline = addMinutes(now, rule.responseTimeMinutes);
    const resolutionDeadline = addMinutes(now, rule.resolutionTimeMinutes);

    const status: SLAStatus = {
      workOrderId: workOrder.id,
      ruleId: rule.id,
      ruleName: rule.name,
      responseDeadline,
      resolutionDeadline,
      responseBreached: false,
      resolutionBreached: false,
      currentEscalationLevel: 0,
      escalationHistory: []
    };

    workOrderSLAStatuses.value.set(workOrder.id, status);
    return status;
  };

  const recordResponse = async (workOrderId: string) => {
    const status = workOrderSLAStatuses.value.get(workOrderId);
    if (!status) return;

    const now = new Date();
    status.respondedAt = now;
    status.responseBreached = now > status.responseDeadline;
    status.responseTimeMinutes = differenceInMinutes(now,
      new Date(status.responseDeadline.getTime() - status.responseTimeMinutes! * 60000)
    );
  };

  const recordResolution = async (workOrderId: string) => {
    const status = workOrderSLAStatuses.value.get(workOrderId);
    if (!status) return;

    const now = new Date();
    status.resolvedAt = now;
    status.resolutionBreached = now > status.resolutionDeadline;
  };

  const checkEscalations = async () => {
    const now = new Date();

    for (const [workOrderId, status] of workOrderSLAStatuses.value) {
      if (status.resolvedAt) continue; // Already resolved

      const rule = rules.value.find(r => r.id === status.ruleId);
      if (!rule) continue;

      for (const escalation of rule.escalationRules) {
        if (escalation.level <= status.currentEscalationLevel) continue;

        const shouldEscalate =
          (!status.respondedAt &&
           differenceInMinutes(now, status.responseDeadline) >= escalation.triggerAfterMinutes) ||
          differenceInMinutes(now, status.resolutionDeadline) >= escalation.triggerAfterMinutes;

        if (shouldEscalate) {
          await triggerEscalation(workOrderId, escalation);
          status.currentEscalationLevel = escalation.level;
        }
      }
    }
  };

  const triggerEscalation = async (workOrderId: string, rule: EscalationRule) => {
    const notificationStore = useNotificationStore();
    const workOrderStore = useWorkOrderStore();

    // Send notifications
    for (const role of rule.notifyRoles) {
      await notificationStore.sendRoleNotification(role, {
        type: 'sla_escalation',
        title: 'SLA Escalation Alert',
        message: `Work order requires attention - Level ${rule.level} escalation`,
        workOrderId,
        priority: 'high'
      });
    }

    // Auto-reassign if configured
    if (rule.autoReassign && rule.reassignToRole) {
      await workOrderStore.escalateWorkOrder(workOrderId, rule.reassignToRole);
    }

    // Record escalation event
    const status = workOrderSLAStatuses.value.get(workOrderId);
    if (status) {
      status.escalationHistory.push({
        level: rule.level,
        triggeredAt: new Date(),
        notifiedUsers: rule.notifyUserIds || [],
        autoReassigned: rule.autoReassign,
        reassignedTo: rule.autoReassign ? rule.reassignToRole : undefined
      });
    }
  };

  // Start escalation checker (runs every minute)
  const startEscalationMonitor = () => {
    setInterval(checkEscalations, 60000);
  };

  return {
    rules,
    workOrderSLAStatuses,
    activeRules,
    breachedWorkOrders,
    atRiskWorkOrders,
    findApplicableRule,
    initializeSLA,
    recordResponse,
    recordResolution,
    checkEscalations,
    startEscalationMonitor
  };
});
```

#### 4.3 SLA Dashboard Component
```vue
<!-- src/components/sla/SLADashboard.vue -->
<template>
  <div class="grid gap-4 md:grid-cols-4">
    <!-- SLA Compliance Rate -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium">SLA Compliance</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold" :class="complianceColor">
          {{ complianceRate }}%
        </div>
        <p class="text-xs text-muted-foreground">
          Last 30 days
        </p>
      </CardContent>
    </Card>

    <!-- Breached Work Orders -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-destructive">
          Breached
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-destructive">
          {{ breachedCount }}
        </div>
        <p class="text-xs text-muted-foreground">
          Requiring attention
        </p>
      </CardContent>
    </Card>

    <!-- At Risk Work Orders -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-warning">
          At Risk
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-warning">
          {{ atRiskCount }}
        </div>
        <p class="text-xs text-muted-foreground">
          Approaching deadline
        </p>
      </CardContent>
    </Card>

    <!-- Average Response Time -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium">Avg Response</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">
          {{ avgResponseTime }} min
        </div>
        <p class="text-xs text-muted-foreground">
          Target: {{ targetResponseTime }} min
        </p>
      </CardContent>
    </Card>
  </div>

  <!-- Breached Work Orders List -->
  <Card v-if="breachedWorkOrders.length > 0" class="mt-4">
    <CardHeader>
      <CardTitle class="text-destructive">Breached SLA - Immediate Action Required</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        <div
          v-for="wo in breachedWorkOrders"
          :key="wo.workOrderId"
          class="flex items-center justify-between p-3 bg-destructive/10 rounded-lg"
        >
          <div>
            <span class="font-medium">{{ wo.workOrderCode }}</span>
            <span class="text-sm text-muted-foreground ml-2">
              {{ wo.responseBreached ? 'Response SLA breached' : 'Resolution SLA breached' }}
            </span>
          </div>
          <Button size="sm" variant="destructive" @click="viewWorkOrder(wo.workOrderId)">
            View
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
```

#### 4.4 SLA Configuration View
**Files to Create**:
- `src/views/admin/SLAManagement.vue` - SLA rule configuration
- `src/components/sla/SLADashboard.vue` - SLA metrics dashboard
- `src/components/sla/SLARuleForm.vue` - Create/edit SLA rules
- `src/components/sla/EscalationConfig.vue` - Escalation rule configuration
- `src/components/workorder/SLAIndicator.vue` - SLA status on work order

---

## Implementation Phases

### Phase 1A: Critical Integration Fixes (3-4 days)
**Priority**: MUST COMPLETE before any other work

| Task | Files | Effort |
|------|-------|--------|
| Photo upload service (mock) | `uploadService.ts`, `DocumentationModal.vue` | 1.5 days |
| Auth integration fix | `template.ts`, `category.ts`, `message.ts`, `auth.ts` | 1 day |
| Material consumption | `workorder.ts`, `inventory.ts` | 1 day |
| Testing & verification | All modified files | 0.5 days |

### Phase 1B: Offline PWA Capability (3-4 days)
**Priority**: Critical for field workers

| Task | Files | Effort |
|------|-------|--------|
| PWA configuration | `vite.config.ts`, manifest | 0.5 days |
| Offline store | `offline.ts` | 1 day |
| Service worker | Custom SW configuration | 1 day |
| Offline UI indicators | `OfflineIndicator.vue` | 0.5 days |
| Queue sync logic | `useOfflineSync.ts` | 1 day |

### Phase 1C: Basic Asset Management (4-5 days)
**Priority**: Foundation for equipment tracking

| Task | Files | Effort |
|------|-------|--------|
| Asset types & interfaces | `types/asset.ts` | 0.5 days |
| Asset store | `stores/asset.ts` | 1 day |
| Mock asset data | `mock/assets.ts` | 0.5 days |
| Asset list view | `views/assets/AssetList.vue` | 1 day |
| Asset detail view | `views/assets/AssetDetail.vue` | 1 day |
| Work order integration | `stores/workorder.ts` | 0.5 days |
| Navigation & routing | `router/index.ts`, `AppSidebar.vue` | 0.5 days |

### Phase 1D: SLA Management (4-5 days)
**Priority**: Service level compliance

| Task | Files | Effort |
|------|-------|--------|
| SLA types & interfaces | `types/sla.ts` | 0.5 days |
| SLA store | `stores/sla.ts` | 1.5 days |
| Mock SLA rules | `mock/sla.ts` | 0.5 days |
| SLA dashboard | `components/sla/SLADashboard.vue` | 1 day |
| SLA management view | `views/admin/SLAManagement.vue` | 1 day |
| Work order SLA integration | `stores/workorder.ts`, SLAIndicator | 0.5 days |

---

## File Structure Summary

### New Files to Create
```
src/
├── services/
│   └── uploadService.ts           # Photo upload service
├── stores/
│   ├── offline.ts                 # Offline data management
│   ├── asset.ts                   # Asset management
│   └── sla.ts                     # SLA management
├── types/
│   ├── asset.ts                   # Asset interfaces
│   └── sla.ts                     # SLA interfaces
├── composables/
│   └── useOfflineSync.ts          # Offline sync logic
├── components/
│   ├── layout/
│   │   └── OfflineIndicator.vue   # Sync status UI
│   ├── asset/
│   │   ├── AssetCard.vue          # Asset summary
│   │   ├── AssetMetrics.vue       # Health metrics
│   │   └── AssetTree.vue          # Hierarchical view
│   ├── sla/
│   │   ├── SLADashboard.vue       # SLA metrics
│   │   ├── SLARuleForm.vue        # Rule configuration
│   │   └── EscalationConfig.vue   # Escalation rules
│   └── workorder/
│       └── SLAIndicator.vue       # SLA status badge
├── views/
│   ├── assets/
│   │   ├── AssetList.vue          # Asset registry
│   │   ├── AssetDetail.vue        # Asset details
│   │   └── AssetCreate.vue        # Create asset
│   └── admin/
│       └── SLAManagement.vue      # SLA configuration
├── mock/
│   ├── assets.ts                  # Mock asset data
│   └── sla.ts                     # Mock SLA rules
└── utils/
    └── auth.ts                    # Auth utility functions
```

### Files to Modify
```
src/
├── components/workorder/
│   └── DocumentationModal.vue     # Photo upload integration
├── stores/
│   ├── template.ts                # Auth fix (2 locations)
│   ├── category.ts                # Auth fix (2 locations)
│   ├── message.ts                 # Auth fix
│   ├── workorder.ts               # Material consumption, asset link
│   └── inventory.ts               # Stock movement integration
├── router/
│   └── index.ts                   # New routes
├── components/layout/
│   └── AppSidebar.vue             # New navigation items
└── vite.config.ts                 # PWA configuration
```

---

## Success Criteria

### Phase 1A: Critical Integration Fixes
- [ ] Photos persist across page refreshes
- [ ] All audit trails show correct user IDs
- [ ] Material usage automatically deducts from inventory
- [ ] Work order completion updates inventory stock levels

### Phase 1B: Offline PWA Capability
- [ ] App installable as PWA on mobile devices
- [ ] Work orders viewable offline
- [ ] Photos can be captured offline and queued
- [ ] Automatic sync when connectivity restored
- [ ] Visual indicators for sync status

### Phase 1C: Basic Asset Management
- [ ] Asset registry with CRUD operations
- [ ] Asset-work order linking
- [ ] Asset search and filtering
- [ ] Asset health metrics display
- [ ] Navigation integrated in sidebar

### Phase 1D: SLA Management
- [ ] SLA rules configurable by admin
- [ ] SLA deadlines calculated on work order creation
- [ ] SLA breach detection and notifications
- [ ] Escalation rules triggering correctly
- [ ] SLA metrics dashboard functional

---

## Dependencies

### External Libraries (New)
- `vite-plugin-pwa` - PWA support
- `idb` - IndexedDB wrapper for offline storage
- `date-fns` - Date calculations for SLA timing

### Internal Dependencies
- Existing Pinia stores
- Existing type system
- Existing UI components (Shadcn Vue)
- Existing routing infrastructure

---

## Risks & Mitigation

### Risk 1: Photo Storage Size
**Issue**: Base64 photos may exceed localStorage limits
**Mitigation**: Use IndexedDB with compression, implement cleanup for old photos

### Risk 2: Offline Sync Conflicts
**Issue**: Concurrent edits while offline
**Mitigation**: Implement last-write-wins with conflict logging, notify users of conflicts

### Risk 3: SLA Calculation Complexity
**Issue**: Business hours and timezone handling
**Mitigation**: Start with simple 24/7 SLA, add business hours support incrementally

### Risk 4: Asset Data Volume
**Issue**: 116 terminals may have many assets
**Mitigation**: Implement pagination from start, lazy loading for asset details

---

## Acceptance Criteria

### Must Have
- [ ] All 4 critical integration fixes completed
- [ ] Basic PWA installable on mobile
- [ ] Asset registry functional with CRUD
- [ ] SLA rules configurable and tracked
- [ ] Zero compilation errors
- [ ] Existing features remain functional

### Should Have
- [ ] Offline photo capture working
- [ ] Asset-work order linking functional
- [ ] SLA escalation notifications working
- [ ] Dashboard SLA metrics displayed

### Nice to Have
- [ ] Full offline work order submission
- [ ] Asset hierarchy visualization
- [ ] Advanced SLA reporting
- [ ] Business hours SLA calculation

---

## Conclusion

Phase 1 establishes the enterprise foundation for CMMS by addressing critical production blockers and implementing essential enterprise features. The implementation prioritizes:

1. **Data Integrity** - Fixing photo persistence and auth integration
2. **Field Usability** - Offline capability for remote terminals
3. **Asset Visibility** - Foundation for equipment management
4. **Service Compliance** - SLA tracking and escalation

Estimated total effort: **14-18 days** for full Phase 1 implementation.
