import { computed, ref, watch, type Ref, type ComputedRef } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { 
  PaginationState, 
  PaginationOptions, 
  PaginationStoreMixin,
  PaginationURLParams 
} from '@/types/pagination';

interface UsePaginationOptions extends PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  persistKey?: string; // For localStorage persistence
  urlSync?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

interface UsePaginationReturn<T> {
  // State
  paginationState: Ref<PaginationState>;
  isLoading: Ref<boolean>;
  
  // Computed
  paginatedItems: ComputedRef<T[]>;
  totalPages: ComputedRef<number>;
  hasNextPage: ComputedRef<boolean>;
  hasPreviousPage: ComputedRef<boolean>;
  startIndex: ComputedRef<number>;
  endIndex: ComputedRef<number>;
  
  // Methods
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  resetPagination: () => void;
  updateTotalItems: (total: number) => void;
  refreshPagination: () => void;
}

export function usePagination<T>(
  items: Ref<T[]>,
  options: UsePaginationOptions = { pageSizes: [25, 50, 100] }
): UsePaginationReturn<T> {
  
  const {
    pageSizes = [25, 50, 100],
    initialPage = 1,
    initialPageSize = pageSizes?.[0] || 25,
    persistKey,
    urlSync = false,
    onPageChange,
    onPageSizeChange
  } = options;

  const isLoading = ref(false);
  
  // Initialize pagination state
  const paginationState = ref<PaginationState>({
    currentPage: initialPage,
    pageSize: initialPageSize,
    totalItems: 0,
    totalPages: 0
  });

  // Restore from localStorage if persistence is enabled
  if (persistKey) {
    const saved = localStorage.getItem(`pagination_${persistKey}`);
    if (saved) {
      try {
        const savedState = JSON.parse(saved);
        paginationState.value.pageSize = savedState.pageSize || initialPageSize;
        // Don't restore page number, always start from page 1
      } catch (e) {
        console.warn('Failed to restore pagination state:', e);
      }
    }
  }

  // Computed properties
  const totalPages = computed(() => {
    const total = Math.ceil(paginationState.value.totalItems / paginationState.value.pageSize);
    return Math.max(1, total);
  });

  const hasNextPage = computed(() => 
    paginationState.value.currentPage < totalPages.value
  );

  const hasPreviousPage = computed(() => 
    paginationState.value.currentPage > 1
  );

  const startIndex = computed(() => 
    (paginationState.value.currentPage - 1) * paginationState.value.pageSize
  );

  const endIndex = computed(() => 
    Math.min(startIndex.value + paginationState.value.pageSize, paginationState.value.totalItems)
  );

  const paginatedItems = computed(() => {
    const start = startIndex.value;
    const end = endIndex.value;
    return items.value.slice(start, end);
  });

  // Watch items to update total
  watch(items, (newItems) => {
    updateTotalItems(newItems.length);
  }, { immediate: true });

  // Watch totalPages to ensure current page is valid
  watch(totalPages, (newTotalPages) => {
    if (paginationState.value.currentPage > newTotalPages) {
      setPage(Math.max(1, newTotalPages));
    }
  });

  // Persist pagination state
  const persistState = () => {
    if (persistKey) {
      localStorage.setItem(`pagination_${persistKey}`, JSON.stringify({
        pageSize: paginationState.value.pageSize
      }));
    }
  };

  // Methods
  const setPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages.value));
    if (newPage !== paginationState.value.currentPage) {
      paginationState.value.currentPage = newPage;
      onPageChange?.(newPage);
    }
  };

  const setPageSize = (pageSize: number) => {
    if (pageSizes.includes(pageSize) && pageSize !== paginationState.value.pageSize) {
      // Calculate what the current first item index is
      const currentFirstItem = (paginationState.value.currentPage - 1) * paginationState.value.pageSize;
      
      // Update page size
      paginationState.value.pageSize = pageSize;
      
      // Calculate new page to keep roughly the same position
      const newPage = Math.floor(currentFirstItem / pageSize) + 1;
      setPage(newPage);
      
      persistState();
      onPageSizeChange?.(pageSize);
    }
  };

  const nextPage = () => {
    if (hasNextPage.value) {
      setPage(paginationState.value.currentPage + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage.value) {
      setPage(paginationState.value.currentPage - 1);
    }
  };

  const firstPage = () => {
    setPage(1);
  };

  const lastPage = () => {
    setPage(totalPages.value);
  };

  const resetPagination = () => {
    paginationState.value.currentPage = 1;
    paginationState.value.pageSize = initialPageSize || 25;
    paginationState.value.totalItems = items.value.length;
  };

  const updateTotalItems = (total: number) => {
    paginationState.value.totalItems = total;
    paginationState.value.totalPages = totalPages.value;
  };

  const refreshPagination = () => {
    updateTotalItems(items.value.length);
  };

  return {
    // State
    paginationState,
    isLoading,
    
    // Computed
    paginatedItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    
    // Methods
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    resetPagination,
    updateTotalItems,
    refreshPagination
  };
}

