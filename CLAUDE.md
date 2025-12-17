# CMMS Prototype Requirements

## Project Overview
**System**: Computerized Maintenance Management System (CMMS)
**Purpose**: Track maintenance activities and generate invoices based on completed work
**Tech Stack**: Vue.js + Shadcn UI
**Data**: Mock/dummy data for prototype demonstration

## Business Context
- **Scope**: 116 Terminals across 8 Regions
- **Integration**: 
  - Talenta HRIS (mocked) for worker and admin authentication
  - Idaman SSO (mocked) for supervisor and leader authentication
- **Primary Output**: Automated invoice generation from maintenance activities
- **Secondary Functions**: Inventory tracking, penalty management, activity notifications

---

## Core Entities

### 1. Geographic Structure
- **Terminal**: 116 physical locations
- **Region**: 8 regional groupings of terminals

### 2. Users & Roles
| Role | Key Permissions |
|------|----------------|
| **Admin** | Create/configure Work Orders, manage inventory, configure pricing/penalties, manage users |
| **Supervisor** | Approve Work Orders, modify Work Order details, assign workers, review completions, configure pricing/penalties |
| **Leader** | TBD - permissions not yet defined |
| **Worker (Pekerja)** | Submit before/after documentation, complete assigned Work Orders |

**Notes**:
- Admin & Supervisor can both assign workers to Work Orders
- Supervisor (PertaMC) and Supervisor (PatraNiaga) have identical permissions
- Workers and Admin authenticated via Talenta HRIS
- Supervisors and Leaders authenticated via Idaman SSO

### 3. Work Order Hierarchy
**Structure**: 
- Dynamic tree with unlimited depth
- Admin-configurable categories based on maintenance scope

**Example**:
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

**Assignment Rules**:
- Work Orders can be assigned at any hierarchy level
- Default: Parent assignment creates one Work Order with children as sub-tasks
- Optional: Admin can split hierarchy into separate Work Orders
- Each sub-task has independent checklist, photos, and notes

### 4. Work Order Fields
**Core Fields**:
- Title/Name
- Description
- Location (Terminal/Region)
- Maintenance Type: Preventive or Corrective
- Assigned Worker (Pekerja) - individual only, no team assignments
- Priority: Custom/configurable levels
- Start Date: When worker can begin
- Due Date: Completion deadline
- Estimated Duration: Minimum time between before/after submissions

**Dynamic Fields**:
- Custom additional fields per Work Order type
- Configurable by Admin/Supervisor
- Examples: Temperature readings, equipment IDs, specific measurements

### 5. Maintenance Types

**Preventive Maintenance**:
- Proactive, scheduled before equipment failure
- Follows recurring schedules
- Standard checklists

**Corrective Maintenance**:
- Reactive, responds to failures/issues
- Two subtypes:
  - Planned: Uses standard checklists (similar to preventive)
  - Incidental: Custom/ad-hoc checklists based on specific incident

### 6. Scheduling
**Types**:
- **Monthly**: Recurring every month
- **Weekly**: Recurring every week
- **Custom**: Admin-defined recurrence pattern
- **One-time**: Non-recurring task

**Recurring Behavior**: TBD - auto-generation rules not yet defined

---

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

**1. Creation & Approval**
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

**2. Worker Execution**
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

**Validation Rule**: 
- Minimum time between BEFORE and AFTER = Estimated Duration
- If submitted early → System allows but flags for supervisor review
```

**3. Supervisor Review**
```
Supervisor reviews submitted work
  - Reviews photos, notes, checklist
  - Reviews flagged early completions
  
Actions:
  • Approve → Work Order status = "Completed" ✓
  • Reject → Send back to worker (redo work)
  • Request Revision (with comments) → Worker fixes issues
  • Reassign → Assign to different worker (rare)
  
Rework approach: Depends on supervisor instruction
  - May need to redo entire work (new before + after)
  - Or just resubmit after documentation
```

### Penalties
**Trigger**: Work Order not completed/approved by Due Date
**Calculation**: Penalty if final approval timestamp > Due Date

**Methods** (configurable by Admin/Supervisor):
- **Per Item**: Fixed amount × days overdue
  - Example: $50/day overdue
- **Percentage**: Base amount × percentage × days overdue
  - Base can be: labor cost, total Work Order value, etc.
  - Example: 5% of labor cost per day

**Configuration**:
- Dynamic/flexible approach
- Different rules per Work Order type, priority, or terminal/region
- Applied at invoice generation

**Responsibility**: TBD - who bears penalty (worker/supervisor/terminal) not defined

---

## Checklist System

### Structure
**Checklist Items** can be:
- Yes/No/NA
- Numeric value (with unit)
- Text input
- Dropdown selection
- Rating scale
- Other custom types

**Properties**:
- Required vs Optional flag
- Conditional logic: TBD - if supported
- Linked to specific task/sub-task

### Before & After Behavior
- **Same checklist items** used for both states
- Worker fills before state → performs work → fills after state
- Allows comparison of conditions

**Example**:
```
Checklist: "Gas Compressor Preventive Maintenance"

