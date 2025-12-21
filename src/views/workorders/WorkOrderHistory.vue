<template>
  <div class="work-order-history h-full flex flex-col">
    <!-- Page Header -->
    <div class="bg-card border-b border-border p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Work Order History</h1>
          <p class="text-muted-foreground mt-1">
            Archive of completed work orders (read-only view)
          </p>
        </div>
        
        <!-- Quick Stats -->
        <div class="hidden lg:flex items-center space-x-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ historyStore.stats.totalCompleted }}</div>
            <div class="text-xs text-muted-foreground">Total Completed</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ historyStore.stats.completedThisMonth }}</div>
            <div class="text-xs text-muted-foreground">This Month</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-600">{{ historyStore.stats.completedLastMonth }}</div>
            <div class="text-xs text-muted-foreground">Last Month</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ Math.round(historyStore.stats.onTimeCompletion) }}%</div>
            <div class="text-xs text-muted-foreground">On Time</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile Stats Cards -->
    <div class="lg:hidden bg-background p-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="text-center p-3 bg-card border rounded-lg">
          <div class="text-lg font-bold text-green-600">{{ historyStore.stats.totalCompleted }}</div>
          <div class="text-xs text-muted-foreground">Total</div>
        </div>
        <div class="text-center p-3 bg-card border rounded-lg">
          <div class="text-lg font-bold text-blue-600">{{ historyStore.stats.completedThisMonth }}</div>
          <div class="text-xs text-muted-foreground">This Month</div>
        </div>
        <div class="text-center p-3 bg-card border rounded-lg">
          <div class="text-lg font-bold text-gray-600">{{ historyStore.stats.completedLastMonth }}</div>
          <div class="text-xs text-muted-foreground">Last Month</div>
        </div>
        <div class="text-center p-3 bg-card border rounded-lg">
          <div class="text-lg font-bold text-purple-600">{{ Math.round(historyStore.stats.onTimeCompletion) }}%</div>
          <div class="text-xs text-muted-foreground">On Time</div>
        </div>
      </div>
    </div>
    
    <!-- History Controls -->
    <div class="bg-background border-b border-border p-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <!-- Date Range Selector -->
        <div class="flex items-center space-x-3">
          <Label class="text-sm font-medium">Date Range:</Label>
          <Select v-model="selectedDateRange" @update:modelValue="handleDateRangeChange">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <!-- Custom Date Range (shown when custom is selected) -->
        <div v-if="selectedDateRange === 'custom'" class="flex items-center space-x-2">
          <Input
            type="date"
            v-model="customDateRange.start"
            class="w-36"
            @change="updateCustomDateRange"
          />
          <span class="text-muted-foreground">to</span>
          <Input
            type="date"
            v-model="customDateRange.end"
            class="w-36"
            @change="updateCustomDateRange"
          />
        </div>
        
        <!-- Quick Actions -->
        <div class="ml-auto flex items-center space-x-2">
          <Badge variant="outline" class="text-xs">
            {{ historyStore.state.pagination.total }} records
          </Badge>
          <Button
            variant="outline"
            size="sm"
            @click="refreshData"
            :disabled="historyStore.isLoading"
          >
            <RotateCcw class="h-4 w-4 mr-2" :class="{ 'animate-spin': historyStore.isLoading }" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
    
    <!-- History Table -->
    <div class="flex-1 overflow-hidden">
      <WorkOrderHistoryTable
        :readonly="true"
        @view="handleViewWorkOrder"
      />
    </div>
    
    <!-- Work Order Detail Modal (Read-only) -->
    <WorkOrderHistoryDetailModal
      v-if="selectedWorkOrder"
      :work-order="selectedWorkOrder"
      @close="selectedWorkOrder = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useWorkOrderHistoryStore } from '@/stores/work-order-history';
import { useToast } from '@/hooks/use-toast';
import type { WorkOrderHistoryRow } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import { RotateCcw } from 'lucide-vue-next';

// Components
import WorkOrderHistoryTable from '@/components/work-order-history/WorkOrderHistoryTable.vue';
import WorkOrderHistoryDetailModal from '@/components/work-order-history/WorkOrderHistoryDetailModal.vue';

// Store and composables
const historyStore = useWorkOrderHistoryStore();
const { toast } = useToast();

// Local state
const selectedWorkOrder = ref<WorkOrderHistoryRow | null>(null);
const selectedDateRange = ref('last_6_months');
const customDateRange = ref({
  start: '',
  end: ''
});

// Computed
const dateRanges = computed(() => {
  const today = new Date();
  const ranges = {
    last_month: {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0)
    },
    last_3_months: {
      start: new Date(today.getFullYear(), today.getMonth() - 3, 1),
      end: today
    },
    last_6_months: {
      start: new Date(today.getFullYear(), today.getMonth() - 6, 1),
      end: today
    },
    last_year: {
      start: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
      end: today
    }
  };
  
  return ranges;
});

// Event handlers
const handleViewWorkOrder = (workOrder: WorkOrderHistoryRow) => {
  selectedWorkOrder.value = workOrder;
};

const handleDateRangeChange = (range: any) => {
  if (range === 'custom') {
    // Initialize custom range with last 6 months
    const defaultRange = dateRanges.value.last_6_months;
    customDateRange.value = {
      start: defaultRange.start.toISOString().split('T')[0] || '',
      end: defaultRange.end.toISOString().split('T')[0] || ''
    };
    return;
  }
  
  const selectedRange = dateRanges.value[String(range) as keyof typeof dateRanges.value];
  if (selectedRange) {
    updateDateRange({
      start: selectedRange.start.toISOString().split('T')[0] || '',
      end: selectedRange.end.toISOString().split('T')[0] || ''
    });
  }
};

const updateCustomDateRange = () => {
  if (customDateRange.value.start && customDateRange.value.end) {
    updateDateRange(customDateRange.value);
  }
};

const updateDateRange = (range: { start: string; end: string }) => {
  historyStore.updatePagination({
    dateRange: range,
    page: 1 // Reset to first page
  });
  
  fetchHistoryData({ forceRefresh: true });
};

const refreshData = async () => {
  try {
    await fetchHistoryData({ forceRefresh: true });
    toast({
      title: 'Success',
      description: 'Work order history refreshed successfully'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to refresh history data',
      variant: 'destructive'
    });
  }
};

const fetchHistoryData = async (options: { forceRefresh?: boolean } = {}) => {
  if (!historyStore.permissions.canViewHistory) {
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to view work order history',
      variant: 'destructive'
    });
    return;
  }
  
  const currentRange = historyStore.state.pagination.dateRange;
  await historyStore.fetchHistoryData({
    ...options,
    dateRange: currentRange
  });
};

// Watch for permission changes
watch(() => historyStore.permissions.canViewHistory, (canView) => {
  if (!canView) {
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to view work order history',
      variant: 'destructive'
    });
  }
});

// Lifecycle
onMounted(async () => {
  // Check permissions first
  if (!historyStore.permissions.canViewHistory) {
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to view work order history',
      variant: 'destructive'
    });
    return;
  }
  
  // Set initial date range
  handleDateRangeChange(selectedDateRange.value);
  
  // Fetch initial data
  await fetchHistoryData();
});
</script>

<style scoped>
.work-order-history {
  height: calc(100vh - 4rem); /* Account for main layout */
}

/* Responsive layout adjustments */
@media (max-width: 768px) {
  .work-order-history {
    height: 100vh;
  }
}
</style>