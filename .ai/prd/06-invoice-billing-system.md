# PRD: Invoice & Billing System

## Overview
**Purpose**: Generate cost analysis reports for PatraNiaga to detect maintenance cost anomalies and monitor petroleum facility maintenance expenses
**Primary Use**: Anomaly detection for unusual maintenance costs in gas/oil operations
**Integration**: Combines labor costs, material usage, and penalties for cost analysis and reporting

## Invoice Generation

### Generation Triggers (Configurable)
- **On-demand**: Admin manually generates
- **Scheduled**: Auto-generate monthly/weekly (if enabled)
- **Per Work Order completion**: Immediate invoice creation
- **Per Terminal/Region consolidation**: Grouped billing
- **Custom date range**: Flexible reporting periods

### Grouping Options
- **Single Work Order invoice**: Individual task billing
- **Multiple Work Orders**: Same Terminal/Region/period
- **Configurable grouping rules**: Admin-defined criteria
- **Recipient-based grouping**: By invoice recipient

## Invoice Components

### 1. Labor Cost
**Configuration**: Fully configurable pricing system
**Variables**:
- **Worker role**: Different rates per role type
- **Task type**: Preventive vs corrective maintenance
- **Terminal**: Location-specific pricing
- **Region**: Regional rate variations
- **Time-based**: Hourly rates (TBD)
- **Fixed rate**: Per work order pricing (TBD)

**Calculation Method**: TBD - time-based vs fixed rate not defined
**Management**: Set by Admin/Supervisor

### 2. Material Cost
**Source**: Inventory system integration
**Calculation**: Sum of consumed items × unit prices
**Components**:
- **Item identification**: From work order consumption
- **Quantities used**: Actual vs planned tracking
- **Unit prices**: From inventory master data
- **Category subtotals**: Grouped material costs

### 3. Penalties
**Application**: Added to invoice total for overdue work orders
**Calculation**: Dynamic based on configured rules

**Penalty Methods** (configurable by Admin/Supervisor):
- **Per Item**: Fixed amount × days overdue
  - Example: $50/day overdue
- **Percentage**: Base amount × percentage × days overdue
  - Base options: labor cost, total Work Order value, material cost
  - Example: 5% of labor cost per day

**Configuration Flexibility**:
- **Different rules** per Work Order type, priority, terminal, or region
- **Escalating penalties**: Increasing rates over time
- **Penalty caps**: Maximum penalty amounts
- **Grace periods**: Days before penalties apply

## Invoice Structure

### Summary View
```
Total Invoice Amount: $X,XXX
  - Labor Cost: $X,XXX
  - Material Cost: $XXX
  - Penalties: $XXX
```

### Category Breakdown
```
Labor Cost: $X,XXX
  - Preventive Maintenance: $XXX
  - Corrective Maintenance: $XXX
  
Material Cost: $XXX
  - Pipeline Components: $XXX
  - Pump & Compressor Parts: $XXX
  - Safety Equipment: $XXX
  - Consumables: $XXX
  
Penalties: $XXX
  - Overdue Work Orders: $XXX
  - Late Submissions: $XXX
```

### Activity Detail
```
Work Order #001 - Gas Pipeline Pressure Test
  Labor: $200 (Worker A, 4 hours @ $50/hr)
  Materials: $120 (Pipeline gaskets x2 @ $60)
  Penalty: $0
  Subtotal: $320

Work Order #002 - Compressor Maintenance (OVERDUE)
  Labor: $150 (Worker B, 3 hours @ $50/hr)
  Materials: $180 (Compressor oil 5L @ $36/L)
  Penalty: $75 (3 days overdue @ $25/day)
  Subtotal: $405
```

## Invoice Recipients

### Flexible Recipients
**Configurable per invoice**:
- Terminal Manager
- Regional Manager
- External Client
- Contractor
- Finance Department
- Multiple recipients per invoice

### Recipient Configuration
- **Default recipients** per terminal/region
- **Override capability** for specific invoices
- **CC/BCC options** for additional notifications
- **Delivery preferences** (TBD: email, in-system, export)

## Pricing Configuration

### Labor Pricing Rules
**Configurable by Admin/Supervisor**:
- **Base rates** per role (Admin, Supervisor, Worker)
- **Location multipliers** (Terminal-specific adjustments)
- **Task type multipliers** (Preventive vs Corrective)
- **Overtime rates** (if time-based calculation)
- **Holiday/weekend rates** (premium pricing)

