<template>
  <div 
    :class="[
      'data-pagination',
      'flex items-center justify-between',
      'px-4 py-3 bg-white border-t border-gray-200',
      compact ? 'px-2 py-2' : 'px-4 py-3',
      className
    ]"
  >
    <!-- Left side: Page info and page size selector -->
    <div class="flex flex-1 items-center justify-between">
      <div v-if="showPageInfo" class="flex items-center text-sm text-gray-700">
        <span>
          Showing {{ startItem }} to {{ endItem }} of {{ totalItems.toLocaleString() }} results
        </span>
      </div>
      
      <div v-if="showPageSizeSelector" class="flex items-center space-x-2">
        <label class="text-sm text-gray-600">Show:</label>
        <select
          :value="pageSize"
          @change="handlePageSizeChange"
          :disabled="disabled || loading"
          class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          <option v-for="size in pageSizes" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
        <span class="text-sm text-gray-600">per page</span>
      </div>
    </div>

    <!-- Right side: Navigation controls -->
    <div class="flex items-center space-x-1 ml-4">
      <!-- Quick jump input (desktop only) -->
      <div v-if="showQuickJump && !compact" class="flex items-center space-x-2 mr-4">
        <label class="text-sm text-gray-600">Go to:</label>
        <input
          v-model.number="quickJumpPage"
          @keyup.enter="handleQuickJump"
          @blur="handleQuickJump"
          type="number"
          min="1"
          :max="totalPages"
          :disabled="disabled || loading"
          class="w-16 text-sm border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          placeholder="Page"
        />
      </div>

      <!-- Navigation buttons -->
      <div class="flex items-center space-x-1">
        <!-- First page -->
        <button
          v-if="!compact"
          @click="$emit('page-change', 1)"
          :disabled="currentPage === 1 || disabled || loading"
          class="inline-flex items-center px-2 py-1 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="[
            currentPage === 1 || disabled || loading
              ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
              : 'text-gray-700 bg-white border border-gray-300'
          ]"
          title="First page"
        >
          <ChevronsLeft class="h-4 w-4" />
        </button>

        <!-- Previous page -->
        <button
          @click="$emit('page-change', currentPage - 1)"
          :disabled="currentPage === 1 || disabled || loading"
          class="inline-flex items-center px-2 py-1 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="[
            currentPage === 1 || disabled || loading
              ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
              : 'text-gray-700 bg-white border border-gray-300'
          ]"
          title="Previous page"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>

        <!-- Page numbers (desktop only) -->
        <div v-if="!compact" class="flex items-center space-x-1">
          <template v-for="page in visiblePages" :key="page">
            <button
              v-if="typeof page === 'number'"
              @click="$emit('page-change', page)"
              :disabled="disabled || loading"
              class="inline-flex items-center px-3 py-1 text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="[
                page === currentPage
                  ? 'text-white bg-primary border border-primary'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
            <span v-else class="inline-flex items-center px-2 py-1 text-sm text-gray-500">
              ...
            </span>
          </template>
        </div>

        <!-- Page info for mobile -->
        <div v-if="compact" class="flex items-center px-2 text-sm text-gray-600">
          {{ currentPage }} / {{ totalPages }}
        </div>

        <!-- Next page -->
        <button
          @click="$emit('page-change', currentPage + 1)"
          :disabled="currentPage === totalPages || disabled || loading"
          class="inline-flex items-center px-2 py-1 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="[
            currentPage === totalPages || disabled || loading
              ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
              : 'text-gray-700 bg-white border border-gray-300'
          ]"
          title="Next page"
        >
          <ChevronRight class="h-4 w-4" />
        </button>

        <!-- Last page -->
        <button
          v-if="!compact"
          @click="$emit('page-change', totalPages)"
          :disabled="currentPage === totalPages || disabled || loading"
          class="inline-flex items-center px-2 py-1 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="[
            currentPage === totalPages || disabled || loading
              ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
              : 'text-gray-700 bg-white border border-gray-300'
          ]"
          title="Last page"
        >
          <ChevronsRight class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-vue-next';
import type { DataPaginationProps, PaginationEmits } from '@/types/pagination';

const props = withDefaults(defineProps<DataPaginationProps>(), {
  pageSizes: () => [25, 50, 100],
  loading: false,
  disabled: false,
  showPageSizeSelector: true,
  showPageInfo: true,
  showQuickJump: false,
  maxVisiblePages: 7,
  className: '',
  compact: false
});

const emit = defineEmits<PaginationEmits>();

const quickJumpPage = ref<number>(props.currentPage);

// Update quick jump when current page changes
watch(() => props.currentPage, (newPage) => {
  quickJumpPage.value = newPage;
});

// Computed properties
const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const endItem = computed(() => {
  const end = props.currentPage * props.pageSize;
  return Math.min(end, props.totalItems);
});

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const { currentPage, totalPages, maxVisiblePages } = props;
  
  if (totalPages <= maxVisiblePages) {
    // Show all pages if total is within limit
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Calculate visible page range
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
  }
  
  return pages;
});

// Event handlers
const handlePageSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newPageSize = parseInt(target.value);
  emit('page-size-change', newPageSize);
};

const handleQuickJump = () => {
  const page = quickJumpPage.value;
  if (page && page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('quick-jump', page);
  } else {
    // Reset to current page if invalid
    quickJumpPage.value = props.currentPage;
  }
};
</script>

<style scoped>
.data-pagination {
  /* Ensure the component is accessible */
  min-height: 48px;
}

/* Focus styles for better accessibility */
.data-pagination button:focus,
.data-pagination select:focus,
.data-pagination input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Loading state animation */
.data-pagination button:disabled {
  pointer-events: none;
}
</style>