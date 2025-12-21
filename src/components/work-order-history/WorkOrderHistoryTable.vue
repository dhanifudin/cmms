<template>
  <div class="history-table-container flex flex-col h-full">
    <!-- Search and Filters -->
    <div class="bg-background border-b border-border p-4 space-y-4">
      <!-- Search Bar -->
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              placeholder="Search work orders..."
              class="pl-10"
              @input="debouncedSearch"
            />
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            @click="showFilters = !showFilters"
            :class="{ 'bg-muted': hasActiveFilters }"
          >
            <Filter class="h-4 w-4 mr-2" />
            Filters
            <Badge v-if="hasActiveFilters" variant="secondary" class="ml-2 px-1.5 py-0.5 text-xs">
              {{ activeFilterCount }}
            </Badge>
          </Button>
        </div>
      </div>
      
      <!-- Filters Panel -->
      <div v-if="showFilters" class="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Maintenance Type Filter -->
          <div>
            <Label class="text-sm font-medium">Type</Label>
            <Select v-model="filters.maintenanceType" @update:modelValue="updateFilters">
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Types</SelectItem>
                <SelectItem value="preventive">Preventive</SelectItem>
                <SelectItem value="corrective">Corrective</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Priority Filter -->
          <div>
            <Label class="text-sm font-medium">Priority</Label>
            <Select v-model="filters.priority" @update:modelValue="updateFilters">
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Duration Variance Filter -->
          <div>
            <Label class="text-sm font-medium">Duration</Label>
            <Select v-model="filters.durationVariance" @update:modelValue="updateFilters">
              <SelectTrigger>
                <SelectValue placeholder="All durations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Durations</SelectItem>
                <SelectItem value="on_time">Completed On Time</SelectItem>
                <SelectItem value="over_time">Over Estimated</SelectItem>
                <SelectItem value="under_time">Under Estimated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Completion Notes Filter -->
          <div>
            <Label class="text-sm font-medium">Notes</Label>
            <Select v-model="filters.hasNotes" @update:modelValue="updateFilters">
              <SelectTrigger>
                <SelectValue placeholder="All records" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Records</SelectItem>
                <SelectItem value="with_notes">With Notes</SelectItem>
                <SelectItem value="without_notes">Without Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="text-sm text-muted-foreground">
            {{ historyStore.state.rows.length }} of {{ historyStore.state.pagination.total }} records
          </div>
          <Button variant="outline" size="sm" @click="clearAllFilters">
            Clear All Filters
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Table Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Loading State -->
      <div v-if="historyStore.isLoading" class="flex items-center justify-center h-full">
        <div class="text-center space-y-4">
          <Loader2 class="h-8 w-8 animate-spin mx-auto text-primary" />
          <p class="text-muted-foreground">Loading work order history...</p>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="historyStore.hasError" class="flex items-center justify-center h-full">
        <div class="text-center space-y-4 max-w-md">
          <AlertCircle class="h-12 w-12 mx-auto text-destructive" />
          <div>
            <h3 class="font-medium text-lg">Unable to load history</h3>
            <p class="text-muted-foreground">{{ historyStore.state.error }}</p>
          </div>
          <Button @click="$emit('refresh')">
            Try Again
          </Button>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="historyStore.isEmpty" class="flex items-center justify-center h-full">
        <div class="text-center space-y-4 max-w-md">
          <Archive class="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 class="font-medium text-lg">No history records found</h3>
            <p class="text-muted-foreground">
              {{ hasActiveFilters 
                ? 'No completed work orders match your current filters.' 
                : 'No completed work orders in the selected date range.'
              }}
            </p>
          </div>
          <Button v-if="hasActiveFilters" variant="outline" @click="clearAllFilters">
            Clear Filters
          </Button>
        </div>
      </div>
      
      <!-- Data Table -->
      <div v-else class="h-full flex flex-col">
        <!-- Desktop Table -->
        <div class="hidden md:block flex-1 overflow-auto">
          <table class="w-full">
            <thead class="sticky top-0 bg-background border-b border-border">
              <tr class="text-left">
                <th class="px-4 py-3 font-medium text-sm">
                  <button 
                    @click="updateSort('code')"
                    class="flex items-center space-x-1 hover:text-primary"
                  >
                    <span>Work Order</span>
                    <ArrowUpDown class="h-3 w-3" />
                  </button>
                </th>
                <th class="px-4 py-3 font-medium text-sm w-24">Type</th>
                <th class="px-4 py-3 font-medium text-sm w-20">Priority</th>
                <th class="px-4 py-3 font-medium text-sm w-32">Assigned To</th>
                <th class="px-4 py-3 font-medium text-sm w-32">
                  <button 
                    @click="updateSort('completedDate')"
                    class="flex items-center space-x-1 hover:text-primary"
                  >
                    <span>Completed</span>
                    <ArrowUpDown class="h-3 w-3" />
                  </button>
                </th>
                <th class="px-4 py-3 font-medium text-sm w-24">Duration</th>
                <th class="px-4 py-3 font-medium text-sm w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="workOrder in historyStore.state.rows"
                :key="workOrder.id"
                class="border-b border-border hover:bg-muted/50 cursor-pointer"
                @click="$emit('view', workOrder)"
              >
                <td class="px-4 py-3">
                  <div>
                    <div class="font-medium text-sm">{{ workOrder.code }}</div>
                    <div class="text-sm text-muted-foreground line-clamp-1">{{ workOrder.title }}</div>
                    <div class="text-xs text-muted-foreground">{{ workOrder.category.name }}</div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <Badge :variant="getTypeVariant(workOrder.maintenanceType)" class="text-xs">
                    {{ workOrder.maintenanceType }}
                  </Badge>
                </td>
                <td class="px-4 py-3">
                  <Badge :variant="getPriorityVariant(workOrder.priority)" class="text-xs">
                    {{ workOrder.priority }}
                  </Badge>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm">{{ workOrder.assignedTo?.name || 'Unassigned' }}</div>
                </td>
                <td class="px-4 py-3">
                  <div>
                    <div class="text-sm">{{ formatDate(workOrder.completedDate) }}</div>
                    <div class="text-xs text-muted-foreground">by {{ workOrder.completedBy.name }}</div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-center">
                    <div class="text-sm">{{ workOrder.actualDuration }}h</div>
                    <div 
                      class="text-xs"
                      :class="getDurationVarianceClass(workOrder.actualDuration, workOrder.estimatedDuration)"
                    >
                      {{ getDurationVariance(workOrder.actualDuration, workOrder.estimatedDuration) }}
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <Button variant="ghost" size="sm" @click.stop="$emit('view', workOrder)">
                    <Eye class="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Mobile Cards -->
        <div class="md:hidden flex-1 overflow-auto space-y-3 p-4">
          <Card
            v-for="workOrder in historyStore.state.rows"
            :key="workOrder.id"
            class="cursor-pointer transition-colors hover:bg-muted/50"
            @click="$emit('view', workOrder)"
          >
            <CardContent class="p-4">
              <div class="space-y-3">
                <!-- Header -->
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-sm">{{ workOrder.code }}</h4>
                    <p class="text-sm text-muted-foreground line-clamp-1">{{ workOrder.title }}</p>
                  </div>
                  <Button variant="ghost" size="sm" @click.stop="$emit('view', workOrder)">
                    <Eye class="h-4 w-4" />
                  </Button>
                </div>
                
                <!-- Badges -->
                <div class="flex items-center space-x-2">
                  <Badge :variant="getTypeVariant(workOrder.maintenanceType)" class="text-xs">
                    {{ workOrder.maintenanceType }}
                  </Badge>
                  <Badge :variant="getPriorityVariant(workOrder.priority)" class="text-xs">
                    {{ workOrder.priority }}
                  </Badge>
                </div>
                
                <!-- Details -->
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div class="text-muted-foreground">Assigned To</div>
                    <div>{{ workOrder.assignedTo?.name || 'Unassigned' }}</div>
                  </div>
                  <div>
                    <div class="text-muted-foreground">Completed</div>
                    <div>{{ formatDate(workOrder.completedDate) }}</div>
                  </div>
                  <div>
                    <div class="text-muted-foreground">Duration</div>
                    <div>
                      {{ workOrder.actualDuration }}h 
                      <span 
                        class="text-xs"
                        :class="getDurationVarianceClass(workOrder.actualDuration, workOrder.estimatedDuration)"
                      >
                        ({{ getDurationVariance(workOrder.actualDuration, workOrder.estimatedDuration) }})
                      </span>
                    </div>
                  </div>
                  <div>
                    <div class="text-muted-foreground">Completed By</div>
                    <div>{{ workOrder.completedBy.name }}</div>
                  </div>
                </div>
                
                <!-- Notes indicator -->
                <div v-if="workOrder.completionNotes" class="flex items-center text-xs text-muted-foreground">
                  <FileText class="h-3 w-3 mr-1" />
                  Has completion notes
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="!historyStore.isLoading && !historyStore.isEmpty" class="border-t border-border p-4">
      <WorkOrderHistoryPagination />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useWorkOrderHistoryStore } from '@/stores/work-order-history';
