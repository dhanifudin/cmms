<template>
  <div class="work-order-table-container">
    <!-- Search and Filter Bar -->
    <div class="bg-white border-b p-2 space-y-2">
      <!-- Search Row -->
      <div class="flex items-center space-x-2">
        <div class="flex-1">
          <WorkOrderSearch
            :search="store.state.search"
            @update="store.setSearch"
            @clear="store.clearSearch"
          />
        </div>
        
        <!-- Mobile Filter Toggle -->
        <Button
          variant="outline"
          size="sm"
          class="md:hidden"
          @click="showMobileFilters = !showMobileFilters"
        >
          <Filter class="h-4 w-4 mr-2" />
          Filters
          <Badge v-if="store.hasActiveFilters" variant="secondary" class="ml-2">
            {{ activeFilterCount }}
          </Badge>
        </Button>
        
        <!-- Page Size Selector -->
        <Select
          :model-value="store.state.pagination.pageSize.toString()"
          @update:model-value="handlePageSizeChange"
        >
          <SelectTrigger class="w-16 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        
        <!-- Create Button (Admin only) -->
        <Button
          v-if="store.permissions.canCreate"
          class="bg-primary text-xs px-2"
          size="sm"
          @click="$emit('create')"
        >
          <Plus class="h-3 w-3 mr-1" />
          <span class="hidden sm:inline">New WO</span>
          <span class="sm:hidden">+</span>
        </Button>
      </div>
      
      <!-- Desktop Filters -->
      <div class="hidden md:block">
        <WorkOrderFilters
          :filters="store.state.filters"
          :has-active-filters="store.hasActiveFilters"
          @update="store.setFilters"
          @clear="store.clearFilters"
        />
      </div>
      
      <!-- Mobile Filters Modal -->
      <div v-if="showMobileFilters" class="md:hidden">
        <div class="border rounded-lg p-4 bg-muted/50">
          <WorkOrderFilters
            :filters="store.state.filters"
            :has-active-filters="store.hasActiveFilters"
            :mobile-mode="true"
            @update="store.setFilters"
            @clear="store.clearFilters"
          />
          <div class="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              @click="showMobileFilters = false"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Table Header with Bulk Actions -->
    <div v-if="store.hasSelection" class="bg-primary/10 border-b p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">
          {{ store.selectedRows.length }} work order{{ store.selectedRows.length === 1 ? '' : 's' }} selected
        </span>
        <div class="flex items-center space-x-2">
          <Button
            v-if="store.permissions.canChangeStatus"
            variant="outline"
            size="sm"
            @click="showBulkStatusModal = true"
          >
            <RotateCcw class="h-4 w-4 mr-2" />
            Status
          </Button>
          <Button
            v-if="store.permissions.canReassign"
            variant="outline"
            size="sm"
            @click="showBulkAssignModal = true"
          >
            <Users class="h-4 w-4 mr-2" />
            Assign
          </Button>
          <Button
            v-if="store.permissions.canBulkEdit"
            variant="outline"
            size="sm"
            @click="showBulkPriorityModal = true"
          >
            <AlertTriangle class="h-4 w-4 mr-2" />
            Priority
          </Button>
          <Button
            v-if="store.permissions.canDelete"
            variant="destructive"
            size="sm"
            @click="handleBulkDelete"
          >
            <Trash2 class="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            @click="store.clearSelection"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="store.state.loading" class="flex items-center justify-center py-12">
      <div class="flex items-center space-x-2">
        <Loader2 class="h-6 w-6 animate-spin" />
        <span class="text-muted-foreground">Loading work orders...</span>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="store.state.error" class="p-8 text-center">
      <AlertCircle class="h-12 w-12 text-destructive mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">Error Loading Work Orders</h3>
      <p class="text-muted-foreground mb-4">{{ store.state.error }}</p>
      <Button @click="store.fetchWorkOrders({ forceRefresh: true })">
        <RefreshCw class="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="store.paginatedRows.length === 0" class="p-8 text-center">
      <FileText class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">
        {{ store.hasActiveFilters || store.state.search.query ? 'No work orders found' : 'No work orders yet' }}
      </h3>
      <p class="text-muted-foreground mb-4">
        {{ store.hasActiveFilters || store.state.search.query 
            ? 'Try adjusting your search or filters' 
            : 'Create your first work order to get started' }}
      </p>
      <div class="space-x-2">
        <Button
          v-if="store.hasActiveFilters"
          variant="outline"
          @click="store.clearFilters"
        >
          Clear Filters
        </Button>
        <Button
          v-if="store.state.search.query"
          variant="outline"
          @click="store.clearSearch"
        >
          Clear Search
        </Button>
        <Button
          v-if="store.permissions.canCreate && !store.hasActiveFilters && !store.state.search.query"
          @click="$emit('create')"
        >
          <Plus class="h-4 w-4 mr-2" />
          Create Work Order
        </Button>
      </div>
    </div>
    
    <!-- Desktop Table View -->
    <div v-else class="hidden lg:block overflow-x-auto">
      <table class="w-full border-collapse">
        <!-- Table Header -->
        <thead class="bg-muted/50 border-b">
          <tr>
            <!-- Bulk Select -->
            <th class="w-8 p-1">
              <Checkbox
                :checked="isAllSelected"
                :indeterminate="isSomeSelected"
                @update:checked="handleSelectAll"
              />
            </th>
            
            <!-- Sortable Headers -->
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              :class="[
                'text-left p-1 px-1 cursor-pointer hover:bg-muted text-xs',
                column.sortable && 'hover:bg-accent',
                column.width
              ]"
              @click="column.sortable && handleSort(column.key)"
            >
              <div class="flex items-center space-x-0.5">
                <span class="font-medium truncate">{{ column.label }}</span>
                <div v-if="column.sortable" class="flex flex-col">
                  <ChevronUp
                    :class="[
                      'h-2 w-2',
                      store.state.sort.field === column.key && store.state.sort.direction === 'asc'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    ]"
                  />
                  <ChevronDown
                    :class="[
                      'h-2 w-2 -mt-0.5',
                      store.state.sort.field === column.key && store.state.sort.direction === 'desc'
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    ]"
                  />
                </div>
              </div>
            </th>
            
            <!-- Actions Column -->
            <th class="w-16 p-1 text-right">
              <span class="text-xs font-medium">Actions</span>
            </th>
          </tr>
        </thead>
        
        <!-- Table Body -->
        <tbody>
          <WorkOrderTableRowComponent
            v-for="row in store.paginatedRows"
            :key="row.id"
            :work-order="row"
            :columns="visibleColumns"
            :is-selected="store.state.selectedIds.includes(row.id)"
            :permissions="store.permissions"
            @select="store.toggleSelection(row.id)"
            @view="$emit('view', row)"
            @edit="$emit('edit', row)"
            @delete="$emit('delete', row)"
            @status-change="$emit('status-change', row, $event)"
            @reassign="$emit('reassign', row, $event)"
          />
        </tbody>
      </table>
    </div>
    
    <!-- Mobile Card View -->
    <div class="lg:hidden space-y-3 p-4">
      <WorkOrderCard
        v-for="row in store.paginatedRows"
        :key="row.id"
        :work-order="row"
        :is-selected="store.state.selectedIds.includes(row.id)"
        :permissions="store.permissions"
        @select="store.toggleSelection(row.id)"
        @view="$emit('view', row)"
        @edit="$emit('edit', row)"
        @delete="$emit('delete', row)"
        @status-change="$emit('status-change', row, $event)"
        @reassign="$emit('reassign', row, $event)"
      />
    </div>
    
    <!-- Pagination -->
    <div class="border-t bg-white p-4">
      <div class="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <!-- Results Info -->
        <div class="text-sm text-muted-foreground">
          Showing {{ startIndex }} to {{ endIndex }} of {{ store.totalFilteredCount }} work orders
          <span v-if="store.hasActiveFilters || store.state.search.query">
            (filtered from {{ store.state.rows.length }} total)
          </span>
        </div>
        
        <!-- Pagination Controls -->
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="store.state.pagination.page === 1"
            @click="handlePageChange(store.state.pagination.page - 1)"
          >
            <ChevronLeft class="h-4 w-4" />
            Previous
          </Button>
          
          <!-- Page Numbers (Desktop) -->
          <div class="hidden sm:flex items-center space-x-1">
            <Button
              v-for="page in visiblePages"
              :key="page"
              :variant="page === store.state.pagination.page ? 'default' : 'outline'"
              size="sm"
              class="w-8 h-8 p-0"
              @click="handlePageChange(page)"
            >
              {{ page }}
            </Button>
          </div>
          
          <!-- Page Info (Mobile) -->
          <div class="sm:hidden text-sm text-muted-foreground">
            Page {{ store.state.pagination.page }} of {{ store.state.pagination.totalPages }}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            :disabled="store.state.pagination.page === store.state.pagination.totalPages"
            @click="handlePageChange(store.state.pagination.page + 1)"
          >
            Next
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Bulk Action Modals -->
    <WorkOrderBulkStatusModal
      v-if="showBulkStatusModal"
      :selected-count="store.selectedRows.length"
      @confirm="handleBulkStatusChange"
      @cancel="showBulkStatusModal = false"
    />
    
    <WorkOrderBulkAssignModal
      v-if="showBulkAssignModal"
      :selected-count="store.selectedRows.length"
      @confirm="handleBulkReassign"
      @cancel="showBulkAssignModal = false"
    />
    
    <WorkOrderBulkPriorityModal
      v-if="showBulkPriorityModal"
      :selected-count="store.selectedRows.length"
      @confirm="handleBulkPriorityChange"
      @cancel="showBulkPriorityModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWorkOrderTableStore } from '@/stores/work-order-table';
