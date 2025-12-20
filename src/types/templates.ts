// Template and Category System Types for CMMS

import type { Priority } from './index';

// Work Order Category Types
export interface WorkOrderCategory {
  id: string;
  name: string;
  description?: string;
  code: string; // Unique category code (e.g., "PIPE_MAINT")
  parentId?: string; // For hierarchical structure
  children?: WorkOrderCategory[];
  level: number; // 1 = Category, 2 = Sub-category, 3+ = Further subdivisions
  path: string; // Full path (e.g., "Pipeline/Gas System/Pressure Testing")
  
  // Template management
  templates?: WorkOrderTemplate[]; // Associated templates
  templateCount: number; // Number of templates in this category
  
  // Business rules
  maintenanceTypes: ('preventive' | 'corrective')[]; // Allowed maintenance types
  requiredPermissions: string[]; // Permissions needed to use category
  defaultPriority: Priority; // Default priority for work orders in this category
  defaultEstimatedDuration: number; // Default duration in hours
  
  // Display properties
  iconName?: string; // For UI display
  color?: string; // For visual identification
  sortOrder: number;
  
  // Status and metadata
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string; // Last time a work order was created in this category
}

// SOP Step for templates
export interface SOPStep {
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

// Checklist Item Template
export interface ChecklistItemTemplate {
  id: string;
  templateId?: string; // Reference to parent template
  
  // Content
  label: string;
  description?: string;
  type: 'checkbox' | 'yes_no' | 'numeric' | 'number' | 'text' | 'dropdown' | 'rating' | 'photo' | 'signature' | 'boolean' | 'file_upload';
  
  // Validation
  required: boolean;
  unit?: string; // For number inputs (PSI, °C, etc.)
  options?: string[]; // For dropdown
  minValue?: number;
  maxValue?: number;
  ratingMin?: number; // For rating scale
  ratingMax?: number; // For rating scale
  pattern?: string; // Regex pattern for text validation
  defaultValue?: any;
  
  // Advanced Conditional Logic
  conditional?: boolean;
  conditionalLogic?: Array<{
    dependsOn: string; // ID of another checklist item
    condition: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
    action?: 'show' | 'hide' | 'require' | 'disable';
  }>;
  
  // Behavior
  order?: number; // Display order
  section?: string; // Group related items
  
  // Guidance
  helpText?: string;
  warningThreshold?: number; // For number inputs
  criticalThreshold?: number;
  
  // Legacy validation rules (keeping for backward compatibility)
  validationRules?: ValidationRule[];
  
  // Customization tracking
  isCustom?: boolean; // Added during work order customization
  
  // Metadata
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Conditional Logic for checklist items
export interface ConditionalRule {
  dependsOn: string; // ID of another checklist item
  condition: 'equals' | 'not_equals' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide' | 'require' | 'disable';
}

// Material Requirement Template
export interface MaterialRequirementTemplate {
  id?: string;
  itemId: string;
  itemName: string; // Cached for display
  plannedQuantity: number;
  isOptional: boolean;
  alternativeItems?: string[]; // Alternative item IDs
  notes?: string;
  isCustom?: boolean; // Added during work order customization
}

// Recurrence Pattern for templates
export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';
  interval: number; // Every N periods
  daysOfWeek?: number[]; // For weekly (0-6, Sun-Sat)
  dayOfMonth?: number; // For monthly
  monthOfYear?: number; // For annually
  customCronExpression?: string; // For complex schedules
}

// Work Order Template
export interface WorkOrderTemplate {
  id: string;
  name: string;
  description: string;
  code: string; // Unique template code (e.g., "PIPE_PRESS_TEST_V1")
  version: string; // Template version (e.g., "1.2.0")
  
  // Categorization
  categoryId: string; // Links to WorkOrderCategory
  category?: WorkOrderCategory;
  
  // Work order defaults
  type: 'preventive' | 'corrective';
  subType?: 'planned' | 'incidental';
  defaultPriority: Priority;
  estimatedDuration: number; // in hours
  
  // Template content
  checklist: ChecklistItemTemplate[];
  materials: MaterialRequirementTemplate[];
  
  // Enhanced content
  instructions?: string; // Detailed work instructions
  safetyNotes?: string; // Safety considerations
  tools?: ToolRequirement[]; // Required tools/equipment
  
  // SOP Content (legacy)
  sopSteps?: SOPStep[]; // Detailed procedure steps
  safetyRequirements?: string[];
  prerequisites?: string[];
  requiredSkills?: string[];
  requiredCertifications?: string[];
  
  // Scheduling
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern; // For preventive maintenance
  
  // Template metadata
  status: 'draft' | 'active' | 'deprecated' | 'archived';
  approvedBy?: string;
  approvedAt?: string;
  isActive: boolean; // Keeping for backward compatibility
  tags: string[];
  
  // Version tracking
  changeLog?: ChangeLogEntry[];
  
  // Usage statistics
  usageCount: number;
  lastUsedAt?: string;
  
  // Analytics (enhanced usage tracking)
  analytics?: {
    totalUsage: number;
    customizationRate: number; // Percentage of uses that were customized
    popularTerminals: Array<{ terminalId: string; count: number }>;
    recentUsage: Array<{
      workOrderTitle: string;
      terminalId: string;
      hasCustomizations: boolean;
      customizationCount: number;
      createdAt: string;
    }>;
  };
  
