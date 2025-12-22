// Category Store for Work Order Category Management

import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { 
  WorkOrderCategory, 
  BulkCategoryOperation, 
  BulkOperationResult,
  CategoryExportData,
  CategoryImportResult,
  CreateCategoryForm,
  CategoryAnalytics
} from '@/types/templates';
import type { PaginationState, CategoryPaginationSizes } from '@/types/pagination';
import { getPaginationConfig } from '@/config/pagination';
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

  // Enterprise pagination state
  const paginationConfig = getPaginationConfig('categories');
  const paginationState = ref<PaginationState>({
    currentPage: 1,
    pageSize: paginationConfig.defaultPageSize,
    totalItems: 0,
    totalPages: 0
  });

  // Enterprise search and filter state
  const searchQuery = ref('');
  const statusFilter = ref<string>('');
  const levelFilter = ref<string>('');
  const sortBy = ref<'name' | 'level' | 'templateCount' | 'createdAt' | 'updatedAt'>('name');
  const sortOrder = ref<'asc' | 'desc'>('asc');

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

  // Enterprise-standard filtering and search for categories
  const flattenedCategories = computed(() => {
    const flatten = (cats: WorkOrderCategory[]): WorkOrderCategory[] => {
      const result: WorkOrderCategory[] = [];
      cats.forEach(cat => {
        result.push(cat);
        if (cat.children) {
          result.push(...flatten(cat.children));
        }
      });
      return result;
    };
    return flatten(categoryTree.value);
  });

  const filteredAndSearchedCategories = computed(() => {
    let result = flattenedCategories.value;

    // Apply search query
    if (searchQuery.value.trim()) {
      const search = searchQuery.value.trim().toLowerCase();
      result = result.filter(category =>
        category.name.toLowerCase().includes(search) ||
        category.description?.toLowerCase().includes(search) ||
        category.code.toLowerCase().includes(search) ||
        category.path.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter.value) {
      switch (statusFilter.value) {
        case 'active':
          result = result.filter(category => category.isActive);
          break;
        case 'inactive':
          result = result.filter(category => !category.isActive);
          break;
      }
    }

    // Apply level filter
    if (levelFilter.value) {
      const level = parseInt(levelFilter.value);
      if (!isNaN(level)) {
        result = result.filter(category => category.level === level);
      }
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
        case 'level':
          aValue = a.level;
          bValue = b.level;
          break;
        case 'templateCount':
          aValue = a.templateCount || 0;
          bValue = b.templateCount || 0;
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

  // Paginated categories for list view
  const paginatedCategories = computed(() => {
    const startIndex = (paginationState.value.currentPage - 1) * paginationState.value.pageSize;
    const endIndex = startIndex + paginationState.value.pageSize;
    return filteredAndSearchedCategories.value.slice(startIndex, endIndex);
  });

  // Filtered tree for tree view (maintains hierarchy)
  const filteredCategoryTree = computed(() => {
    if (!searchQuery.value.trim() && !statusFilter.value && !levelFilter.value) {
      return categoryTree.value;
    }

    const search = searchQuery.value.trim().toLowerCase();
    
    const filterTree = (cats: WorkOrderCategory[]): WorkOrderCategory[] => {
      return cats.filter(cat => {
        // Check if category matches filters
        let matches = true;

        // Search filter
        if (search) {
          matches = matches && (
            cat.name.toLowerCase().includes(search) ||
            cat.description?.toLowerCase().includes(search) ||
            cat.code.toLowerCase().includes(search) ||
            cat.path.toLowerCase().includes(search)
          );
        }

        // Status filter
        if (statusFilter.value) {
          matches = matches && (
            statusFilter.value === 'active' ? cat.isActive : !cat.isActive
          );
        }

        // Level filter
        if (levelFilter.value) {
          const level = parseInt(levelFilter.value);
          if (!isNaN(level)) {
            matches = matches && cat.level === level;
          }
        }

        // Check if any children match (include parent if child matches)
        const filteredChildren = cat.children ? filterTree(cat.children) : [];
        
        if (matches || filteredChildren.length > 0) {
          return {
            ...cat,
            children: filteredChildren
          };
        }

        return false;
      }).filter(Boolean) as WorkOrderCategory[];
    };

    return filterTree(categoryTree.value);
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

      // Calculate level and path
      let level = 1;
      let parentPath = '';
      if (categoryData.parentId) {
        const parent = getCategoryById(categoryData.parentId);
        if (parent) {
          level = parent.level + 1;
          parentPath = parent.path;
        }
      }

      // Create new category
      const newCategory: WorkOrderCategory = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: categoryData.name.trim(),
        description: categoryData.description?.trim() || undefined,
        code: categoryData.code.trim(),
        parentId: categoryData.parentId || undefined,
        level,
        path: categoryData.parentId ? `${parentPath}/${categoryData.name.trim()}` : categoryData.name.trim(),
        templateCount: 0,
        maintenanceTypes: categoryData.maintenanceTypes,
        requiredPermissions: categoryData.requiredPermissions,
        defaultPriority: categoryData.defaultPriority,
        defaultEstimatedDuration: categoryData.defaultEstimatedDuration,
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
      code: `${originalCategory.code}_COPY`,
      parentId: originalCategory.parentId,
      maintenanceTypes: originalCategory.maintenanceTypes,
      requiredPermissions: originalCategory.requiredPermissions,
      defaultPriority: originalCategory.defaultPriority,
      defaultEstimatedDuration: originalCategory.defaultEstimatedDuration,
      iconName: originalCategory.iconName,
      color: originalCategory.color,
      isActive: false, // Start as inactive
      sortOrder: originalCategory.sortOrder + 1
    };

    return createCategory(duplicateData);
  };

  // Enterprise pagination methods
  const setPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, paginationState.value.totalPages));
    paginationState.value.currentPage = newPage;
  };

  const setPageSize = (pageSize: CategoryPaginationSizes) => {
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

  const setStatusFilter = (status: string) => {
    statusFilter.value = status;
    resetPagination();
  };

  const setLevelFilter = (level: string) => {
    levelFilter.value = level;
    resetPagination();
  };

  const setSorting = (by: 'name' | 'level' | 'templateCount' | 'createdAt' | 'updatedAt', order: 'asc' | 'desc') => {
    sortBy.value = by;
    sortOrder.value = order;
    resetPagination();
  };

  const toggleSort = (field: string) => {
    const validFields = ['name', 'level', 'templateCount', 'createdAt', 'updatedAt'];
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
    statusFilter.value = '';
    levelFilter.value = '';
    sortBy.value = 'name';
    sortOrder.value = 'asc';
    resetPagination();
  };

  const clearFilters = clearAllFilters; // Alias for compatibility

  // Available filter options
  const availableStatuses = computed(() => {
    const statuses = new Set<string>();
    categories.value.forEach(category => {
      if (category.isActive) statuses.add('active');
      if (!category.isActive) statuses.add('inactive');
    });
    return Array.from(statuses).sort();
  });

  const availableLevels = computed(() => {
    const levels = new Set<number>();
    categories.value.forEach(category => levels.add(category.level));
    return Array.from(levels).sort((a, b) => a - b);
  });

  // Note: Don't initialize automatically, let components call fetchCategories when needed

  return {
    // State
    categories,
    loading,
    error,

    // Pagination and filtering state (enterprise standard)
    paginationState: readonly(paginationState),
    paginatedCategories,
    filteredAndSearchedCategories,
    filteredCategoryTree,
    flattenedCategories,
    availableStatuses,
    availableLevels,
    searchQuery: readonly(searchQuery),
    statusFilter: readonly(statusFilter),
    levelFilter: readonly(levelFilter),
    sortBy: readonly(sortBy),
    sortOrder: readonly(sortOrder),

    // Computed
    categoryTree,
    activeCategories,
    rootCategories,
    categoryMap,

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
    duplicateCategory,

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
    setStatusFilter,
    setLevelFilter,
    setSorting,
    toggleSort,
    clearAllFilters,
    clearFilters
  };
});