# PRD: User Roles & Permissions System

## Overview
**Purpose**: Define role-based access control and permissions for different user types
**Authentication Sources**: Talenta HRIS for workers/admin, Idaman SSO for supervisors/leaders

## User Roles

### Admin
**Authentication**: Talenta HRIS
**Primary Responsibilities**: System configuration and work order creation

**Key Permissions**:
- Create/configure Work Orders
- Manage inventory and stock levels
- Configure pricing and penalty rules
- Manage user accounts and assignments
- Create and modify checklist templates
- Generate invoices and reports
- Access all system modules

**Dashboard Access**:
- Worker Status Overview (active workers, availability, performance metrics)
- Material/Inventory Status (stock levels, alerts, usage)
- Work Assignment (Surat Tugas) Management (pending, active, completion rates)

### Supervisor
**Authentication**: Idaman SSO
**Types**: Supervisor (PertaMC) and Supervisor (PatraNiaga) - identical permissions
**Primary Responsibilities**: Work order approval and oversight

**Key Permissions**:
- Approve Work Orders
- Modify Work Order details
- Assign/reassign workers to work orders
- Review work completions
- Configure pricing and penalty rules
- Access regional dashboards
- Generate regional reports

**Dashboard Access**:
- **PertaMC Regional**: KPI overview per terminal, regional metrics, cross-terminal comparisons
- **PertaMC Director**: KPI overview per region, strategic metrics, executive reports
- **PatraNiaga Regional**: Regional work order metrics, cost summaries, compliance metrics

### Leader
**Authentication**: Idaman SSO
**Status**: TBD - permissions not yet defined
**Dashboard Access**: TBD - role permissions and dashboard content not yet defined

### Worker (Pekerja)
**Authentication**: Talenta HRIS
**Primary Responsibilities**: Execute assigned work orders

**Key Permissions**:
- View assigned work orders
- Submit before/after documentation (photos, notes, checklist)
- Complete assigned work orders
- Access personal work history
- Receive notifications and communications

**Dashboard Access**:
- My Assigned Work Orders
- Work Orders Completed (recent history)
- Pending Tasks
- Upcoming Deadlines
- Personal Performance Metrics

## Permission Matrix

| Feature | Admin | Supervisor | Leader | Worker |
|---------|-------|------------|--------|--------|
| Create Work Orders | ✅ | ❌ | TBD | ❌ |
| Approve Work Orders | ❌ | ✅ | TBD | ❌ |
| Assign Workers | ✅ | ✅ | TBD | ❌ |
| Execute Work Orders | ❌ | ❌ | TBD | ✅ |
| Manage Inventory | ✅ | ❌ | TBD | ❌ |
| Configure Pricing | ✅ | ✅ | TBD | ❌ |
| Generate Invoices | ✅ | ✅ | TBD | ❌ |
| Access Regional KPIs | ✅ | ✅ | TBD | ❌ |
| Submit Documentation | ❌ | ❌ | TBD | ✅ |
| Review Completions | ✅ | ✅ | TBD | ❌ |
| Manage Users | ✅ | ❌ | TBD | ❌ |
| Create Checklists | ✅ | ✅ | TBD | ❌ |

## Authentication Integration

### Talenta HRIS Integration
**Users**: Workers and Admin
**Mock Implementation**: Dummy authentication system
**User Data Sync**:
- Employee ID
- Name and contact information
- Department/Terminal assignment
- Role designation
- Status (active/inactive)

### Idaman SSO Integration
**Users**: Supervisors and Leaders
**Mock Implementation**: Dummy SSO simulation
**User Data Sync**:
- Employee ID
- Name and contact information
- Regional/territorial assignment
- Role designation (PertaMC/PatraNiaga)
- Access level permissions

## Role-Based Navigation

### Universal Access
- **Inbox**: All users can access communication system
- **Profile**: Personal settings and information
- **Notifications**: System alerts and messages

### Role-Specific Access

#### Admin Navigation
- Dashboard (Terminal Admin view)
- Work Orders (creation, management)
- Inventory (stock management)
- Users (account management)
- Invoicing (generation, configuration)
- Reports (system-wide analytics)
- Configuration (pricing, penalties)

#### Supervisor Navigation
- Dashboard (Regional/Director view based on role)
- Work Orders (approval, assignment)
- Reports (regional analytics)
- Configuration (pricing, penalties)
- Team Management (worker oversight)

#### Worker Navigation
- Dashboard (Personal view)
- My Work Orders (assigned tasks)
- Documentation (photo upload, notes)
- History (completed work)

## Security Considerations

### Access Control
- **Role verification** on each request
- **Permission checking** before feature access
- **Session management** with appropriate timeouts
- **Audit logging** for sensitive operations

### Data Isolation
- **Terminal-level** data access for workers
- **Regional-level** data access for supervisors
- **System-wide** access for admins
- **Cross-terminal** access restrictions

### Mock Security Implementation
- **Simulated authentication** flows
- **Role switching** for demo purposes
- **Permission enforcement** in UI
- **Data filtering** based on user role

## User Experience

### Role Identification
- **Visual indicators** for current user role
- **Role-specific** color schemes or badges
- **Navigation menu** adapted to permissions
- **Feature hiding** for unauthorized functions

### Context Awareness
- **Location-based** data filtering (Terminal/Region)
- **Role-appropriate** default views
- **Personalized** dashboard content
- **Relevant notifications** only

## Technical Implementation

### Frontend Considerations
- **Route guards** for role-based access
- **Component-level** permission checking
- **Dynamic menu** generation based on role
- **Conditional rendering** of features

### State Management
- **User role** in global state
- **Permission matrix** for feature access
- **Authentication status** tracking
- **Role switching** for development/demo

## Success Criteria
1. ✅ Role-based UI differences (Admin vs Supervisor vs Worker)
2. ✅ Permission enforcement throughout application
3. ✅ Appropriate dashboard views per role
4. ✅ Secure access to role-specific features
5. ✅ Mock authentication system integration
6. ✅ User role identification and switching

## Open Questions
1. **Leader Role**: Specific permissions and responsibilities
2. **Multi-role Users**: Can users have multiple roles?
3. **Role Hierarchy**: Is there a hierarchy between roles?
4. **Delegation**: Can supervisors delegate permissions?
5. **Audit Requirements**: What user actions need logging?
6. **Session Management**: Timeout policies and concurrent sessions