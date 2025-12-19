# Hierarchical Work Order Categorization & Template System

## Problem Statement

The current CMMS lacks a structured categorization system for work orders that can serve as templates and Standard Operating Procedures (SOPs) for preventive maintenance. While work orders have basic type classification (`preventive`/`corrective`), there's no hierarchical organization that enables:

1. **Standardization** of maintenance procedures across similar equipment
2. **Reusable templates** for recurring preventive maintenance tasks
3. **Consistent SOPs** that ensure quality and compliance
4. **Efficient work order creation** from predefined templates
5. **Better organization** and searchability of maintenance activities

## Current State Analysis

### Existing Work Order Structure
```typescript
interface WorkOrder {
  type: 'preventive' | 'corrective';
  subType?: 'planned' | 'incidental';
  parentId?: string; // For parent-child hierarchy
  children?: WorkOrder[]; // Sub-tasks
  // ... other fields
}
```

### Current Limitations
- **No categorical organization** beyond basic type/subType
- **No template system** for reusing successful maintenance procedures
- **Manual work order creation** requires defining everything from scratch
- **Inconsistent procedures** across similar maintenance tasks
- **No SOP standardization** for preventive maintenance

### Existing Maintenance Categories (Identified from Mock Data)
1. **Pipeline Maintenance**
   - Gas Pipeline Pressure Test
   - Pipeline Valve Maintenance  
   - Emergency Gas Leak Repair

2. **Compressor/Pump Systems**
   - Gas Compressor Monthly Inspection
   - Pump Station Routine Maintenance

3. **Safety Systems**
   - Fire & Gas Detection System Calibration

4. **Storage/Tank Systems**
   - Tank Inspection and Cleaning

## Proposed Solution: Hierarchical Work Order Groups & Templates

### Core Concept
Create a **three-tier system**:

1. **Work Order Categories** - Hierarchical categorization system
2. **Work Order Templates** - Reusable SOPs with predefined procedures
3. **Work Order Instances** - Actual work orders created from templates

### System Architecture

```
Work Order Category Tree
├── Pipeline Maintenance (Category)
│   ├── Gas Pipeline Systems (Sub-category)
│   │   ├── Pressure Testing (Template)
│   │   ├── Leak Detection (Template)
│   │   └── Emergency Repairs (Template)
│   └── Pipeline Valves (Sub-category)
│       ├── Routine Valve Maintenance (Template)
│       └── Valve Replacement (Template)
├── Compressor & Pump Systems (Category)
│   ├── Gas Compressors (Sub-category)
│   │   ├── Monthly Inspection (Template)
│   │   └── Annual Overhaul (Template)
│   └── Pump Stations (Sub-category)
│       ├── Weekly Maintenance (Template)
│       └── Filter Replacement (Template)
└── Safety Systems (Category)
    └── Fire & Gas Detection (Sub-category)
        ├── Quarterly Calibration (Template)
        └── Emergency System Test (Template)
```

## Data Model Design

### 1. Work Order Category
```typescript
interface WorkOrderCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string; // For hierarchical structure
  children?: WorkOrderCategory[];
  level: number; // 1 = Category, 2 = Sub-category, 3+ = Further subdivisions
  iconName?: string; // For UI display
  color?: string; // For visual identification
  isActive: boolean;
  sortOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Work Order Template
```typescript
interface WorkOrderTemplate {
  id: string;
  name: string;
  description: string;
  categoryId: string; // Links to WorkOrderCategory
  category?: WorkOrderCategory;
  
  // Template Configuration
  type: 'preventive' | 'corrective';
  subType?: 'planned' | 'incidental';
  defaultPriority: Priority;
  estimatedDuration: number; // in hours
  
  // SOP Content
  sopSteps?: SOPStep[]; // Detailed procedure steps
  safetyRequirements?: string[];
  prerequisites?: string[];
  
  // Predefined Elements
  checklist: ChecklistItemTemplate[];
  materials: MaterialRequirementTemplate[];
  requiredSkills?: string[];
  requiredCertifications?: string[];
  
  // Scheduling
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern; // For preventive maintenance
  
  // Template Metadata
  version: string; // For SOP version control
  approvedBy?: string;
  approvedAt?: string;
  isActive: boolean;
  tags: string[];
  