import { debounce } from '@/utils/debounce';
import type { WorkOrderHistoryRow } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Icons
import { 
  Search, Filter, Eye, ArrowUpDown, Archive, Loader2, AlertCircle, FileText
} from 'lucide-vue-next';

// Components
import WorkOrderHistoryPagination from './WorkOrderHistoryPagination.vue';

interface Props {
  readonly?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  view: [workOrder: WorkOrderHistoryRow];
  refresh: [];
}>();

// Store
const historyStore = useWorkOrderHistoryStore();

// Local state
const showFilters = ref(false);
const searchQuery = ref(historyStore.state.search.query);
const filters = ref({
  maintenanceType: '',
  priority: '',
  durationVariance: '',
  hasNotes: ''
});

// Computed
const hasActiveFilters = computed(() => {
  return !!(
    filters.value.maintenanceType ||
    filters.value.priority ||
    filters.value.durationVariance ||
    filters.value.hasNotes ||
    searchQuery.value
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.maintenanceType) count++;
  if (filters.value.priority) count++;
  if (filters.value.durationVariance) count++;
  if (filters.value.hasNotes) count++;
  if (searchQuery.value) count++;
  return count;
});

// Methods
const debouncedSearch = debounce(() => {
  historyStore.updateSearch({ query: searchQuery.value });
  historyStore.fetchHistoryData();
}, 300);

