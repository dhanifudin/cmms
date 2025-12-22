// Core pagination types for CMMS data management components
import type { Ref, ComputedRef } from 'vue';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationOptions {
  pageSizes: number[];
  showPageNumbers?: boolean;
  showQuickJump?: boolean;
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export interface PaginationConfig {
  defaultPageSize: number;
  pageSizes: number[];
  maxVisiblePages: number;
  showFirstLast: boolean;
  showQuickJump: boolean;
  persistPageSize: boolean;
}

export interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizes?: number[];
  loading?: boolean;
  disabled?: boolean;
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  showQuickJump?: boolean;
  maxVisiblePages?: number;
  className?: string;
  compact?: boolean; // For mobile
}

export interface PaginationEmits {
  'page-change': [page: number];
  'page-size-change': [pageSize: number];
  'quick-jump': [page: number];
}

// Store mixin interface for standardized pagination
export interface PaginationStoreMixin<T = any> {
  // State
  paginationState: Ref<PaginationState>;
  isLoading: Ref<boolean>;
  
  // Computed
  paginatedItems: ComputedRef<T[]>;
  totalPages: ComputedRef<number>;
  hasNextPage: ComputedRef<boolean>;
  hasPreviousPage: ComputedRef<boolean>;
  
  // Methods
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  resetPagination: () => void;
  
  // Integration methods
  updateTotalItems: (total: number) => void;
  refreshPagination: () => void;
}

// Specific pagination configurations for different components
export type InventoryPaginationSizes = 25 | 50 | 100;
export type InvoicePaginationSizes = 25 | 50 | 100;
export type TemplatePaginationSizes = 10 | 25 | 50;
export type CategoryPaginationSizes = 20 | 50 | 100;
export type UserPaginationSizes = 20 | 50 | 100;
export type ReportPaginationSizes = 50 | 100 | 200;

export interface ComponentPaginationConfig {
  inventory: {
    defaultPageSize: InventoryPaginationSizes;
    pageSizes: InventoryPaginationSizes[];
  };
  invoices: {
    defaultPageSize: InvoicePaginationSizes;
    pageSizes: InvoicePaginationSizes[];
  };
  templates: {
    defaultPageSize: TemplatePaginationSizes;
    pageSizes: TemplatePaginationSizes[];
  };
  categories: {
    defaultPageSize: CategoryPaginationSizes;
    pageSizes: CategoryPaginationSizes[];
  };
  users: {
    defaultPageSize: UserPaginationSizes;
    pageSizes: UserPaginationSizes[];
  };
  reports: {
    defaultPageSize: ReportPaginationSizes;
    pageSizes: ReportPaginationSizes[];
  };
}

// URL pagination parameters
export interface PaginationURLParams {
  page?: string | number;
  size?: string | number;
  [key: string]: any; // For additional filters
}

// Virtual scrolling types for large datasets
export interface VirtualScrollConfig {
  enabled: boolean;
  itemHeight: number;
  bufferSize: number;
  overscan: number;
}

// Infinite scroll configuration
export interface InfiniteScrollConfig {
  enabled: boolean;
  threshold: number;
  loadMoreThreshold: number;
  hasMore: boolean;
}

// Combined pagination with advanced features
export interface AdvancedPaginationState extends PaginationState {
  virtualScroll?: VirtualScrollConfig;
  infiniteScroll?: InfiniteScrollConfig;
  searchQuery?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Performance monitoring
export interface PaginationPerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  pageTransitionTime: number;
}