  // Usage Statistics
  usageCount: number;
  lastUsedAt?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### 3. SOP Step
```typescript
interface SOPStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  estimatedDuration?: number; // in minutes
  isRequired: boolean;
  safetyNotes?: string[];
  requiredTools?: string[];
  attachments?: string[]; // Reference documents, diagrams
}
```

### 4. Checklist Item Template
```typescript
interface ChecklistItemTemplate {
  id: string;
  label: string;
  type: 'yes_no' | 'number' | 'text' | 'dropdown' | 'rating';
  required: boolean;
  unit?: string;
  options?: string[];
  minValue?: number;
  maxValue?: number;
  defaultValue?: any;
  helpText?: string;
  validationRules?: ValidationRule[];
}
```

### 5. Material Requirement Template
```typescript
interface MaterialRequirementTemplate {
  itemId: string;
  itemName: string; // Cached for display
  plannedQuantity: number;
  isOptional: boolean;
  alternativeItems?: string[]; // Alternative item IDs
  notes?: string;
}
```

### 6. Recurrence Pattern
```typescript
interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';
  interval: number; // Every N periods
  daysOfWeek?: number[]; // For weekly (0-6, Sun-Sat)
  dayOfMonth?: number; // For monthly
  monthOfYear?: number; // For annually
  customCronExpression?: string; // For complex schedules
}
```

### 7. Enhanced Work Order
```typescript
interface WorkOrder {
  // ... existing fields
  templateId?: string; // Links to WorkOrderTemplate
  template?: WorkOrderTemplate;
  categoryPath: string; // Full category path for searching/filtering
  sopVersion?: string; // Version of SOP used
  
  // New workflow fields
  sopStepsCompleted?: string[]; // Track completed SOP steps
  deviationsFromSOP?: SOPDeviation[];
}

interface SOPDeviation {
  stepId: string;
  reason: string;
  approvedBy?: string;
  notes?: string;
  timestamp: string;
}
```

## Admin Management Capabilities

### 1. Hierarchical Category Management
**Core Admin Functions**:
- **Create Categories**: Add new categories at any level of the hierarchy
- **Edit Categories**: Modify category names, descriptions, icons, and colors
- **Delete Categories**: Remove categories with validation (prevent deletion if templates exist)
- **Reorganize Hierarchy**: Move categories and sub-categories via drag-and-drop
- **Bulk Operations**: Import/export categories, mass updates, and bulk activation/deactivation
- **Category Validation**: Ensure unique names within parent scope, prevent circular references

**Administrative Controls**:
- **Sort Order Management**: Define display order within category levels
- **Icon and Color Assignment**: Visual identification for each category
- **Active/Inactive Status**: Enable/disable categories without deletion
- **Category Analytics**: View usage statistics and template distribution per category

### 2. Template Management
- **Create Templates**: Admins can create templates with predefined procedures
- **Version Control**: Track SOP versions and maintain change history
- **Approval Workflow**: Templates require supervisor approval before use
- **Template Library**: Searchable repository of approved templates

**Advanced Template Administration**:
- **Template Lifecycle Management**: Draft → Review → Approved → Active → Deprecated
- **Clone/Duplicate Templates**: Create new templates based on existing ones
- **Template Validation**: Ensure all required fields and dependencies are met
- **Bulk Template Operations**: Mass updates, category reassignment, and archiving

## Role-Based Access Control

### 1. Admin Permissions for Hierarchical Groups
**Category Management**:
- ✅ **Create/Edit/Delete** categories at any level
- ✅ **Reorganize hierarchy** via drag-and-drop interface
- ✅ **Bulk operations** on multiple categories
- ✅ **Import/Export** category structures
- ✅ **View analytics** and usage statistics
- ✅ **Configure visual settings** (icons, colors, sort order)
- ✅ **Manage activation status** of categories

**Template Management**:
- ✅ **Create/Edit/Delete** work order templates
- ✅ **Approve templates** created by others
- ✅ **Version control** and template lifecycle management
- ✅ **Clone templates** across categories
- ✅ **Bulk template operations** and reassignment
- ✅ **Configure template settings** (recurring patterns, approvals)

### 2. Supervisor Permissions  
**Limited Category Access**:
- ✅ **View categories** and browse hierarchy
- ✅ **Create templates** within existing categories (requires approval)
- ✅ **Edit own templates** before approval
- ✅ **Use approved templates** for work order creation
- ❌ **Cannot modify** category structure or settings

### 3. Worker/Leader Permissions
**Read-Only Category Access**:
- ✅ **Browse categories** when creating work orders
- ✅ **Use approved templates** for work order creation
- ✅ **View template procedures** and SOP steps
- ❌ **Cannot create/edit** categories or templates
- ❌ **Cannot access** admin management interfaces

### 4. Navigation Structure

#### Admin Navigation Menu
```
Dashboard
├── Work Orders
├── Inventory  
├── Invoices
├── Messages
└── Administration 👑
    ├── User Management
    ├── Category Management ⭐ (NEW)
    ├── Template Management ⭐ (NEW)  
    ├── Settings
    └── Analytics
```

#### Category Management Sub-Navigation
```
Administration > Category Management
├── 📁 Categories
│   ├── Overview & Analytics
│   ├── Category Tree
│   ├── Import/Export
│   └── Bulk Operations
└── 📋 Templates  
    ├── Template Library
    ├── Create Template
    ├── Approval Queue
    └── Version History
```

### 5. Security Considerations
- **RBAC enforcement** at API level prevents unauthorized access
- **UI-level guards** hide admin features from non-admin users  
- **Audit logging** tracks all category and template modifications
- **Approval workflows** prevent unauthorized template deployment
- **Data validation** ensures category hierarchy integrity

### 6. Admin Data Management Policies

#### Category Management Validation Rules
```typescript
// Admin category management validation
const categoryValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    uniqueWithinParent: true,
    pattern: /^[a-zA-Z0-9\s\-&()]+$/ // Alphanumeric, spaces, hyphens, ampersands, parentheses
  },
  
  hierarchy: {
    maxDepth: 10, // Prevent overly deep hierarchies
    preventCircularReference: true,
    validateParentExists: true
  },
  
  deletion: {
    preventIfHasChildren: true,
    preventIfHasTemplates: true,
    requireConfirmation: true,
    cascadeOptions: ['move_children', 'move_templates', 'archive_only']
  },
  
  activation: {
    deactivateDescendants: true, // When parent is deactivated
    preventUseInNewTemplates: true // When category is inactive
  }
};

// Bulk operation limits
const bulkOperationLimits = {
  maxSelections: 50, // Maximum categories in bulk operation
  timeoutMs: 30000,  // Bulk operation timeout
  batchSize: 10      // Process in batches to prevent timeouts
};
```

#### Template Management Validation Rules
```typescript
// Admin template management validation
const templateValidationRules = {
  basic: {
    name: { required: true, minLength: 3, maxLength: 150 },
    description: { required: true, minLength: 10, maxLength: 500 },
    categoryId: { required: true, mustExist: true, mustBeActive: true },
    estimatedDuration: { min: 0.5, max: 48 } // hours
  },
  
  checklist: {
    minItems: 1,
    maxItems: 50,
    requiredItemsLimit: 20, // Max required checklist items
    validTypes: ['yes_no', 'number', 'text', 'dropdown', 'rating']
  },
  
  materials: {
    maxItems: 30,
    validateItemExists: true,
    preventDuplicateItems: true
  },
  
  sopSteps: {
    maxSteps: 20,
    maxStepDuration: 240, // minutes per step
    requireSequentialNumbering: true
  },
  
  approval: {
    requireSupervisorApproval: true,
    preventSelfApproval: true,
    approvalTimeoutDays: 14
  }
};
```

#### Data Integrity Enforcement
```typescript
// Admin data management policies
const dataIntegrityPolicies = {
  categoryDeletion: {
    // When admin deletes a category with dependencies
    steps: [
      'validatePermissions',
      'checkTemplateCount', 
      'checkWorkOrderCount',
      'presentOptions',      // Move vs archive vs cascade delete
      'confirmAction',
      'executeWithAuditLog'
    ]
  },
  
  templateVersioning: {
    // When admin modifies approved template
    autoVersionBump: true,
    preservePreviousVersions: 5,
    notifyAffectedWorkOrders: true,
    allowGracefulMigration: true
  },
  
  hierarchyReorganization: {
    // When admin moves categories
    validateNewPosition: true,
    preventCircularReferences: true,
    updateAffectedTemplates: true,
    maintainWorkOrderReferences: true
  },
  
  auditLogging: {
    // All admin actions are logged
    logActions: [
      'category_create', 'category_update', 'category_delete', 'category_move',
      'template_create', 'template_update', 'template_delete', 'template_approve',
      'bulk_operation', 'import_export'
    ],
    includeDetails: ['userId', 'timestamp', 'changes', 'ipAddress'],
    retentionDays: 365
  }
};
```

### 3. SOP Features
- **Step-by-step procedures** with detailed instructions
- **Safety requirements** and prerequisites
- **Required tools and materials** specification
- **Skill/certification requirements** for workers
- **Reference attachments** (manuals, diagrams, videos)

### 4. Template Usage
- **Quick Work Order Creation**: Create work orders from templates in seconds
- **SOP Compliance Tracking**: Monitor adherence to standard procedures
- **Deviation Recording**: Track when procedures are modified with reasons
- **Performance Analytics**: Measure template effectiveness and usage

### 5. Standardization Benefits
- **Consistent Quality**: Same procedures across all similar maintenance
- **Training Material**: Templates serve as training guides for new workers
- **Compliance**: Ensure regulatory and safety requirements are met
- **Knowledge Retention**: Capture best practices from experienced workers

## Integration with Existing System

### 1. Work Order Creation Enhancement
```typescript
// Enhanced CreateWorkOrderForm
interface CreateWorkOrderForm {
  // ... existing fields
  templateId?: string; // Optional - create from template
  categoryId?: string; // For manual categorization
  
  // When template is selected:
  // - Checklist auto-populated from template
  // - Materials auto-populated from template
  // - Estimated duration set from template
  // - SOP steps included
}
```

### 2. Work Order Display Enhancement
- **Category breadcrumb**: Show full category path
- **Template information**: Display source template and version
- **SOP steps**: Show procedure steps in work order detail
- **Progress tracking**: Visual indication of SOP step completion

### 3. Search and Filtering Enhancement
- **Category filtering**: Filter work orders by category hierarchy
- **Template-based search**: Find work orders created from specific templates
- **SOP compliance reporting**: Track adherence to procedures

### 4. Dashboard Integration
- **Template usage metrics**: Most used templates, success rates
- **Category analytics**: Maintenance distribution by category
- **SOP compliance dashboard**: Deviation tracking and trends

## Implementation Strategy

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Create core data model and admin category management

**Deliverables**:
1. **New Type Definitions** (`src/types/templates.ts`)
2. **Mock Data** for categories and templates
3. **Category Store** (`src/stores/category.ts`)
4. **Template Store** (`src/stores/template.ts`)
5. **Admin Category Management UI** (`src/views/admin/CategoryManagement.vue`)
6. **Admin Navigation Enhancement** (add category management to admin menu)

**Key Tasks**:
- Define TypeScript interfaces
- Create mock hierarchical categories
- Implement category tree structure with admin controls
- Admin CRUD operations for categories with validation
- Drag-and-drop category reorganization
- Bulk operations (activate/deactivate/move/delete)
- Import/Export functionality for category data

### Phase 2: Template System (Weeks 3-4)
**Goal**: Build template creation and management

**Deliverables**:
1. **Template Creation UI** (`src/views/templates/CreateTemplate.vue`)
2. **Template Management** (`src/views/templates/TemplateList.vue`)
3. **SOP Step Builder** (`src/components/template/SOPStepBuilder.vue`)
4. **Template Preview** (`src/components/template/TemplatePreview.vue`)

**Key Tasks**:
- Template CRUD operations
- SOP step builder interface
- Checklist template builder
- Material requirement template builder

### Phase 3: Work Order Integration (Weeks 5-6)
**Goal**: Integrate templates with work order creation

**Deliverables**:
1. **Enhanced Work Order Creation** (modify existing `CreateWorkOrder.vue`)
2. **Template Selector** (`src/components/workorder/TemplateSelector.vue`)
3. **Category Browser** (`src/components/category/CategoryBrowser.vue`)
4. **Work Order Template Preview**

**Key Tasks**:
- Template selection in work order creation
- Auto-population from templates
- Category assignment
- Enhanced work order display

### Phase 4: SOP Workflow (Weeks 7-8)
**Goal**: Implement SOP compliance and tracking

**Deliverables**:
1. **SOP Step Tracker** (`src/components/workorder/SOPStepTracker.vue`)
2. **Deviation Recording** (`src/components/workorder/SOPDeviation.vue`)
3. **SOP Compliance Reports**
4. **Template Analytics Dashboard**

**Key Tasks**:
- SOP step completion tracking
- Deviation recording workflow
- Compliance reporting
- Template usage analytics

## UI/UX Design Requirements

### 1. Admin Category Management Interface
```vue
<!-- AdminCategoryManagement.vue -->
<template>
  <div class="admin-category-management">
    <!-- Header with Admin Controls -->
    <div class="admin-header">
      <h1>Work Order Category Management</h1>
      <div class="admin-actions">
        <Button @click="addRootCategory" icon="Plus">
          Add Root Category
        </Button>
        <Button @click="showImportDialog" variant="outline" icon="Upload">
          Import Categories
        </Button>
        <Button @click="exportCategories" variant="outline" icon="Download">
          Export Categories
        </Button>
        <Button @click="showAnalytics" variant="outline" icon="BarChart">
          View Analytics
        </Button>
      </div>
    </div>
    
    <!-- Search and Filter -->
    <div class="search-filter-bar">
      <SearchBox
        v-model="searchTerm"
        placeholder="Search categories and templates..."
      />
      <FilterDropdown v-model="statusFilter" :options="statusOptions" />
      <ViewToggle v-model="viewMode" :options="['tree', 'list', 'grid']" />
    </div>
    
    <!-- Category Tree with Admin Controls -->
    <div class="category-tree-container">
      <!-- Tree View -->
      <div class="category-tree">
        <AdminCategoryTreeNode
          v-for="category in filteredCategories"
          :key="category.id"
          :category="category"
          :can-edit="true"
          :can-delete="canDeleteCategory(category)"
          :can-reorder="true"
          @edit="editCategory"
          @delete="deleteCategory"
          @add-child="addChildCategory"
          @move="moveCategory"
          @toggle-status="toggleCategoryStatus"
        />
      </div>
      
      <!-- Category Details Panel -->
      <div v-if="selectedCategory" class="category-details">
        <CategoryDetailPanel
          :category="selectedCategory"
          @update="updateCategory"
          @close="selectedCategory = null"
        />
      </div>
    </div>
    
    <!-- Category Form Modal -->
    <CategoryFormModal
      v-if="showCategoryForm"
      :category="editingCategory"
      :parent-category="parentCategory"
      @save="saveCategory"
      @cancel="hideCategoryForm"
    />
    
    <!-- Bulk Operations Bar -->
    <div v-if="selectedCategories.length > 0" class="bulk-operations">
      <span>{{ selectedCategories.length }} categories selected</span>
      <div class="bulk-actions">
        <Button @click="bulkActivate" variant="outline">Activate</Button>
        <Button @click="bulkDeactivate" variant="outline">Deactivate</Button>
        <Button @click="bulkMove" variant="outline">Move</Button>
        <Button @click="bulkDelete" variant="destructive">Delete</Button>
      </div>
    </div>
    
    <!-- Import/Export Dialogs -->
    <ImportCategoriesDialog
      v-if="showImportDialog"
      @import="importCategories"
      @cancel="showImportDialog = false"
    />
    
    <!-- Analytics Modal -->
    <CategoryAnalyticsModal
      v-if="showAnalyticsModal"
      @close="showAnalyticsModal = false"
    />
  </div>
</template>
```

### 2. Advanced Category Tree Node with Admin Features
```vue
<!-- AdminCategoryTreeNode.vue -->
<template>
  <div 
    class="admin-category-node"
    :class="{ 
      'is-dragging': isDragging,
      'is-inactive': !category.isActive,
      'is-selected': isSelected
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragover.prevent
    @drop="handleDrop"
  >
    <!-- Node Header -->
    <div class="node-header" @click="selectCategory">
      <div class="node-content">
        <!-- Selection Checkbox -->
        <Checkbox
          v-if="canSelect"
          :checked="isSelected"
          @change="toggleSelection"
        />
        
        <!-- Expand/Collapse -->
        <Button
          v-if="hasChildren"
          variant="ghost"
          size="sm"
          @click.stop="toggleExpand"
        >
          <ChevronRight :class="{ 'rotate-90': isExpanded }" />
        </Button>
        
        <!-- Category Icon and Color -->
        <div 
          class="category-indicator"
          :style="{ backgroundColor: category.color }"
        >
          <Icon :name="category.iconName" />
        </div>
        
        <!-- Category Info -->
        <div class="category-info">
          <span class="category-name">{{ category.name }}</span>
          <span v-if="category.description" class="category-description">
            {{ category.description }}
          </span>
          <div class="category-meta">
            <Badge v-if="!category.isActive" variant="secondary">Inactive</Badge>
            <Badge variant="outline">{{ templateCount }} templates</Badge>
            <Badge variant="outline">Level {{ category.level }}</Badge>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="node-actions">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="$emit('edit', category)">
              <Edit class="h-4 w-4 mr-2" />
              Edit Category
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('add-child', category)">
              <Plus class="h-4 w-4 mr-2" />
              Add Sub-category
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="$emit('toggle-status', category)">
              <Power class="h-4 w-4 mr-2" />
              {{ category.isActive ? 'Deactivate' : 'Activate' }}
            </DropdownMenuItem>
            <DropdownMenuItem @click="duplicateCategory">
              <Copy class="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              @click="$emit('delete', category)"
              :disabled="!canDelete"
              class="text-destructive"
            >
              <Trash2 class="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    
    <!-- Children -->
    <div v-if="isExpanded && hasChildren" class="node-children">
      <AdminCategoryTreeNode
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        :level="level + 1"
        v-bind="$props"
      />
    </div>
  </div>
</template>
```

### 3. Category Form with Advanced Options
```vue
<!-- CategoryFormModal.vue -->
<template>
  <Dialog :open="true" @update:open="$emit('cancel')">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? 'Edit Category' : 'Create Category' }}
        </DialogTitle>
      </DialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="name">Category Name*</Label>
              <Input
                id="name"
                v-model="form.name"
                required
                :error="errors.name"
              />
            </div>
            <div>
              <Label for="parent">Parent Category</Label>
              <CategorySelector
                id="parent"
                v-model="form.parentId"
                :exclude-id="category?.id"
                placeholder="Select parent (optional)"
              />
            </div>
          </div>
          
          <div>
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="form.description"
              rows="3"
            />
          </div>
        </div>
        
        <!-- Visual Configuration -->
        <div class="space-y-4">
          <h4 class="font-medium">Visual Settings</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="icon">Icon</Label>
              <IconSelector
                id="icon"
                v-model="form.iconName"
                :icons="availableIcons"
              />
            </div>
            <div>
              <Label for="color">Color</Label>
              <ColorPicker
                id="color"
                v-model="form.color"
                :presets="colorPresets"
              />
            </div>
          </div>
        </div>
        
        <!-- Advanced Settings -->
        <div class="space-y-4">
          <h4 class="font-medium">Advanced Settings</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                v-model.number="form.sortOrder"
                type="number"
                min="0"
              />
            </div>
            <div class="flex items-center space-x-2">
              <Switch
                id="isActive"
                v-model="form.isActive"
              />
              <Label for="isActive">Active</Label>
            </div>
          </div>
        </div>
        
        <!-- Validation and Preview -->
        <div v-if="validationErrors.length > 0" class="validation-errors">
          <Alert variant="destructive">
            <AlertTriangle class="h-4 w-4" />
            <AlertTitle>Validation Errors</AlertTitle>
            <AlertDescription>
              <ul class="list-disc list-inside">
                <li v-for="error in validationErrors" :key="error">
                  {{ error }}
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
        
        <!-- Preview -->
        <div class="category-preview">
          <Label>Preview</Label>
          <div class="preview-item">
            <div 
              class="category-indicator"
              :style="{ backgroundColor: form.color }"
            >
              <Icon :name="form.iconName" />
            </div>
            <span class="category-name">{{ form.name || 'Category Name' }}</span>
          </div>
        </div>
      </form>
      
      <DialogFooter>
        <Button type="button" variant="outline" @click="$emit('cancel')">
          Cancel
        </Button>
        <Button 
          type="submit"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          {{ isEditing ? 'Update' : 'Create' }} Category
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

### 2. Template Builder Interface
```vue
<!-- TemplateBuilder.vue -->
<template>
  <div class="template-builder">
    <!-- Template Header -->
    <div class="template-header">
      <Input v-model="template.name" placeholder="Template Name" />
      <CategorySelector v-model="template.categoryId" />
      <PrioritySelector v-model="template.defaultPriority" />
    </div>
    
