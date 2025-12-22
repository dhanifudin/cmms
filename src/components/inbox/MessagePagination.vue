<template>
  <div class="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
    <!-- Gaming-style pagination info -->
    <div class="flex flex-1 items-center justify-between">
      <div class="flex items-center text-sm text-gray-700">
        <span>
          Page {{ currentPage }} of {{ totalPages }} 
          <span class="text-gray-500">• {{ totalMessages }} total notifications</span>
        </span>
      </div>
      
      <div class="flex items-center space-x-4">
        <!-- Page size selector -->
        <div class="flex items-center space-x-2">
          <label class="text-sm text-gray-600">Show:</label>
          <select
            :value="pageSize"
            @change="handlePageSizeChange"
            class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span class="text-sm text-gray-600">per page</span>
        </div>
        
        <!-- Navigation buttons -->
        <div class="flex items-center space-x-1">
          <!-- Previous page -->
          <button
            @click="goToPreviousPage"
            :disabled="currentPage === 1"
            class="inline-flex items-center px-2 py-1 text-sm font-medium rounded transition-colors"
            :class="[
              currentPage === 1
                ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            ]"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </button>
          
          <!-- Page numbers -->
          <div class="flex items-center space-x-1">
            <template v-for="page in visiblePages" :key="page">
              <button
                v-if="typeof page === 'number'"
                @click="goToPage(page)"
                class="inline-flex items-center px-2 py-1 text-sm font-medium rounded transition-colors"
                :class="[
                  page === currentPage
                    ? 'text-blue-700 bg-blue-100 border border-blue-300'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <span
                v-else
                class="px-1 py-1 text-sm text-gray-500"
              >
                ...
              </span>
            </template>
          </div>
          
          <!-- Next page -->
          <button
            @click="goToNextPage"
            :disabled="currentPage === totalPages"
            class="inline-flex items-center px-2 py-1 text-sm font-medium rounded transition-colors"
            :class="[
              currentPage === totalPages
                ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            ]"
          >
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Mobile pagination -->
  <div class="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 sm:hidden">
    <div class="flex items-center text-sm text-gray-700">
      <span>{{ currentPage }} / {{ totalPages }}</span>
    </div>
    
    <div class="flex items-center space-x-2">
      <button
        @click="goToPreviousPage"
        :disabled="currentPage === 1"
        class="inline-flex items-center px-3 py-1 text-sm rounded-md"
        :class="[
          currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-blue-600 hover:text-blue-800'
        ]"
      >
        <ChevronLeftIcon class="h-4 w-4" />
      </button>
      
      <span class="text-sm text-gray-500">
        {{ totalMessages }} notifications
      </span>
      
      <button
        @click="goToNextPage"
        :disabled="currentPage === totalPages"
        class="inline-flex items-center px-3 py-1 text-sm rounded-md"
        :class="[
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-blue-600 hover:text-blue-800'
        ]"
      >
        <ChevronRightIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-vue-next';

interface Props {
  currentPage: number;
  totalPages: number;
  totalMessages: number;
  pageSize: 25 | 50 | 100;
}

interface Emits {
  pageChange: [page: number];
  pageSizeChange: [pageSize: 25 | 50 | 100];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Calculate visible page numbers for pagination
const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const { currentPage, totalPages } = props;
  
  if (totalPages <= 7) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show smart pagination with ellipsis
    if (currentPage <= 4) {
      // Show first 5 pages, ellipsis, last page
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      if (totalPages > 6) {
        pages.push('...');
        pages.push(totalPages);
      }
    } else if (currentPage >= totalPages - 3) {
      // Show first page, ellipsis, last 5 pages
      pages.push(1);
      if (totalPages > 6) {
        pages.push('...');
      }
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, ellipsis, current-1, current, current+1, ellipsis, last
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }
  }
  
  return pages;
});

// Event handlers
const goToPage = (page: number) => {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
    emit('pageChange', page);
  }
};

const goToPreviousPage = () => {
  if (props.currentPage > 1) {
    emit('pageChange', props.currentPage - 1);
  }
};

const goToNextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('pageChange', props.currentPage + 1);
  }
};

const handlePageSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newPageSize = parseInt(target.value) as 25 | 50 | 100;
  emit('pageSizeChange', newPageSize);
};
</script>

<style scoped>
/* Gaming-style enhancements */
button:hover:not(:disabled) {
  transform: translateY(-1px);
  transition: transform 0.1s ease;
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* Responsive design */
@media (max-width: 640px) {
  .hidden {
    display: none !important;
  }
  
  .sm\\:hidden {
    display: block !important;
  }
}

@media (min-width: 640px) {
  .sm\\:hidden {
    display: none !important;
  }
}
</style>