# PRD: Inventory Management System

## Overview
**Purpose**: Track inventory items, monitor stock levels, and manage material consumption for maintenance activities
**Integration**: Links with work orders for material usage and invoice generation for cost calculation

## Item Master Data

### Core Fields (Configurable)
- **Item Name**: Descriptive name of the inventory item
- **Item Code/SKU**: Unique identifier for tracking
- **Category**: Grouping for organization and reporting
- **Unit of Measure**: Standard unit (pieces, liters, meters, etc.)
- **Current Stock Level**: Available quantity in inventory
- **Minimum Threshold**: Alert trigger level
- **Unit Price**: Cost per unit for invoice calculation
- **Storage Location**: TBD - per Terminal/Region/Central not defined
- **Supplier Information**: Vendor details (optional)

### Additional Metadata
- **Description**: Detailed item specifications
- **Brand/Manufacturer**: Equipment compatibility
- **Serial Numbers**: For high-value items (optional)
- **Expiry Date**: For consumables with shelf life
- **Last Updated**: Timestamp of last stock change
- **Last Restocked**: Date of last inventory replenishment

## Stock Management

### Stock Levels
- **Current Stock**: Real-time available quantity
- **Reserved Stock**: Allocated to pending work orders
- **Available Stock**: Current minus reserved
- **Reorder Point**: Calculated based on usage patterns
- **Maximum Stock**: Storage capacity limit (optional)

### Stock Movements
- **Inbound**: Purchase receipts, transfers in
- **Outbound**: Work order consumption, transfers out
- **Adjustments**: Manual corrections, damaged goods
- **History**: Complete audit trail of all movements

## Alert System

### Low Stock Alerts
**Trigger**: Stock level drops below minimum threshold
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

**Alert Configuration**:
- **Threshold configurable** per item
- **Can be adjusted** anytime by Admin
- **Multiple alert levels** (warning, critical)
- **Alert frequency** to prevent spam

### Alert Recipients
- **Primary**: Admin users
- **Secondary**: Terminal managers (configurable)
- **Escalation**: Regional supervisors (if critical)

## Consumption Tracking

### Link to Work Orders
**Purpose**: Track material usage per completed work order for accurate cost calculation

**Usage Scenarios**:
- **Pre-planned**: Work orders specify required items/materials
- **Actual consumption**: Workers report actual usage during completion
- **Variance tracking**: Planned vs actual usage analysis

**Implementation Method**: TBD - how items are deducted from stock
- **Option A**: Auto-deduct when Work Order completed
- **Option B**: Worker manually records usage
- **Option C**: Admin reviews and approves consumption

### Cost Calculation
- **Work Order costing**: Sum of consumed items × unit prices
- **Material cost component** for invoice generation
- **Usage analytics** for optimization

## Inventory Categories

### Petroleum Gas/Oil Maintenance Categories
- **Pipeline Components**: Gas pipes, oil pipes, fittings, valves, gaskets
- **Pump & Compressor Parts**: Impellers, seals, bearings, coupling parts
- **Safety & Emergency Equipment**: Gas detectors, fire suppression systems, emergency valves, safety barriers
- **Filtration Systems**: Oil filters, gas filters, separator elements, strainers
- **Instrumentation**: Pressure gauges, flow meters, temperature sensors, control valves
- **Electrical & Control**: Explosion-proof electrical components, control panels, cables
- **Consumables**: Lubricating oils, hydraulic fluids, sealants, cleaning solvents
- **Tools & Maintenance**: Specialized petroleum tools, torque wrenches, leak detection equipment

### Category Management
- **Hierarchical structure**: Main category → Sub-category
- **Custom categories**: Admin-defined based on needs
- **Category-specific fields**: Additional attributes per category
- **Reporting by category**: Usage and cost analysis

## Purchase Management

### Purchase Requests
**Triggered by**: Low stock alerts or admin initiative
**Workflow**: TBD - detailed purchase process not defined

**Request Information**:
- **Item details**: Name, code, quantity needed
- **Urgency level**: Normal, urgent, emergency
- **Justification**: Reason for purchase
- **Preferred supplier**: Based on item master data
- **Estimated cost**: Budget planning

### Purchase Approval
- **Approval workflow**: TBD - multi-level approvals?
- **Budget verification**: Against allocated budgets
- **Supplier selection**: Based on criteria (cost, quality, delivery)

## Storage & Location

### Storage Strategy
**Current Status**: TBD - location strategy not defined
**Options**:
- **Per Terminal**: Each terminal maintains own inventory
- **Per Region**: Regional warehouses serve multiple terminals
- **Central**: Single central warehouse with distribution
- **Hybrid**: Combination based on item types

### Location Tracking
- **Physical location**: Where items are stored
- **Transfer management**: Between locations
- **Location-specific stock levels**: Visibility per location

## Reporting & Analytics

### Stock Reports
- **Current stock levels** across all items
- **Low stock items** requiring attention
- **Stock movement** history and trends
- **Usage patterns** by terminal/region
- **Cost analysis** by category/time period

### Performance Metrics
- **Inventory turnover**: How quickly stock is consumed
- **Stock accuracy**: Physical vs system counts
- **Usage efficiency**: Planned vs actual consumption
- **Cost optimization**: Best performing suppliers/items

## Integration Points

### Work Order System
- **Material requirements** planning
- **Consumption recording** during work completion
- **Cost calculation** for invoicing

### Invoice System
- **Material cost component** from consumed items
- **Item prices** from inventory master data
- **Usage tracking** for billing accuracy

### Notification System
- **Low stock alerts** to relevant users
- **Purchase notifications** for approval workflow
- **Stock movement** confirmations

## Technical Requirements

### User Interface
- **Item search** and filtering capabilities
- **Stock level** visual indicators (green/yellow/red)
- **Quick actions** for common tasks (adjust stock, reorder)
- **Mobile interface** for field inventory checks

### Data Management
- **Real-time** stock level updates
- **Batch operations** for bulk stock adjustments
- **Import/export** capabilities for external systems
- **Audit trail** for all inventory changes

### Performance
- **Fast search** across large item catalogs
- **Efficient reporting** for real-time dashboards
- **Scalable storage** for growing inventory data

## Success Criteria
1. ✅ Inventory tracking with threshold alerts
2. ✅ Integration with work order material requirements
3. ✅ Cost calculation for invoice generation
4. ✅ Stock movement audit trail
5. ✅ Category-based organization and reporting
6. ✅ Low stock alert system functionality

## Mock Data Requirements

### Sample Items (50-100 items)
- **Petroleum-specific categories**: Pipeline components, pump parts, safety equipment, filtration systems
- **Realistic pricing**: Industry-appropriate unit costs for gas/oil maintenance
- **Some below threshold**: Critical safety items for alert demonstration
- **Different units**: Pieces, liters, meters, kg, PSI ratings, etc.
- **Examples**: Gas detector sensors, pipeline gaskets, compressor oil, pressure relief valves

### Sample Scenarios
- **Stock movements**: Recent transactions
- **Low stock items**: Trigger alert demonstrations
- **Usage history**: Consumption patterns
- **Category distribution**: Balanced across categories

## Open Questions
1. **Storage Location**: Per Terminal, Regional, or Central warehouse?
2. **Consumption Method**: Auto-deduct vs manual recording vs approval?
3. **Purchase Workflow**: Detailed approval and procurement process?
4. **Multi-location**: How to handle inventory across multiple locations?
5. **Physical Inventory**: Periodic counting and reconciliation process?
6. **Supplier Integration**: Direct integration with supplier systems?
7. **Barcode/RFID**: Physical item tracking and scanning capabilities?