    <!-- SOP Steps Builder -->
    <div class="sop-builder">
      <h3>Standard Operating Procedure</h3>
      <SOPStepBuilder v-model="template.sopSteps" />
    </div>
    
    <!-- Checklist Builder -->
    <div class="checklist-builder">
      <h3>Inspection Checklist</h3>
      <ChecklistTemplateBuilder v-model="template.checklist" />
    </div>
    
    <!-- Materials Builder -->
    <div class="materials-builder">
      <h3>Required Materials</h3>
      <MaterialTemplateBuilder v-model="template.materials" />
    </div>
    
    <!-- Preview & Actions -->
    <div class="template-actions">
      <Button @click="previewTemplate">Preview</Button>
      <Button @click="saveTemplate">Save Template</Button>
      <Button @click="submitForApproval">Submit for Approval</Button>
    </div>
  </div>
</template>
```

### 3. Enhanced Work Order Creation
```vue
<!-- Enhanced CreateWorkOrder.vue -->
<template>
  <div class="create-work-order">
    <!-- Creation Method Selection -->
    <div class="creation-method">
      <RadioGroup v-model="creationMethod">
        <RadioButton value="manual">Create Manually</RadioButton>
        <RadioButton value="template">Use Template</RadioButton>
      </RadioGroup>
    </div>
    
