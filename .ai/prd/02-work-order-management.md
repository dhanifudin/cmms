# PRD: Work Order Management System

## Overview
**Purpose**: Manage the complete lifecycle of maintenance work orders from creation to completion
**Scope**: Dynamic hierarchical work structure with approval workflows

## Work Order Hierarchy

### Structure
- **Dynamic tree with unlimited depth**
- **Admin-configurable categories** based on maintenance scope
- **Flexible assignment**: Can assign at any hierarchy level

### Example Structure
```
Pipeline Maintenance (Category)
  └─ Gas Pipeline System (Sub-category)
      ├─ Pipeline Pressure Test (Task)
      └─ Gas Leak Detection (Task)

Pump & Compressor Maintenance (Category)
  └─ Gas Compressor Unit (Equipment)
      ├─ Monthly Compressor Inspection (Task)
      └─ Lubrication System Service (Task)

Safety System Maintenance (Category)
  └─ Fire & Gas Detection (Sub-category)
      ├─ Gas Detector Calibration (Task)
      └─ Emergency Valve Test (Task)
```

### Assignment Rules
- Work Orders assignable at any hierarchy level
- Default: Parent assignment creates one Work Order with children as sub-tasks
- Optional: Admin can split hierarchy into separate Work Orders
- Each sub-task has independent checklist, photos, and notes

## Work Order Fields

### Core Fields
- **Title/Name**: Descriptive work order name
- **Description**: Detailed work description
- **Location**: Terminal/Region assignment
- **Maintenance Type**: Preventive or Corrective
- **Assigned Worker**: Individual worker only (no team assignments)
- **Priority**: Custom/configurable levels
- **Start Date**: When worker can begin
- **Due Date**: Completion deadline
- **Estimated Duration**: Minimum time between before/after submissions

### Dynamic Fields
- **Custom additional fields** per Work Order type
- **Configurable by Admin/Supervisor**
- **Examples**: Temperature readings, equipment IDs, specific measurements

## Maintenance Types

### Preventive Maintenance
- **Proactive**: Scheduled before equipment failure
- **Recurring schedules**: Monthly, Weekly, Custom patterns
- **Standard checklists**: Predefined for each task type

### Corrective Maintenance
- **Reactive**: Responds to failures/issues
- **Planned**: Uses standard checklists (similar to preventive)
- **Incidental**: Custom/ad-hoc checklists based on specific incident

## Work Order Lifecycle

### Status Flow
```
Draft
  ↓ (Admin creates)
Pending Approval
  ↓ (Supervisor approves & assigns worker)
Assigned
  ↓ (Start Date arrives, worker submits BEFORE docs)
In Progress
  ↓ (Worker completes, submits AFTER docs)
Submitted for Review
  ↓ (Supervisor reviews)
Completed / Rejected / Revision Required
```

### Detailed Workflow

#### 1. Creation & Approval
```
Admin creates Work Order
  - Fills core fields (title, location, dates, priority, etc.)
  - Optionally assigns worker
  - Submits for approval
    ↓
Supervisor reviews
  - Can modify Work Order details
  - Can assign/reassign worker (if not assigned)
  - Actions:
    • Approve → Work Order moves to "Assigned"
    • Reject (with reason) → Returns to Admin for revision
```

#### 2. Worker Execution
```
Work Order assigned to Worker
  ↓
Worker waits until Start Date
  ↓
Worker submits BEFORE documentation:
  - Multiple photos (unlimited)
  - Text notes
  - Checklist items (specific to this task/sub-task)
  → Status automatically becomes "In Progress"
  ↓
Worker performs maintenance work
  ↓
Worker submits AFTER documentation:
  - Multiple photos (unlimited)
  - Text notes
  - Same checklist items (completed state)
  → Status becomes "Submitted for Review"
```

#### 3. Supervisor Review
```
Supervisor reviews submitted work
  - Reviews photos, notes, checklist
  - Reviews flagged early completions
  
Actions:
  • Approve → Work Order status = "Completed" ✓
  • Reject → Send back to worker (redo work)
  • Request Revision (with comments) → Worker fixes issues
  • Reassign → Assign to different worker (rare)
```

### Validation Rules
- **Minimum time between BEFORE and AFTER** = Estimated Duration
- **Early submission** → System allows but flags for supervisor review
- **Rework approach**: Depends on supervisor instruction
  - May need to redo entire work (new before + after)
  - Or just resubmit after documentation

## Checklist System

### Structure
**Checklist Items** can be:
- Yes/No/NA
- Numeric value (with unit)
- Text input
- Dropdown selection
- Rating scale
- Other custom types

### Properties
- **Required vs Optional** flag
- **Conditional logic**: TBD - if supported
- **Linked to specific task/sub-task**

### Before & After Behavior
- **Same checklist items** used for both states
- Worker fills before state → performs work → fills after state
- **Allows comparison** of conditions

### Management
- Admin/Supervisor create checklist templates
- Checklists reusable across Work Orders
- Each sub-task has its own checklist
- Worker cannot modify checklist structure (only fill values)

## Scheduling

### Types
- **Monthly**: Recurring every month
- **Weekly**: Recurring every week
- **Custom**: Admin-defined recurrence pattern
- **One-time**: Non-recurring task

### Recurring Behavior
- **TBD**: Auto-generation rules not yet defined
- **Advance creation period**: How far in advance to create recurring tasks
- **Template inheritance**: How recurring tasks inherit from templates

## Penalties

### Trigger
**Work Order not completed/approved by Due Date**
**Calculation**: Penalty if final approval timestamp > Due Date

### Methods (configurable by Admin/Supervisor)
- **Per Item**: Fixed amount × days overdue
  - Example: $50/day overdue
- **Percentage**: Base amount × percentage × days overdue
  - Base can be: labor cost, total Work Order value, etc.
  - Example: 5% of labor cost per day

### Configuration
- **Dynamic/flexible** approach
- **Different rules** per Work Order type, priority, or terminal/region
- **Applied at invoice generation**
- **Responsibility**: TBD - who bears penalty (worker/supervisor/terminal)

## Technical Requirements

### User Interface
- **Hierarchical tree view** for work order categories
- **Drag & drop** for work order assignment
- **Photo upload** with preview capabilities
- **Checklist interface** with various input types
- **Mobile-optimized** for worker field use

### Performance
- **Fast search** across work orders
- **Efficient loading** of hierarchical data
- **Offline capability** for worker documentation (TBD)

### Integration Points
- **Inventory system** for material requirements
- **User management** for worker assignments
- **Notification system** for status updates
- **Invoice system** for cost calculation

## Success Criteria
1. ✅ Complete Work Order lifecycle from creation to completion
2. ✅ Multi-level hierarchy navigation and assignment
3. ✅ Before/After submission with photo gallery
4. ✅ Supervisor approval with modification capabilities
5. ✅ Penalty calculation and display
6. ✅ Checklist completion interface
7. ✅ Mobile-friendly worker interface

## Open Questions
1. **Recurring Work Orders**: Auto-generation logic and timing
2. **Conditional Checklists**: Support for dynamic checklist items
3. **Offline Capability**: Should workers be able to work offline?
4. **File Size Limits**: Maximum upload sizes and allowed file types
5. **Audit Trail**: What changes are logged and retention period