### Material Pricing
**Source**: Inventory system unit prices
**Markup options**:
- **Cost-plus pricing**: Inventory cost + markup percentage
- **Fixed pricing**: Override inventory costs with fixed rates
- **Category-based markup**: Different markups per material category

### Penalty Configuration Interface
**Admin/Supervisor can configure**:
- **Penalty calculation method** (per item vs percentage)
- **Base amounts** and percentages
- **Escalation rules** (increasing penalties over time)
- **Exemption rules** (emergency work orders, force majeure)
- **Approval requirements** for penalty adjustments

## Invoice Workflow

### 1. Generation Process
```
Trigger occurs (manual/scheduled/completion)
  ↓
System identifies work orders for billing period
  ↓
Calculates labor costs based on pricing rules
  ↓
Retrieves material costs from inventory consumption
  ↓
Applies penalty calculations for overdue items
  ↓
Generates invoice with selected grouping
  ↓
Sends to configured recipients
```

### 2. Review & Approval
**Optional workflow**:
- **Draft invoice** generation for review
- **Admin/Supervisor approval** before sending
- **Modification capability** for manual adjustments
- **Approval audit trail** for changes

### 3. Distribution
- **In-system notification** to recipients
- **Export capabilities** (PDF, Excel, etc.)
- **Email delivery** (TBD - prototype scope)
- **Integration hooks** for external accounting systems

## Cost Analysis & Reporting

### Cost Breakdown Analytics
- **Labor vs Material vs Penalty** ratios
- **Terminal/Region** cost comparisons
- **Trend analysis** over time periods
- **Category performance** (which materials cost most)
- **Worker productivity** cost analysis

### Performance Metrics
- **Average cost per work order** by type
- **Material efficiency** (planned vs actual costs)
- **Penalty trends** (improving or worsening)
- **Regional cost variations** and reasons

## Integration Points

### Work Order System
- **Completion status** for billing eligibility
- **Labor time tracking** (if time-based pricing)
- **Task categorization** for pricing rules
- **Due date tracking** for penalty calculation

### Inventory System
- **Material consumption** data
- **Unit prices** for cost calculation
- **Category information** for breakdown analysis

### User Management
- **Worker role information** for labor pricing
- **Location assignments** for regional pricing
- **Approval hierarchy** for invoice review

## Technical Requirements

### Calculation Engine
- **Real-time cost calculation** as work orders complete
- **Flexible pricing rule** evaluation
- **Accurate penalty computation** with complex rules
- **Currency handling** and precision

### User Interface
- **Invoice builder** with drag-and-drop grouping
- **Cost breakdown** drill-down capabilities
- **Pricing configuration** interface for admins
- **Preview functionality** before final generation

### Export & Integration
- **Multiple format export** (PDF, Excel, CSV)
- **Template customization** for invoice layouts
- **API endpoints** for external system integration
- **Batch processing** for large invoice runs

## Success Criteria
1. ✅ Invoice generation with multiple view levels
2. ✅ Configurable pricing and penalty rules (admin interface)
3. ✅ Accurate cost calculation from work orders
4. ✅ Material cost integration from inventory
5. ✅ Penalty calculation and display
6. ✅ Flexible grouping and recipient options
7. ✅ Cost breakdown and drill-down analysis

## Mock Data Requirements

### Sample Invoices (20-30)
- **Various grouping methods**: Single WO, multiple WO, regional
- **Different recipients**: Terminal managers, regional managers, clients
- **Breakdown examples**: Detailed cost analysis
- **Penalty scenarios**: Some invoices with overdue penalties
- **Time period variety**: Weekly, monthly, quarterly samples

### Pricing Scenarios
- **Multiple labor rates** by role and location
- **Material markup** examples
- **Penalty calculation** demonstrations
- **Cost trend** data for analytics

## Open Questions
1. **Labor Calculation**: Time-based vs fixed rate pricing?
2. **Time Tracking**: How are worker hours captured and verified?
3. **Penalty Responsibility**: Who ultimately pays penalties?
4. **Currency**: Multi-currency support needed?
5. **Tax Handling**: Tax calculation and compliance requirements?
6. **Payment Terms**: Integration with payment processing?
7. **Audit Requirements**: Financial audit trail and compliance?
8. **External Integration**: Which accounting systems to integrate with?