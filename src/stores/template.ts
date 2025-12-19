// Template Store for Work Order Template Management

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  WorkOrderTemplate,
  CreateTemplateForm,
  TemplateUsageStats
} from '@/types/templates';
import type { CreateWorkOrderForm, WorkOrder } from '@/types';
import { 
  mockTemplates
} from '@/mock/templates';

export const useTemplateStore = defineStore('template', () => {
  // State
  const templates = ref<WorkOrderTemplate[]>([...mockTemplates]);
  const loading = ref(false);
  const error = ref<string | null>(null);

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
      const checklist = templateData.checklist.map((item, index) => ({
        ...item,
        id: `checklist-${Date.now()}-${index + 1}`
      }));

      // Create new template
      const newTemplate: WorkOrderTemplate = {
        id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: templateData.name.trim(),
        description: templateData.description.trim(),
        categoryId: templateData.categoryId,
        type: templateData.type,
        subType: templateData.subType,
        defaultPriority: templateData.defaultPriority,
        estimatedDuration: templateData.estimatedDuration,
        sopSteps: sopSteps.length > 0 ? sopSteps : undefined,
        safetyRequirements: templateData.safetyRequirements.filter(req => req.trim()),
        prerequisites: templateData.prerequisites.filter(req => req.trim()),
        checklist,
        materials: templateData.materials,
        requiredSkills: templateData.requiredSkills.filter(skill => skill.trim()),
        requiredCertifications: templateData.requiredCertifications.filter(cert => cert.trim()),
        isRecurring: templateData.isRecurring,
        recurrencePattern: templateData.recurrencePattern,
        version: '1.0',
        isActive: false, // New templates start inactive until approved
        tags: templateData.tags.filter(tag => tag.trim()),
        usageCount: 0,
        createdBy: 'current-user', // TODO: Get from auth store
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
          id: `checklist-${Date.now()}-${index + 1}`
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
        type: item.type,
        required: item.required,
        unit: item.unit,
        options: item.options ? [...item.options] : undefined,
        minValue: item.minValue,
        maxValue: item.maxValue,
        defaultValue: item.defaultValue,
        helpText: item.helpText
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
    overrides: Partial<CreateWorkOrderForm>
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


      // Create work order from template
      const workOrder: Partial<WorkOrder> = {
        title: overrides.title || template.name,
        type: overrides.type || template.type,
        subType: overrides.subType || template.subType,
        priority: overrides.priority || template.defaultPriority,
        terminalId: overrides.terminalId!,
        assignedWorkerId: overrides.assignedWorkerId,
        startDate: overrides.startDate!,
        dueDate: overrides.dueDate!,
        estimatedDuration: overrides.estimatedDuration || template.estimatedDuration,
        checklist: template.checklist.map(item => ({
          id: item.id,
          label: item.label,
          type: item.type,
          required: item.required,
          unit: item.unit,
          options: item.options,
          minValue: item.minValue,
          maxValue: item.maxValue
        })),
        materials: overrides.materials || template.materials.map(material => ({
          itemId: material.itemId,
          plannedQuantity: material.plannedQuantity
        })),
        // Enhanced fields for template support
        description: `${overrides.description || template.description}\n\nCreated from template: ${template.name} (v${template.version})`
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

  // Initialize store
  fetchTemplates();

  return {
    // State
    templates,
    loading,
    error,

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
    approveTemplate,
    cloneTemplate,
    createWorkOrderFromTemplate,
    incrementUsageCount,
    getTemplateUsageStats,
    getPopularTemplates,
    getRecentTemplates
  };
});