    <!-- Template Selection -->
    <div v-if="creationMethod === 'template'" class="template-selection">
      <CategoryBrowser @select-template="selectTemplate" />
      <TemplatePreview v-if="selectedTemplate" :template="selectedTemplate" />
    </div>
    
    <!-- Work Order Form (auto-populated if from template) -->
    <WorkOrderForm
      v-model="workOrderForm"
      :template="selectedTemplate"
      @submit="createWorkOrder"
    />
  </div>
</template>
```

### 4. SOP Compliance Tracking
```vue
<!-- SOPTracker.vue in WorkOrderDetail -->
<template>
  <div class="sop-tracker">
    <div class="sop-header">
      <h3>Standard Operating Procedure</h3>
      <Badge>{{ completedSteps }}/{{ totalSteps }} Steps Complete</Badge>
    </div>
    
    <div class="sop-steps">
      <div
        v-for="step in sopSteps"
        :key="step.id"
        class="sop-step"
        :class="{ completed: isStepCompleted(step.id) }"
      >
        <div class="step-header">
          <Checkbox
            :checked="isStepCompleted(step.id)"
            @change="toggleStep(step.id)"
          />
          <span class="step-number">{{ step.stepNumber }}</span>
          <span class="step-title">{{ step.title }}</span>
        </div>
        
