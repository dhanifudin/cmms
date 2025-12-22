<template>
  <div class="mobile-pagination flex items-center justify-between px-3 py-2 bg-white border-t border-gray-200">
    <!-- Left: Page info -->
    <div class="flex items-center text-sm text-gray-600">
      <span>{{ currentPage }} of {{ totalPages }}</span>
      <span v-if="showItemCount" class="ml-2 text-xs text-gray-500">
        ({{ totalItems }} items)
      </span>
    </div>

    <!-- Center: Page size selector (if enabled) -->
    <div v-if="showPageSizeSelector" class="flex items-center space-x-2">
      <select
        :value="pageSize"
        @change="handlePageSizeChange"
        :disabled="disabled || loading"
        class="text-xs border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
      >
        <option v-for="size in pageSizes" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
    </div>

    <!-- Right: Navigation -->
    <div class="flex items-center space-x-1">
      <!-- Previous button -->
      <button
        @click="$emit('page-change', currentPage - 1)"
        :disabled="currentPage === 1 || disabled || loading"
        class="inline-flex items-center p-2 text-sm font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          currentPage === 1 || disabled || loading
            ? 'text-gray-300 bg-gray-100'
            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
        ]"
        aria-label="Previous page"
      >
        <ChevronLeft class="h-4 w-4" />
      </button>

      <!-- Quick jump button -->
      <button
        v-if="showQuickJump"
        @click="showJumpModal = true"
        :disabled="disabled || loading"
        class="inline-flex items-center px-2 py-2 text-xs font-medium rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
        aria-label="Jump to page"
      >
        <Hash class="h-3 w-3" />
      </button>

      <!-- Next button -->
      <button
        @click="$emit('page-change', currentPage + 1)"
        :disabled="currentPage === totalPages || disabled || loading"
        class="inline-flex items-center p-2 text-sm font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          currentPage === totalPages || disabled || loading
            ? 'text-gray-300 bg-gray-100'
            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
        ]"
        aria-label="Next page"
      >
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>

    <!-- Quick jump modal -->
    <div
      v-if="showJumpModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="handleModalClick"
    >
      <div
        ref="modalContent"
        class="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
        @click.stop
      >
        <h3 class="text-lg font-medium mb-4">Jump to Page</h3>
        <div class="space-y-4">
          <input
            v-model.number="jumpPage"
            ref="jumpInput"
            type="number"
            min="1"
            :max="totalPages"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter page number"
            @keyup.enter="handleJump"
          />
          <div class="text-sm text-gray-500">
            Enter a page number between 1 and {{ totalPages }}
          </div>
          <div class="flex space-x-3">
            <button
              @click="handleJump"
              :disabled="!isValidJumpPage"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Go
            </button>
            <button
              @click="showJumpModal = false"
              class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue';
import { ChevronLeft, ChevronRight, Hash } from 'lucide-vue-next';

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizes?: number[];
  loading?: boolean;
  disabled?: boolean;
  showPageSizeSelector?: boolean;
  showItemCount?: boolean;
  showQuickJump?: boolean;
}

interface MobilePaginationEmits {
  'page-change': [page: number];
  'page-size-change': [pageSize: number];
  'quick-jump': [page: number];
}

const props = withDefaults(defineProps<MobilePaginationProps>(), {
  pageSizes: () => [25, 50, 100],
  loading: false,
  disabled: false,
  showPageSizeSelector: true,
  showItemCount: false,
  showQuickJump: true
});

const emit = defineEmits<MobilePaginationEmits>();

const showJumpModal = ref(false);
const jumpPage = ref<number>(props.currentPage);
const jumpInput = ref<HTMLInputElement>();
const modalContent = ref<HTMLElement>();

// Update jump page when current page changes
watch(() => props.currentPage, (newPage) => {
  jumpPage.value = newPage;
});

// Auto-focus input when modal opens
watch(showJumpModal, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    jumpInput.value?.focus();
    jumpInput.value?.select();
  }
});

const isValidJumpPage = computed(() => {
  return jumpPage.value >= 1 && jumpPage.value <= props.totalPages;
});

// Event handlers
const handlePageSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const newPageSize = parseInt(target.value);
  emit('page-size-change', newPageSize);
};

const handleJump = () => {
  if (isValidJumpPage.value && jumpPage.value !== props.currentPage) {
    emit('quick-jump', jumpPage.value);
  }
  showJumpModal.value = false;
};

const handleModalClick = (event: Event) => {
  // Close modal if clicking outside the content
  showJumpModal.value = false;
};

// Touch gesture support could be added here
// For swipe left/right to navigate pages
</script>

<style scoped>
.mobile-pagination {
  /* Ensure adequate touch targets */
  min-height: 56px;
  touch-action: manipulation;
}

/* Improve button touch targets */
.mobile-pagination button {
  min-width: 44px;
  min-height: 44px;
  touch-action: manipulation;
}

/* Modal animations */
.mobile-pagination .fixed {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.mobile-pagination .bg-white.rounded-lg {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>