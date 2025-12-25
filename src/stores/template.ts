// Template Store for Work Order Template Management

import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type {
  WorkOrderTemplate,
  CreateTemplateForm,
  ChecklistItemTemplate,
  TemplateUsageStats,
  TemplateFilter
} from '@/types/templates';
import type { CreateWorkOrderForm, WorkOrder } from '@/types';
import type { PaginationState, TemplatePaginationSizes } from '@/types/pagination';
import { getPaginationConfig } from '@/config/pagination';
import {
  mockTemplates
} from '@/mock/templates';
import { getCurrentUserId } from '@/utils/auth';

export const useTemplateStore = defineStore('template', () => {
  // State
  const templates = ref<WorkOrderTemplate[]>([...mockTemplates]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Pagination state
  const paginationConfig = getPaginationConfig('templates');
  const paginationState = ref<PaginationState>({
    currentPage: 1,
    pageSize: paginationConfig.defaultPageSize,
    totalItems: 0,
    totalPages: 0
  });

  // Search and filter state
  const searchQuery = ref('');
  const categoryFilter = ref<string>('');
  const statusFilter = ref<string>('');
  const typeFilter = ref<string>('');
  const recurringFilter = ref<string>('');
  const sortBy = ref<'name' | 'category' | 'usageCount' | 'createdAt' | 'updatedAt'>('updatedAt');
  const sortOrder = ref<'asc' | 'desc'>('desc');

  // Computed
  const activeTemplates = computed(() => 
    templates.value.filter(template => template.isActive)
  );

  const approvedTemplates = computed(() =>
    templates.value.filter(template => template.isActive && template.approvedBy)
  );

  const templatesRequiringApproval = computed(() =>
    templates.value.filter(template => !template.approvedBy && !template.isActive)
  );

  const templatesByCategory = computed(() => {
    const grouped = new Map<string, WorkOrderTemplate[]>();
    templates.value.forEach(template => {
      if (!grouped.has(template.categoryId)) {
        grouped.set(template.categoryId, []);
      }
      grouped.get(template.categoryId)!.push(template);
    });
    return grouped;
  });

  // Enterprise-standard filtering with search, sort and pagination
  const filteredAndSearchedTemplates = computed(() => {
    let result = templates.value;

    // Apply search query
    if (searchQuery.value.trim()) {
      const search = searchQuery.value.trim().toLowerCase();
      result = result.filter(template =>
        template.name.toLowerCase().includes(search) ||
        template.description.toLowerCase().includes(search) ||
        template.code.toLowerCase().includes(search) ||
        template.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Apply category filter
    if (categoryFilter.value) {
      result = result.filter(template => template.categoryId === categoryFilter.value);
    }

    // Apply status filter
    if (statusFilter.value) {
      switch (statusFilter.value) {
        case 'active':
          result = result.filter(template => template.isActive);
          break;
        case 'draft':
          result = result.filter(template => template.status === 'draft');
          break;
        case 'deprecated':
          result = result.filter(template => template.status === 'deprecated');
          break;
        case 'pending_approval':
          result = result.filter(template => !template.approvedBy && !template.isActive);
          break;
      }
    }

    // Apply type filter
    if (typeFilter.value) {
      result = result.filter(template => template.type === typeFilter.value);
    }

    // Apply recurring filter
    if (recurringFilter.value === 'recurring') {
      result = result.filter(template => template.isRecurring);
    } else if (recurringFilter.value === 'one-time') {
      result = result.filter(template => !template.isRecurring);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy.value) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'category':
          aValue = a.categoryId;
          bValue = b.categoryId;
          break;
        case 'usageCount':
          aValue = a.usageCount || 0;
          bValue = b.usageCount || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });

    // Update pagination total
    paginationState.value.totalItems = result.length;
    paginationState.value.totalPages = Math.ceil(result.length / paginationState.value.pageSize);
    
    // Ensure current page is valid
    if (paginationState.value.currentPage > paginationState.value.totalPages && paginationState.value.totalPages > 0) {
      paginationState.value.currentPage = paginationState.value.totalPages;
    }

    return result;
  });

  // Paginated templates
  const paginatedTemplates = computed(() => {
    const startIndex = (paginationState.value.currentPage - 1) * paginationState.value.pageSize;
    const endIndex = startIndex + paginationState.value.pageSize;
    return filteredAndSearchedTemplates.value.slice(startIndex, endIndex);
  });

  // Backward compatibility
  const filteredTemplates = computed(() => filteredAndSearchedTemplates.value);

  const templateStats = computed(() => {
    const mostUsed = templates.value.length > 0 
      ? templates.value.reduce((prev, curr) => 
          curr.usageCount > (prev?.usageCount ?? 0) ? curr : prev
        )
      : undefined;
    
    return {
      total: templates.value.length,
      active: activeTemplates.value.length,
      approved: approvedTemplates.value.length,
      pendingApproval: templatesRequiringApproval.value.length,
      mostUsed
    };
  });

  // Actions
  const fetchTemplates = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Templates are already loaded from mock data
      // In real implementation, this would fetch from API
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch templates';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getTemplateById = (id: string): WorkOrderTemplate | undefined => {
    return templates.value.find(template => template.id === id);
  };

  const getTemplatesByCategoryId = (categoryId: string): WorkOrderTemplate[] => {
    return templates.value.filter(template => template.categoryId === categoryId);
  };

  const searchTemplates = (query: string, categoryId?: string): WorkOrderTemplate[] => {
    let filteredTemplates = templates.value;
    
    if (categoryId) {
      filteredTemplates = getTemplatesByCategoryId(categoryId);
    }
    
    if (!query.trim()) {
      return filteredTemplates;
    }
    
    const searchTerm = query.toLowerCase().trim();
    return filteredTemplates.filter(template =>
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  };

  const createTemplate = async (templateData: CreateTemplateForm): Promise<WorkOrderTemplate> => {
    try {
      loading.value = true;
      error.value = null;

      // Validate data
      if (!templateData.name.trim()) {
        throw new Error('Template name is required');
      }

      if (!templateData.description.trim()) {
        throw new Error('Template description is required');
      }

      if (!templateData.categoryId) {
        throw new Error('Category is required');
      }

      // Check for duplicate template name
      const existingTemplate = templates.value.find(template =>
        template.name.toLowerCase() === templateData.name.toLowerCase() &&
        template.categoryId === templateData.categoryId
      );

      if (existingTemplate) {
        throw new Error('Template with this name already exists in the selected category');
      }

      // Generate SOP steps with IDs
      const sopSteps = templateData.sopSteps.map((step, index) => ({
        ...step,
        id: `sop-${Date.now()}-${index + 1}`
      }));

      // Generate checklist items with IDs
      const templateId = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const checklist = templateData.checklist.map((item, index) => ({
        ...item,
        id: `checklist-${Date.now()}-${index + 1}`,
        templateId: templateId
      }));

      // Generate tools with IDs
      const tools = templateData.tools?.map((tool, index) => ({
        ...tool,
        id: `tool-${Date.now()}-${index + 1}`
      })) || [];

      // Create new template
      const newTemplate: WorkOrderTemplate = {
        id: templateId,
        name: templateData.name.trim(),
        description: templateData.description.trim(),
        code: templateData.code.trim(),
        version: templateData.version || '1.0.0',
        categoryId: templateData.categoryId,
        type: templateData.type,
        subType: templateData.subType,
        defaultPriority: templateData.defaultPriority,
        estimatedDuration: templateData.estimatedDuration,
        
        // Enhanced content
        instructions: templateData.instructions?.trim(),
        safetyNotes: templateData.safetyNotes?.trim(),
        tools,
        
        // Template content
        checklist,
        materials: templateData.materials,
        
        // SOP Content (legacy)
        sopSteps: sopSteps.length > 0 ? sopSteps : undefined,
        safetyRequirements: templateData.safetyRequirements.filter(req => req.trim()),
        prerequisites: templateData.prerequisites.filter(req => req.trim()),
        requiredSkills: templateData.requiredSkills.filter(skill => skill.trim()),
        requiredCertifications: templateData.requiredCertifications.filter(cert => cert.trim()),
        
        // Scheduling
        isRecurring: templateData.isRecurring,
        recurrencePattern: templateData.recurrencePattern,
        
        // Template metadata
        status: 'draft',
        isActive: false, // New templates start inactive until approved
        tags: templateData.tags.filter(tag => tag.trim()),
        
        // Usage statistics
        usageCount: 0,
        lastUsedAt: undefined,
        
        // Audit trail
        createdBy: getCurrentUserId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastUsed: undefined
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add to store
      templates.value.push(newTemplate);

      return newTemplate;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create template';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<CreateTemplateForm>): Promise<WorkOrderTemplate> => {
    try {
      loading.value = true;
      error.value = null;

      const existingTemplate = getTemplateById(id);
      if (!existingTemplate) {
        throw new Error('Template not found');
      }

      // If template is already approved and being modified, create a new version
      const shouldVersion = existingTemplate.approvedBy && 
        (updates.sopSteps || updates.checklist || updates.materials);

      let updatedTemplate: WorkOrderTemplate;

      if (shouldVersion) {
        // Create new version
        const versionParts = existingTemplate.version.split('.');
        const majorVersion = parseInt(versionParts[0] ?? '1');
        const minorVersion = parseInt(versionParts[1] ?? '0');
        const newVersion = `${majorVersion}.${minorVersion + 1}`;

        updatedTemplate = {
          ...existingTemplate,
          version: newVersion,
          approvedBy: undefined, // Reset approval for new version
          approvedAt: undefined,
          isActive: false, // Require re-approval
          updatedAt: new Date().toISOString()
        };
      } else {
        updatedTemplate = {
          ...existingTemplate,
          updatedAt: new Date().toISOString()
        };
      }

      // Apply updates
      if (updates.name) updatedTemplate.name = updates.name.trim();
      if (updates.description) updatedTemplate.description = updates.description.trim();
      if (updates.categoryId) updatedTemplate.categoryId = updates.categoryId;
      if (updates.type) updatedTemplate.type = updates.type;
      if (updates.subType !== undefined) updatedTemplate.subType = updates.subType;
      if (updates.defaultPriority) updatedTemplate.defaultPriority = updates.defaultPriority;
      if (updates.estimatedDuration) updatedTemplate.estimatedDuration = updates.estimatedDuration;
      
      if (updates.sopSteps) {
        updatedTemplate.sopSteps = updates.sopSteps.map((step, index) => ({
          ...step,
          id: `sop-${Date.now()}-${index + 1}`
        }));
      }
      
      if (updates.safetyRequirements) {
        updatedTemplate.safetyRequirements = updates.safetyRequirements.filter(req => req.trim());
      }
      
      if (updates.prerequisites) {
        updatedTemplate.prerequisites = updates.prerequisites.filter(req => req.trim());
      }
      
      if (updates.checklist) {
        updatedTemplate.checklist = updates.checklist.map((item, index) => ({
          ...item,
          id: `checklist-${Date.now()}-${index + 1}`,
          templateId: id
        }));
      }
      
      if (updates.materials) updatedTemplate.materials = updates.materials;
      
      if (updates.requiredSkills) {
        updatedTemplate.requiredSkills = updates.requiredSkills.filter(skill => skill.trim());
      }
      
      if (updates.requiredCertifications) {
        updatedTemplate.requiredCertifications = updates.requiredCertifications.filter(cert => cert.trim());
      }
      
      if (updates.isRecurring !== undefined) updatedTemplate.isRecurring = updates.isRecurring;
      if (updates.recurrencePattern) updatedTemplate.recurrencePattern = updates.recurrencePattern;
      
      if (updates.tags) {
        updatedTemplate.tags = updates.tags.filter(tag => tag.trim());
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update in store
      const index = templates.value.findIndex(template => template.id === id);
      if (index !== -1) {
        templates.value[index] = updatedTemplate;
      }

      return updatedTemplate;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update template';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const template = getTemplateById(id);
      if (!template) {
        throw new Error('Template not found');
      }

      // Check if template is being used in active work orders
      // TODO: Integrate with work order store to check usage
      if (template.usageCount > 0) {
        // Don't actually delete, just deactivate
        await updateTemplate(id, {}); // This will just mark as inactive
        template.isActive = false;
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Remove from store
      templates.value = templates.value.filter(template => template.id !== id);

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete template';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const approveTemplate = async (id: string, approverId: string): Promise<WorkOrderTemplate> => {
    try {
      loading.value = true;
      error.value = null;

      const template = getTemplateById(id);
      if (!template) {
        throw new Error('Template not found');
      }

      if (template.approvedBy) {
        throw new Error('Template is already approved');
      }

      // Cannot approve own template
      if (template.createdBy === approverId) {
        throw new Error('Cannot approve your own template');
      }

      const approvedTemplate: WorkOrderTemplate = {
        ...template,
        approvedBy: approverId,
        approvedAt: new Date().toISOString(),
        isActive: true,
        updatedAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update in store
      const index = templates.value.findIndex(t => t.id === id);
      if (index !== -1) {
        templates.value[index] = approvedTemplate;
      }

      return approvedTemplate;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to approve template';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const cloneTemplate = async (id: string, newName: string): Promise<WorkOrderTemplate> => {
    const originalTemplate = getTemplateById(id);
    if (!originalTemplate) {
      throw new Error('Template not found');
    }

    const cloneData: CreateTemplateForm = {
      name: newName,
      description: originalTemplate.description,
      code: `${originalTemplate.code}_COPY`,
      version: '1.0',
      categoryId: originalTemplate.categoryId,
      type: originalTemplate.type,
      subType: originalTemplate.subType,
      defaultPriority: originalTemplate.defaultPriority,
      estimatedDuration: originalTemplate.estimatedDuration,
      sopSteps: originalTemplate.sopSteps?.map(step => ({
        stepNumber: step.stepNumber,
        title: step.title,
        description: step.description,
        estimatedDuration: step.estimatedDuration,
        isRequired: step.isRequired,
        safetyNotes: [...(step.safetyNotes || [])],
        requiredTools: [...(step.requiredTools || [])],
        attachments: [...(step.attachments || [])]
      })) || [],
      safetyRequirements: [...(originalTemplate.safetyRequirements || [])],
      prerequisites: [...(originalTemplate.prerequisites || [])],
      checklist: originalTemplate.checklist.map(item => ({
        label: item.label,
        description: item.description,
        type: item.type,
        required: item.required,
        unit: item.unit,
        options: item.options ? [...item.options] : undefined,
        minValue: item.minValue,
        maxValue: item.maxValue,
        pattern: item.pattern,
        defaultValue: item.defaultValue,
        order: item.order,
        section: item.section,
        conditionalLogic: item.conditionalLogic && Array.isArray(item.conditionalLogic) ? [...item.conditionalLogic] : undefined,
        helpText: item.helpText,
        warningThreshold: item.warningThreshold,
        criticalThreshold: item.criticalThreshold,
        validationRules: item.validationRules ? [...item.validationRules] : undefined,
        isActive: item.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      materials: [...originalTemplate.materials],
      requiredSkills: [...(originalTemplate.requiredSkills || [])],
      requiredCertifications: [...(originalTemplate.requiredCertifications || [])],
      isRecurring: originalTemplate.isRecurring,
      recurrencePattern: originalTemplate.recurrencePattern ? {
        ...originalTemplate.recurrencePattern
      } : undefined,
      tags: [...originalTemplate.tags]
    };

    return createTemplate(cloneData);
  };

  const createWorkOrderFromTemplate = async (
    templateId: string,
    overrides: Partial<CreateWorkOrderForm> & { customizations?: any }
  ): Promise<WorkOrder> => {
    try {
      loading.value = true;
      error.value = null;

      const template = getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      if (!template.isActive || !template.approvedBy) {
        throw new Error('Template must be approved and active');
      }

      // Create inheritance tracking data
      const inheritanceData = {
        templateId,
        templateName: template.name,
        templateVersion: template.version,
        templateCode: template.code,
        inheritedAt: new Date().toISOString(),
        hasCustomizations: overrides.customizations?.hasCustomizations || false,
        customizationSummary: overrides.customizations?.stats,
        originalFields: {
          title: template.name,
          description: template.description,
          priority: template.defaultPriority,
          estimatedDuration: template.estimatedDuration,
          checklistItemCount: template.checklist?.length || 0,
          materialCount: template.materials?.length || 0
        },
        appliedFields: {
          title: overrides.title || template.name,
          description: overrides.description || template.description,
          priority: overrides.priority || template.defaultPriority,
          estimatedDuration: overrides.estimatedDuration || template.estimatedDuration
        }
      };

      // Create work order from template with inheritance tracking
      const workOrder: Partial<WorkOrder> = {
        title: overrides.title || template.name,
        description: overrides.description || template.description,
        type: overrides.type || template.type,
        subType: overrides.subType || template.subType,
        priority: overrides.priority || template.defaultPriority,
        terminalId: overrides.terminalId!,
        assignedWorkerId: overrides.assignedWorkerId,
        startDate: overrides.startDate!,
        dueDate: overrides.dueDate!,
        estimatedDuration: overrides.estimatedDuration || template.estimatedDuration,
        instructions: overrides.instructions || template.instructions,
        safetyNotes: overrides.safetyNotes || template.safetyNotes,
        
        // Handle checklist with inheritance
        checklist: (overrides.checklist || template.checklist)?.map(item => ({
          id: item.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          label: item.label,
          type: item.type as 'yes_no' | 'number' | 'text' | 'dropdown' | 'rating' | 'boolean',
          required: item.required || false,
          unit: item.unit,
          options: item.options,
          minValue: item.minValue,
          maxValue: item.maxValue,
          ratingMin: item.ratingMin,
          ratingMax: item.ratingMax,
          description: item.description,
          isCustom: item.isCustom || false
        })) || [],
        
        // Handle materials with inheritance
        materials: (overrides.materials || template.materials)?.map(material => ({
          itemId: material.itemId,
          itemName: material.itemName,
          plannedQuantity: material.plannedQuantity,
          notes: material.notes,
          isOptional: material.isOptional || false,
          isCustom: material.isCustom || false
        })) || [],

        // Template inheritance metadata
        templateInheritance: inheritanceData
      };

      // Update template usage statistics
      const updatedTemplate = {
        ...template,
        usageCount: template.usageCount + 1,
        lastUsedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const index = templates.value.findIndex(t => t.id === templateId);
      if (index !== -1) {
        templates.value[index] = updatedTemplate;
      }

      // Track template usage analytics
      await recordTemplateUsage(templateId, {
        workOrderTitle: workOrder.title || '',
        terminalId: workOrder.terminalId || '',
        hasCustomizations: inheritanceData.hasCustomizations,
        customizationCount: (overrides.customizations?.stats?.checklist?.added || 0) + 
                           (overrides.customizations?.stats?.materials?.added || 0),
        createdAt: new Date().toISOString()
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));

      return workOrder as WorkOrder;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create work order from template';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // New method to record template usage analytics
  const recordTemplateUsage = async (templateId: string, usageData: {
    workOrderTitle: string;
    terminalId: string;
    hasCustomizations: boolean;
    customizationCount: number;
    createdAt: string;
  }): Promise<void> => {
    try {
      const template = getTemplateById(templateId);
      if (!template) return;

      // In a real implementation, this would track usage in analytics store
      // For now, we'll just update the template's usage statistics
      template.usageCount = (template.usageCount || 0) + 1;
      template.lastUsedAt = usageData.createdAt;

      // Track customization rate
      if (!template.analytics) {
        template.analytics = {
          totalUsage: 0,
          customizationRate: 0,
          popularTerminals: [],
          recentUsage: []
        };
      }

      template.analytics.totalUsage++;
      
      // Update customization rate
      const totalCustomized = template.analytics.recentUsage?.filter(u => u.hasCustomizations).length || 0;
      template.analytics.customizationRate = Math.round((totalCustomized / template.analytics.totalUsage) * 100);

      // Track popular terminals
      const terminalUsage = template.analytics.popularTerminals || [];
      const existingTerminal = terminalUsage.find(t => t.terminalId === usageData.terminalId);
      if (existingTerminal) {
        existingTerminal.count++;
      } else {
        terminalUsage.push({ terminalId: usageData.terminalId, count: 1 });
      }
      template.analytics.popularTerminals = terminalUsage.sort((a, b) => b.count - a.count).slice(0, 5);

      // Track recent usage (keep last 10)
      template.analytics.recentUsage = template.analytics.recentUsage || [];
      template.analytics.recentUsage.unshift(usageData);
      template.analytics.recentUsage = template.analytics.recentUsage.slice(0, 10);

    } catch (err) {
      // Don't throw errors for analytics tracking
      console.warn('Failed to record template usage analytics:', err);
    }
  };

  const getTemplateUsageStats = async (templateId: string): Promise<TemplateUsageStats> => {
    try {
      const template = getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));

      // Mock usage statistics
      const stats: TemplateUsageStats = {
        templateId,
        usageCount: template.usageCount,
        successRate: Math.floor(Math.random() * 20) + 80, // 80-100%
        averageCompletionTime: template.estimatedDuration + (Math.random() * 2 - 1), // ±1 hour variance
        lastUsed: template.lastUsedAt || '',
        popularTerminals: ['terminal1', 'terminal2'], // Mock data
        deviationRate: Math.floor(Math.random() * 10) + 5 // 5-15%
      };

      return stats;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get template usage stats';
      throw err;
    }
  };

  const getPopularTemplates = (limit: number = 10): WorkOrderTemplate[] => {
    return [...templates.value]
      .filter(template => template.isActive && template.approvedBy)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  };

  const getRecentTemplates = (limit: number = 10): WorkOrderTemplate[] => {
    return [...templates.value]
      .filter(template => template.isActive && template.approvedBy)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  };

  // Usage tracking
  const incrementUsageCount = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      template.usageCount++;
      template.lastUsedAt = new Date().toISOString();
    }
  };

  // Enhanced Checklist Management
  const addChecklistItem = async (templateId: string, item: Omit<ChecklistItemTemplate, 'id' | 'templateId'>): Promise<ChecklistItemTemplate> => {
    loading.value = true;
    error.value = null;

    try {
      const template = getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const newItem: ChecklistItemTemplate = {
        ...item,
        id: `checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        templateId,
        order: item.order || template.checklist.length + 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      template.checklist.push(newItem);
      template.updatedAt = new Date().toISOString();

      return newItem;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add checklist item';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateChecklistItem = async (templateId: string, itemId: string, updates: Partial<ChecklistItemTemplate>): Promise<ChecklistItemTemplate> => {
    loading.value = true;
    error.value = null;

    try {
      const template = getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const itemIndex = template.checklist.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        throw new Error('Checklist item not found');
      }

      const existingItem = template.checklist[itemIndex];
      if (!existingItem) {
        throw new Error('Checklist item not found in template');
      }
      
      const updatedItem: ChecklistItemTemplate = {
        ...existingItem,
        ...updates,
        id: itemId,
        templateId,
        label: updates.label || existingItem.label,
        type: updates.type || existingItem.type,
        required: updates.required !== undefined ? updates.required : existingItem.required,
        order: updates.order !== undefined ? updates.order : existingItem.order,
        isActive: updates.isActive !== undefined ? updates.isActive : existingItem.isActive,
        createdAt: existingItem.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      template.checklist[itemIndex] = updatedItem;
      template.updatedAt = new Date().toISOString();

      return updatedItem;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update checklist item';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteChecklistItem = async (templateId: string, itemId: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const template = getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const itemIndex = template.checklist.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        throw new Error('Checklist item not found');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      template.checklist.splice(itemIndex, 1);
      template.updatedAt = new Date().toISOString();

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete checklist item';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const reorderChecklist = async (templateId: string, itemIds: string[]): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const template = getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Create a map for quick lookups
      const itemMap = new Map(template.checklist.map(item => [item.id, item]));
      
      // Reorder based on provided array
      const reorderedChecklist = itemIds
        .map(id => itemMap.get(id))
        .filter(Boolean) as ChecklistItemTemplate[];

      // Update order numbers
      reorderedChecklist.forEach((item, index) => {
        item.order = index + 1;
        item.updatedAt = new Date().toISOString();
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      template.checklist = reorderedChecklist;
      template.updatedAt = new Date().toISOString();

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reorder checklist';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Template Operations
  const duplicateTemplate = async (templateId: string, newName?: string): Promise<WorkOrderTemplate> => {
    const template = getTemplateById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const duplicateData: CreateTemplateForm = {
      name: newName || `${template.name} (Copy)`,
      description: template.description,
      code: `${template.code}_COPY_${Date.now()}`,
      version: '1.0.0',
      categoryId: template.categoryId,
      type: template.type,
      subType: template.subType,
      defaultPriority: template.defaultPriority,
      estimatedDuration: template.estimatedDuration,
      instructions: template.instructions,
      safetyNotes: template.safetyNotes,
      sopSteps: template.sopSteps?.map(step => ({
        stepNumber: step.stepNumber,
        title: step.title,
        description: step.description,
        estimatedDuration: step.estimatedDuration,
        isRequired: step.isRequired,
        safetyNotes: [...(step.safetyNotes || [])],
        requiredTools: [...(step.requiredTools || [])],
        attachments: [...(step.attachments || [])]
      })) || [],
      safetyRequirements: [...(template.safetyRequirements || [])],
      prerequisites: [...(template.prerequisites || [])],
      checklist: template.checklist.map(item => ({
        label: item.label,
        description: item.description,
        type: item.type,
        required: item.required,
        unit: item.unit,
        options: item.options ? [...item.options] : undefined,
        minValue: item.minValue,
        maxValue: item.maxValue,
        pattern: item.pattern,
        order: item.order,
        section: item.section,
        conditionalLogic: item.conditionalLogic && Array.isArray(item.conditionalLogic) ? [...item.conditionalLogic] : undefined,
        helpText: item.helpText,
        warningThreshold: item.warningThreshold,
        criticalThreshold: item.criticalThreshold,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })),
      materials: [...template.materials],
      tools: template.tools?.map(tool => ({
        name: tool.name,
        type: tool.type,
        required: tool.required,
        specifications: tool.specifications
      })),
      requiredSkills: [...(template.requiredSkills || [])],
      requiredCertifications: [...(template.requiredCertifications || [])],
      isRecurring: template.isRecurring,
      recurrencePattern: template.recurrencePattern ? { ...template.recurrencePattern } : undefined,
      tags: [...template.tags]
    };

    return createTemplate(duplicateData);
  };


  const deprecateTemplate = async (templateId: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const template = getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      template.status = 'deprecated';
      template.isActive = false;
      template.updatedAt = new Date().toISOString();

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to deprecate template';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Filtering
  const getFilteredTemplates = (filter: Omit<TemplateFilter, 'search'> & { search?: string }): WorkOrderTemplate[] => {
    let filtered = templates.value;

    if (filter.categoryId) {
      filtered = filtered.filter(t => t.categoryId === filter.categoryId);
    }

    if (filter.type) {
      filtered = filtered.filter(t => t.type === filter.type);
    }

    if (filter.status) {
      filtered = filtered.filter(t => t.status === filter.status);
    }

    if (filter.isRecurring !== undefined) {
      filtered = filtered.filter(t => t.isRecurring === filter.isRecurring);
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(t => 
        filter.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.code.toLowerCase().includes(search) ||
        t.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    return filtered;
  };


  // Additional methods needed for template management
  const toggleTemplateStatus = async (id: string, isActive: boolean): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const template = getTemplateById(id);
      if (!template) {
        throw new Error('Template not found');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      template.isActive = isActive;
      template.updatedAt = new Date().toISOString();

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update template status';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const applyFilters = (filters: any) => {
    // This method would typically apply filters on server side
    // For now, we'll just trigger a reactivity update
    console.log('Applying filters:', filters);
  };

  // Template Versioning Methods
  const createNewVersion = async (
    templateId: string, 
    versionData: { version: string; description: string; isDraft: boolean }
  ): Promise<WorkOrderTemplate> => {
    try {
      loading.value = true;
      error.value = null;

      const originalTemplate = getTemplateById(templateId);
      if (!originalTemplate) {
        throw new Error('Original template not found');
      }

      // Create new version based on original
      const newVersionData: CreateTemplateForm = {
        ...originalTemplate,
        name: originalTemplate.name,
        description: originalTemplate.description,
        code: `${originalTemplate.code}_v${versionData.version.replace(/\./g, '_')}`,
        version: versionData.version,
        status: versionData.isDraft ? 'draft' : 'active',
        checklist: originalTemplate.checklist.map(item => ({
          ...item,
          id: undefined,
          templateId: undefined,
          createdAt: undefined,
          updatedAt: undefined
        })) as any,
        sopSteps: originalTemplate.sopSteps || [],
        safetyRequirements: [...(originalTemplate.safetyRequirements || [])],
        prerequisites: [...(originalTemplate.prerequisites || [])],
        materials: [...originalTemplate.materials],
        requiredSkills: [...(originalTemplate.requiredSkills || [])],
        requiredCertifications: [...(originalTemplate.requiredCertifications || [])],
        isRecurring: originalTemplate.isRecurring,
        recurrencePattern: originalTemplate.recurrencePattern,
        tags: [...originalTemplate.tags]
      };

      // Add change log entry (commented out as it's not being used yet)
      // const changeLogEntry = {
      //   id: `change-${Date.now()}`,
      //   type: 'version_created' as const,
      //   description: versionData.description || 'New version created',
      //   timestamp: new Date().toISOString(),
      //   userId: 'current-user' // TODO: Get from auth store
      // };

      return createTemplate(newVersionData);

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create new version';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const promoteVersion = async (versionId: string): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const version = getTemplateById(versionId);
      if (!version) {
        throw new Error('Version not found');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update the version to be the current one
      version.status = 'active';
      version.updatedAt = new Date().toISOString();

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to promote version';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getTemplateVersions = (templateId: string): WorkOrderTemplate[] => {
    const template = getTemplateById(templateId);
    if (!template) return [];

    // In a real implementation, this would fetch all versions of the template
    // For now, return just the template itself
    return templates.value.filter(t => 
      t.name === template.name || t.code.startsWith(template.code.split('_v')[0] || template.code)
    );
  };

  const submitForApproval = async (templateId: string): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const template = getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update status to pending approval
      template.status = 'draft'; // In real system, would be 'pending_approval'
      template.updatedAt = new Date().toISOString();

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit for approval';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const approveTemplateVersion = async (
    templateId: string, 
    _approvalData: { comments: string; notify: boolean }
  ): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const template = getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update template status and approval info
      template.status = 'active';
      template.approvedBy = getCurrentUserId();
      template.approvedAt = new Date().toISOString();
      template.updatedAt = new Date().toISOString();

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to approve template';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const rejectTemplateVersion = async (
    templateId: string, 
    _rejectionData: { reason: string; notify: boolean }
  ): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const template = getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update template status
      template.status = 'draft'; // Mark as draft for revision
      template.updatedAt = new Date().toISOString();

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reject template';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Enterprise pagination methods
  const setPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, paginationState.value.totalPages));
    paginationState.value.currentPage = newPage;
  };

  const setPageSize = (pageSize: TemplatePaginationSizes) => {
    // Calculate current first item index
    const currentFirstItem = (paginationState.value.currentPage - 1) * paginationState.value.pageSize;
    
    // Update page size
    paginationState.value.pageSize = pageSize;
    
    // Calculate new page to keep roughly the same position
    const newPage = Math.floor(currentFirstItem / pageSize) + 1;
    setPage(newPage);
  };

  const nextPage = () => {
    if (paginationState.value.currentPage < paginationState.value.totalPages) {
      setPage(paginationState.value.currentPage + 1);
    }
  };

  const previousPage = () => {
    if (paginationState.value.currentPage > 1) {
      setPage(paginationState.value.currentPage - 1);
    }
  };

  const firstPage = () => {
    setPage(1);
  };

  const lastPage = () => {
    setPage(paginationState.value.totalPages);
  };

  const resetPagination = () => {
    paginationState.value.currentPage = 1;
  };

  // Enterprise search and filter methods
  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
    resetPagination(); // Reset to first page when search changes
  };

  const setCategoryFilter = (categoryId: string) => {
    categoryFilter.value = categoryId;
    resetPagination();
  };

  const setStatusFilter = (status: string) => {
    statusFilter.value = status;
    resetPagination();
  };

  const setTypeFilter = (type: string) => {
    typeFilter.value = type;
    resetPagination();
  };

  const setRecurringFilter = (recurring: string) => {
    recurringFilter.value = recurring;
    resetPagination();
  };

  const setSorting = (by: 'name' | 'category' | 'usageCount' | 'createdAt' | 'updatedAt', order: 'asc' | 'desc') => {
    sortBy.value = by;
    sortOrder.value = order;
    resetPagination();
  };

  const toggleSort = (field: string) => {
    const validFields = ['name', 'category', 'usageCount', 'createdAt', 'updatedAt'];
    if (validFields.includes(field)) {
      if (sortBy.value === field) {
        // Toggle order if same field
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        // Change field, default to ascending
        sortBy.value = field as any;
        sortOrder.value = 'asc';
      }
      resetPagination();
    }
  };

  const clearAllFilters = () => {
    searchQuery.value = '';
    categoryFilter.value = '';
    statusFilter.value = '';
    typeFilter.value = '';
    recurringFilter.value = '';
    sortBy.value = 'updatedAt';
    sortOrder.value = 'desc';
    resetPagination();
  };

  const clearFilters = clearAllFilters; // Alias for compatibility

  // Available filter options
  const availableCategories = computed(() => {
    const categories = new Set<string>();
    templates.value.forEach(template => categories.add(template.categoryId));
    return Array.from(categories).sort();
  });

  const availableStatuses = computed(() => {
    const statuses = new Set<string>();
    templates.value.forEach(template => {
      if (template.isActive) statuses.add('active');
      if (template.status === 'draft') statuses.add('draft');
      if (template.status === 'deprecated') statuses.add('deprecated');
      if (!template.approvedBy && !template.isActive) statuses.add('pending_approval');
    });
    return Array.from(statuses).sort();
  });

  const availableTypes = computed(() => {
    const types = new Set<string>();
    templates.value.forEach(template => types.add(template.type));
    return Array.from(types).sort();
  });

  // Initialize store
  fetchTemplates();

  return {
    // State
    templates,
    loading,
    error,

    // Pagination and filtering state (enterprise standard)
    paginationState: readonly(paginationState),
    paginatedTemplates,
    filteredAndSearchedTemplates,
    availableCategories,
    availableStatuses,
    availableTypes,
    searchQuery: readonly(searchQuery),
    categoryFilter: readonly(categoryFilter),
    statusFilter: readonly(statusFilter),
    typeFilter: readonly(typeFilter),
    recurringFilter: readonly(recurringFilter),
    sortBy: readonly(sortBy),
    sortOrder: readonly(sortOrder),

    // Backward compatibility
    filteredTemplates,

    // Computed
    activeTemplates,
    approvedTemplates,
    templatesRequiringApproval,
    templatesByCategory,
    templateStats,

    // Actions
    fetchTemplates,
    getTemplateById,
    getTemplatesByCategoryId,
    searchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    cloneTemplate,
    createWorkOrderFromTemplate,
    recordTemplateUsage,
    incrementUsageCount,
    getTemplateUsageStats,
    getRecentTemplates,
    
    // Enhanced checklist management
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    reorderChecklist,
    
    // Template operations
    duplicateTemplate,
    approveTemplate,
    deprecateTemplate,
    
    // Filtering and search
    getFilteredTemplates,
    getPopularTemplates,
    
    // Template management
    toggleTemplateStatus,
    applyFilters,
    
    // Template versioning and workflow
    createNewVersion,
    promoteVersion,
    getTemplateVersions,
    submitForApproval,
    approveTemplateVersion,
    rejectTemplateVersion,

    // Enterprise pagination actions
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    resetPagination,

    // Enterprise filter actions
    setSearchQuery,
    setCategoryFilter,
    setStatusFilter,
    setTypeFilter,
    setRecurringFilter,
    setSorting,
    toggleSort,
    clearAllFilters,
    clearFilters
  };
});