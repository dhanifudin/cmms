// Export pagination components
export { default as DataPagination } from './DataPagination.vue';
export { default as MobilePagination } from './MobilePagination.vue';

// Export pagination composables
export { 
  usePagination, 
  usePaginationURL, 
  createPaginationMixin,
  getPaginationConfig 
} from '@/composables/usePagination';

// Export pagination types
export type * from '@/types/pagination';

// Export pagination configuration
export {
  PAGINATION_CONFIGS,
  PAGINATION_DEFAULTS,
  PAGINATION_THRESHOLDS,
  PAGINATION_BREAKPOINTS,
  PAGINATION_TIMING,
  PAGINATION_A11Y,
  PAGINATION_URL_PARAMS,
  getPaginationConfig as getConfigForComponent,
  shouldUseVirtualScroll,
  shouldUseInfiniteScroll,
  shouldUseCompactMode
} from '@/config/pagination';