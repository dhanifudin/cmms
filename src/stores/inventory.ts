import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { InventoryItem, StockMovement, MaterialRequirement } from '@/types';
import type { PaginationState, InventoryPaginationSizes } from '@/types/pagination';
import { getPaginationConfig } from '@/config/pagination';
import { useAuthStore } from './auth';

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<InventoryItem[]>([]);
  const movements = ref<StockMovement[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  // Pagination state
  const paginationConfig = getPaginationConfig('inventory');
  const paginationState = ref<PaginationState>({
    currentPage: 1,
    pageSize: paginationConfig.defaultPageSize,
    totalItems: 0,
    totalPages: 0
  });

  // Search and filter state
  const searchQuery = ref('');
  const categoryFilter = ref<string>('');
  const statusFilter = ref<'all' | 'active' | 'low_stock' | 'out_of_stock'>('all');
  const sortBy = ref<'name' | 'category' | 'stock' | 'value'>('name');
  const sortOrder = ref<'asc' | 'desc'>('asc');

  // Terminal-based filtering helper
  const getFilteredInventory = computed(() => {
    if (!authStore.currentUser) return [];

    // Workers: Only see inventory from their terminal (read-only)
    if (authStore.isWorker && authStore.currentUser.terminalId) {
      return items.value.filter(item => 
        item.terminalId === authStore.currentUser?.terminalId
      );
    }

    // Admins: Only see inventory from their terminal (full CRUD)
    if (authStore.isAdmin && authStore.currentUser?.terminalId) {
      return items.value.filter(item => 
        item.terminalId === authStore.currentUser?.terminalId
      );
    }

    // Supervisors: See inventory from all terminals in their region
    if (authStore.isSupervisor && authStore.currentUser?.regionId) {
      return items.value.filter(item => 
        item.regionId === authStore.currentUser?.regionId
      );
    }

    // Leaders: Regional access (TBD scope - for now same as supervisor)
    if (authStore.isLeader && authStore.currentUser?.regionId) {
      return items.value.filter(item => 
        item.regionId === authStore.currentUser?.regionId
      );
    }

    // Fallback: no access
    return [];
  });

  // Search and filter computed properties
  const filteredAndSearchedItems = computed(() => {
    let items = getFilteredInventory.value;

    // Apply search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.trim().toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.supplier && item.supplier.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (categoryFilter.value) {
      items = items.filter(item => item.category === categoryFilter.value);
    }

    // Apply status filter
    switch (statusFilter.value) {
      case 'active':
        items = items.filter(item => item.status === 'active');
        break;
      case 'low_stock':
        items = items.filter(item => item.currentStock <= item.minThreshold && item.status === 'active');
        break;
      case 'out_of_stock':
        items = items.filter(item => item.currentStock === 0);
        break;
      // 'all' case - no additional filtering
    }

    // Apply sorting
    items.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy.value) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'stock':
          aValue = a.currentStock;
          bValue = b.currentStock;
          break;
        case 'value':
          aValue = a.currentStock * a.unitPrice;
          bValue = b.currentStock * b.unitPrice;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });

    // Update pagination total
    paginationState.value.totalItems = items.length;
    paginationState.value.totalPages = Math.ceil(items.length / paginationState.value.pageSize);
    
    // Ensure current page is valid
    if (paginationState.value.currentPage > paginationState.value.totalPages && paginationState.value.totalPages > 0) {
      paginationState.value.currentPage = paginationState.value.totalPages;
    }

    return items;
  });

  // Paginated items
  const paginatedItems = computed(() => {
    const startIndex = (paginationState.value.currentPage - 1) * paginationState.value.pageSize;
    const endIndex = startIndex + paginationState.value.pageSize;
    return filteredAndSearchedItems.value.slice(startIndex, endIndex);
  });

  // Computed getters based on filtered data (preserve existing computed properties)
  const lowStockItems = computed(() => 
    getFilteredInventory.value.filter(item => 
      item.currentStock <= item.minThreshold && item.status === 'active'
    )
  );

  const activeItems = computed(() => 
    getFilteredInventory.value.filter(item => item.status === 'active')
  );

  const itemsByCategory = computed(() => {
    const categories: Record<string, InventoryItem[]> = {};
    getFilteredInventory.value.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category]!.push(item);
    });
    return categories;
  });

  const totalValue = computed(() => 
    getFilteredInventory.value.reduce((total, item) => total + (item.currentStock * item.unitPrice), 0)
  );

  // Available categories for filter dropdown
  const availableCategories = computed(() => {
    const categories = new Set<string>();
    getFilteredInventory.value.forEach(item => categories.add(item.category));
    return Array.from(categories).sort();
  });

  // Actions
  const fetchInventoryItems = async () => {
    // Allow basic inventory viewing for all authenticated users
    // Individual operations will check specific permissions as needed
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data will be loaded from mock service
      const mockItems = await import('@/mock/inventory').then(m => m.mockInventoryItems);
      items.value = mockItems;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch inventory items';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchStockMovements = async () => {
    if (!authStore.hasPermission('manage_inventory')) {
      throw new Error('Insufficient permissions');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data will be loaded from mock service
      const mockMovements = await import('@/mock/inventory').then(m => m.mockStockMovements);
      movements.value = mockMovements;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch stock movements';
    } finally {
      isLoading.value = false;
    }
  };

  const createInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    if (!authStore.hasPermission('manage_inventory')) {
      throw new Error('Insufficient permissions');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newItem: InventoryItem = {
        ...itemData,
        id: `item_${Date.now()}`,
        lastUpdated: new Date().toISOString()
      };

      items.value.push(newItem);
      return newItem;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create inventory item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateStock = async (itemId: string, quantity: number, type: 'inbound' | 'outbound' | 'adjustment', reference?: string, notes?: string) => {
    if (!authStore.hasPermission('manage_inventory')) {
      throw new Error('Insufficient permissions');
    }

    const item = items.value.find(i => i.id === itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update stock based on movement type
      if (type === 'inbound') {
        item.currentStock += quantity;
      } else if (type === 'outbound') {
        if (item.currentStock < quantity) {
          throw new Error('Insufficient stock');
        }
        item.currentStock -= quantity;
      } else if (type === 'adjustment') {
        item.currentStock = quantity;
      }

      item.lastUpdated = new Date().toISOString();

      // Create stock movement record
      const movement: StockMovement = {
        id: `movement_${Date.now()}`,
        itemId,
        type,
        quantity,
        reason: notes || `Stock ${type}`,
        performedBy: authStore.currentUser?.id || '',
        timestamp: new Date().toISOString(),
        reference,
        notes,
        createdBy: authStore.currentUser?.id || '',
        createdAt: new Date().toISOString()
      };

      movements.value.push(movement);

      return { item, movement };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update stock';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const consumeMaterials = async (materials: MaterialRequirement[], workOrderId: string) => {
    if (!authStore.currentUser) {
      throw new Error('User not authenticated');
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const results: { item: InventoryItem; movement: StockMovement }[] = [];

      for (const material of materials) {
        if (material.actualQuantity && material.actualQuantity > 0) {
          const result = await updateStock(
            material.itemId,
            material.actualQuantity,
            'outbound',
            workOrderId,
            `Consumed for work order: ${workOrderId}`
          );
          results.push(result);
        }
      }

      return results;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to consume materials';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getItemById = (id: string) => {
    return items.value.find(item => item.id === id);
  };

  const getItemsByCategory = (category: string) => {
    return items.value.filter(item => item.category === category && item.status === 'active');
  };

  const searchItems = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return items.value.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.code.toLowerCase().includes(lowercaseQuery) ||
      item.description?.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getMovementsByItem = (itemId: string) => {
    return movements.value.filter(movement => movement.itemId === itemId);
  };

  const checkLowStock = () => {
    return lowStockItems.value.length > 0 ? lowStockItems.value : null;
  };

  // Pagination methods
  const setPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, paginationState.value.totalPages));
    paginationState.value.currentPage = newPage;
  };

  const setPageSize = (pageSize: InventoryPaginationSizes) => {
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

  // Search and filter methods
  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
    resetPagination(); // Reset to first page when search changes
  };

  const setCategoryFilter = (category: string) => {
    categoryFilter.value = category;
    resetPagination();
  };

  const setStatusFilter = (status: 'all' | 'active' | 'low_stock' | 'out_of_stock') => {
    statusFilter.value = status;
    resetPagination();
  };

  const setSorting = (by: 'name' | 'category' | 'stock' | 'value', order: 'asc' | 'desc') => {
    sortBy.value = by;
    sortOrder.value = order;
    resetPagination();
  };

  const clearFilters = () => {
    searchQuery.value = '';
    categoryFilter.value = '';
    statusFilter.value = 'all';
    sortBy.value = 'name';
    sortOrder.value = 'asc';
    resetPagination();
  };

  return {
    // Original properties
    items,
    movements,
    isLoading,
    error,
    lowStockItems,
    activeItems,
    itemsByCategory,
    totalValue,
    
    // New pagination and filtering properties
    paginationState: readonly(paginationState),
    paginatedItems,
    filteredAndSearchedItems,
    availableCategories,
    searchQuery: readonly(searchQuery),
    categoryFilter: readonly(categoryFilter),
    statusFilter: readonly(statusFilter),
    sortBy: readonly(sortBy),
    sortOrder: readonly(sortOrder),
    
    // Original actions
    fetchInventoryItems,
    fetchStockMovements,
    createInventoryItem,
    updateStock,
    consumeMaterials,
    getItemById,
    getItemsByCategory,
    searchItems,
    getMovementsByItem,
    checkLowStock,
    
    // New pagination actions
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    resetPagination,
    
    // New filter actions
    setSearchQuery,
    setCategoryFilter,
    setStatusFilter,
    setSorting,
    clearFilters
  };
});
