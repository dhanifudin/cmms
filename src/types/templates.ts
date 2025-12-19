// Template and Category System Types for CMMS

import type { Priority } from './index';

// Work Order Category Types
export interface WorkOrderCategory {
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

// Material Requirement Template
export interface MaterialRequirementTemplate {
  itemId: string;
  itemName: string; // Cached for display
  plannedQuantity: number;
  isOptional: boolean;
  alternativeItems?: string[]; // Alternative item IDs
  notes?: string;
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
  parentId?: string;
  iconName?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CreateTemplateForm {
  name: string;
  description: string;
  categoryId: string;
  type: 'preventive' | 'corrective';
  subType?: 'planned' | 'incidental';
  defaultPriority: Priority;
  estimatedDuration: number;
  sopSteps: Omit<SOPStep, 'id'>[];
  safetyRequirements: string[];
  prerequisites: string[];
  checklist: Omit<ChecklistItemTemplate, 'id'>[];
  materials: MaterialRequirementTemplate[];
  requiredSkills: string[];
  requiredCertifications: string[];
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  tags: string[];
}

// Enhanced Work Order Type with Template Support
export interface EnhancedWorkOrder {
  // Existing WorkOrder fields...
  templateId?: string; // Links to WorkOrderTemplate
  template?: WorkOrderTemplate;
  categoryPath: string; // Full category path for searching/filtering
  sopVersion?: string; // Version of SOP used
  
  // New workflow fields
  sopStepsCompleted?: string[]; // Track completed SOP steps
  deviationsFromSOP?: SOPDeviation[];
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