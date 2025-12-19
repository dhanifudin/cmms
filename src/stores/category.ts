// Category Store for Work Order Category Management

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  WorkOrderCategory, 
  BulkCategoryOperation, 
  BulkOperationResult,
  CategoryExportData,
  CategoryImportResult,
  CreateCategoryForm,
  CategoryAnalytics
} from '@/types/templates';
import { 
  mockCategories, 
  buildCategoryTree, 
  getCategoryPath, 
  getDescendantIds, 
  validateCategoryHierarchy 
} from '@/mock/categories';

export const useCategoryStore = defineStore('category', () => {
  // State
  const categories = ref<WorkOrderCategory[]>([...mockCategories]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const categoryTree = computed(() => buildCategoryTree(categories.value));
  
  const activeCategories = computed(() => 
    categories.value.filter(cat => cat.isActive)
  );

  const rootCategories = computed(() => 
    categories.value.filter(cat => !cat.parentId && cat.isActive)
  );

  const categoryMap = computed(() => {
    const map = new Map<string, WorkOrderCategory>();
    categories.value.forEach(cat => map.set(cat.id, cat));
    return map;
  });

  // Actions
  const fetchCategories = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Categories are already loaded from mock data
      // In real implementation, this would fetch from API
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch categories';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getCategoryById = (id: string): WorkOrderCategory | undefined => {
    return categoryMap.value.get(id);
  };

  const getCategoryPathString = (categoryId: string): string => {
    return getCategoryPath(categoryId, categories.value);
  };

  const getChildCategories = (parentId: string): WorkOrderCategory[] => {
    return categories.value.filter(cat => cat.parentId === parentId);
  };

  const createCategory = async (categoryData: CreateCategoryForm): Promise<WorkOrderCategory> => {
    try {
      loading.value = true;
      error.value = null;

      // Validate data
      if (!categoryData.name.trim()) {
        throw new Error('Category name is required');
      }

      // Check for duplicate name within parent scope
      const existingCategory = categories.value.find(cat => 
        cat.name.toLowerCase() === categoryData.name.toLowerCase() &&
        cat.parentId === categoryData.parentId
      );
      
      if (existingCategory) {
        throw new Error('Category name already exists within this parent');
      }

      // Validate hierarchy
      if (categoryData.parentId) {
        const validation = validateCategoryHierarchy('', categoryData.parentId, categories.value);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      // Calculate level
      let level = 1;
      if (categoryData.parentId) {
        const parent = getCategoryById(categoryData.parentId);
        if (parent) {
          level = parent.level + 1;
        }
      }

      // Create new category
      const newCategory: WorkOrderCategory = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: categoryData.name.trim(),
        description: categoryData.description?.trim() || undefined,
        parentId: categoryData.parentId || undefined,
        level,
        iconName: categoryData.iconName,
        color: categoryData.color,
        isActive: categoryData.isActive,
        sortOrder: categoryData.sortOrder,
        createdBy: 'current-user', // TODO: Get from auth store
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Add to store
      categories.value.push(newCategory);

      return newCategory;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create category';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (id: string, updates: Partial<CreateCategoryForm>): Promise<WorkOrderCategory> => {
    try {
      loading.value = true;
      error.value = null;

      const existingCategory = getCategoryById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // Validate name uniqueness if name is being updated
      if (updates.name && updates.name !== existingCategory.name) {
        const duplicateCategory = categories.value.find(cat =>
          cat.id !== id &&
          cat.name.toLowerCase() === updates.name!.toLowerCase() &&
          cat.parentId === (updates.parentId ?? existingCategory.parentId)
        );
        
        if (duplicateCategory) {
          throw new Error('Category name already exists within this parent');
        }
      }

      // Validate hierarchy if parent is being changed
      if (updates.parentId !== undefined && updates.parentId !== existingCategory.parentId) {
        const validation = validateCategoryHierarchy(id, updates.parentId, categories.value);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      // Calculate new level if parent changed
      let newLevel = existingCategory.level;
      if (updates.parentId !== undefined && updates.parentId !== existingCategory.parentId) {
        newLevel = 1;
        if (updates.parentId) {
          const parent = getCategoryById(updates.parentId);
          if (parent) {
            newLevel = parent.level + 1;
          }
        }

        // Update levels of all descendants
        const updateDescendantLevels = (categoryId: string, baseLevel: number) => {
          const children = getChildCategories(categoryId);
          children.forEach(child => {
            const index = categories.value.findIndex(cat => cat.id === child.id);
            if (index !== -1) {
              const existing = categories.value[index];
              if (existing) {
                categories.value[index] = {
                  ...existing,
                  id: existing.id,
                  name: existing.name,
                  level: baseLevel + 1,
                  updatedAt: new Date().toISOString()
                };
              }
              updateDescendantLevels(child.id, baseLevel + 1);
            }
          });
        };

        updateDescendantLevels(id, newLevel);
      }

      // Update category
      const updatedCategory: WorkOrderCategory = {
        ...existingCategory,
        name: updates.name?.trim() || existingCategory.name,
        description: updates.description?.trim() || existingCategory.description,
        parentId: updates.parentId !== undefined ? updates.parentId : existingCategory.parentId,
        level: newLevel,
        iconName: updates.iconName !== undefined ? updates.iconName : existingCategory.iconName,
        color: updates.color !== undefined ? updates.color : existingCategory.color,
        isActive: updates.isActive !== undefined ? updates.isActive : existingCategory.isActive,
        sortOrder: updates.sortOrder !== undefined ? updates.sortOrder : existingCategory.sortOrder,
        updatedAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update in store
      const index = categories.value.findIndex(cat => cat.id === id);
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      }

      return updatedCategory;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update category';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (id: string, cascade: boolean = false): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const category = getCategoryById(id);
      if (!category) {
        throw new Error('Category not found');
      }

      // Check for child categories
      const children = getChildCategories(id);
      if (children.length > 0 && !cascade) {
        throw new Error('Cannot delete category with child categories. Use cascade delete or move children first.');
      }

      // TODO: Check for existing templates in this category
      // This would be integrated with template store

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      if (cascade) {
        // Delete all descendants
        const descendantIds = getDescendantIds(id, categories.value);
        categories.value = categories.value.filter(cat => 
          cat.id !== id && !descendantIds.includes(cat.id)
        );
      } else {
        // Just delete the category
        categories.value = categories.value.filter(cat => cat.id !== id);
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete category';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const moveCategory = async (categoryId: string, newParentId: string | null): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const validation = validateCategoryHierarchy(categoryId, newParentId || undefined, categories.value);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const updates = { parentId: newParentId || undefined };
      await updateCategory(categoryId, updates);

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to move category';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const toggleCategoryStatus = async (id: string): Promise<void> => {
    const category = getCategoryById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    await updateCategory(id, { isActive: !category.isActive });

    // If deactivating, also deactivate all descendants
    if (category.isActive) {
      const descendantIds = getDescendantIds(id, categories.value);
      for (const descendantId of descendantIds) {
        const descendant = getCategoryById(descendantId);
        if (descendant && descendant.isActive) {
          await updateCategory(descendantId, { isActive: false });
        }
      }
    }
  };

  const bulkOperation = async (operation: BulkCategoryOperation): Promise<BulkOperationResult> => {
    try {
      loading.value = true;
      error.value = null;

      const result: BulkOperationResult = {
        success: true,
        processedCount: 0,
        failedItems: [],
        warnings: []
      };

      // Process each category
      for (const categoryId of operation.categoryIds) {
        try {
          switch (operation.type) {
            case 'activate':
              await updateCategory(categoryId, { isActive: true });
              break;
            case 'deactivate':
              await toggleCategoryStatus(categoryId);
              break;
            case 'move':
              if (operation.targetParentId) {
                await moveCategory(categoryId, operation.targetParentId);
              }
              break;
            case 'delete':
              await deleteCategory(categoryId, false);
              break;
          }
          result.processedCount++;
        } catch (err) {
          result.failedItems.push({
            categoryId,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }

      result.success = result.failedItems.length === 0;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Bulk operation failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const searchCategories = (query: string): WorkOrderCategory[] => {
    if (!query.trim()) return categories.value;
    
    const searchTerm = query.toLowerCase().trim();
    return categories.value.filter(category =>
      category.name.toLowerCase().includes(searchTerm) ||
      category.description?.toLowerCase().includes(searchTerm)
    );
  };

  const exportCategories = async (): Promise<CategoryExportData> => {
    try {
      loading.value = true;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const exportData: CategoryExportData = {
        categories: categories.value,
        templates: [], // TODO: Get from template store
        exportedAt: new Date().toISOString(),
        exportedBy: 'current-user', // TODO: Get from auth store
        version: '1.0'
      };

      return exportData;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to export categories';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const importCategories = async (data: CategoryExportData): Promise<CategoryImportResult> => {
    try {
      loading.value = true;
      error.value = null;

      const result: CategoryImportResult = {
        success: true,
        importedCategories: 0,
        importedTemplates: 0,
        skippedItems: [],
        errors: []
      };

      // Validate and import categories
      for (const category of data.categories) {
        try {
          // Check if category already exists
          const existing = categories.value.find(cat => cat.id === category.id);
          if (existing) {
            result.skippedItems.push({
              type: 'category',
              name: category.name,
              reason: 'Category with this ID already exists'
            });
            continue;
          }

          // Validate category data
          if (!category.name || !category.id) {
            result.errors.push(`Invalid category data: ${category.name || 'Unknown'}`);
            continue;
          }

          // Add category
          categories.value.push({
            ...category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          result.importedCategories++;

        } catch (err) {
          result.errors.push(`Failed to import category ${category.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      result.success = result.errors.length === 0;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to import categories';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getCategoryAnalytics = async (categoryId: string): Promise<CategoryAnalytics> => {
    try {
      // Simulate API call for analytics data
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock analytics data
      const analytics: CategoryAnalytics = {
        categoryId,
        templateCount: Math.floor(Math.random() * 10) + 1,
        workOrderCount: Math.floor(Math.random() * 50) + 10,
        averageCompletionTime: Math.floor(Math.random() * 8) + 2,
        successRate: Math.floor(Math.random() * 20) + 80,
        popularTemplates: [
          {
            templateId: 'template-1',
            templateName: 'Sample Template',
            usageCount: Math.floor(Math.random() * 25) + 5
          }
        ]
      };

      return analytics;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get category analytics';
      throw err;
    }
  };

  const duplicateCategory = async (categoryId: string): Promise<WorkOrderCategory> => {
    const originalCategory = getCategoryById(categoryId);
    if (!originalCategory) {
      throw new Error('Category not found');
    }

    const duplicateData: CreateCategoryForm = {
      name: `${originalCategory.name} (Copy)`,
      description: originalCategory.description,
      parentId: originalCategory.parentId,
      iconName: originalCategory.iconName,
      color: originalCategory.color,
      isActive: false, // Start as inactive
      sortOrder: originalCategory.sortOrder + 1
    };

    return createCategory(duplicateData);
  };

  // Initialize store
  fetchCategories();

  return {
    // State
    categories,
    loading,
    error,

    // Computed
    categoryTree,
    activeCategories,
    rootCategories,

    // Actions
    fetchCategories,
    getCategoryById,
    getCategoryPathString,
    getChildCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    toggleCategoryStatus,
    bulkOperation,
    searchCategories,
    exportCategories,
    importCategories,
    getCategoryAnalytics,
    duplicateCategory
  };
});