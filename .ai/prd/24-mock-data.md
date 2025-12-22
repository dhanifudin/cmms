# Mock Data Reorganization - Terminal-Based User Scoping

**Document Version:** 2.0  
**Date:** December 22, 2024  
**Status:** 🚧 **IMPLEMENTATION IN PROGRESS**

## Overview

This document outlines the reorganization of mock data in the CMMS system to implement proper terminal-based user scoping. The goal is to ensure that users can only access data from their assigned terminal, with proper isolation between terminals while maintaining realistic business scenarios.

## Business Requirements

### Current Issues
- **Cross-Terminal Data Leakage**: Users can currently access data from other terminals
- **Incomplete Scoping**: Workers see more work orders than they should
- **Inconsistent Terminal Logic**: Some stores implement terminal filtering, others don't
- **Unrealistic Distribution**: Mock data doesn't reflect actual 116 terminals with proper terminal-based scoping

### Target State
- **Terminal Isolation**: Complete data separation between terminals
- **Role-Based Access**: Proper scoping for workers, admins, supervisors, and leaders
- **Realistic Distribution**: 116 terminals with terminal-specific data and users
- **Consistent Implementation**: All stores implement terminal-based filtering

## Regional Structure Definition

### Geographic Distribution
```
📊 CMMS Regional Structure (116 Terminals across 8 Regions):

Region 1: Jakarta & Surrounding (15 terminals: terminal1-terminal15)
├── Jakarta Utara (4 terminals)
├── Jakarta Selatan (4 terminals)  
├── Jakarta Timur (4 terminals)
└── Tangerang & Bekasi (3 terminals)

Region 2: West Java (15 terminals: terminal16-terminal30)
├── Bandung (5 terminals)
├── Bogor (4 terminals)
├── Cirebon (3 terminals)
└── Sukabumi (3 terminals)

Region 3: Central Java (15 terminals: terminal31-terminal45)
├── Semarang (5 terminals)
├── Solo (4 terminals)
├── Yogyakarta (3 terminals)
└── Magelang (3 terminals)

Region 4: East Java (15 terminals: terminal46-terminal60)
├── Surabaya (6 terminals)
├── Malang (4 terminals)
├── Jember (3 terminals)
└── Kediri (2 terminals)

Region 5: Sumatra (15 terminals: terminal61-terminal75)
├── Medan (5 terminals)
├── Palembang (4 terminals)
├── Padang (3 terminals)
└── Pekanbaru (3 terminals)

Region 6: Kalimantan (15 terminals: terminal76-terminal90)
├── Balikpapan (5 terminals)
├── Banjarmasin (4 terminals)
├── Pontianak (3 terminals)
└── Samarinda (3 terminals)

Region 7: Sulawesi (15 terminals: terminal91-terminal105)
├── Makassar (5 terminals)
├── Manado (4 terminals)
├── Palu (3 terminals)
└── Kendari (3 terminals)

Region 8: Eastern Indonesia (11 terminals: terminal106-terminal116)
├── Denpasar Bali (4 terminals)
├── Mataram Lombok (3 terminals)
├── Kupang NTT (2 terminals)
└── Jayapura Papua (2 terminals)
```

### Terminal User Distribution

**Per Terminal Staffing:**
- **1-2 Admins** per terminal (managing single terminal)
- **2-3 Workers** per terminal (terminal-specific assignments)

**Per Regional Staffing:**
- **1-2 Supervisors** per region (regional oversight across multiple terminals)
- **1 Leader** per region (TBD scope and permissions)

**Total System Users:**
- **150 Admins** (1-2 per terminal × 116 terminals)
- **12 Supervisors** (1-2 per region × 8 regions)  
- **8 Leaders** (1 per region × 8 regions)
- **300 Workers** (2-3 per terminal × 116 terminals)
- **Total: 470 users** across the entire system

## Data Scoping Rules

### 1. Worker Access Rules
```typescript
// Workers can only see:
- Work orders assigned specifically to them
- Within their assigned terminal only
- Their personal performance data
- Terminal inventory (read-only)
```

### 2. Admin Access Rules  
```typescript
// Admins can only see:
- Data from their assigned terminal only
- Work orders within their terminal
- Workers within their terminal
- Terminal inventory (full CRUD)
- Terminal invoices and reports
- Cannot access data from other terminals
```