const updateFilters = () => {
  const newFilters: any = {};
  
  if (filters.value.maintenanceType && filters.value.maintenanceType !== '__ALL__') {
    newFilters.maintenanceType = [filters.value.maintenanceType];
  }
  
  if (filters.value.priority && filters.value.priority !== '__ALL__') {
    newFilters.priority = [filters.value.priority];
  }
  
  if (filters.value.hasNotes && filters.value.hasNotes !== '__ALL__') {
    newFilters.hasNotes = filters.value.hasNotes === 'with_notes';
  }
  
  if (filters.value.durationVariance && filters.value.durationVariance !== '__ALL__') {
    const varianceMap = {
      'on_time': { type: 'within', threshold: 10 },
      'over_time': { type: 'over', threshold: 10 },
      'under_time': { type: 'under', threshold: 10 }
    };
    newFilters.durationVariance = varianceMap[filters.value.durationVariance as keyof typeof varianceMap];
  }
  
  historyStore.updateFilters(newFilters);
  historyStore.fetchHistoryData();
};

const clearAllFilters = () => {
  filters.value = {
    maintenanceType: '',
    priority: '',
    durationVariance: '',
    hasNotes: ''
  };
  searchQuery.value = '';
  historyStore.clearFilters();
  historyStore.fetchHistoryData();
};

const updateSort = (field: keyof WorkOrderHistoryRow) => {
  const currentSort = historyStore.state.sort;
  const newDirection = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
  
  historyStore.updateSort({
    field,
    direction: newDirection
  });
  historyStore.fetchHistoryData();
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getDurationVariance = (actual: number, estimated: number): string => {
  const variance = ((actual - estimated) / estimated) * 100;
  const sign = variance > 0 ? '+' : '';
  return `${sign}${Math.round(variance)}%`;
};

const getDurationVarianceClass = (actual: number, estimated: number): string => {
  const variance = ((actual - estimated) / estimated) * 100;
  if (Math.abs(variance) <= 10) return 'text-green-600';
  if (variance > 10) return 'text-red-600';
  return 'text-blue-600';
};

const getTypeVariant = (type: string) => {
  switch (type) {
    case 'preventive':
      return 'default';
    case 'corrective':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};

// Watch for search changes
watch(searchQuery, () => {
  debouncedSearch();
});
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.history-table-container {
  background-color: hsl(var(--background));
}
</style>