<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Enterprise Data Management Demo</h1>
        <p class="mt-1 text-sm text-gray-600">
          Comprehensive pagination, bulk operations, keyboard navigation, and export features
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center space-x-3">
        <button
          @click="showKeyboardHelp = true"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Keyboard class="h-4 w-4 mr-2" />
          Shortcuts
        </button>
        <button
          @click="showExportModal = true"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download class="h-4 w-4 mr-2" />
          Export
        </button>
      </div>
    </div>

    <!-- Features Demo Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Link class="h-6 w-6 text-blue-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">URL Sync</p>
            <p class="text-lg font-semibold text-gray-900">Active</p>
            <p class="text-xs text-gray-500">State persisted in URL</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <CheckSquare class="h-6 w-6 text-green-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Selection</p>
            <p class="text-lg font-semibold text-gray-900">{{ bulkOperations.selectionCount }}</p>
            <p class="text-xs text-gray-500">{{ bulkOperations.selectionCount === 'all' ? 'All selected' : 'items selected' }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <Keyboard class="h-6 w-6 text-purple-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Navigation</p>
            <p class="text-lg font-semibold text-gray-900">Enabled</p>
            <p class="text-xs text-gray-500">Keyboard accessible</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <FileText class="h-6 w-6 text-orange-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Export</p>
            <p class="text-lg font-semibold text-gray-900">{{ exportComposable.formats.length }}</p>
            <p class="text-xs text-gray-500">formats available</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Operations Bar -->
    <BulkOperationsBar
      v-if="bulkOperations.selectionCount > 0"
      :selected-count="bulkOperations.selectionCount"
      :is-all-selected="bulkOperations.isAllSelected"
      :is-partial-selection="bulkOperations.isPartialSelection"
      :is-all-selected-across-pages="bulkOperations.allSelectedAcrossPages"
      :operations="bulkOperations.availableOperations"
      :is-operation-in-progress="bulkOperations.isOperationInProgress"
      :current-operation="bulkOperations.currentOperation"
      :allow-select-all="true"
      :allow-select-across-pages="true"
      :selection-error="bulkOperations.selectionError"
      @select-all="bulkOperations.selectAll"
      @select-all-across-pages="bulkOperations.selectAllAcrossPages"
      @clear-selection="bulkOperations.deselectAll"
      @execute-operation="bulkOperations.executeOperation"
    />

    <!-- Filters and Search -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Category</label>
          <select 
            :value="categoryFilter" 
            @change="setCategoryFilter(($event.target as HTMLSelectElement).value)"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select 
            :value="statusFilter" 
            @change="setStatusFilter(($event.target as HTMLSelectElement).value)"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Search</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              :value="urlPagination.paginationState.searchQuery"
              @input="urlPagination.setSearchQuery(($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="Search items..."
              class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      <!-- Filter Summary -->
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div class="text-sm text-gray-600">
          Showing {{ paginatedData.length }} of {{ urlPagination.paginationState.totalItems }} items
          <span v-if="hasActiveFilters" class="text-blue-600 ml-1">(filtered)</span>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="overflow-x-auto" data-pagination>
        <table 
          class="min-w-full divide-y divide-gray-200" 
          role="table"
          aria-label="Data table with enterprise features"
          tabindex="0"
        >
          <thead class="bg-gray-50">
            <tr role="row">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  :checked="bulkOperations.isAllSelected"
                  :indeterminate="bulkOperations.isPartialSelection"
                  @change="bulkOperations.toggleSelectAll"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th 
                @click="urlPagination.setSort('name')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                :class="getSortHeaderClass('name')"
                role="columnheader"
                tabindex="0"
                @keydown.enter="urlPagination.setSort('name')"
                @keydown.space.prevent="urlPagination.setSort('name')"
              >
                <div class="flex items-center space-x-1">
                  <span>Name</span>
                  <ArrowUpDown class="h-4 w-4" />
                </div>
              </th>
              <th 
                @click="urlPagination.setSort('category')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                :class="getSortHeaderClass('category')"
                role="columnheader"
                tabindex="0"
                @keydown.enter="urlPagination.setSort('category')"
                @keydown.space.prevent="urlPagination.setSort('category')"
              >
                <div class="flex items-center space-x-1">
                  <span>Category</span>
                  <ArrowUpDown class="h-4 w-4" />
                </div>
              </th>
              <th 
                @click="urlPagination.setSort('status')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                :class="getSortHeaderClass('status')"
                role="columnheader"
                tabindex="0"
                @keydown.enter="urlPagination.setSort('status')"
                @keydown.space.prevent="urlPagination.setSort('status')"
              >
                <div class="flex items-center space-x-1">
                  <span>Status</span>
                  <ArrowUpDown class="h-4 w-4" />
                </div>
              </th>
              <th 
                @click="urlPagination.setSort('createdAt')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                :class="getSortHeaderClass('createdAt')"
                role="columnheader"
                tabindex="0"
                @keydown.enter="urlPagination.setSort('createdAt')"
                @keydown.space.prevent="urlPagination.setSort('createdAt')"
              >
                <div class="flex items-center space-x-1">
                  <span>Created</span>
                  <ArrowUpDown class="h-4 w-4" />
                </div>
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(item, index) in paginatedData"
              :key="item.id"
              :tabindex="index === keyboardNav.state.activeRowIndex ? 0 : -1"
              :class="[
                'cursor-pointer hover:bg-gray-50 transition-colors',
                bulkOperations.isItemSelected(item) ? 'bg-blue-50' : ''
              ]"
              role="row"
              :aria-rowindex="index + 1"
              @click="bulkOperations.toggleItem(item)"
              @keydown.enter="bulkOperations.toggleItem(item)"
              @keydown.space.prevent="bulkOperations.toggleItem(item)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  :checked="bulkOperations.isItemSelected(item)"
                  @change="bulkOperations.toggleItem(item)"
                  @click.stop
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ item.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800': item.status === 'active',
                    'bg-yellow-100 text-yellow-800': item.status === 'pending',
                    'bg-red-100 text-red-800': item.status === 'inactive'
                  }"
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(item.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click.stop="viewItem(item)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  View
                </button>
                <button
                  @click.stop="editItem(item)"
                  class="text-gray-600 hover:text-gray-900"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <DataPagination
        :pagination-state="urlPagination.paginationState"
        :page-sizes="[25, 50, 100] as InventoryPaginationSizes[]"
        @page-change="urlPagination.setPage"
        @page-size-change="urlPagination.setPageSize"
        data-pagination-prev="[data-pagination-prev]"
        data-pagination-next="[data-pagination-next]"
      />
    </div>

    <!-- Export Modal -->
    <ExportModal
      v-if="showExportModal"
      :show="showExportModal"
      :formats="exportComposable.formats"
      :export-scopes="exportComposable.exportScopes"
      :export-state="exportComposable.state"
      :total-pages="urlPagination.paginationState.totalPages"
      :default-filename="'inventory_export'"
      :estimated-row-count="urlPagination.paginationState.totalItems"
      @close="showExportModal = false"
      @export="handleExport"
    />

    <!-- Keyboard Shortcuts Help -->
    <div 
      v-if="showKeyboardHelp"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="showKeyboardHelp = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Keyboard Shortcuts
            </h3>
            <button @click="showKeyboardHelp = false">
              <X class="h-6 w-6 text-gray-400" />
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="shortcut in keyboardShortcuts" :key="shortcut.key" class="flex justify-between">
              <span class="text-sm text-gray-600">{{ shortcut.description }}</span>
              <kbd class="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                {{ shortcut.key }}
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  Search, 
  Download, 
  Keyboard, 
  CheckSquare, 
  Link, 
  FileText, 
  ArrowUpDown, 
  X 
} from 'lucide-vue-next';

