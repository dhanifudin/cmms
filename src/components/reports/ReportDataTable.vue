<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <!-- Table Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <p v-if="subtitle" class="text-sm text-gray-500 mt-0.5">{{ subtitle }}</p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Search -->
          <div v-if="searchable" class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          <!-- Row count -->
          <span class="text-sm text-gray-500">
            {{ filteredData.length }} {{ filteredData.length === 1 ? 'row' : 'rows' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              @click="column.sortable && handleSort(column.key)"
              :class="[
                'px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left',
                column.sortable ? 'cursor-pointer hover:text-gray-700 select-none' : ''
              ]"
              :style="column.width ? { width: column.width } : {}"
            >
              <div class="flex items-center" :class="column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''">
                <span>{{ column.label }}</span>
                <template v-if="column.sortable">
                  <ChevronUp
                    v-if="sortBy === column.key && sortOrder === 'asc'"
                    class="h-4 w-4 ml-1 text-blue-600"
                  />
                  <ChevronDown
                    v-else-if="sortBy === column.key && sortOrder === 'desc'"
                    class="h-4 w-4 ml-1 text-blue-600"
                  />
                  <ChevronsUpDown
                    v-else
                    class="h-4 w-4 ml-1 text-gray-300"
                  />
                </template>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(row, rowIndex) in paginatedData"
            :key="getRowKey(row, rowIndex)"
            :class="[
              'transition-colors',
              isRowClickable(row) ? 'cursor-pointer hover:bg-blue-50' : 'hover:bg-gray-50'
            ]"
            @click="handleRowClick(row)"
          >
            <td
              v-for="column in columns"
              :key="`${getRowKey(row, rowIndex)}-${column.key}`"
              :class="[
                'px-4 py-3 text-sm',
                column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
              ]"
            >
              <!-- Slot for custom cell rendering -->
              <slot :name="`cell-${column.key}`" :row="row" :value="getCellValue(row, column.key)" :column="column">
                <!-- Default rendering based on column type -->
                <template v-if="column.type === 'badge'">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getBadgeClass(getCellValue(row, column.key), column.badgeMap)"
                  >
                    {{ formatCellValue(getCellValue(row, column.key), column) }}
                  </span>
                </template>

                <template v-else-if="column.type === 'progress'">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        class="h-2 rounded-full"
                        :class="getProgressClass(getCellValue(row, column.key))"
                        :style="{ width: `${Math.min(100, getCellValue(row, column.key))}%` }"
                      ></div>
                    </div>
                    <span class="text-gray-900">{{ getCellValue(row, column.key) }}%</span>
                  </div>
                </template>

                <template v-else-if="column.type === 'currency'">
                  <span class="font-medium text-gray-900">
                    {{ formatCurrency(getCellValue(row, column.key)) }}
                  </span>
                </template>

                <template v-else-if="column.type === 'date'">
                  {{ formatDate(getCellValue(row, column.key)) }}
                </template>

                <template v-else-if="column.type === 'drilldown'">
                  <div class="flex items-center">
                    <span class="font-medium text-gray-900">{{ getCellValue(row, column.key) }}</span>
                    <ChevronRight
                      v-if="isRowClickable(row)"
                      class="h-4 w-4 ml-2 text-blue-500"
                    />
                  </div>
                </template>

                <template v-else>
                  {{ formatCellValue(getCellValue(row, column.key), column) }}
                </template>
              </slot>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="filteredData.length === 0">
            <td :colspan="columns.length" class="px-4 py-12 text-center">
              <div class="text-gray-500">
                <FileX class="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p class="text-sm font-medium">{{ emptyMessage }}</p>
                <p v-if="searchQuery" class="text-xs mt-1">Try adjusting your search or filters</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="paginated && filteredData.length > 0" class="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-700">Rows per page:</span>
        <select
          v-model="localPageSize"
          @change="handlePageSizeChange"
          class="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>

      <div class="flex items-center space-x-4">
        <span class="text-sm text-gray-700">
          {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredData.length }}
        </span>

        <div class="flex items-center space-x-1">
          <button
            @click="goToPage(1)"
            :disabled="currentPage === 1"
            class="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft class="h-5 w-5 text-gray-600" />
          </button>
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft class="h-5 w-5 text-gray-600" />
          </button>

          <span class="px-3 py-1 text-sm text-gray-700">
            Page {{ currentPage }} of {{ totalPages }}
          </span>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon class="h-5 w-5 text-gray-600" />
          </button>
          <button
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
            class="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight class="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  FileX,
  ChevronRight as ChevronRightIcon
} from 'lucide-vue-next';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge' | 'progress' | 'currency' | 'drilldown';
  align?: 'left' | 'center' | 'right';
  width?: string;
  format?: (value: any) => string;
  badgeMap?: Record<string, string>;
}

