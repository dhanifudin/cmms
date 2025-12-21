<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <!-- Results Info -->
    <div class="text-sm text-muted-foreground">
      Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ historyStore.state.pagination.total }} records
      <span class="hidden sm:inline">
        from {{ formatDate(historyStore.state.pagination.dateRange.start) }}
        to {{ formatDate(historyStore.state.pagination.dateRange.end) }}
      </span>
    </div>
    
    <!-- Pagination Controls -->
    <div class="flex items-center space-x-4">
      <!-- Page Size Selector -->
      <div class="flex items-center space-x-2">
        <Label class="text-sm">Show:</Label>
        <Select :value="historyStore.state.pagination.pageSize.toString()" @update:modelValue="updatePageSize">
          <SelectTrigger class="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <!-- Page Navigation -->
      <div class="flex items-center space-x-1">
        <!-- Previous Page -->
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(historyStore.state.pagination.page - 1)"
          :disabled="!canGoPrevious || historyStore.isLoading"
        >
          <ChevronLeft class="h-4 w-4" />
          <span class="hidden sm:inline ml-1">Previous</span>
        </Button>
        
        <!-- Page Numbers -->
        <div class="hidden sm:flex items-center space-x-1">
          <!-- First page -->
          <Button
            v-if="showFirstPage"
            variant="outline"
            size="sm"
            @click="goToPage(1)"
            :disabled="historyStore.isLoading"
          >
            1
          </Button>
          
          <!-- First ellipsis -->
          <span v-if="showFirstEllipsis" class="px-2 text-muted-foreground">...</span>
          
          <!-- Page range -->
          <Button
            v-for="page in visiblePages"
            :key="page"
            :variant="page === historyStore.state.pagination.page ? 'default' : 'outline'"
            size="sm"
            @click="goToPage(page)"
            :disabled="historyStore.isLoading"
            class="w-8"
          >
            {{ page }}
          </Button>
          
          <!-- Last ellipsis -->
          <span v-if="showLastEllipsis" class="px-2 text-muted-foreground">...</span>
          
          <!-- Last page -->
          <Button
            v-if="showLastPage"
            variant="outline"
            size="sm"
            @click="goToPage(totalPages)"
            :disabled="historyStore.isLoading"
          >
            {{ totalPages }}
          </Button>
        </div>
        
        <!-- Mobile page indicator -->
        <div class="sm:hidden flex items-center space-x-2">
          <span class="text-sm text-muted-foreground">
            Page {{ historyStore.state.pagination.page }} of {{ totalPages }}
          </span>
        </div>
        
        <!-- Next Page -->
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(historyStore.state.pagination.page + 1)"
          :disabled="!canGoNext || historyStore.isLoading"
        >
          <span class="hidden sm:inline mr-1">Next</span>
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
      
      <!-- Jump to Page (Desktop only) -->
      <div class="hidden lg:flex items-center space-x-2">
        <Label class="text-sm">Go to:</Label>
        <Input
          type="number"
          min="1"
          :max="totalPages"
          v-model.number="jumpToPageValue"
          @keyup.enter="jumpToPage"
          class="w-16 h-8"
          :disabled="historyStore.isLoading"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useWorkOrderHistoryStore } from '@/stores/work-order-history';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

// Store
const historyStore = useWorkOrderHistoryStore();

// Local state
const jumpToPageValue = ref(historyStore.state.pagination.page);

// Computed
const totalPages = computed(() => historyStore.state.pagination.totalPages);
const currentPage = computed(() => historyStore.state.pagination.page);
const pageSize = computed(() => historyStore.state.pagination.pageSize);

const startIndex = computed(() => 
  (currentPage.value - 1) * pageSize.value
);

const endIndex = computed(() => 
  Math.min(startIndex.value + pageSize.value, historyStore.state.pagination.total)
);

const canGoPrevious = computed(() => currentPage.value > 1);
const canGoNext = computed(() => currentPage.value < totalPages.value);

// Visible pages calculation (for pagination buttons)
const visiblePages = computed(() => {
  const current = currentPage.value;
  const total = totalPages.value;
  const delta = 2; // Number of pages to show on each side of current
  
  let start = Math.max(1, current - delta);
  let end = Math.min(total, current + delta);
  
  // Adjust start if we're near the end
  if (end - start < delta * 2) {
    start = Math.max(1, end - delta * 2);
  }
  
  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

const showFirstPage = computed(() => {
  const firstVisible = visiblePages.value[0];
  return firstVisible && firstVisible > 1;
});

const showLastPage = computed(() => {
  const lastVisible = visiblePages.value[visiblePages.value.length - 1];
  return lastVisible && lastVisible < totalPages.value;
});

const showFirstEllipsis = computed(() => {
  const firstVisible = visiblePages.value[0];
  return firstVisible && firstVisible > 2;
});

const showLastEllipsis = computed(() => {
  const lastVisible = visiblePages.value[visiblePages.value.length - 1];
  return lastVisible && lastVisible < totalPages.value - 1;
});

// Methods
const goToPage = async (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) {
    return;
  }
  
  historyStore.updatePagination({ page });
  await historyStore.fetchHistoryData();
  
  // Update jump to page value
  jumpToPageValue.value = page;
};

const jumpToPage = () => {
  const page = jumpToPageValue.value;
  if (page >= 1 && page <= totalPages.value) {
    goToPage(page);
  } else {
    // Reset to current page if invalid
    jumpToPageValue.value = currentPage.value;
  }
};

const updatePageSize = async (value: any) => {
  const newPageSize = parseInt(String(value)) as 25 | 50 | 100;
  
  // Calculate what the new page should be to show similar records
  const currentFirstRecord = startIndex.value;
  const newPage = Math.floor(currentFirstRecord / newPageSize) + 1;
  
  historyStore.updatePagination({
    pageSize: newPageSize,
    page: newPage
  });
  
  await historyStore.fetchHistoryData();
  
  // Update jump to page value
  jumpToPageValue.value = newPage;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Watch for page changes to update jump input
watch(currentPage, (newPage) => {
  jumpToPageValue.value = newPage;
});
</script>