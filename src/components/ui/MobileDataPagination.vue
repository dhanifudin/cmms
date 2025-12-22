<template>
  <div class="flex flex-col space-y-3 p-4 bg-white border-t border-gray-200">
    <!-- Mobile Compact View -->
    <div v-if="isMobile && !showExpanded" class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <button
          @click="goToPreviousPage"
          :disabled="!hasPreviousPage || loading"
          class="inline-flex items-center p-2 border border-gray-300 rounded-md bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :class="{ 'touch-manipulation': isTouch }"
          data-pagination-prev
        >
          <ChevronLeft class="h-5 w-5" />
          <span class="sr-only">Previous page</span>
        </button>
        
        <span class="text-sm text-gray-700">
          {{ startItem }}-{{ endItem }} of {{ totalItems }}
        </span>
        
        <button
          @click="goToNextPage"
          :disabled="!hasNextPage || loading"
          class="inline-flex items-center p-2 border border-gray-300 rounded-md bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :class="{ 'touch-manipulation': isTouch }"
          data-pagination-next
        >
          <ChevronRight class="h-5 w-5" />
          <span class="sr-only">Next page</span>
        </button>
      </div>
      
      <button
        @click="showExpanded = true"
        class="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
        :class="{ 'touch-manipulation': isTouch }"
      >
        <Settings class="h-4 w-4 mr-1" />
        Options
      </button>
    </div>

    <!-- Mobile Expanded View -->
    <div v-if="isMobile && showExpanded" class="space-y-4">
      <!-- Header with close button -->
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">Pagination Settings</h3>
        <button
          @click="showExpanded = false"
          class="p-2 text-gray-400 hover:text-gray-600"
          :class="{ 'touch-manipulation': isTouch }"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Page Navigation -->
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Current Page
          </label>
          <div class="flex items-center space-x-3">
            <button
              @click="goToPreviousPage"
              :disabled="!hasPreviousPage || loading"
              class="flex-1 inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'touch-manipulation': isTouch }"
            >
              <ChevronLeft class="h-5 w-5 mr-2" />
              Previous
            </button>
            
            <div class="px-4 py-3 bg-blue-50 border border-blue-200 rounded-md text-center min-w-[80px]">
              <div class="text-sm font-medium text-blue-900">
                {{ currentPage }}
              </div>
              <div class="text-xs text-blue-600">
                of {{ totalPages }}
              </div>
            </div>
            
            <button
              @click="goToNextPage"
              :disabled="!hasNextPage || loading"
              class="flex-1 inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'touch-manipulation': isTouch }"
            >
              Next
              <ChevronRight class="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>

        <!-- Quick Jump -->
        <div v-if="showQuickJump && totalPages > 5">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Jump to Page
          </label>
          <div class="flex items-center space-x-2">
            <input
              v-model.number="jumpToPage"
              type="number"
              :min="1"
              :max="totalPages"
              class="flex-1 block w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Page number"
              :class="{ 'touch-manipulation': isTouch }"
            />
            <button
              @click="handleQuickJump"
              :disabled="!isValidJumpPage || loading"
              class="px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'touch-manipulation': isTouch }"
            >
              Go
            </button>
          </div>
        </div>

        <!-- Page Size Selector -->
        <div v-if="showPageSizeSelector">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Items per Page
          </label>
          <select
            :value="pageSize"
            @change="handlePageSizeChange(parseInt(($event.target as HTMLSelectElement).value))"
            class="block w-full px-3 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :class="{ 'touch-manipulation': isTouch }"
          >
            <option v-for="size in availablePageSizes" :key="size" :value="size">
              {{ size }} items
            </option>
          </select>
        </div>

        <!-- Page Info -->
        <div v-if="showPageInfo" class="p-3 bg-gray-50 rounded-md">
          <div class="text-sm text-gray-600">
            <div>Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} items</div>
            <div class="mt-1">Page {{ currentPage }} of {{ totalPages }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex space-x-3">
        <button
          @click="goToFirstPage"
          :disabled="currentPage === 1 || loading"
          class="flex-1 px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{ 'touch-manipulation': isTouch }"
        >
          First
        </button>
        <button
          @click="goToLastPage"
          :disabled="currentPage === totalPages || loading"
          class="flex-1 px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{ 'touch-manipulation': isTouch }"
        >
          Last
        </button>
      </div>
    </div>

    <!-- Tablet View -->
    <div v-if="isTablet" class="flex flex-col space-y-4">
      <!-- Top row: Page info and page size -->
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} items
        </div>
        
        <div v-if="showPageSizeSelector" class="flex items-center space-x-2">
          <label class="text-sm text-gray-700">Show:</label>
          <select
            :value="pageSize"
            @change="handlePageSizeChange(parseInt(($event.target as HTMLSelectElement).value))"
            class="block px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :class="{ 'touch-manipulation': isTouch }"
          >
            <option v-for="size in availablePageSizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
      </div>

      <!-- Bottom row: Navigation -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <button
            @click="goToFirstPage"
            :disabled="currentPage === 1 || loading"
            class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{ 'touch-manipulation': isTouch }"
          >
            <ChevronsLeft class="h-4 w-4" />
          </button>
          
          <button
            @click="goToPreviousPage"
            :disabled="!hasPreviousPage || loading"
            class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{ 'touch-manipulation': isTouch }"
            data-pagination-prev
          >
            <ChevronLeft class="h-4 w-4 mr-1" />
            Previous
          </button>
        </div>

        <!-- Page indicator -->
        <div class="px-4 py-2 bg-gray-100 rounded-md">
          <span class="text-sm font-medium text-gray-900">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <button
            @click="goToNextPage"
            :disabled="!hasNextPage || loading"
            class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{ 'touch-manipulation': isTouch }"
            data-pagination-next
          >
            Next
            <ChevronRight class="h-4 w-4 ml-1" />
          </button>
          
          <button
            @click="goToLastPage"
            :disabled="currentPage === totalPages || loading"
            class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{ 'touch-manipulation': isTouch }"
          >
            <ChevronsRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop View (fallback to original DataPagination) -->
    <div v-if="isDesktop">
      <DataPagination
        :current-page="paginationState.currentPage"
        :total-pages="paginationState.totalPages"
        :total-items="paginationState.totalItems"
        :page-size="paginationState.pageSize"
        :page-sizes="pageSizes"
        :loading="loading"
        :disabled="disabled"
        :show-page-size-selector="showPageSizeSelector"
        :show-page-info="showPageInfo"
        :show-quick-jump="showQuickJump"
        :max-visible-pages="maxVisiblePages"
        :compact="false"
        @page-change="$emit('page-change', $event)"
        @page-size-change="$emit('page-size-change', $event)"
      />
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center"
    >
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  X
} from 'lucide-vue-next';