// Specialized composable for URL synchronization
export function usePaginationURL(
  paginationState: Ref<PaginationState>,
  routeName?: string
) {
  const router = useRouter();
  const route = useRoute();
  
  if (!router || !route) {
    console.warn('usePaginationURL requires Vue Router to be available');
    return {
      syncToURL: () => {},
      syncFromURL: () => {}
    };
  }

  const syncToURL = (updateState = true) => {
    if (!routeName || route.name !== routeName) return;
    
    const query = { ...route.query };
    query.page = paginationState.value.currentPage.toString();
    query.size = paginationState.value.pageSize.toString();
    
    router.replace({ query });
  };

  const syncFromURL = () => {
    if (!routeName || route.name !== routeName) return;
    
    const { page, size } = route.query;
    
    if (page && !isNaN(Number(page))) {
      paginationState.value.currentPage = Math.max(1, Number(page));
    }
    
    if (size && !isNaN(Number(size))) {
      paginationState.value.pageSize = Number(size);
    }
  };

  // Sync from URL on mount
  syncFromURL();
  
  // Watch for pagination changes and sync to URL
  watch(
    () => [paginationState.value.currentPage, paginationState.value.pageSize],
    () => syncToURL(),
    { deep: true }
  );

  return {
    syncToURL,
    syncFromURL
  };
}

// Store mixin factory for consistent pagination across stores
export function createPaginationMixin<T>(
  options: UsePaginationOptions = { pageSizes: [25, 50, 100] }
): PaginationStoreMixin<T> {
  const paginationState = ref<PaginationState>({
    currentPage: 1,
    pageSize: options.initialPageSize || options.pageSizes?.[0] || 25,
    totalItems: 0,
    totalPages: 0
  });

  const isLoading = ref(false);

  const paginatedItems = computed(() => {
    // This will be overridden by the actual store implementation
    return [] as T[];
  });

  const totalPages = computed(() => 
    Math.ceil(paginationState.value.totalItems / paginationState.value.pageSize)
  );

  const hasNextPage = computed(() => 
    paginationState.value.currentPage < totalPages.value
  );

  const hasPreviousPage = computed(() => 
    paginationState.value.currentPage > 1
  );

  const setPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages.value));
    paginationState.value.currentPage = newPage;
  };

  const setPageSize = (pageSize: number) => {
    const currentFirstItem = (paginationState.value.currentPage - 1) * paginationState.value.pageSize;
    paginationState.value.pageSize = pageSize;
    const newPage = Math.floor(currentFirstItem / pageSize) + 1;
    setPage(newPage);
  };

  const nextPage = () => {
    if (hasNextPage.value) setPage(paginationState.value.currentPage + 1);
  };

  const previousPage = () => {
    if (hasPreviousPage.value) setPage(paginationState.value.currentPage - 1);
  };

  const firstPage = () => setPage(1);
  const lastPage = () => setPage(totalPages.value);

  const resetPagination = () => {
    paginationState.value.currentPage = 1;
  };

  const updateTotalItems = (total: number) => {
    paginationState.value.totalItems = total;
    paginationState.value.totalPages = totalPages.value;
  };

  const refreshPagination = () => {
    // Override in actual store implementation
  };

  return {
    // State
    paginationState,
    isLoading,
    
    // Computed
    paginatedItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    
    // Methods
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    resetPagination,
    updateTotalItems,
    refreshPagination
  };
}

// Helper function to get pagination configuration for specific components
export function getPaginationConfig(component: string) {
  const configs = {
    inventory: { defaultPageSize: 25, pageSizes: [25, 50, 100] },
    invoices: { defaultPageSize: 25, pageSizes: [25, 50, 100] },
    templates: { defaultPageSize: 10, pageSizes: [10, 25, 50] },
    categories: { defaultPageSize: 20, pageSizes: [20, 50, 100] },
    reports: { defaultPageSize: 50, pageSizes: [50, 100, 200] }
  };
  
  return configs[component as keyof typeof configs] || configs.inventory;
}