BEFORE submission:
  □ Suction Pressure: 15 PSI
  □ Discharge Pressure: 45 PSI
  □ Oil Level: Low
  □ Vibration Level: Normal
  □ Gas Leak Detection: No leaks

(Worker performs maintenance)

AFTER submission:
  ☑ Suction Pressure: 16 PSI
  ☑ Discharge Pressure: 48 PSI
  ☑ Oil Level: Normal (topped up)
  ☑ Vibration Level: Normal
  ☑ Gas Leak Detection: No leaks
```

### Management
- Admin/Supervisor create checklist templates
- Checklists reusable across Work Orders
- Each sub-task has its own checklist
- Worker cannot modify checklist structure (only fill values)

---

## Inventory Management

### Item Tracking
**Item Master Data** (configurable):
- Item Name
- Item Code/SKU
- Category
- Unit of Measure
- Current Stock Level
- Minimum Threshold (alert trigger)
- Unit Price
- Storage Location: TBD - per Terminal/Region/Central not defined
- Supplier Information (optional)

### Stock Alerts
**Workflow**:
```
Stock level drops below threshold
  ↓
Alert sent to Admin
  ↓
Admin creates purchase request
  ↓
Purchase/approval workflow: TBD
```

**Configuration**:
- Threshold configurable per item
- Can be adjusted anytime by Admin

### Consumption Tracking
**Method**: TBD - how items are deducted from stock not defined
- Auto-deduct when Work Order completed?
- Worker manually records usage?
- Admin reviews and approves?

**Linking to Work Orders**:
- Work Orders specify required items/materials
- Used for invoice material cost calculation
- Stock consumption tracked per completed Work Order

---

## Invoice System

### Generation
**Triggers** (configurable):
- On-demand: Admin manually generates
- Scheduled: Auto-generate monthly/weekly (if enabled)
- Per Work Order completion
- Per Terminal/Region consolidation
- Custom date range

**Grouping**:
- Single Work Order invoice
- Multiple Work Orders (same Terminal/Region/period)
- Configurable grouping rules

### Invoice Components

**1. Labor Cost**
- Fully configurable pricing
- Can vary by: worker role, task type, terminal, region
- Calculation method: TBD - time-based vs fixed rate not defined
- Set by Admin/Supervisor

**2. Material Cost**
- Sum of inventory items used
- Item prices from inventory master data
- Fully configurable per item

**3. Penalties**
- Calculated per overdue Work Order
- Added to invoice total
- Dynamic calculation (per item or percentage)
- Configurable rules

### Invoice Structure

**Summary View**:
```
Total Invoice Amount: $X,XXX
  - Labor Cost: $X,XXX
  - Material Cost: $XXX
  - Penalties: $XXX
```

**Category Breakdown**:
```
Labor Cost: $X,XXX
  - Preventive Maintenance: $XXX
  - Corrective Maintenance: $XXX
  
Material Cost: $XXX
  - Pipes & Fittings: $XXX
  - Machine Parts: $XXX
  
Penalties: $XXX
  - Overdue Work Orders: $XXX
```

**Activity Detail**:
```
Work Order #001 - Main Line Inspection
  Labor: $150 (Worker A, 3 hours @ $50/hr)
  Materials: $45 (Pipe seal x3 @ $15)
  Penalty: $0
  Subtotal: $195

Work Order #002 - Generator Check (OVERDUE)
  Labor: $100 (Worker B, 2 hours @ $50/hr)
  Materials: $30 (Oil filter x1)
  Penalty: $50 (2 days overdue @ $25/day)
  Subtotal: $180