  // Audit trail
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
}

// Change log entry for version tracking
export interface ChangeLogEntry {
  id: string;
  type: 'added' | 'modified' | 'removed';
  description: string;
  field?: string; // Field that changed
  oldValue?: any;
  newValue?: any;
  modifiedBy: string;
  modifiedAt: string;
}

// Tool Requirement interface
export interface ToolRequirement {
  id: string;
  name: string;
  type: 'hand_tool' | 'power_tool' | 'measuring_device' | 'safety_equipment';
  required: boolean;
  specifications?: string;
}

// SOP Deviation for work orders
export interface SOPDeviation {
  stepId: string;
  reason: string;
  approvedBy?: string;
  notes?: string;
  timestamp: string;
}

// Validation Rule for checklist items
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// Template Usage Statistics
export interface TemplateUsageStats {
  templateId: string;
  usageCount: number;
  successRate: number; // Percentage of completed work orders
  averageCompletionTime: number; // in hours
  lastUsed: string;
  popularTerminals: string[];
  deviationRate: number; // Percentage with SOP deviations
}

// Category Analytics
export interface CategoryAnalytics {
  categoryId: string;
  templateCount: number;
  workOrderCount: number;
  averageCompletionTime: number;
  successRate: number;
  popularTemplates: {
    templateId: string;
    templateName: string;
    usageCount: number;
  }[];
}

// Category Tree Building Types
export interface CategoryTreeNode {
  category: WorkOrderCategory;
  children: CategoryTreeNode[];
  depth: number;
  hasChildren: boolean;
  isExpanded?: boolean;
  isSelected?: boolean;
}

// Bulk Operation Types
export interface BulkCategoryOperation {
  type: 'activate' | 'deactivate' | 'move' | 'delete';
  categoryIds: string[];
  targetParentId?: string; // For move operations
  reason?: string; // For deletion
}

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  failedItems: {
    categoryId: string;
    error: string;
  }[];
  warnings: string[];
}

// Import/Export Types
export interface CategoryExportData {
  categories: WorkOrderCategory[];
  templates: WorkOrderTemplate[];
  exportedAt: string;
  exportedBy: string;
  version: string;
}

export interface CategoryImportResult {
  success: boolean;
  importedCategories: number;
  importedTemplates: number;
  skippedItems: {
    type: 'category' | 'template';
    name: string;
    reason: string;
  }[];
  errors: string[];
}

// Form Types
export interface CreateCategoryForm {
  name: string;
  description?: string;
  code: string;
  parentId?: string;
  maintenanceTypes: ('preventive' | 'corrective')[];
  requiredPermissions: string[];
  defaultPriority: Priority;
  defaultEstimatedDuration: number;
  iconName?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateCategoryForm extends Partial<CreateCategoryForm> {}

export interface CreateTemplateForm {
  name: string;
  description: string;
  code: string;
  version: string;
  categoryId: string;
  type: 'preventive' | 'corrective';
  subType?: 'planned' | 'incidental';
  defaultPriority: Priority;
  estimatedDuration: number;
  instructions?: string;
  safetyNotes?: string;
  sopSteps: Omit<SOPStep, 'id'>[];
  safetyRequirements: string[];
  prerequisites: string[];
  checklist: Omit<ChecklistItemTemplate, 'id' | 'templateId'>[];
  materials: MaterialRequirementTemplate[];
  tools?: Omit<ToolRequirement, 'id'>[];
  requiredSkills: string[];
  requiredCertifications: string[];
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  tags: string[];
  status?: 'draft' | 'active' | 'deprecated' | 'archived';
  isActive?: boolean;
}

export interface UpdateTemplateForm extends Partial<CreateTemplateForm> {}

// Work Order Customization tracking
export interface WorkOrderCustomization {
  id: string;
  workOrderId: string;
  type: 'checklist_added' | 'checklist_removed' | 'checklist_modified' | 'material_added' | 'material_removed';
  description: string;
  oldValue?: any;
  newValue?: any;
  modifiedBy: string;
  modifiedAt: string;
  reason?: string;
}

// Enhanced Work Order Type with Template Support
export interface EnhancedWorkOrder {
  // Existing WorkOrder fields...
  templateId?: string; // Links to WorkOrderTemplate
  template?: WorkOrderTemplate;
  templateVersion?: string; // Version used when created
  
  // Category relationship  
  categoryId?: string; // Can be derived from template or set manually
  category?: WorkOrderCategory;
  categoryPath: string; // Full category path for searching/filtering
  sopVersion?: string; // Version of SOP used
  
  // Inheritance tracking
  inheritedFromTemplate: boolean;
  customizations: WorkOrderCustomization[]; // Track changes from template
  
  // Enhanced checklist with inheritance
  checklistLocked: boolean; // Prevent modifications if required for compliance
  
  // New workflow fields
  sopStepsCompleted?: string[]; // Track completed SOP steps
  deviationsFromSOP?: SOPDeviation[];
}

// Template filtering
export interface TemplateFilter {
  categoryId?: string;
  type?: 'preventive' | 'corrective';
  status?: 'draft' | 'active' | 'deprecated' | 'archived';
  search?: string;
  isRecurring?: boolean;
  tags?: string[];
}

// Enhanced template usage stats
export interface EnhancedTemplateUsageStats {
  templateId: string;
  totalUsage: number;
  recentUsage: number; // Last 30 days
  averageCompletionTime: number;
  successRate: number; // Percentage of successful completions
  deviationRate: number; // Percentage with customizations
  popularTerminals: string[];
  lastUsed: string;
}

// Category usage stats
export interface CategoryUsageStats {
  categoryId: string;
  templateCount: number;
  workOrderCount: number;
  averageCompletionTime: number;
  mostUsedTemplate?: WorkOrderTemplate;
}

// API Response Types
export interface CategoryApiResponse {
  success: boolean;
  data: WorkOrderCategory[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TemplateApiResponse {
  success: boolean;
  data: WorkOrderTemplate[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}