### 3. Supervisor Access Rules
```typescript
// Supervisors can see:
- All terminals within their assigned region(s)
- All work orders within their region(s) 
- All users within their region(s)
- Regional approvals and oversight data
- Multi-regional access possible (exception cases)
```

### 4. Leader Access Rules (TBD)
```typescript
// Leaders access scope: TO BE DEFINED
- Regional context: TBD
- Data access permissions: TBD  
- Cross-regional access: TBD
```

### 5. Global Access Rules
```typescript
// Templates are globally accessible:
- All terminals can use any template
- Templates are shared across terminals
- No terminal restrictions on templates
```

## Technical Implementation

### File Structure Changes

```
📁 src/mock/
├── regions.ts           [NEW] - Define 8 regions with metadata
├── terminals.ts         [NEW] - 116 terminals mapped to regions
├── users.ts            [UPDATE] - Terminal-based user distribution  
├── workorders.ts       [UPDATE] - Terminal-based work order distribution
├── invoices.ts         [UPDATE] - Terminal-based invoice scoping
├── inventory.ts        [UPDATE] - Terminal-based inventory separation
└── templates.ts        [GLOBAL] - Keep templates global

📁 src/stores/ 
├── workorder.ts        [UPDATE] - Terminal filtering logic
├── invoice.ts          [UPDATE] - Terminal data scoping
├── inventory.ts        [UPDATE] - Terminal inventory management
├── message.ts          [UPDATE] - Terminal notifications
├── userManagement.ts   [UPDATE] - Terminal user management
└── auth.ts             [UPDATE] - Terminal permission logic
```

### Phase-by-Phase Implementation

#### Phase 1: Regional Master Data
**Files**: `regions.ts`, `terminals.ts`

**regions.ts Structure:**
```typescript
interface Region {
  id: string;
  name: string;
  displayName: string;
  description: string;
  terminalIds: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  active: boolean;
}
```

**terminals.ts Structure:**
```typescript
interface Terminal {
  id: string;
  name: string;
  regionId: string;
  address: string;
  city: string;
  province: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  capacity: number;
  type: 'depot' | 'station' | 'hub';
  active: boolean;
  establishedDate: string;
}
```

#### Phase 2: Terminal-Based User Distribution
**File**: `users.ts`

**Implementation Goals:**
- Distribute 470 users across 116 terminals
- Ensure proper role distribution per terminal
- Maintain realistic user profiles
- Assign workers and admins to specific terminals

**Terminal User Template:**
```typescript
// Terminal 1 Example:
- admin1_terminal1, admin2_terminal1
- worker1_terminal1, worker2_terminal1, worker3_terminal1

// Regional Supervisors:
- supervisor1_region1 (oversees terminals 1-15)
- supervisor2_region1 (backup/support)
- leader1_region1 (TBD scope)
```

#### Phase 3: Terminal-Based Work Order Distribution  
**File**: `workorders.ts`

**Distribution Strategy:**
- **0-2 work orders** per terminal (100 total across 116 terminals)
- Work orders assigned to specific terminals
- Workers assigned only within their terminal
- Admin-managed distribution within terminals
- Realistic maintenance scenarios per terminal

#### Phase 4: Terminal-Based Inventory & Invoices
**Files**: `inventory.ts`, `invoices.ts`

**Inventory Separation:**
- Each terminal has separate inventory
- No cross-terminal inventory sharing
- Terminal-specific stock levels and thresholds
- Terminal-specific items where applicable

**Invoice Terminal Scoping:**
- Invoices contain only terminal work orders
- Terminal-specific cost tracking and billing
- Terminal-specific penalty calculations
- Terminal-specific recipient targeting

#### Phase 5: Store Enhancement
**Files**: All store files

**Key Enhancements:**
```typescript
// Add terminal filtering to computed properties
const terminalWorkOrders = computed(() => {
  if (!authStore.currentUser?.terminalId) return [];
  
  // Admin sees only their terminal's work orders
  if (authStore.isAdmin) {
    return workOrders.value.filter(wo => 
      wo.terminalId === authStore.currentUser.terminalId
    );
  }
  
  // Worker sees only their assigned work orders in their terminal
  if (authStore.isWorker) {
    return workOrders.value.filter(wo => 
      wo.terminalId === authStore.currentUser.terminalId &&
      wo.assignedWorkerId === authStore.currentUser.id
    );
  }
  
  // Supervisor sees all terminals in their region
  if (authStore.isSupervisor) {
    return workOrders.value.filter(wo => 
      getTerminalRegion(wo.terminalId) === authStore.currentUser.regionId
    );
  }
  
  return [];
});

// Add terminal permission checks
const canAccessTerminalData = (terminalId: string): boolean => {
  if (authStore.isAdmin || authStore.isWorker) {
    return authStore.currentUser?.terminalId === terminalId;
  }
  if (authStore.isSupervisor) {
    return getTerminalRegion(terminalId) === authStore.currentUser?.regionId;
  }
  return false;
};
```