import DataPagination from './pagination/DataPagination.vue';
import { useResponsive } from '@/composables/useResponsive';
import type { PaginationState } from '@/types/pagination';

interface Props {
  paginationState: PaginationState;
  pageSizes?: number[];
  loading?: boolean;
  disabled?: boolean;
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  showQuickJump?: boolean;
  maxVisiblePages?: number;
}

interface Emits {
  'page-change': [page: number];
  'page-size-change': [pageSize: number];
}

const props = withDefaults(defineProps<Props>(), {
  pageSizes: () => [10, 25, 50, 100],
  loading: false,
  disabled: false,
  showPageSizeSelector: true,
  showPageInfo: true,
  showQuickJump: true,
  maxVisiblePages: 5
});

const emit = defineEmits<Emits>();

// Responsive detection
const { isMobile, isTablet, isDesktop, isTouch } = useResponsive();

// Local state
const showExpanded = ref(false);
const jumpToPage = ref<number>(props.paginationState.currentPage);

// Computed properties
const currentPage = computed(() => props.paginationState.currentPage);
const totalPages = computed(() => props.paginationState.totalPages);
const totalItems = computed(() => props.paginationState.totalItems);
const pageSize = computed(() => props.paginationState.pageSize);

const startItem = computed(() => {
  if (totalItems.value === 0) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});

const endItem = computed(() => {
  const end = currentPage.value * pageSize.value;
  return Math.min(end, totalItems.value);
});

const hasPreviousPage = computed(() => currentPage.value > 1);
const hasNextPage = computed(() => currentPage.value < totalPages.value);

const availablePageSizes = computed(() => {
  // For mobile, suggest smaller page sizes
  if (isMobile.value) {
    return props.pageSizes.filter(size => size <= 25);
  }
  return props.pageSizes;
});

const isValidJumpPage = computed(() => {
  return jumpToPage.value >= 1 && jumpToPage.value <= totalPages.value;
});

// Methods
const goToFirstPage = () => {
  if (currentPage.value !== 1 && !props.loading) {
    emit('page-change', 1);
  }
};

const goToLastPage = () => {
  if (currentPage.value !== totalPages.value && !props.loading) {
    emit('page-change', totalPages.value);
  }
};

const goToPreviousPage = () => {
  if (hasPreviousPage.value && !props.loading) {
    emit('page-change', currentPage.value - 1);
  }
};

const goToNextPage = () => {
  if (hasNextPage.value && !props.loading) {
    emit('page-change', currentPage.value + 1);
  }
};

const handlePageSizeChange = (newPageSize: number) => {
  if (!props.loading && newPageSize !== pageSize.value) {
    emit('page-size-change', newPageSize);
  }
};

const handleQuickJump = () => {
  if (isValidJumpPage.value && !props.loading && jumpToPage.value !== currentPage.value) {
    emit('page-change', jumpToPage.value);
    showExpanded.value = false;
  }
};

// Update jump page when current page changes
import { watch } from 'vue';
watch(() => props.paginationState.currentPage, (newPage) => {
  jumpToPage.value = newPage;
});
</script>

<style scoped>
.touch-manipulation {
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Ensure touch targets are at least 44px */
@media (hover: none) and (pointer: coarse) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
  
  input[type="number"],
  select {
    min-height: 44px;
  }
}

/* Focus styles for accessibility */
button:focus,
input:focus,
select:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>