interface Props {
  title: string;
  subtitle?: string;
  columns: TableColumn[];
  data: any[];
  rowKey?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: string[];
  paginated?: boolean;
  pageSize?: number;
  pageSizes?: number[];
  emptyMessage?: string;
  clickableField?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  rowKey: 'id',
  searchable: true,
  searchPlaceholder: 'Search...',
  searchFields: () => [],
  paginated: true,
  pageSize: 50,
  pageSizes: () => [25, 50, 100, 200],
  emptyMessage: 'No data available',
  clickableField: 'isClickable'
});

const emit = defineEmits<{
  (e: 'row-click', row: any): void;
  (e: 'sort', field: string, order: 'asc' | 'desc'): void;
}>();

// Local state
const searchQuery = ref('');
const sortBy = ref<string | null>(null);
const sortOrder = ref<'asc' | 'desc'>('asc');
const currentPage = ref(1);
const localPageSize = ref(props.pageSize);

// Computed
const filteredData = computed(() => {
  let result = [...props.data];

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    const searchFields = props.searchFields.length > 0
      ? props.searchFields
      : props.columns.map(c => c.key);

    result = result.filter(row =>
      searchFields.some(field => {
        const value = getCellValue(row, field);
        return value != null && String(value).toLowerCase().includes(query);
      })
    );
  }

  // Apply sorting
  if (sortBy.value) {
    const column = props.columns.find(c => c.key === sortBy.value);
    result.sort((a, b) => {
      const aVal = getCellValue(a, sortBy.value!);
      const bVal = getCellValue(b, sortBy.value!);

      let comparison = 0;

      if (column?.type === 'date') {
        comparison = new Date(aVal).getTime() - new Date(bVal).getTime();
      } else if (column?.type === 'number' || column?.type === 'currency' || column?.type === 'progress') {
        comparison = Number(aVal) - Number(bVal);
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortOrder.value === 'asc' ? comparison : -comparison;
    });
  }

  return result;
});

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / localPageSize.value) || 1;
});

const startIndex = computed(() => {
  return (currentPage.value - 1) * localPageSize.value;
});

const endIndex = computed(() => {
  return Math.min(startIndex.value + localPageSize.value, filteredData.value.length);
});

const paginatedData = computed(() => {
  if (!props.paginated) return filteredData.value;
  return filteredData.value.slice(startIndex.value, endIndex.value);
});

// Methods
const getRowKey = (row: any, index: number): string => {
  return row[props.rowKey] ?? `row-${index}`;
};

const getCellValue = (row: any, key: string): any => {
  // Support nested keys like 'user.name'
  return key.split('.').reduce((obj, k) => obj?.[k], row);
};

const formatCellValue = (value: any, column: TableColumn): string => {
  if (value == null) return '-';
  if (column.format) return column.format(value);
  return String(value);
};

const formatDate = (value: any): string => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatCurrency = (value: any): string => {
  if (value == null) return '-';
  return `Rp ${Number(value).toLocaleString('id-ID')}`;
};

const getBadgeClass = (value: any, badgeMap?: Record<string, string>): string => {
  if (badgeMap && badgeMap[value]) {
    return badgeMap[value];
  }

  // Default badge classes based on common status values
  const defaultMap: Record<string, string> = {
    'completed': 'bg-green-100 text-green-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'overdue': 'bg-red-100 text-red-800',
    'excellent': 'bg-green-100 text-green-800',
    'good': 'bg-blue-100 text-blue-800',
    'average': 'bg-yellow-100 text-yellow-800',
    'poor': 'bg-red-100 text-red-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800',
    'normal': 'bg-gray-100 text-gray-800',
    'low': 'bg-green-100 text-green-800'
  };

  return defaultMap[value?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

const getProgressClass = (value: number): string => {
  if (value >= 90) return 'bg-green-600';
  if (value >= 70) return 'bg-blue-600';
  if (value >= 50) return 'bg-yellow-600';
  return 'bg-red-600';
};

const isRowClickable = (row: any): boolean => {
  return row[props.clickableField] === true;
};

const handleRowClick = (row: any) => {
  if (isRowClickable(row)) {
    emit('row-click', row);
  }
};

const handleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
  emit('sort', field, sortOrder.value);
};

const handlePageSizeChange = () => {
  currentPage.value = 1;
};

const goToPage = (page: number) => {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value));
};

// Reset pagination when data changes
watch(() => props.data, () => {
  currentPage.value = 1;
});

// Reset pagination when search changes
watch(searchQuery, () => {
  currentPage.value = 1;
});
</script>
