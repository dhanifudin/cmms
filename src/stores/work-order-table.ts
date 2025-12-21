import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { 
  WorkOrderTableRow, 
  WorkOrderTableFilters, 
  WorkOrderTableSearchOptions, 
  WorkOrderTablePagination, 
  WorkOrderTableSort,
  WorkOrderTableState,
  WorkOrderBulkAction,
  WorkOrderActionPermissions
} from '@/types';

// Helper function for urgency score calculation (used by mock data)
const calculateUrgencyScore = (row: WorkOrderTableRow): number => {
  let score = 0;
  
  // Overdue gets highest priority
  if (row.isOverdue) {
    score += 1000 + (row.daysOverdue || 0) * 10;
  }
  
  // Priority scoring
  switch (row.priority) {
    case 'high':
      score += 100;
      break;
    case 'medium':
      score += 50;
      break;
    case 'low':
      score += 10;
      break;
  }
  
  // Due date proximity (higher score for sooner due dates)
  const dueDate = new Date(row.dueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue <= 0) {
    score += 200; // Past due
  } else if (daysUntilDue <= 1) {
    score += 150; // Due today/tomorrow
  } else if (daysUntilDue <= 7) {
    score += 100 - daysUntilDue * 10; // Due this week
  }
  
  return score;
};

