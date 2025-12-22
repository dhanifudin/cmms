// Enterprise-standard URL synchronization for pagination state
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter, useRoute, type LocationQueryRaw } from 'vue-router';
import type { PaginationState, PaginationURLParams } from '@/types/pagination';

export interface UrlPaginationConfig {
  // URL parameter names
  pageParam: string;
  sizeParam: string;
  searchParam: string;
  sortByParam: string;
  sortOrderParam: string;
  
  // Default values
  defaultPageSize: number;
  defaultSortOrder: 'asc' | 'desc';
  
  // Behavior
  updateOnMount: boolean;
  debounceDelay: number;
  preserveOtherParams: boolean;
  
  // Validation
  allowedPageSizes: number[];
  maxPageSize: number;
  
  // Prefix for multi-section pagination
  prefix?: string;
}

export interface UrlPaginationState extends PaginationState {
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const DEFAULT_CONFIG: UrlPaginationConfig = {
  pageParam: 'page',
  sizeParam: 'size',
  searchParam: 'search',
  sortByParam: 'sortBy',
  sortOrderParam: 'sortOrder',
  defaultPageSize: 25,
  defaultSortOrder: 'asc',
  updateOnMount: true,
  debounceDelay: 300,
  preserveOtherParams: true,
  allowedPageSizes: [10, 25, 50, 100],
  maxPageSize: 200
};

export function useUrlPagination(config: Partial<UrlPaginationConfig> = {}) {
  const router = useRouter();
  const route = useRoute();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Create parameter names with optional prefix
  const getParamName = (param: string) => 
    mergedConfig.prefix ? `${mergedConfig.prefix}_${param}` : param;
  
  const pageParam = getParamName(mergedConfig.pageParam);
  const sizeParam = getParamName(mergedConfig.sizeParam);
  const searchParam = getParamName(mergedConfig.searchParam);
  const sortByParam = getParamName(mergedConfig.sortByParam);
  const sortOrderParam = getParamName(mergedConfig.sortOrderParam);
  
  // Validation functions
  const validatePageSize = (size: number): number => {
    if (!mergedConfig.allowedPageSizes.includes(size)) {
      return mergedConfig.defaultPageSize;
    }
    return Math.min(size, mergedConfig.maxPageSize);
  };
  
  const validatePage = (page: number, totalPages: number): number => {
    if (isNaN(page) || page < 1) return 1;
    if (totalPages > 0 && page > totalPages) return totalPages;
    return Math.floor(page);
  };
  
  const validateSortOrder = (order: string): 'asc' | 'desc' => {
    return order === 'desc' ? 'desc' : 'asc';
  };
  
  // Parse URL parameters
  const parseUrlParams = (): Partial<UrlPaginationState> => {
    const query = route.query;
    
    const page = query[pageParam] ? parseInt(query[pageParam] as string, 10) : 1;
    const pageSize = query[sizeParam] ? parseInt(query[sizeParam] as string, 10) : mergedConfig.defaultPageSize;
    const searchQuery = (query[searchParam] as string) || '';
    const sortBy = (query[sortByParam] as string) || '';
    const sortOrder = validateSortOrder((query[sortOrderParam] as string) || mergedConfig.defaultSortOrder);
    
    return {
      currentPage: validatePage(page, 0), // Will be validated again when totalPages is known
      pageSize: validatePageSize(pageSize),
      searchQuery,
      sortBy,
      sortOrder
    };
  };
  
  // Initialize state from URL
  const initialState = parseUrlParams();
  
  // Reactive state
  const paginationState = ref<UrlPaginationState>({
    currentPage: initialState.currentPage || 1,
    pageSize: initialState.pageSize || mergedConfig.defaultPageSize,
    totalItems: 0,
    totalPages: 0,
    searchQuery: initialState.searchQuery || '',
    sortBy: initialState.sortBy || '',
    sortOrder: initialState.sortOrder || mergedConfig.defaultSortOrder
  });
  
  // Computed for URL query object
  const urlQuery = computed((): LocationQueryRaw => {
    const query: LocationQueryRaw = {};
    
    // Preserve existing query parameters if configured
    if (mergedConfig.preserveOtherParams) {
      Object.assign(query, route.query);
    }
    
    // Add pagination parameters only if they differ from defaults
    if (paginationState.value.currentPage !== 1) {
      query[pageParam] = paginationState.value.currentPage.toString();
    }
    
    if (paginationState.value.pageSize !== mergedConfig.defaultPageSize) {
      query[sizeParam] = paginationState.value.pageSize.toString();
    }
    
    if (paginationState.value.searchQuery) {
      query[searchParam] = paginationState.value.searchQuery;
    }
    
    if (paginationState.value.sortBy) {
      query[sortByParam] = paginationState.value.sortBy;
    }
    
    if (paginationState.value.sortOrder !== mergedConfig.defaultSortOrder) {
      query[sortOrderParam] = paginationState.value.sortOrder;
    }
    
    return query;
  });
  
  // Debounced URL update
  let updateTimeoutId: NodeJS.Timeout | null = null;
  
  const updateUrl = async (immediate = false) => {
    if (updateTimeoutId) {
      clearTimeout(updateTimeoutId);
    }
    
    const doUpdate = async () => {
      try {
        await router.replace({
          path: route.path,
          query: urlQuery.value
        });
      } catch (error) {
        console.warn('Failed to update URL:', error);
      }
    };
    
    if (immediate || mergedConfig.debounceDelay === 0) {
      await doUpdate();
    } else {
      updateTimeoutId = setTimeout(doUpdate, mergedConfig.debounceDelay);
    }
  };
  
  // Watch for state changes and update URL
  watch(
    () => [
      paginationState.value.currentPage,
      paginationState.value.pageSize,
      paginationState.value.searchQuery,
      paginationState.value.sortBy,
      paginationState.value.sortOrder
    ],
    () => updateUrl(),
    { deep: true }
  );
  
  // Watch for URL changes and update state
  watch(
    () => route.query,
    (newQuery) => {
      const newState = parseUrlParams();
      
      // Validate page against current totalPages
      const validatedPage = validatePage(
        newState.currentPage || 1,
        paginationState.value.totalPages
      );
      
      // Update state if values have changed
      if (paginationState.value.currentPage !== validatedPage) {
        paginationState.value.currentPage = validatedPage;
      }
      
      if (paginationState.value.pageSize !== (newState.pageSize || mergedConfig.defaultPageSize)) {
        paginationState.value.pageSize = newState.pageSize || mergedConfig.defaultPageSize;
      }
      
      if (paginationState.value.searchQuery !== (newState.searchQuery || '')) {
        paginationState.value.searchQuery = newState.searchQuery || '';
      }
      
      if (paginationState.value.sortBy !== (newState.sortBy || '')) {
        paginationState.value.sortBy = newState.sortBy || '';
      }
      
      if (paginationState.value.sortOrder !== (newState.sortOrder || mergedConfig.defaultSortOrder)) {
        paginationState.value.sortOrder = newState.sortOrder || mergedConfig.defaultSortOrder;
      }
    },
    { immediate: mergedConfig.updateOnMount }
  );
  
  // Actions
  const setPage = (page: number) => {
    const validatedPage = validatePage(page, paginationState.value.totalPages);
    if (paginationState.value.currentPage !== validatedPage) {
      paginationState.value.currentPage = validatedPage;
    }
  };
  
  const setPageSize = (pageSize: number) => {
    const validatedPageSize = validatePageSize(pageSize);
    const currentFirstItem = (paginationState.value.currentPage - 1) * paginationState.value.pageSize;
    
    paginationState.value.pageSize = validatedPageSize;
    
    // Adjust current page to maintain position
    const newPage = Math.floor(currentFirstItem / validatedPageSize) + 1;
    setPage(newPage);
  };
  
  const setSearchQuery = (query: string) => {
    paginationState.value.searchQuery = query;
    // Reset to first page when search changes
    if (paginationState.value.currentPage !== 1) {
      paginationState.value.currentPage = 1;
    }
  };
  
  const setSort = (field: string) => {
    if (paginationState.value.sortBy === field) {
      // Toggle sort order
      paginationState.value.sortOrder = paginationState.value.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // New field, default to ascending
      paginationState.value.sortBy = field;
      paginationState.value.sortOrder = 'asc';
    }
    // Reset to first page when sort changes
    if (paginationState.value.currentPage !== 1) {
      paginationState.value.currentPage = 1;
    }
  };
  
  const updateTotalItems = (totalItems: number) => {
    paginationState.value.totalItems = totalItems;
    paginationState.value.totalPages = Math.ceil(totalItems / paginationState.value.pageSize);
    
    // Validate current page against new total pages
    const validatedPage = validatePage(paginationState.value.currentPage, paginationState.value.totalPages);
    if (paginationState.value.currentPage !== validatedPage) {
      paginationState.value.currentPage = validatedPage;
    }
  };
  
  const resetPagination = () => {
    paginationState.value.currentPage = 1;
    paginationState.value.pageSize = mergedConfig.defaultPageSize;
    paginationState.value.searchQuery = '';
    paginationState.value.sortBy = '';
    paginationState.value.sortOrder = mergedConfig.defaultSortOrder;
  };
  
  // Computed helpers
  const hasNextPage = computed(() => 
    paginationState.value.currentPage < paginationState.value.totalPages
  );
  
  const hasPreviousPage = computed(() => 
    paginationState.value.currentPage > 1
  );
  
  const firstItemIndex = computed(() => 
    (paginationState.value.currentPage - 1) * paginationState.value.pageSize + 1
  );
  
  const lastItemIndex = computed(() => 
    Math.min(
      paginationState.value.currentPage * paginationState.value.pageSize,
      paginationState.value.totalItems
    )
  );
  
  // Navigation methods
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
    setPage(paginationState.value.totalPages);
  };
  
  return {
    // State
    paginationState,
    
    // Computed
    hasNextPage,
    hasPreviousPage,
    firstItemIndex,
    lastItemIndex,
    
    // Actions
    setPage,
    setPageSize,
    setSearchQuery,
    setSort,
    updateTotalItems,
    resetPagination,
    
    // Navigation
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    
    // URL management
    updateUrl
  };
}

// Multi-section URL pagination for complex views like Reports
export function useMultiSectionUrlPagination(sections: Record<string, Partial<UrlPaginationConfig>>) {
  const sectionComposables: Record<string, ReturnType<typeof useUrlPagination>> = {};
  
  for (const [sectionName, config] of Object.entries(sections)) {
    sectionComposables[sectionName] = useUrlPagination({
      ...config,
      prefix: sectionName
    });
  }
  
  return sectionComposables;
}