#### Phase 6: Validation & Testing
**Validation Scenarios:**
- Worker sees only assigned work orders in their region
- Admin sees only their regional data
- Supervisor sees only their regional scope
- No cross-regional data access
- Templates remain globally accessible

## Mock Data Specifications

### Work Order Distribution
```
Region 1: 15 work orders (terminals 1-15)
Region 2: 13 work orders (terminals 16-30)
Region 3: 12 work orders (terminals 31-45) 
Region 4: 14 work orders (terminals 46-60)
Region 5: 13 work orders (terminals 61-75)
Region 6: 11 work orders (terminals 76-90)
Region 7: 12 work orders (terminals 91-105)
Region 8: 10 work orders (terminals 106-116)
Total: 100 work orders
```

### User Assignment Strategy
- **Even Distribution**: Users distributed evenly across regions
- **Role Coverage**: Each region has all role types represented
- **Terminal Assignment**: Workers and admins assigned to specific terminals
- **Regional Supervision**: Supervisors oversee entire regions

### Inventory Distribution
- **Regional Stock**: Each region maintains separate inventory
- **Common Items**: Standard maintenance items across all regions
- **Regional Specialization**: Some region-specific inventory items
- **Realistic Levels**: Stock levels based on regional work order volume

## Success Criteria

### Functional Requirements
- [x] 116 terminals properly distributed across 8 regions
- [ ] 240 users regionally separated by role
- [ ] 100 work orders distributed regionally
- [ ] Complete regional data isolation
- [ ] Templates remain globally accessible
- [ ] All stores implement regional filtering

### Technical Requirements  
- [ ] Zero cross-regional data access
- [ ] Proper regional permission enforcement
- [ ] Consistent regional filtering logic
- [ ] Realistic mock data distribution
- [ ] Maintainable data structure

### Business Requirements
- [ ] Workers see only their assignments
- [ ] Admins scope limited to their region
- [ ] Supervisors have proper regional oversight
- [ ] Regional inventory separation
- [ ] Regional invoice generation

## Testing Strategy

### Regional Isolation Testing
1. **Worker Test**: Login as worker, verify only assigned WOs in region visible
2. **Admin Test**: Login as admin, verify only regional data accessible
3. **Supervisor Test**: Login as supervisor, verify regional scope enforcement
4. **Cross-Regional Test**: Verify no data leakage between regions

### Data Consistency Testing
1. **User Distribution**: Verify users properly distributed across regions
2. **Work Order Assignment**: Verify WOs assigned only within regions
3. **Inventory Scoping**: Verify regional inventory separation
4. **Template Access**: Verify global template accessibility

## Implementation Timeline

**Total Development Time: 12-16 hours**

- **Phase 1** (2-3 hours): Regional master data creation
- **Phase 2** (3-4 hours): Regional user distribution  
- **Phase 3** (2-3 hours): Work order regional distribution
- **Phase 4** (2-3 hours): Inventory and invoice regional scoping
- **Phase 5** (2-3 hours): Store enhancement with regional filtering
- **Phase 6** (1-2 hours): Testing and validation

## Future Considerations

### Multi-Regional Access
- **Supervisor Multi-Region**: Some supervisors may need access to multiple regions
- **Configuration System**: Admin configurable regional access
- **Role Extensions**: Enhanced role definitions for complex regional access

### Leader Role Definition
- **Scope Definition**: Define what data leaders can access
- **Regional Context**: Single region vs multi-regional access
- **Permission Structure**: Define leader permissions relative to other roles

### Dynamic Regional Management
- **Terminal Reallocation**: Ability to move terminals between regions
- **Regional Splitting**: Ability to create new regions
- **User Transfer**: Ability to transfer users between regions

---

**Document Control:**
- **Author**: Claude Code Assistant
- **Reviewer**: Development Team  
- **Approval**: Product Owner
- **Next Review**: Post-implementation validation