// Import our new composables
import { useUrlPagination } from '@/composables/useUrlPagination';
import { useBulkOperations, createBulkOperations } from '@/composables/useBulkOperations';
import { useKeyboardNavigation, getKeyboardShortcuts } from '@/composables/useKeyboardNavigation';
import { useDataExport } from '@/composables/useDataExport';

// Import components
import DataPagination from '@/components/ui/pagination/DataPagination.vue';
import BulkOperationsBar from '@/components/ui/BulkOperationsBar.vue';
import ExportModal from '@/components/ui/ExportModal.vue';
import type { InventoryPaginationSizes } from '@/types/pagination';

// Mock data interface
interface DemoItem {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
}

// Generate mock data
const generateMockData = (): DemoItem[] => {
  const categories = ['Electronics', 'Tools', 'Safety', 'Maintenance', 'Spare Parts'];
  const statuses: DemoItem['status'][] = ['active', 'pending', 'inactive'];
  
  return Array.from({ length: 150 }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Demo Item ${i + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));
};

// Reactive data
const allData = ref<DemoItem[]>(generateMockData());
const categoryFilter = ref('');
const statusFilter = ref('');
const showExportModal = ref(false);
const showKeyboardHelp = ref(false);

// Available filter options
const categories = computed(() => [...new Set(allData.value.map(item => item.category))]);

// URL pagination setup
const urlPagination = useUrlPagination({
  defaultPageSize: 25,
  allowedPageSizes: [25, 50, 100]
});

