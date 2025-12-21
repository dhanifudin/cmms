import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { 
  WorkOrderHistoryRow,
  WorkOrderHistoryState,
  WorkOrderHistoryQuery,
  WorkOrderHistoryFilters,
  WorkOrderHistorySearchOptions,
  WorkOrderHistoryPagination,
  WorkOrderHistorySort,
  WorkOrderHistoryPermissions,
  WorkOrderHistoryStats,
  WorkOrderSeparationRule,
  WorkOrderHistoryCache
} from '@/types';
import { useAuthStore } from '@/stores/auth';
import { useWorkOrderTableStore } from '@/stores/work-order-table';

export const useWorkOrderHistoryStore = defineStore('workOrderHistory', () => {
  // Core state
  const state = ref<WorkOrderHistoryState>({
    rows: [],
    filters: {
      maintenanceType: [],
      priority: [],
      categoryIds: [],
      terminalIds: [],
      assignedWorkerIds: [],
      createdByIds: [],
      completedByIds: [],
      hasTemplate: undefined,
      completedDateRange: undefined,
      durationVariance: undefined,
      hasNotes: undefined
    },
    search: {
      query: '',
      fields: ['title', 'code', 'assignedWorker', 'completedBy'],
      useAdvanced: false,
      operators: {}
    },
    pagination: {
      page: 1,
      pageSize: 50,
      total: 0,
      totalPages: 0,
      dateRange: {
        start: getDefaultStartDate(),
        end: new Date().toISOString().split('T')[0] || ''
      }
    },
    sort: {
      field: 'completedDate',
      direction: 'desc'
    },
    loading: false,
    error: null,
    lastUpdated: '',
    cache: {}
  });

  // Performance optimization - cache implementation
  const cache: WorkOrderHistoryCache = {
    get(key: string) {
      const cached = state.value.cache[key];
      if (!cached) return null;
      
      const now = new Date();
      const expiresAt = new Date(cached.expiresAt);
      
      if (now > expiresAt) {
        delete state.value.cache[key];
        return null;
      }
      
      return cached.data;
    },
    
    set(key: string, data: WorkOrderHistoryRow[], expiresIn: number) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expiresIn);
      
      state.value.cache[key] = {
        data,
        timestamp: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      };
    },
    
    invalidate(pattern?: string) {
      if (!pattern) {
        state.value.cache = {};
        return;
      }
      
      Object.keys(state.value.cache).forEach(key => {
        if (key.includes(pattern)) {
          delete state.value.cache[key];
        }
      });
    },
    
    clear() {
      state.value.cache = {};
    }
  };

  // Month-based separation rule
  const separationRule: WorkOrderSeparationRule = {
    currentMonthCutoff: new Date(),
    
    shouldMoveToHistory(completedDate: string): boolean {
      const completed = new Date(completedDate);
      const now = new Date();
      
      // Move to history if completed in previous months
      return completed.getFullYear() < now.getFullYear() || 
             (completed.getFullYear() === now.getFullYear() && completed.getMonth() < now.getMonth());
    },
    
    getHistoryDateRange(months: number) {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - months);
      
      return {
        start: start.toISOString().split('T')[0] || '',
        end: end.toISOString().split('T')[0] || ''
      };
    }
  };

  // Helper functions
  function getDefaultStartDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 6); // Default to 6 months of history
    return date.toISOString().split('T')[0] || '';
  }

  function generateCacheKey(query: WorkOrderHistoryQuery): string {
    return JSON.stringify({
      filters: query.filters,
      search: query.search.query,
      pagination: {
        page: query.pagination.page,
        pageSize: query.pagination.pageSize,
        dateRange: query.pagination.dateRange
      },
      sort: query.sort
    });
  }

  // Computed permissions
  const permissions = computed((): WorkOrderHistoryPermissions => {
    const authStore = useAuthStore();
    const userRole = authStore.currentUser?.role;
    
    if (!userRole || userRole === 'worker') {
      return {
        canViewHistory: false,
        canViewAllTerminals: false,
        canViewDetails: false,
        canExportSummary: false
      };
    }

    return {
      canViewHistory: ['admin', 'supervisor', 'leader'].includes(userRole),
      canViewAllTerminals: userRole === 'admin',
      canViewDetails: true,
      canExportSummary: userRole === 'admin'
    };
  });

  // Actions
  async function fetchHistoryData(options: {
    forceRefresh?: boolean;
    dateRange?: { start: string; end: string };
  } = {}): Promise<void> {
    if (!permissions.value.canViewHistory) {
      throw new Error('Insufficient permissions to view work order history');
    }

    const query: WorkOrderHistoryQuery = {
      filters: state.value.filters,
      search: state.value.search,
      pagination: {
        page: state.value.pagination.page,
        pageSize: state.value.pagination.pageSize,
        dateRange: options.dateRange || state.value.pagination.dateRange
      },
      sort: state.value.sort
    };

    const cacheKey = generateCacheKey(query);
    
    // Check cache first
    if (!options.forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) {
        state.value.rows = cached;
        return;
      }
    }

    state.value.loading = true;
    state.value.error = null;

    try {
      // Get completed work orders from the main work order store
      const workOrderStore = useWorkOrderTableStore();
      const allWorkOrders = workOrderStore.state.rows;
      
      // Generate historical work orders from completed ones
      const historicalData = await generateHistoricalWorkOrders(allWorkOrders, query);
      
      // Apply filters and search
      const filtered = applyFiltersAndSearch(historicalData, query);
      
      // Apply sorting
      const sorted = applySorting(filtered, query.sort);
      
      // Apply pagination
      const paginated = applyPagination(sorted, query.pagination);
      
      state.value.rows = paginated.data;
      state.value.pagination.total = sorted.length;
      state.value.pagination.totalPages = Math.ceil(sorted.length / query.pagination.pageSize);
      state.value.lastUpdated = new Date().toISOString();
      
      // Cache the results for 10 minutes
      cache.set(cacheKey, paginated.data, 10 * 60 * 1000);
      
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to fetch history data';
      console.error('Error fetching work order history:', error);
    } finally {
      state.value.loading = false;
    }
  }

  async function generateHistoricalWorkOrders(
    workOrders: any[], 
    query: WorkOrderHistoryQuery
  ): Promise<WorkOrderHistoryRow[]> {
    // In a real implementation, this would query the database for historical records
    // For now, we'll generate mock historical data based on completed work orders
    
    const mockUsers = [
      { id: 'user1', name: 'Ahmad Sutrisno', role: 'worker' as const },
      { id: 'user2', name: 'Budi Santoso', role: 'worker' as const },
      { id: 'user3', name: 'Citra Dewi', role: 'supervisor' as const }
    ];
    
    const historical: WorkOrderHistoryRow[] = [];
    
    // Generate 200+ historical records for the past 12 months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    
    for (let i = 0; i < 250; i++) {
      const randomDate = new Date(startDate.getTime() + Math.random() * (Date.now() - startDate.getTime()));
      
      // Only include if it should be in history (not current month)
      if (!separationRule.shouldMoveToHistory(randomDate.toISOString())) {
        continue;
      }
      
      // Skip if outside query date range
      if (randomDate < new Date(query.pagination.dateRange.start) || 
          randomDate > new Date(query.pagination.dateRange.end)) {
        continue;
      }
      
      const baseWorkOrder = workOrders[i % workOrders.length];
      if (!baseWorkOrder) continue;
      
      const completedBy = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const estimatedDuration = baseWorkOrder.estimatedDuration || 2;
      const actualDuration = estimatedDuration + (Math.random() - 0.5) * estimatedDuration * 0.4;
      
      historical.push({
        ...baseWorkOrder,
        id: `hist_${i + 1}`,
        code: `WO-HIST-${String(i + 1).padStart(4, '0')}`,
        status: 'completed',
        completedDate: randomDate.toISOString(),
        completedBy,
        completionNotes: Math.random() > 0.7 ? `Completed successfully on ${randomDate.toLocaleDateString()}` : undefined,
        actualDuration: Math.round(actualDuration * 10) / 10,
        isArchived: false,
        lastUpdated: randomDate.toISOString()
      });
    }
    
    return historical;
  }

  function applyFiltersAndSearch(
    data: WorkOrderHistoryRow[], 
    query: WorkOrderHistoryQuery
  ): WorkOrderHistoryRow[] {
    let filtered = [...data];
    
    // Apply search
    if (query.search.query) {
      const searchTerm = query.search.query.toLowerCase();
      filtered = filtered.filter(row => 
        query.search.fields.some(field => {
          const value = getFieldValue(row, field);
          return value.toLowerCase().includes(searchTerm);
        })
      );
    }
    
    // Apply filters
    const filters = query.filters;
    
    if (filters.maintenanceType?.length) {
      filtered = filtered.filter(row => 
        filters.maintenanceType!.includes(row.maintenanceType)
      );
    }
    
    if (filters.priority?.length) {
      filtered = filtered.filter(row => 
        filters.priority!.includes(row.priority)
      );
    }
    
    if (filters.terminalIds?.length) {
      filtered = filtered.filter(row => 
        filters.terminalIds!.includes(row.terminal.id)
      );
    }
    
    if (filters.completedByIds?.length) {
      filtered = filtered.filter(row => 
        filters.completedByIds!.includes(row.completedBy.id)
      );
    }
    
    if (filters.hasNotes !== undefined) {
      filtered = filtered.filter(row => 
        filters.hasNotes ? !!row.completionNotes : !row.completionNotes
      );
    }
    
    if (filters.durationVariance) {
      const { type, threshold } = filters.durationVariance;
      filtered = filtered.filter(row => {
        const variance = ((row.actualDuration - row.estimatedDuration) / row.estimatedDuration) * 100;
        
        switch (type) {
          case 'over':
            return variance > threshold;
          case 'under':
            return variance < -threshold;
          case 'within':
            return Math.abs(variance) <= threshold;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }

  function getFieldValue(row: WorkOrderHistoryRow, field: string): string {
    switch (field) {
      case 'title':
        return row.title;
      case 'code':
        return row.code;
      case 'assignedWorker':
        return row.assignedTo?.name || '';
      case 'completedBy':
        return row.completedBy.name;
      case 'completionNotes':
        return row.completionNotes || '';
      default:
        return '';
    }
  }

  function applySorting(
    data: WorkOrderHistoryRow[], 
    sort: WorkOrderHistorySort
  ): WorkOrderHistoryRow[] {
    return [...data].sort((a, b) => {
      const aVal = a[sort.field];
      const bVal = b[sort.field];
      
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sort.direction === 'asc' ? -1 : 1;
      if (bVal == null) return sort.direction === 'asc' ? 1 : -1;
      
      let comparison = 0;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }

  function applyPagination(
    data: WorkOrderHistoryRow[], 
    pagination: Pick<WorkOrderHistoryPagination, 'page' | 'pageSize'>
  ): { data: WorkOrderHistoryRow[]; total: number } {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    
    return {
      data: data.slice(startIndex, endIndex),
      total: data.length
    };
  }

  // Statistics computation
  const stats = computed((): WorkOrderHistoryStats => {
    const allRows = state.value.rows;
    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const thisYear = now.getFullYear();
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    
    const thisMonthData = allRows.filter(row => {
      const date = new Date(row.completedDate);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });
    
    const lastMonthData = allRows.filter(row => {
      const date = new Date(row.completedDate);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });
    
    const onTimeCount = allRows.filter(row => !row.isOverdue).length;
    const overdueCount = allRows.filter(row => row.isOverdue).length;
    
    return {
      totalCompleted: allRows.length,
      completedThisMonth: thisMonthData.length,
      completedLastMonth: lastMonthData.length,
      averageDuration: allRows.length > 0 ? 
        allRows.reduce((sum, row) => sum + row.actualDuration, 0) / allRows.length : 0,
      onTimeCompletion: allRows.length > 0 ? (onTimeCount / allRows.length) * 100 : 0,
      overdueCompletion: allRows.length > 0 ? (overdueCount / allRows.length) * 100 : 0,
      byMaintenanceType: {
        preventive: allRows.filter(row => row.maintenanceType === 'preventive').length,
        corrective: allRows.filter(row => row.maintenanceType === 'corrective').length
      },
      byPriority: {
        low: allRows.filter(row => row.priority === 'low').length,
        normal: allRows.filter(row => row.priority === 'medium').length,
        high: allRows.filter(row => row.priority === 'high').length,
        urgent: 0 // Assuming no urgent in history for simplicity
      },
      completionTrend: [] // Would be computed from actual data
    };
  });

  // Filter and search actions
  function updateFilters(newFilters: Partial<WorkOrderHistoryFilters>) {
    state.value.filters = { ...state.value.filters, ...newFilters };
    state.value.pagination.page = 1; // Reset to first page
    cache.invalidate(); // Invalidate cache when filters change
  }

  function updateSearch(newSearch: Partial<WorkOrderHistorySearchOptions>) {
    state.value.search = { ...state.value.search, ...newSearch };
    state.value.pagination.page = 1; // Reset to first page
    cache.invalidate(); // Invalidate cache when search changes
  }

  function updateSort(newSort: WorkOrderHistorySort) {
    state.value.sort = newSort;
    cache.invalidate(); // Invalidate cache when sort changes
  }

  function updatePagination(newPagination: Partial<WorkOrderHistoryPagination>) {
    state.value.pagination = { ...state.value.pagination, ...newPagination };
  }

  function clearFilters() {
    state.value.filters = {
      maintenanceType: [],
      priority: [],
      categoryIds: [],
      terminalIds: [],
      assignedWorkerIds: [],
      createdByIds: [],
      completedByIds: [],
      hasTemplate: undefined,
      completedDateRange: undefined,
      durationVariance: undefined,
      hasNotes: undefined
    };
    state.value.search.query = '';
    state.value.pagination.page = 1;
    cache.clear();
  }

  // Computed getters
  const isLoading = computed(() => state.value.loading);
  const hasError = computed(() => !!state.value.error);
  const isEmpty = computed(() => state.value.rows.length === 0 && !state.value.loading);
  const hasFilters = computed(() => {
    const filters = state.value.filters;
    return !!(
      filters.maintenanceType?.length ||
      filters.priority?.length ||
      filters.categoryIds?.length ||
      filters.terminalIds?.length ||
      filters.completedByIds?.length ||
      filters.hasTemplate !== undefined ||
      filters.durationVariance ||
      filters.hasNotes !== undefined ||
      state.value.search.query
    );
  });

  return {
    // State
    state: computed(() => state.value),
    
    // Computed
    permissions,
    stats,
    isLoading,
    hasError,
    isEmpty,
    hasFilters,
    
    // Actions
    fetchHistoryData,
    updateFilters,
    updateSearch,
    updateSort,
    updatePagination,
    clearFilters,
    
    // Utils
    separationRule,
    cache
  };
});