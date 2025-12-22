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
  WorkOrderActionPermissions,
  WorkOrder
} from '@/types';
import { useWorkOrderStore } from './workorder';
import { useAuthStore } from './auth';

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
  const workOrderStore = useWorkOrderStore();
  const authStore = useAuthStore();
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

  // Get user role from auth store
  const currentUserRole = computed(() => {
    if (authStore.isAdmin) return 'admin';
    if (authStore.isSupervisor) return 'supervisor';
    if (authStore.isWorker) return 'worker';
    return 'worker'; // default
  });

  // Helper function to determine if a work order should be in ongoing vs history
  const shouldShowInOngoing = (row: WorkOrderTableRow): boolean => {
    // If not completed, always show in ongoing
    if (row.status !== 'completed') {
      return true;
    }
    
    // For completed work orders, check if they were completed in the current month
    const now = new Date();
    const lastUpdated = new Date(row.lastUpdated);
    
    return lastUpdated.getFullYear() === now.getFullYear() && 
           lastUpdated.getMonth() === now.getMonth();
  };

  // Computed
  const filteredRows = computed(() => {
    let rows = [...state.value.rows];

    // First, filter out work orders that should be in history
    rows = rows.filter(shouldShowInOngoing);

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

  // Convert WorkOrder to WorkOrderTableRow
  const convertToTableRow = async (wo: WorkOrder): Promise<WorkOrderTableRow> => {
    // Import mock data to get related objects
    const { mockUsers } = await import('@/mock/users');
    const { mockTerminals } = await import('@/mock/terminals');
    const { mockCategories } = await import('@/mock/categories');
    
    // Find related objects
    const assignedWorker = wo.assignedWorkerId ? mockUsers.find((u: any) => u.id === wo.assignedWorkerId) : null;
    const terminal = mockTerminals.find((t: any) => t.id === wo.terminalId);
    const creator = mockUsers.find((u: any) => u.id === wo.createdBy);
    const category = mockCategories.find((c: any) => c.id === wo.categoryId);
    
    // Calculate overdue status
    const dueDate = new Date(wo.dueDate);
    const now = new Date();
    const isOverdue = dueDate < now && !['completed', 'rejected'].includes(wo.status);
    const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : undefined;
    
    // Calculate progress based on status
    let progress = 0;
    switch (wo.status) {
      case 'draft': progress = 0; break;
      case 'pending_approval': progress = 10; break;
      case 'assigned': progress = 20; break;
      case 'in_progress': progress = 50; break;
      case 'submitted_for_review': progress = 90; break;
      case 'completed': progress = 100; break;
      default: progress = 0;
    }
    
    // Map priority to table format
    const mappedPriority: 'high' | 'medium' | 'low' = 
      wo.priority === 'urgent' || wo.priority === 'critical' ? 'high' :
      wo.priority === 'normal' ? 'medium' : 
      wo.priority as 'high' | 'medium' | 'low';
    
    // Map status to table format
    const mappedStatus = isOverdue ? 'overdue' as const : 
      wo.status === 'pending_approval' ? 'draft' as const :
      wo.status as 'draft' | 'assigned' | 'in_progress' | 'submitted_for_review' | 'completed';
    
    const tableRow: WorkOrderTableRow = {
      id: wo.id,
      code: `WO-${wo.id.replace('wo_', '')}`,
      title: wo.title,
      status: mappedStatus,
      maintenanceType: wo.type,
      priority: mappedPriority,
      dueDate: wo.dueDate.split('T')[0] || wo.dueDate,
      assignedTo: assignedWorker ? {
        id: assignedWorker.id,
        name: assignedWorker.name,
        role: assignedWorker.role === 'leader' ? 'supervisor' : assignedWorker.role as 'admin' | 'supervisor' | 'worker'
      } : null,
      terminal: {
        id: terminal?.id || 'unknown',
        name: terminal?.name || 'Unknown Terminal',
        region: terminal?.regionId || 'Unknown Region'
      },
      category: {
        id: category?.id || 'general',
        name: category?.name || 'General Maintenance',
        level: category?.level || 1,
        path: category?.name || 'General Maintenance'
      },
      progress,
      isOverdue,
      daysOverdue,
      estimatedDuration: wo.estimatedDuration || 4,
      createdAt: wo.createdAt,
      createdBy: {
        id: creator?.id || wo.createdBy,
        name: creator?.name || 'System User',
        role: (creator?.role === 'leader' ? 'supervisor' : creator?.role || 'admin') as 'admin' | 'supervisor'
      },
      templateUsed: wo.templateId ? {
        id: wo.templateId,
        name: `Template ${wo.templateId}`,
        version: '1.0'
      } : undefined,
      lastUpdated: wo.updatedAt,
      urgencyScore: 0, // Will be calculated
      hasDocumentation: wo.beforePhotos.length > 0 || wo.afterPhotos.length > 0,
      checklistProgress: {
        completed: wo.checklist?.filter(item => item.afterValue !== undefined).length || 0,
        total: wo.checklist?.length || 0
      }
    };
    
    return tableRow;
  };

  // Get work orders from main store with terminal filtering
  const fetchMockWorkOrders = async (): Promise<WorkOrderTableRow[]> => {
    // Ensure work orders are loaded in main store
    await workOrderStore.fetchWorkOrders();
    
    // Get filtered work orders based on user's terminal access
    const filteredWorkOrders = workOrderStore.myWorkOrders;
    
    // Convert WorkOrder to WorkOrderTableRow format
    return await Promise.all(filteredWorkOrders.map(wo => convertToTableRow(wo)));
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
    updateWorkOrder
  };
});