        <div class="step-content">
          <p>{{ step.description }}</p>
          <div v-if="step.safetyNotes?.length" class="safety-notes">
            <AlertTriangle class="icon" />
            <ul>
              <li v-for="note in step.safetyNotes" :key="note">{{ note }}</li>
            </ul>
          </div>
        </div>
        
        <!-- Deviation Recording -->
        <Button
          v-if="canRecordDeviation(step.id)"
          variant="outline"
          @click="recordDeviation(step.id)"
        >
          Record Deviation
        </Button>
      </div>
    </div>
  </div>
</template>
```

## Technical Implementation Details

### 1. Store Management
```typescript
// src/stores/category.ts
export const useCategoryStore = defineStore('category', () => {
  const categories = ref<WorkOrderCategory[]>([]);
  const categoryTree = computed(() => buildCategoryTree(categories.value));
  
  const fetchCategories = async () => {
    // Fetch categories from API
  };
  
  const createCategory = async (category: Partial<WorkOrderCategory>) => {
    // Create new category
  };
  
  const updateCategory = async (id: string, updates: Partial<WorkOrderCategory>) => {
    // Update existing category
  };
  
  const deleteCategory = async (id: string) => {
    // Delete category (with validation)
  };
  
  const getCategoryPath = (categoryId: string): string => {
    // Return full path like "Pipeline Maintenance > Gas Pipeline Systems"
  };
  
  return {
    categories,
    categoryTree,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryPath
  };
});

// src/stores/template.ts
export const useTemplateStore = defineStore('template', () => {
  const templates = ref<WorkOrderTemplate[]>([]);
  const templatesByCategory = computed(() => {
    // Group templates by category
  });
  
  const fetchTemplates = async () => {
    // Fetch templates from API
  };
  
  const createWorkOrderFromTemplate = async (
    templateId: string,
    overrides: Partial<CreateWorkOrderForm>
  ): Promise<WorkOrder> => {
    // Create work order from template with overrides
  };
  
  const getTemplateUsageStats = async (templateId: string) => {
    // Get usage statistics for template
  };
  
  return {
    templates,
    templatesByCategory,
    fetchTemplates,
    createWorkOrderFromTemplate,
    getTemplateUsageStats
  };
});
```

### 2. Component Architecture
```
src/components/
├── category/
│   ├── CategoryBrowser.vue        # Tree browser for category selection
│   ├── CategoryForm.vue           # Create/edit category form
│   ├── CategoryTreeNode.vue       # Single tree node component
│   └── CategorySelector.vue       # Dropdown category selector
├── template/
│   ├── TemplateBuilder.vue        # Main template creation interface
│   ├── TemplatePreview.vue        # Preview template before using
│   ├── TemplateSelector.vue       # Select from available templates
│   ├── SOPStepBuilder.vue         # Build SOP steps
│   ├── ChecklistTemplateBuilder.vue # Build checklist templates
│   └── MaterialTemplateBuilder.vue  # Build material templates
└── workorder/
    ├── SOPTracker.vue             # Track SOP compliance
    ├── SOPDeviation.vue           # Record SOP deviations
    └── TemplateWorkOrderForm.vue   # Enhanced work order form
```

### 3. API Endpoints (Mock Implementation)
```typescript
// Category Management
GET    /api/categories              // Get all categories
POST   /api/categories              // Create category
PUT    /api/categories/:id          // Update category
DELETE /api/categories/:id          // Delete category
GET    /api/categories/:id/templates // Get templates in category

// Template Management
GET    /api/templates               // Get all templates
POST   /api/templates               // Create template
PUT    /api/templates/:id           // Update template
DELETE /api/templates/:id           // Delete template
POST   /api/templates/:id/approve   // Approve template
GET    /api/templates/:id/stats     // Get usage statistics

// Work Order Creation
POST   /api/workorders/from-template/:templateId // Create from template
POST   /api/workorders/:id/sop-step/:stepId/complete // Mark SOP step complete
POST   /api/workorders/:id/sop-deviation // Record SOP deviation
```

## Testing Strategy

### 1. Unit Tests
- **Category Store**: Test category tree building, CRUD operations
- **Template Store**: Test template creation, work order generation from templates
- **SOP Logic**: Test step completion tracking, deviation recording

### 2. Integration Tests
- **Template to Work Order**: Test complete flow from template to work order creation
- **Category Navigation**: Test hierarchical browsing and selection
- **SOP Compliance**: Test step tracking and deviation workflows

### 3. E2E Tests
```typescript
// Category Management E2E
test('Admin can create hierarchical categories', async ({ page }) => {
  await page.goto('/categories');
  await page.click('[data-testid="add-category"]');
  await page.fill('[data-testid="category-name"]', 'Pipeline Maintenance');
  await page.click('[data-testid="save-category"]');
  
  // Verify category appears in tree
  await expect(page.locator('[data-testid="category-tree"]')).toContainText('Pipeline Maintenance');
});

// Template Creation E2E
test('Admin can create work order template with SOP', async ({ page }) => {
  await page.goto('/templates/create');
  await page.fill('[data-testid="template-name"]', 'Monthly Compressor Inspection');
  await page.selectOption('[data-testid="category-selector"]', 'compressor-category-id');
  
  // Add SOP steps
  await page.click('[data-testid="add-sop-step"]');
  await page.fill('[data-testid="sop-step-title"]', 'Check suction pressure');
  
  // Save template
  await page.click('[data-testid="save-template"]');
});

// Work Order Creation from Template E2E
test('Worker can create work order from template', async ({ page }) => {
  await page.goto('/workorders/create');
  await page.click('[data-testid="use-template-option"]');
  await page.click('[data-testid="select-template-monthly-compressor"]');
  
  // Verify auto-population
  await expect(page.locator('[data-testid="work-order-title"]')).toHaveValue('Monthly Compressor Inspection');
  
  // Customize and create
  await page.selectOption('[data-testid="assigned-worker"]', 'worker1');
  await page.click('[data-testid="create-work-order"]');
});
```

### 4. Performance Tests
- **Category Tree Rendering**: Test with 1000+ categories
- **Template Loading**: Test template list with 500+ templates
- **Work Order Creation**: Test bulk creation from templates

## Migration Strategy

### 1. Data Migration
```sql
-- Create new tables
CREATE TABLE work_order_categories (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  parent_id VARCHAR REFERENCES work_order_categories(id),
  level INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE work_order_templates (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  category_id VARCHAR REFERENCES work_order_categories(id),
  type VARCHAR NOT NULL CHECK (type IN ('preventive', 'corrective')),
  sub_type VARCHAR CHECK (sub_type IN ('planned', 'incidental')),
  default_priority VARCHAR NOT NULL,
  estimated_duration INTEGER NOT NULL,
  sop_steps JSONB,
  checklist JSONB NOT NULL,
  materials JSONB NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  version VARCHAR DEFAULT '1.0',
  approved_by VARCHAR,
  approved_at TIMESTAMP,
  is_active BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign keys to work_orders table
ALTER TABLE work_orders 
ADD COLUMN template_id VARCHAR REFERENCES work_order_templates(id),
ADD COLUMN category_path VARCHAR,
ADD COLUMN sop_version VARCHAR,
ADD COLUMN sop_steps_completed JSONB DEFAULT '[]',
ADD COLUMN sop_deviations JSONB DEFAULT '[]';
```

### 2. Existing Data Classification
```typescript
// Migration script to categorize existing work orders
const categorizeExistingWorkOrders = async () => {
  const workOrders = await getExistingWorkOrders();
  
  for (const workOrder of workOrders) {
    const category = inferCategoryFromTitle(workOrder.title);
    if (category) {
      await updateWorkOrder(workOrder.id, {
        categoryPath: category.path
      });
    }
  }
};

const inferCategoryFromTitle = (title: string): Category | null => {
  if (title.toLowerCase().includes('pipeline')) {
    return { path: 'Pipeline Maintenance > Gas Pipeline Systems' };
  } else if (title.toLowerCase().includes('compressor')) {
    return { path: 'Compressor & Pump Systems > Gas Compressors' };
  }
  // ... more inference logic
  return null;
};
```

### 3. Template Creation from Existing Work Orders
```typescript
// Create templates from successful work orders
const createTemplatesFromWorkOrders = async () => {
  // Find work orders with high completion rates and good feedback
  const successfulWorkOrders = await findSuccessfulWorkOrders();
  
  for (const workOrder of successfulWorkOrders) {
    if (shouldCreateTemplate(workOrder)) {
      const template = convertWorkOrderToTemplate(workOrder);
      await createTemplate(template);
    }
  }
};
```

## Success Criteria

### 1. Functional Requirements
✅ **Category Management**
- [ ] Admins can create/edit/delete hierarchical categories
- [ ] Categories support unlimited depth with proper parent-child relationships
- [ ] Category tree displays correctly with expand/collapse functionality

✅ **Template System**
- [ ] Admins can create work order templates with complete SOP procedures
- [ ] Templates include predefined checklists, materials, and step-by-step instructions
- [ ] Templates support version control and approval workflows
- [ ] Template library is searchable and filterable by category

✅ **Work Order Integration**
- [ ] Users can create work orders from templates in under 30 seconds
- [ ] Template-based work orders auto-populate all relevant fields
- [ ] Workers can track SOP step completion during work execution
- [ ] Deviations from SOPs are recorded with reasons and approvals

✅ **Analytics & Reporting**
- [ ] Template usage statistics show most/least used procedures
- [ ] SOP compliance reports track adherence across work orders
- [ ] Category analytics show maintenance distribution patterns

### 2. Performance Requirements
- **Category Tree Loading**: < 500ms for 1000+ categories
- **Template Selection**: < 200ms to load template list
- **Work Order Creation**: < 1s from template selection to creation
- **SOP Step Tracking**: Real-time updates without page refresh

### 3. User Experience Requirements
- **Intuitive Navigation**: Category browsing feels natural and responsive
- **Template Discovery**: Users can easily find relevant templates
- **Guided Workflows**: Clear step-by-step guidance for complex procedures
- **Mobile Friendly**: SOP tracking works well on mobile devices

### 4. Business Impact Metrics
- **Standardization**: 80% of preventive maintenance uses templates within 3 months
- **Efficiency**: 50% reduction in work order creation time from templates
- **Quality**: 25% reduction in maintenance-related issues due to SOP compliance
- **Knowledge Retention**: 90% of maintenance procedures documented as templates

## Risk Analysis & Mitigation

### 1. Technical Risks
**Risk**: Complex hierarchical data structure performance issues
- **Mitigation**: Implement efficient tree traversal, caching, and lazy loading

**Risk**: Template versioning complexity
- **Mitigation**: Start with simple versioning, expand incrementally

### 2. User Adoption Risks
**Risk**: Resistance to using templates instead of manual creation
- **Mitigation**: 
  - Make template creation optional initially
  - Show clear time savings and consistency benefits
  - Provide training and support for template usage

**Risk**: Over-complication of simple maintenance tasks
- **Mitigation**:
  - Keep simple templates simple
  - Allow bypassing SOP steps when appropriate
  - Maintain manual work order creation as option

### 3. Data Migration Risks
**Risk**: Incorrect categorization of existing work orders
- **Mitigation**:
  - Manual review of auto-categorized work orders
  - Gradual migration with validation checkpoints
  - Rollback plan for migration issues

## Conclusion

The hierarchical work order categorization and template system will transform the CMMS from a basic tracking tool into a comprehensive maintenance management platform. By standardizing procedures, enabling reusability, and ensuring SOP compliance, this system will significantly improve maintenance quality, consistency, and efficiency across all terminals and regions.

The phased implementation approach ensures manageable development cycles while providing immediate value at each phase. The robust data model supports future enhancements while maintaining compatibility with existing workflows.

**Next Steps**:
1. Review and approve this implementation plan
2. Begin Phase 1 development with foundation data model
3. Create initial category structure based on existing maintenance patterns
4. Develop template creation UI for administrative users
5. Pilot test with a subset of preventive maintenance procedures

This system positions the CMMS for long-term scalability and sets the foundation for advanced features like AI-powered maintenance recommendations, predictive scheduling, and automated compliance reporting.