import type { 
  WorkOrderTableRow 
} from '@/types';

// Components
import WorkOrderSearch from './WorkOrderSearch.vue';
import WorkOrderFilters from './WorkOrderFilters.vue';
import WorkOrderTableRowComponent from './WorkOrderTableRow.vue';
import WorkOrderCard from './WorkOrderCard.vue';
import WorkOrderBulkStatusModal from './WorkOrderBulkStatusModal.vue';
import WorkOrderBulkAssignModal from './WorkOrderBulkAssignModal.vue';
import WorkOrderBulkPriorityModal from './WorkOrderBulkPriorityModal.vue';

// UI Components
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import {
  Filter, Plus, Loader2, AlertCircle, RefreshCw, FileText,
  RotateCcw, Users, AlertTriangle, Trash2, X,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-vue-next';

// Props & Emits
defineProps<{
  userRole?: 'worker' | 'supervisor' | 'admin';
}>();

const emit = defineEmits<{
  create: [];
  view: [workOrder: WorkOrderTableRow];
  edit: [workOrder: WorkOrderTableRow];
  delete: [workOrder: WorkOrderTableRow];
  'status-change': [workOrder: WorkOrderTableRow, newStatus: string];
  reassign: [workOrder: WorkOrderTableRow, newAssigneeId: string];
}>();

// Store
const store = useWorkOrderTableStore();

// Local state
const showMobileFilters = ref(false);
const showBulkStatusModal = ref(false);
const showBulkAssignModal = ref(false);
const showBulkPriorityModal = ref(false);

// Table columns configuration - compact for low resolution displays
const allColumns = [
  { key: 'title', label: 'Work Order', sortable: true, mobile: true, width: 'flex-1' },
  { key: 'status', label: 'Status', sortable: true, mobile: true, width: 'w-24' },
  { key: 'priority', label: 'Priority', sortable: true, mobile: false, width: 'w-20' },
  { key: 'maintenanceType', label: 'Type', sortable: true, mobile: false, width: 'w-20' },
  { key: 'assignedTo', label: 'Assigned', sortable: true, mobile: false, width: 'w-28' },
  { key: 'dueDate', label: 'Due Date', sortable: true, mobile: true, width: 'w-24' },
] as const;

// Compact view with essential columns separated
const visibleColumns = computed(() => allColumns);

// Computed
const activeFilterCount = computed(() => {
  const filters = store.state.filters;
  let count = 0;
  if (filters.maintenanceType?.length) count++;
  if (filters.status?.length) count++;
  if (filters.priority?.length) count++;
  if (filters.categoryIds?.length) count++;
  if (filters.terminalIds?.length) count++;
  if (filters.assignedWorkerIds?.length) count++;
  if (filters.createdByIds?.length) count++;
  if (filters.dateRange) count++;
  if (filters.progressRange) count++;
  if (filters.durationRange) count++;
  if (filters.hasTemplate !== undefined) count++;
  if (filters.isOverdue !== undefined) count++;
  return count;
});

const isAllSelected = computed(() => {
  return store.paginatedRows.length > 0 && 
         store.paginatedRows.every(row => store.state.selectedIds.includes(row.id));
});

const isSomeSelected = computed(() => {
  return store.state.selectedIds.length > 0 && !isAllSelected.value;
});

const startIndex = computed(() => {
  return store.totalFilteredCount === 0 ? 0 : 
         (store.state.pagination.page - 1) * store.state.pagination.pageSize + 1;
});

const endIndex = computed(() => {
  return Math.min(
    store.state.pagination.page * store.state.pagination.pageSize,
    store.totalFilteredCount
  );
});

const visiblePages = computed(() => {
  const current = store.state.pagination.page;
  const total = store.state.pagination.totalPages;
  const delta = 2;
  
  const range = [];
  const start = Math.max(1, current - delta);
  const end = Math.min(total, current + delta);
  
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  
  // Add ellipsis and first/last pages if needed
  if (start > 1) {
    if (start > 2) range.unshift('...');
    range.unshift(1);
  }
  if (end < total) {
    if (end < total - 1) range.push('...');
    range.push(total);
  }
  
  return range.filter(page => typeof page === 'number') as number[];
});

// Event handlers
const handlePageSizeChange = (value: any) => {
  const newSize = String(value || '10');
  store.setPagination({
    pageSize: parseInt(newSize) as 10 | 25 | 50,
    page: 1
  });
  store.fetchWorkOrders();
};

const handlePageChange = (newPage: number) => {
  store.setPagination({ page: newPage });
  store.fetchWorkOrders({ page: newPage });
};

const handleSort = (field: keyof WorkOrderTableRow) => {
  const currentSort = store.state.sort;
  const newDirection = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
  
  store.setSort({
    field,
    direction: newDirection,
    overridePriority: true // User-initiated sort overrides default priority
  });
};

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    store.selectAll(true); // Select only filtered results
  } else {
    store.clearSelection();
  }
};