```

### Invoice Recipient
**Flexible**: Can be sent to different parties
- Terminal Manager
- Regional Manager
- External Client
- Contractor
- Finance Department
- Configurable per invoice

---

## Notification System

### Delivery Channels
- **In-app notifications**: Displayed in application interface
- **Push notifications**: Mobile/desktop alerts

### Recipients
**Context-aware**: Sent to users who interact with the activity
- Work Order creator (Admin)
- Assigned worker
- Approving supervisor
- Users who commented/updated
- Terminal/Region managers (if configured)

### Notification Events
**Work Order Related**:
- Work Order assigned to worker
- Work Order due date approaching (X days before - configurable)
- Work Order overdue
- Work Order submitted for review
- Work Order approved
- Work Order rejected/revision requested
- Work Order cancelled (if applicable)

**Inventory Related**:
- Stock below threshold alert (to Admin)
- Purchase request created (TBD)

**Invoice Related**:
- Invoice generated
- Invoice sent to recipient

**Other**:
- Comments added to Work Order
- Attachments uploaded
- System configuration changes (optional)

### User Preferences
**TBD**: Can users customize notification settings?

---

## Inbox & Communication System

### Inbox Features
**Purpose**: Central communication hub for users to receive and manage work-related messages, notifications, and updates

**Core Functionality**:
- Unified inbox for all system communications
- Message categorization and filtering
- Read/unread status tracking
- Message priority levels
- Reply and forward capabilities
- Attachment support

**Message Types**:
- Work Order assignments and updates
- Supervisor feedback and approvals
- System notifications and alerts
- Administrative announcements
- Inventory alerts
- Invoice notifications

### Inter-User Communication
**Communication Channels**:
- Direct messaging between users
- Work Order comment threads
- Supervisor-Worker communication
- Admin broadcasts
- Regional team messaging

**Message Features**:
- Real-time delivery
- Message history retention
- File attachment support
- Message status (sent, delivered, read)
- Emergency/urgent message flagging

---

## Dashboard System

### Role-Based Dashboard Structure

**Main Navigation**:
- Inbox (universal access)
- Dashboard (role-specific views)

### Terminal Level Dashboards

**Worker (Pekerja) Dashboard**:
- My Assigned Work Orders
- Work Orders Completed (recent history)
- Pending Tasks
- Upcoming Deadlines
- Personal Performance Metrics

**Terminal Admin Dashboard**:
- Worker Status Overview
  - Active workers
  - Worker availability
  - Performance metrics per worker
- Material/Inventory Status
  - Current stock levels
  - Low inventory alerts
  - Recent material usage
- Work Assignment (Surat Tugas) Management
  - Pending assignments
  - Active work orders
  - Completion rates

### Regional Level Dashboards

**PertaMC Regional Dashboard**:
- KPI Overview per Terminal
  - Work order completion rates
  - On-time completion percentage
  - Material usage efficiency
  - Worker productivity metrics
  - Cost analysis per terminal
- Regional Summary Metrics
- Cross-terminal comparisons
- Escalation alerts

**PertaMC Director Dashboard**:
- KPI Overview per Region
  - Regional performance comparison
  - Aggregate completion rates
  - Regional cost analysis
  - Resource allocation efficiency
- Strategic metrics
- Executive summary reports

**PatraNiaga Regional Dashboard**:
- KPI Overview per Region (PatraNiaga territories)
  - Regional work order metrics
  - PatraNiaga-specific KPIs
  - Cost and billing summaries
  - Regional compliance metrics

**Leader Dashboard**:
- TBD - Role permissions and dashboard content not yet defined

### Key Performance Indicators (KPIs)

**Terminal Level KPIs**:
- Work Order completion rate
- Average completion time
- On-time completion percentage
- Material cost efficiency
- Worker utilization rate
- Quality metrics (rework rate)

**Regional Level KPIs**:
- Aggregate terminal performance
- Regional cost analysis
- Resource optimization metrics
- Inter-terminal efficiency comparison
- Regional compliance scores

**System-Wide Metrics**:
- Total Work Orders by status
- Overdue count and trending
- Monthly completion rates
- Total penalties incurred
- Inventory turnover rates
- System utilization metrics

---

## Reporting & Analytics

### Key Reports
- Work Order completion rate by Terminal/Region
- Overdue Work Orders list
- Worker performance/productivity
- Inventory usage and costs
- Preventive vs Corrective maintenance ratio
- Penalty summary
- Cost analysis (Labor vs Materials vs Penalties)
- KPI trend analysis
- Cross-regional performance comparison

---

## Technical Specifications

### Frontend
- **Framework**: Vue.js 3 (Composition API recommended)
- **UI Library**: Shadcn Vue (Vue port of Shadcn)
- **State Management**: Pinia (recommended for Vue 3)
- **Routing**: Vue Router
- **Forms**: VeeValidate or native Vue form handling
- **Notifications**: Component-based toast/notification system

### Data Layer
- **Mock Data**: JSON files or in-memory store
- **API Simulation**: Mock API layer for realistic data flow
- **Data Structure**: Normalized relational structure

### Key Features to Demonstrate
1. Work Order creation workflow (Admin → Supervisor → Worker)
2. Dynamic hierarchy builder
3. Before/After submission with photo upload
4. Checklist completion interface
5. Supervisor review/approval screen
6. Invoice generation with drill-down views
7. Inventory tracking with threshold alerts
8. Notification center
9. Configurable pricing/penalty rules
10. Role-based permissions

### Prototype Scope
**In Scope**:
- All core workflows with mock data
- Responsive UI (desktop + mobile considerations)
- Role-based navigation and permissions
- Interactive forms and validations
- Visual invoice generation
- Dashboard with key metrics

**Out of Scope**:
- Real API integration (Talenta or others)
- Authentication system (mock user switching)
- Database persistence
- File storage (simulate upload/download)
- Email/SMS notifications (in-app only)
- Advanced reporting (basic views only)

---

## Open Questions / TBD Items

### High Priority
1. **Leader Role**: What are Leader's specific permissions and responsibilities?
2. **Inventory Location**: Per Terminal, per Region, or Central warehouse?
3. **Labor Cost Calculation**: Time-based vs fixed rate? How are hours tracked?
4. **Stock Consumption**: How are items deducted from inventory?
5. **Penalty Responsibility**: Who pays penalties (worker/supervisor/terminal)?

### Medium Priority
6. **Recurring Work Orders**: Auto-generation logic and advance creation period
7. **Approval Workflow Details**: Multi-level approvals? Escalation rules?
8. **Purchase Request Workflow**: Post-alert process for inventory replenishment
9. **Checklist Conditional Logic**: Support for dynamic checklist items?
10. **Audit Trail**: What changes are logged? History retention period?

### Low Priority
11. **Search Capabilities**: Global search vs entity-specific search
12. **File Size Limits**: Maximum upload sizes and allowed file types
13. **Offline Capability**: Should workers be able to work offline?
14. **User Notification Preferences**: Can users customize which notifications they receive?
15. **Report Scheduling**: Auto-generated and emailed reports?

---

## Mock Data Requirements

### Users
- 5-10 Admin users
- 10-15 Supervisor users (mix of PertaMC and PatraNiaga)
- 3-5 Leader users (permissions TBD)
- 50-100 Worker users across terminals

### Geographic
- 8 Regions with names
- 116 Terminals distributed across regions
- Realistic terminal names and locations

### Work Orders
- 200-300 sample Work Orders in various statuses
- Mix of Preventive and Corrective types
- 3-4 level hierarchy examples
- Different priority levels
- Some overdue (for penalty demonstration)
- Recurring and one-time examples

### Inventory
- 50-100 inventory items
- Various categories (pipes, machines, tools, consumables)
- Some below threshold (for alert demonstration)
- Realistic pricing

### Invoices
- 20-30 sample invoices
- Various grouping methods
- Breakdown examples
- Different recipients

### Checklists
- 10-15 reusable checklist templates
- Different types of checklist items
- Linked to specific Work Order types

---

## Success Criteria

### Prototype Must Demonstrate
1. ✅ Complete Work Order lifecycle from creation to completion
2. ✅ Multi-level hierarchy navigation and assignment
3. ✅ Before/After submission with photo gallery
4. ✅ Supervisor approval with modification capabilities
5. ✅ Invoice generation with multiple view levels
6. ✅ Inventory tracking with alerts
7. ✅ Penalty calculation and display
8. ✅ Role-based UI differences (Admin vs Supervisor vs Worker)
9. ✅ Notification center with activity feed
10. ✅ Configurable pricing and penalty rules (admin interface)

### User Experience Goals
- Intuitive navigation between modules
- Mobile-friendly interface for workers
- Fast form interactions with proper validation
- Clear status indicators throughout workflows
- Actionable notifications with context
- Easy-to-understand invoice breakdowns

---

## Version History
- **v1.0** (Current): Initial requirements documentation based on stakeholder discussions
- **Next**: Refinement after prototype review

---

## Notes for Development
- Start with core Work Order workflow
- Use realistic mock data for better demonstration
- Implement role switching for testing different user experiences
- Add sample data generator for easy reset/demo
- Include tooltips and help text for complex features
- Prepare demo scenarios for stakeholder walkthrough