export const useWorkOrderTableStore = defineStore('workOrderTable', () => {
  // State
  const state = ref<WorkOrderTableState>({
    rows: [],
    filters: {
      maintenanceType: [],
      status: [],
      priority: [],
      categoryIds: [],
      terminalIds: [],
      assignedWorkerIds: [],
      createdByIds: []
    },
    search: {
      query: '',
      fields: ['title', 'code', 'assignedWorker'],
      useAdvanced: false,
      operators: {}
    },
    pagination: {
      page: 1,
      pageSize: 25,
      total: 0,
      totalPages: 0
    },
    sort: {
      field: 'urgencyScore', // Default: overdue priority
      direction: 'desc',
      overridePriority: false
    },
    selectedIds: [],
    loading: false,
    error: null,
    lastUpdated: new Date().toISOString()
  });

  const currentUserRole = ref<'worker' | 'supervisor' | 'admin'>('worker'); // TODO: Get from auth store

  // Computed
  const filteredRows = computed(() => {
    let rows = [...state.value.rows];

    // Apply search
    if (state.value.search.query.trim()) {
      const query = state.value.search.query.toLowerCase();
      
      if (state.value.search.useAdvanced) {
        rows = applyAdvancedSearch(rows, query);
      } else {
        rows = rows.filter(row => 
          row.title.toLowerCase().includes(query) ||
          row.code.toLowerCase().includes(query) ||
          row.assignedTo?.name.toLowerCase().includes(query)
        );
      }
    }

    // Apply filters
    rows = applyFilters(rows, state.value.filters);

    // Apply sorting with overdue prioritization
    rows = applySorting(rows, state.value.sort);

    return rows;
  });

  const paginatedRows = computed(() => {
    const start = (state.value.pagination.page - 1) * state.value.pagination.pageSize;
    const end = start + state.value.pagination.pageSize;
    return filteredRows.value.slice(start, end);
  });

  const totalFilteredCount = computed(() => filteredRows.value.length);

  const hasActiveFilters = computed(() => {
    const filters = state.value.filters;
    return !!(
      filters.maintenanceType?.length ||
      filters.status?.length ||
      filters.priority?.length ||
      filters.categoryIds?.length ||
      filters.terminalIds?.length ||
      filters.assignedWorkerIds?.length ||
      filters.createdByIds?.length ||
      filters.dateRange ||
      filters.progressRange ||
      filters.durationRange ||
      filters.hasTemplate !== undefined ||
      filters.isOverdue !== undefined
    );
  });

  const hasSelection = computed(() => state.value.selectedIds.length > 0);

  const selectedRows = computed(() => 
    state.value.rows.filter(row => state.value.selectedIds.includes(row.id))
  );

  // Action permissions based on user role
  const permissions = computed((): WorkOrderActionPermissions => {
    const role = currentUserRole.value;
    
    return {
      canView: true,
      canEdit: role === 'admin' || role === 'supervisor',
      canDelete: role === 'admin',
      canReassign: role === 'admin' || role === 'supervisor',
      canChangeStatus: role === 'admin' || role === 'supervisor',
      canBulkEdit: role === 'admin' || role === 'supervisor',
      canCreate: role === 'admin',
      canComment: true,
      canSubmitDocumentation: role === 'worker' || role === 'supervisor' || role === 'admin',
      canApprove: role === 'supervisor' || role === 'admin'
    };
  });

  // Helper Functions

  const applyAdvancedSearch = (rows: WorkOrderTableRow[], _query: string): WorkOrderTableRow[] => {
    // Parse advanced search operators like "title:pump", "worker:john", "status:overdue"
    const operators = state.value.search.operators || {};
    
    return rows.filter(row => {
      for (const [field, value] of Object.entries(operators)) {
        const searchValue = value.toLowerCase();
        
        switch (field) {
          case 'title':
            if (!row.title.toLowerCase().includes(searchValue)) return false;
            break;
          case 'code':
            if (!row.code.toLowerCase().includes(searchValue)) return false;
            break;
          case 'worker':
            if (!row.assignedTo?.name.toLowerCase().includes(searchValue)) return false;
            break;
          case 'status':
            if (row.status !== searchValue) return false;
            break;
          case 'priority':
            if (row.priority !== searchValue) return false;
            break;
          case 'category':
            if (!row.category.name.toLowerCase().includes(searchValue)) return false;
            break;
        }
      }
      return true;
    });
  };

  const applyFilters = (rows: WorkOrderTableRow[], filters: WorkOrderTableFilters): WorkOrderTableRow[] => {
    return rows.filter(row => {
      // Maintenance type filter (OR logic)
      if (filters.maintenanceType?.length && !filters.maintenanceType.includes(row.maintenanceType)) {
        return false;
      }
      
      // Status filter (OR logic)
      if (filters.status?.length && !filters.status.includes(row.status)) {
        return false;
      }
      
      // Priority filter (OR logic)
      if (filters.priority?.length && !filters.priority.includes(row.priority)) {
        return false;
      }
      
      // Category filter (OR logic)
      if (filters.categoryIds?.length && !filters.categoryIds.includes(row.category.id)) {
        return false;
      }
      
      // Terminal filter (OR logic)
      if (filters.terminalIds?.length && !filters.terminalIds.includes(row.terminal.id)) {
        return false;
      }
      
      // Assigned worker filter (OR logic)
      if (filters.assignedWorkerIds?.length && 
          (!row.assignedTo || !filters.assignedWorkerIds.includes(row.assignedTo.id))) {
        return false;
      }
      
      // Created by filter (OR logic)
      if (filters.createdByIds?.length && !filters.createdByIds.includes(row.createdBy.id)) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange) {
        const { field, start, end } = filters.dateRange;
        let dateValue: string;
        
        switch (field) {
          case 'dueDate':
            dateValue = row.dueDate;
            break;
          case 'createdAt':
            dateValue = row.createdAt;
            break;
          case 'lastUpdated':
            dateValue = row.lastUpdated;
            break;
          default:
            dateValue = row.dueDate;
        }
        
        if (dateValue < start || dateValue > end) {
          return false;
        }
      }
      
      // Progress range filter
      if (filters.progressRange) {
        const { min, max } = filters.progressRange;
        if (row.progress < min || row.progress > max) {
          return false;
        }
      }
      
      // Duration range filter
      if (filters.durationRange) {
        const { min, max } = filters.durationRange;
        if (row.estimatedDuration < min || row.estimatedDuration > max) {
          return false;
        }
      }
      
      // Template filter
      if (filters.hasTemplate !== undefined) {
        const hasTemplate = !!row.templateUsed;
        if (hasTemplate !== filters.hasTemplate) {
          return false;
        }
      }
      
      // Overdue filter
      if (filters.isOverdue !== undefined) {
        if (row.isOverdue !== filters.isOverdue) {
          return false;
        }
      }
      
      return true;
    });
  };

  const applySorting = (rows: WorkOrderTableRow[], sort: WorkOrderTableSort): WorkOrderTableRow[] => {
    const sortedRows = [...rows];
    
    // Default overdue prioritization unless overridden
    if (!sort.overridePriority) {
      sortedRows.sort((a, b) => {
        // First priority: overdue items (by days overdue, descending)
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        if (a.isOverdue && b.isOverdue) {
          return (b.daysOverdue || 0) - (a.daysOverdue || 0);
        }
        
        // Second priority: urgency score (overdue + priority + due date)
        return b.urgencyScore - a.urgencyScore;
      });
    } else {
      // Custom sorting
      sortedRows.sort((a, b) => {
        const aValue = a[sort.field];
        const bValue = b[sort.field];
        
        if ((aValue ?? '') < (bValue ?? '')) return sort.direction === 'asc' ? -1 : 1;
        if ((aValue ?? '') > (bValue ?? '')) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return sortedRows;
  };

  // Actions
  const fetchWorkOrders = async (options?: { 
    page?: number; 
    pageSize?: number;
    forceRefresh?: boolean;
  }) => {
    try {
      state.value.loading = true;
      state.value.error = null;
      
      // Update pagination if provided
      if (options?.page) state.value.pagination.page = options.page;
      if (options?.pageSize) state.value.pagination.pageSize = options.pageSize as 10 | 25 | 50;
      
      // Simulate API call - replace with actual API
      const mockData = await fetchMockWorkOrders();
      
      state.value.rows = mockData.map(row => ({
        ...row,
        urgencyScore: calculateUrgencyScore(row)
      }));
      
      // Update pagination totals
      state.value.pagination.total = totalFilteredCount.value;
      state.value.pagination.totalPages = Math.ceil(totalFilteredCount.value / state.value.pagination.pageSize);
      state.value.lastUpdated = new Date().toISOString();
      
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to fetch work orders';
      console.error('Failed to fetch work orders:', error);
    } finally {
      state.value.loading = false;
    }
  };

  const setFilters = (newFilters: Partial<WorkOrderTableFilters>) => {
    state.value.filters = { ...state.value.filters, ...newFilters };
    state.value.pagination.page = 1; // Reset to first page when filters change
  };

  const clearFilters = () => {
    state.value.filters = {
      maintenanceType: [],
      status: [],
      priority: [],
      categoryIds: [],
      terminalIds: [],
      assignedWorkerIds: [],
      createdByIds: []
    };
    state.value.pagination.page = 1;
  };

  const setSearch = (searchOptions: Partial<WorkOrderTableSearchOptions>) => {
    state.value.search = { ...state.value.search, ...searchOptions };
    state.value.pagination.page = 1; // Reset to first page when search changes
  };

  const clearSearch = () => {
    state.value.search = {
      query: '',
      fields: ['title', 'code', 'assignedWorker'],
      useAdvanced: false,
      operators: {}
    };
    state.value.pagination.page = 1;
  };

  const setSort = (newSort: Partial<WorkOrderTableSort>) => {
    state.value.sort = { ...state.value.sort, ...newSort };
  };

  const setPagination = (newPagination: Partial<WorkOrderTablePagination>) => {
    state.value.pagination = { ...state.value.pagination, ...newPagination };
  };

  const toggleSelection = (workOrderId: string) => {
    const index = state.value.selectedIds.indexOf(workOrderId);
    if (index > -1) {
      state.value.selectedIds.splice(index, 1);
    } else {
      state.value.selectedIds.push(workOrderId);
    }
  };

  const selectAll = (selectFiltered = true) => {
    if (selectFiltered) {
      state.value.selectedIds = filteredRows.value.map(row => row.id);
    } else {
      state.value.selectedIds = state.value.rows.map(row => row.id);
    }
  };

  const clearSelection = () => {
    state.value.selectedIds = [];
  };

  const executeBulkAction = async (action: WorkOrderBulkAction) => {
    try {
      state.value.loading = true;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state based on action
      switch (action.type) {
        case 'status_update':
          if (action.payload?.status) {
            state.value.rows = state.value.rows.map(row => 
              action.workOrderIds.includes(row.id) 
                ? { ...row, status: action.payload!.status!, lastUpdated: new Date().toISOString() }
                : row
            );
          }
          break;
        case 'priority_change':
          if (action.payload?.priority) {
            state.value.rows = state.value.rows.map(row => 
              action.workOrderIds.includes(row.id) 
                ? { ...row, priority: action.payload!.priority!, lastUpdated: new Date().toISOString() }
                : row
            );
          }
          break;
        case 'reassign':
          if (action.payload?.assignedTo) {
            // This would need to fetch user data in real implementation
            state.value.rows = state.value.rows.map(row => 
              action.workOrderIds.includes(row.id) 
                ? { ...row, lastUpdated: new Date().toISOString() }
                : row
            );
          }
          break;
        case 'delete':
          state.value.rows = state.value.rows.filter(row => 
            !action.workOrderIds.includes(row.id)
          );
          break;
      }
      
      // Recalculate urgency scores
      state.value.rows = state.value.rows.map(row => ({
        ...row,
        urgencyScore: calculateUrgencyScore(row)
      }));
      
      clearSelection();
      state.value.lastUpdated = new Date().toISOString();
      
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Bulk action failed';
      throw error;
    } finally {
      state.value.loading = false;
    }
  };

  const updateWorkOrder = async (id: string, updates: Partial<WorkOrderTableRow>) => {
    try {
      const index = state.value.rows.findIndex(row => row.id === id);
      if (index > -1) {
        const updatedRow = { 
          ...state.value.rows[index], 
          ...updates, 
          lastUpdated: new Date().toISOString()
        } as WorkOrderTableRow;
        updatedRow.urgencyScore = calculateUrgencyScore(updatedRow);
        state.value.rows[index] = updatedRow;
      }
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Update failed';
      throw error;
    }
  };

  // Mock data generator
  const fetchMockWorkOrders = async (): Promise<WorkOrderTableRow[]> => {
    // This will be replaced with actual API call
    return generateMockWorkOrders();
  };

  // Watch for changes that should trigger re-sorting
  watch(
    () => [state.value.filters, state.value.search],
    () => {
      // Update pagination totals when filters/search change
      state.value.pagination.total = totalFilteredCount.value;
      state.value.pagination.totalPages = Math.ceil(totalFilteredCount.value / state.value.pagination.pageSize);
      
      // Ensure current page is valid
      if (state.value.pagination.page > state.value.pagination.totalPages) {
        state.value.pagination.page = Math.max(1, state.value.pagination.totalPages);
      }
    },
    { deep: true }
  );

  return {
    // State
    state,
    
    // Computed
    filteredRows,
    paginatedRows,
    totalFilteredCount,
    hasActiveFilters,
    hasSelection,
    selectedRows,
    permissions,
    
    // Actions
    fetchWorkOrders,
    setFilters,
    clearFilters,
    setSearch,
    clearSearch,
    setSort,
    setPagination,
    toggleSelection,
    selectAll,
    clearSelection,
    executeBulkAction,
    updateWorkOrder,
    
    // Utility
    setUserRole: (role: 'worker' | 'supervisor' | 'admin') => {
      currentUserRole.value = role;
    }
  };
});

// Mock data generator - will be removed in production
const generateMockWorkOrders = (): WorkOrderTableRow[] => {
  const mockData: WorkOrderTableRow[] = [];
  const statuses = ['draft', 'assigned', 'in_progress', 'completed', 'overdue', 'submitted_for_review'] as const;
  const priorities = ['high', 'medium', 'low'] as const;
  const maintenanceTypes = ['preventive', 'corrective'] as const;
  
  for (let i = 1; i <= 100; i++) {
    const dueDate = new Date();
    // Make exactly 5% overdue (items 5, 25, 45, 65, 85 - every 20th starting from 5)
    const isOverdue = i % 20 === 5;
    if (isOverdue) {
      // Set overdue by 1-10 days based on item index
      dueDate.setDate(dueDate.getDate() - (1 + (i % 10)));
    } else {
      // Set future due date 1-30 days ahead based on item index
      dueDate.setDate(dueDate.getDate() + (1 + (i % 30)));
    }
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - (1 + (i % 30)));
    
    const daysOverdue = isOverdue ? Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : undefined;
    
    const row: WorkOrderTableRow = {
      id: `wo-${i.toString().padStart(3, '0')}`,
      code: `WO-2024-${i.toString().padStart(3, '0')}`,
      title: `Maintenance Task ${i} - ${['Pipeline Inspection', 'Compressor Service', 'Safety Check', 'Valve Maintenance', 'Pressure Test'][Math.floor(Math.random() * 5)]}`,
      status: isOverdue ? 'overdue' : statuses[Math.floor(Math.random() * (statuses.length - 1))] || 'draft',
      maintenanceType: maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)] || 'preventive',
      priority: priorities[Math.floor(Math.random() * priorities.length)] || 'medium',
      dueDate: dueDate.toISOString().split('T')[0]!,
      assignedTo: Math.random() > 0.2 ? {
        id: `worker-${Math.floor(Math.random() * 20) + 1}`,
        name: ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'David Brown'][Math.floor(Math.random() * 5)] || 'Worker',
        role: 'worker' as const
      } : null,
      terminal: {
        id: `terminal-${Math.floor(Math.random() * 116) + 1}`,
        name: `Terminal ${Math.floor(Math.random() * 116) + 1}`,
        region: `Region ${Math.floor(Math.random() * 8) + 1}`
      },
      category: {
        id: `cat-${Math.floor(Math.random() * 10) + 1}`,
        name: ['Pipeline Maintenance', 'Compressor Systems', 'Safety Equipment', 'Valve Operations', 'Control Systems'][Math.floor(Math.random() * 5)] || 'General Maintenance',
        level: Math.floor(Math.random() * 3) + 1,
        path: 'Category > Subcategory'
      },
      progress: Math.floor(Math.random() * 101),
      isOverdue,
      daysOverdue,
      estimatedDuration: Math.floor(Math.random() * 16) + 1, // 1-16 hours
      createdAt: createdDate.toISOString(),
      createdBy: {
        id: `admin-${Math.floor(Math.random() * 5) + 1}`,
        name: ['Admin User', 'Supervisor One', 'Manager Two'][Math.floor(Math.random() * 3)] || 'System Admin',
        role: Math.random() > 0.5 ? 'admin' as const : 'supervisor' as const
      },
      templateUsed: Math.random() > 0.4 ? {
        id: `template-${Math.floor(Math.random() * 20) + 1}`,
        name: `Standard Template ${Math.floor(Math.random() * 20) + 1}`,
        version: '1.0'
      } : undefined,
      lastUpdated: new Date().toISOString(),
      urgencyScore: 0, // Will be calculated
      hasDocumentation: Math.random() > 0.3,
      checklistProgress: {
        completed: Math.floor(Math.random() * 10),
        total: 10
      }
    };
    
    // Calculate urgency score after creating the row
    row.urgencyScore = calculateUrgencyScore(row);
    
    mockData.push(row);
  }
  
  return mockData;
};