// Filtered data based on search and filters
const filteredData = computed(() => {
  let filtered = allData.value;
  
  // Apply search
  if (urlPagination.paginationState.searchQuery) {
    const search = urlPagination.paginationState.searchQuery.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search)
    );
  }
  
  // Apply category filter
  if (categoryFilter.value) {
    filtered = filtered.filter(item => item.category === categoryFilter.value);
  }
  
  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(item => item.status === statusFilter.value);
  }
  
  // Apply sorting
  if (urlPagination.paginationState.sortBy) {
    filtered.sort((a, b) => {
      const field = urlPagination.paginationState.sortBy as keyof DemoItem;
      const aValue = a[field];
      const bValue = b[field];
      
      if (aValue < bValue) {
        return urlPagination.paginationState.sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return urlPagination.paginationState.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  
  // Update pagination total
  urlPagination.updateTotalItems(filtered.length);
  
  return filtered;
});

// Paginated data
const paginatedData = computed(() => {
  const startIndex = (urlPagination.paginationState.currentPage - 1) * urlPagination.paginationState.pageSize;
  const endIndex = startIndex + urlPagination.paginationState.pageSize;
  return filteredData.value.slice(startIndex, endIndex);
});

// Selected items for bulk operations
const selectedItems = computed(() => 
  allData.value.filter(item => bulkOperations.isItemSelected(item))
);

// Bulk operations setup
const bulkOperations = useBulkOperations(paginatedData, {
  allowSelectAll: true,
  allowSelectAcrossPages: true,
  operations: [
    createBulkOperations.delete(async (items) => {
      console.log('Deleting items:', items.map(i => i.id));
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: `Deleted ${items.length} items` };
    }),
    createBulkOperations.export(async (items) => {
      console.log('Exporting items:', items.map(i => i.id));
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: `Exported ${items.length} items` };
    }),
    {
      id: 'activate',
      label: 'Activate Selected',
      icon: 'check-circle',
      variant: 'primary',
      visible: (items) => items.some(item => item.status !== 'active'),
      execute: async (items) => {
        console.log('Activating items:', items.map(i => i.id));
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true, message: `Activated ${items.length} items` };
      }
    }
  ]
});

// Keyboard navigation
const keyboardNav = useKeyboardNavigation({
  enableTableNavigation: true,
  enableRowSelection: true,
  enableBulkSelection: true,
  customKeys: {
    'ctrl+e': () => showExportModal.value = true,
    'ctrl+h': () => showKeyboardHelp.value = true,
    'ctrl+k': () => urlPagination.paginationState.searchQuery = ''
  }
});

// Export functionality
const exportComposable = useDataExport(
  allData,
  paginatedData,
  selectedItems,
  {
    defaultFilename: 'demo_export',
    fieldMapping: {
      id: 'ID',
      name: 'Name',
      category: 'Category', 
      status: 'Status',
      createdAt: 'Created Date'
    },
    customFields: [
      {
        key: 'displayName',
        label: 'Display Name',
        getValue: (item) => `${item.name} (${item.category})`,
      }
    ]
  }
);

// Computed properties
const hasActiveFilters = computed(() => 
  categoryFilter.value || statusFilter.value || urlPagination.paginationState.searchQuery
);

const keyboardShortcuts = computed(() => [
  ...getKeyboardShortcuts(),
  { key: 'Ctrl+E', description: 'Open export modal' },
  { key: 'Ctrl+H', description: 'Show keyboard shortcuts' },
  { key: 'Ctrl+K', description: 'Clear search' }
]);

// Methods
const setCategoryFilter = (value: string) => {
  categoryFilter.value = value;
  urlPagination.setPage(1); // Reset to first page when filtering
};

const setStatusFilter = (value: string) => {
  statusFilter.value = value;
  urlPagination.setPage(1); // Reset to first page when filtering
};

const clearFilters = () => {
  categoryFilter.value = '';
  statusFilter.value = '';
  urlPagination.setSearchQuery('');
  urlPagination.setPage(1);
};

const getSortHeaderClass = (field: string) => {
  if (urlPagination.paginationState.sortBy === field) {
    return urlPagination.paginationState.sortOrder === 'asc' 
      ? 'text-blue-600' 
      : 'text-blue-600';
  }
  return '';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const viewItem = (item: DemoItem) => {
  console.log('Viewing item:', item.id);
};

const editItem = (item: DemoItem) => {
  console.log('Editing item:', item.id);
};

const handleExport = (options: any) => {
  exportComposable.exportData(options);
};

// Initialize keyboard navigation
onMounted(() => {
  keyboardNav.announce('Enterprise data table loaded with full keyboard navigation');
});
</script>

<style scoped>
/* Screen reader only class */
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

/* Focus styles for better accessibility */
button:focus,
input:focus,
select:focus,
th:focus,
tr:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Custom checkbox indeterminate styles */
input[type="checkbox"]:indeterminate {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M2 8h12'/%3e%3c/svg%3e");
}
</style>