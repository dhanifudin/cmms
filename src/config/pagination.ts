import type { ComponentPaginationConfig } from '@/types/pagination';

// Default pagination configurations for different components
export const PAGINATION_CONFIGS: ComponentPaginationConfig = {
  inventory: {
    defaultPageSize: 25,
    pageSizes: [25, 50, 100]
  },
  invoices: {
    defaultPageSize: 25,
    pageSizes: [25, 50, 100]
  },
  templates: {
    defaultPageSize: 10,
    pageSizes: [10, 25, 50]
  },
  categories: {
    defaultPageSize: 20,
    pageSizes: [20, 50, 100]
  },
  users: {
    defaultPageSize: 20,
    pageSizes: [20, 50, 100]
  },
  reports: {
    defaultPageSize: 50,
    pageSizes: [50, 100, 200]
  }
};

// Global pagination settings
export const PAGINATION_DEFAULTS = {
  maxVisiblePages: 7,
  showQuickJump: true,
  showPageInfo: true,
  showPageSizeSelector: true,
  persistPageSize: true,
  compactBreakpoint: 768, // px - switch to compact mode below this width
};

// Performance thresholds
export const PAGINATION_THRESHOLDS = {
  virtualScrollThreshold: 1000, // Enable virtual scrolling above this many items
  infiniteScrollThreshold: 500,  // Enable infinite scroll above this many items
  performanceWarningThreshold: 2000, // Warn if pagination is slow above this many items
};

// Responsive breakpoints for pagination UI
export const PAGINATION_BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

// Animation and timing settings
export const PAGINATION_TIMING = {
  pageTransitionDelay: 100, // ms
  loadingDebounce: 300, // ms
  autoRefreshInterval: 30000, // ms for live data
};

// Accessibility settings
export const PAGINATION_A11Y = {
  ariaLabels: {
    firstPage: 'Go to first page',
    previousPage: 'Go to previous page',
    nextPage: 'Go to next page',
    lastPage: 'Go to last page',
    pageOf: 'Page {current} of {total}',
    pageSizeSelector: 'Number of items per page',
    quickJump: 'Jump to specific page'
  },
  keyboardShortcuts: {
    firstPage: ['Home'],
    previousPage: ['ArrowLeft', 'PageUp'],
    nextPage: ['ArrowRight', 'PageDown'],
    lastPage: ['End'],
    quickJump: ['g'], // Gmail-style quick jump
  }
};

// URL parameter names for pagination
export const PAGINATION_URL_PARAMS = {
  page: 'page',
  pageSize: 'size',
  search: 'search',
  sort: 'sort',
  filter: 'filter'
};

// Helper function to get configuration for specific component
export function getPaginationConfig(componentName: keyof ComponentPaginationConfig) {
  return PAGINATION_CONFIGS[componentName] || PAGINATION_CONFIGS.inventory;
}

// Helper function to determine if virtual scrolling should be enabled
export function shouldUseVirtualScroll(itemCount: number): boolean {
  return itemCount > PAGINATION_THRESHOLDS.virtualScrollThreshold;
}

// Helper function to determine if infinite scroll should be enabled
export function shouldUseInfiniteScroll(itemCount: number): boolean {
  return itemCount > PAGINATION_THRESHOLDS.infiniteScrollThreshold;
}

// Helper function to check if we should use compact mode
export function shouldUseCompactMode(windowWidth: number): boolean {
  return windowWidth < PAGINATION_DEFAULTS.compactBreakpoint;
}