const handleBulkDelete = async () => {
  if (!confirm(`Are you sure you want to delete ${store.selectedRows.length} work order(s)? This action cannot be undone.`)) {
    return;
  }
  
  try {
    await store.executeBulkAction({
      type: 'delete',
      workOrderIds: store.state.selectedIds
    });
  } catch (error) {
    console.error('Bulk delete failed:', error);
  }
};

const handleBulkStatusChange = async (newStatus: string) => {
  try {
    await store.executeBulkAction({
      type: 'status_update',
      workOrderIds: store.state.selectedIds,
      payload: { status: newStatus as WorkOrderTableRow['status'] }
    });
    showBulkStatusModal.value = false;
  } catch (error) {
    console.error('Bulk status change failed:', error);
  }
};

const handleBulkReassign = async (assigneeId: string) => {
  try {
    await store.executeBulkAction({
      type: 'reassign',
      workOrderIds: store.state.selectedIds,
      payload: { assignedTo: assigneeId }
    });
    showBulkAssignModal.value = false;
  } catch (error) {
    console.error('Bulk reassign failed:', error);
  }
};

const handleBulkPriorityChange = async (newPriority: string) => {
  try {
    await store.executeBulkAction({
      type: 'priority_change',
      workOrderIds: store.state.selectedIds,
      payload: { priority: newPriority as WorkOrderTableRow['priority'] }
    });
    showBulkPriorityModal.value = false;
  } catch (error) {
    console.error('Bulk priority change failed:', error);
  }
};

// Lifecycle
onMounted(() => {
  store.fetchWorkOrders();
});
</script>

<style scoped>
.work-order-table-container {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Custom scrollbar for table */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background-color: #f1f5f9;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #64748b;
  border-radius: 0.25rem;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background-color: #0f172a;
}

/* Table row hover effects */
tbody tr:hover {
  background-color: rgba(241, 245, 249, 0.5);
}

/* Overdue row styling */
tbody tr[data-overdue="true"] {
  border-left: 4px solid #ef4444;
  background-color: rgba(239, 68, 68, 0.05);
}
</style>