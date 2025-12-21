<template>
  <div class="work-order-filters">
    <!-- Desktop Horizontal Layout -->
    <div v-if="!mobileMode" class="flex flex-wrap items-center gap-2 md:gap-4">
      <!-- Primary Filters -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Maintenance Type -->
        <div class="filter-group">
          <Label class="text-xs text-muted-foreground hidden sm:block">Type</Label>
          <Select
            :model-value="filters.maintenanceType?.join(',') || ''"
            @update:model-value="handleMaintenanceTypeChange"
          >
            <SelectTrigger class="w-28 h-8 text-xs">
              <SelectValue>
                <span v-if="!filters.maintenanceType?.length">All Types</span>
                <span v-else-if="filters.maintenanceType.length === 1">
                  {{ formatMaintenanceType(filters.maintenanceType[0]!) }}
                </span>
                <span v-else>
                  {{ filters.maintenanceType.length }} types
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="preventive">Preventive</SelectItem>
              <SelectItem value="corrective">Corrective</SelectItem>
              <SelectItem value="preventive,corrective">Both Types</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <!-- Status -->
        <div class="filter-group">
          <Label class="text-xs text-muted-foreground hidden sm:block">Status</Label>
          <MultiSelect
            :model-value="filters.status || []"
            :options="statusOptions"
            placeholder="All Statuses"
            @update:model-value="updateFilter('status', $event)"
          />
        </div>
        
        <!-- Priority -->
        <div class="filter-group">
          <Label class="text-xs text-muted-foreground hidden sm:block">Priority</Label>
          <MultiSelect
            :model-value="filters.priority || []"
            :options="priorityOptions"
            placeholder="All Priorities"
            @update:model-value="updateFilter('priority', $event)"
          />
        </div>
        
        <!-- Category -->
        <div class="filter-group">
          <Label class="text-xs text-muted-foreground hidden sm:block">Category</Label>
          <MultiSelect
            :model-value="filters.categoryIds || []"
            :options="categoryOptions"
            placeholder="All Categories"
            @update:model-value="updateFilter('categoryIds', $event)"
          />
        </div>
      </div>
      
      <!-- Secondary Filters Toggle -->
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          class="h-8 px-2 text-xs"
          @click="showSecondaryFilters = !showSecondaryFilters"
        >
          <SlidersHorizontal class="h-3 w-3 mr-1" />
          <span class="hidden md:inline">More</span>
          <Badge v-if="secondaryFilterCount > 0" variant="secondary" class="ml-1 text-xs px-1">
            {{ secondaryFilterCount }}
          </Badge>
        </Button>
        
        <!-- Clear Filters -->
        <Button
          v-if="hasActiveFilters"
          variant="ghost"
          class="h-8 px-2 text-xs"
          @click="$emit('clear')"
        >
          <X class="h-3 w-3 mr-1" />
          <span class="hidden sm:inline">Clear</span>
        </Button>
      </div>
    </div>
    
    <!-- Mobile Priority Filters -->
    <div v-else class="space-y-2">
      <!-- Most Important Filters (Mobile Priority) -->
      <div class="grid grid-cols-1 gap-2">
        <div class="filter-group">
          <Label class="text-xs font-medium">Status</Label>
          <MultiSelect
            :model-value="filters.status || []"
            :options="statusOptions"
            placeholder="All Statuses"
            @update:model-value="updateFilter('status', $event)"
          />
        </div>
        
        <div class="filter-group">
          <Label class="text-xs font-medium">Type</Label>
          <Select
            :model-value="filters.maintenanceType?.join(',') || ''"
            @update:model-value="handleMaintenanceTypeChange"
          >
            <SelectTrigger class="h-8 text-xs">
              <SelectValue>
                <span v-if="!filters.maintenanceType?.length">All Types</span>
                <span v-else-if="filters.maintenanceType.length === 1">
                  {{ formatMaintenanceType(filters.maintenanceType[0]!) }}
                </span>
                <span v-else>Both Types</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="preventive">Preventive</SelectItem>
              <SelectItem value="corrective">Corrective</SelectItem>
              <SelectItem value="preventive,corrective">Both Types</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div class="filter-group">
          <Label class="text-xs font-medium">Priority</Label>
          <MultiSelect
            :model-value="filters.priority || []"
            :options="priorityOptions"
            placeholder="All Priorities"
            @update:model-value="updateFilter('priority', $event)"
          />
        </div>
      </div>
      
      <!-- More Filters Button -->
      <Button
        variant="outline"
        class="w-full h-8 text-xs"
        @click="showSecondaryFilters = !showSecondaryFilters"
      >
        <SlidersHorizontal class="h-3 w-3 mr-1" />
        More Filters
        <Badge v-if="secondaryFilterCount > 0" variant="secondary" class="ml-1 text-xs px-1">
          {{ secondaryFilterCount }}
        </Badge>
      </Button>
    </div>
    
    <!-- Secondary Filters Panel -->
    <Collapsible :open="showSecondaryFilters">
      <CollapsibleContent class="mt-2">
        <div class="border rounded-lg p-2 sm:p-3 bg-muted/30 space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-medium">More Filters</h4>
            <Button
              variant="ghost"
              class="h-6 w-6 p-0"
              @click="showSecondaryFilters = false"
            >
              <X class="h-3 w-3" />
            </Button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <!-- Terminal/Location -->
            <div class="filter-group">
              <Label class="text-xs">Terminal</Label>
              <MultiSelect
                :model-value="filters.terminalIds || []"
                :options="terminalOptions"
                placeholder="All Terminals"
                :search-enabled="true"
                @update:model-value="updateFilter('terminalIds', $event)"
              />
            </div>
            
            <!-- Assigned Worker -->
            <div class="filter-group">
              <Label class="text-xs">Worker</Label>
              <MultiSelect
                :model-value="filters.assignedWorkerIds || []"
                :options="workerOptions"
                placeholder="All Workers"
                :search-enabled="true"
                @update:model-value="updateFilter('assignedWorkerIds', $event)"
              />
            </div>
            
            <!-- Created By -->
            <div class="filter-group">
              <Label class="text-sm">Created By</Label>
              <MultiSelect
                :model-value="filters.createdByIds || []"
                :options="creatorOptions"
                placeholder="All Creators"
                @update:model-value="updateFilter('createdByIds', $event)"
              />
            </div>
            
            <!-- Date Range -->
            <div class="filter-group">
              <Label class="text-sm">Date Range</Label>
              <div class="flex items-center space-x-2">
                <Select
                  :model-value="filters.dateRange?.field || 'dueDate'"
                  @update:model-value="updateDateField"
                >
                  <SelectTrigger class="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="lastUpdated">Last Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="flex items-center space-x-2 mt-2">
                <Input
                  type="date"
                  :value="filters.dateRange?.start || ''"
                  @input="updateDateRange('start', $event.target.value)"
                  class="text-xs"
                />
                <span class="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  :value="filters.dateRange?.end || ''"
                  @input="updateDateRange('end', $event.target.value)"
                  class="text-xs"
                />
              </div>
            </div>
            
            <!-- Progress Range -->
            <div class="filter-group">
              <Label class="text-sm">Progress Range</Label>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    :value="filters.progressRange?.min || ''"
                    placeholder="Min %"
                    @input="updateProgressRange('min', $event.target.value)"
                    class="text-xs"
                  />
                  <span class="text-xs text-muted-foreground">to</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    :value="filters.progressRange?.max || ''"
                    placeholder="Max %"
                    @input="updateProgressRange('max', $event.target.value)"
                    class="text-xs"
                  />
                </div>
              </div>
            </div>
            
            <!-- Duration Range -->
            <div class="filter-group">
              <Label class="text-sm">Duration (Hours)</Label>
              <div class="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  :value="filters.durationRange?.min || ''"
                  placeholder="Min hours"
                  @input="updateDurationRange('min', $event.target.value)"
                  class="text-xs"
                />
                <span class="text-xs text-muted-foreground">to</span>
                <Input
                  type="number"
                  min="0"
                  :value="filters.durationRange?.max || ''"
                  placeholder="Max hours"
                  @input="updateDurationRange('max', $event.target.value)"
                  class="text-xs"
                />
              </div>
            </div>
          </div>
          
          <!-- Toggle Filters -->
          <div class="border-t pt-4">
            <div class="flex flex-wrap gap-4">
              <div class="flex items-center space-x-2">
                <Checkbox
                  :checked="filters.hasTemplate === true"
                  @update:checked="updateToggleFilter('hasTemplate', $event)"
                />
                <Label class="text-sm">Has Template</Label>
              </div>
              
              <div class="flex items-center space-x-2">
                <Checkbox
                  :checked="filters.isOverdue === true"
                  @update:checked="updateToggleFilter('isOverdue', $event)"
                />
                <Label class="text-sm">Overdue Only</Label>
              </div>
            </div>
          </div>
          
          <!-- Filter Actions -->
          <div class="border-t pt-4 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              @click="clearSecondaryFilters"
            >
              Clear Secondary
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              @click="$emit('clear')"
            >
              <X class="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
    
    <!-- Active Filter Tags -->
    <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mt-3">
      <Badge
        v-for="tag in activeFilterTags"
        :key="tag.key"
        variant="secondary"
        class="cursor-pointer hover:bg-secondary/80"
        @click="removeFilterTag(tag.key)"
      >
        {{ tag.label }}
        <X class="h-3 w-3 ml-1" />
      </Badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { WorkOrderTableFilters } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';

// Custom Components
import MultiSelect from '@/components/ui/multi-select.vue';

// Icons
import { SlidersHorizontal, X } from 'lucide-vue-next';

// Props & Emits
interface Props {
  filters: WorkOrderTableFilters;
  hasActiveFilters: boolean;
  mobileMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mobileMode: false
});

const emit = defineEmits<{
  update: [filters: Partial<WorkOrderTableFilters>];
  clear: [];
}>();

// Local state
const showSecondaryFilters = ref(false);

// Filter options (in real app, these would come from API)
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'submitted_for_review', label: 'Submitted for Review' }
];

const priorityOptions = [
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'low', label: 'Low Priority' }
];

const categoryOptions = [
  { value: 'cat-1', label: 'Pipeline Maintenance' },
  { value: 'cat-2', label: 'Compressor Systems' },
  { value: 'cat-3', label: 'Safety Equipment' },
  { value: 'cat-4', label: 'Valve Operations' },
  { value: 'cat-5', label: 'Control Systems' }
];

const terminalOptions = Array.from({ length: 20 }, (_, i) => ({
  value: `terminal-${i + 1}`,
  label: `Terminal ${i + 1}`
}));

const workerOptions = [
  { value: 'worker-1', label: 'John Smith' },
  { value: 'worker-2', label: 'Jane Doe' },
  { value: 'worker-3', label: 'Mike Johnson' },
  { value: 'worker-4', label: 'Sarah Wilson' },
  { value: 'worker-5', label: 'David Brown' }
];

const creatorOptions = [
  { value: 'admin-1', label: 'Admin User' },
  { value: 'supervisor-1', label: 'Supervisor One' },
  { value: 'manager-1', label: 'Manager Two' }
];

// Computed
const secondaryFilterCount = computed(() => {
  let count = 0;
  if (props.filters.terminalIds?.length) count++;
  if (props.filters.assignedWorkerIds?.length) count++;
  if (props.filters.createdByIds?.length) count++;
  if (props.filters.dateRange) count++;
  if (props.filters.progressRange) count++;
  if (props.filters.durationRange) count++;
  if (props.filters.hasTemplate !== undefined) count++;
  if (props.filters.isOverdue !== undefined) count++;
  return count;
});

const activeFilterTags = computed(() => {
  const tags: Array<{ key: string; label: string }> = [];
  
  if (props.filters.maintenanceType?.length) {
    tags.push({
      key: 'maintenanceType',
      label: `Type: ${props.filters.maintenanceType.map(formatMaintenanceType).join(', ')}`
    });
  }
  
  if (props.filters.status?.length) {
    tags.push({
      key: 'status',
      label: `Status: ${props.filters.status.length} selected`
    });
  }
  
  if (props.filters.priority?.length) {
    tags.push({
      key: 'priority',
      label: `Priority: ${props.filters.priority.length} selected`
    });
  }
  
  if (props.filters.categoryIds?.length) {
    tags.push({
      key: 'categoryIds',
      label: `Categories: ${props.filters.categoryIds.length} selected`
    });
  }
  
  if (props.filters.terminalIds?.length) {
    tags.push({
      key: 'terminalIds',
      label: `Terminals: ${props.filters.terminalIds.length} selected`
    });
  }
  
  if (props.filters.assignedWorkerIds?.length) {
    tags.push({
      key: 'assignedWorkerIds',
      label: `Workers: ${props.filters.assignedWorkerIds.length} selected`
    });
  }
  
  if (props.filters.dateRange) {
    tags.push({
      key: 'dateRange',
      label: `Date: ${props.filters.dateRange.field}`
    });
  }
  
  if (props.filters.progressRange) {
    tags.push({
      key: 'progressRange',
      label: `Progress: ${props.filters.progressRange.min || 0}%-${props.filters.progressRange.max || 100}%`
    });
  }
  
  if (props.filters.hasTemplate === true) {
    tags.push({
      key: 'hasTemplate',
      label: 'Has Template'
    });
  }
  
  if (props.filters.isOverdue === true) {
    tags.push({
      key: 'isOverdue',
      label: 'Overdue Only'
    });
  }
  
  return tags;
});

// Methods
const updateFilter = (key: keyof WorkOrderTableFilters, value: any) => {
  emit('update', { [key]: value });
};

const handleMaintenanceTypeChange = (value: any) => {
  const stringValue = String(value || '');
  const types = stringValue ? stringValue.split(',') as ('preventive' | 'corrective')[] : [];
  updateFilter('maintenanceType', types);
};

const formatMaintenanceType = (type: string) => {
  return type === 'preventive' ? 'Preventive' : 'Corrective';
};

const updateDateField = (value: any) => {
  const field = String(value || 'dueDate');
  const current = props.filters.dateRange;
  updateFilter('dateRange', {
    field: field as 'dueDate' | 'createdAt' | 'lastUpdated',
    start: current?.start || '',
    end: current?.end || ''
  });
};

const updateDateRange = (key: 'start' | 'end', value: string) => {
  const current = props.filters.dateRange;
  updateFilter('dateRange', {
    field: current?.field || 'dueDate',
    [key]: value,
    [key === 'start' ? 'end' : 'start']: key === 'start' ? current?.end || '' : current?.start || ''
  });
};

const updateProgressRange = (key: 'min' | 'max', value: string) => {
  const numValue = value ? parseInt(value) : undefined;
  const current = props.filters.progressRange;
  
  if (!numValue && !current?.[key === 'min' ? 'max' : 'min']) {
    updateFilter('progressRange', undefined);
  } else {
    updateFilter('progressRange', {
      [key]: numValue,
      [key === 'min' ? 'max' : 'min']: current?.[key === 'min' ? 'max' : 'min']
    });
  }
};

const updateDurationRange = (key: 'min' | 'max', value: string) => {
  const numValue = value ? parseInt(value) : undefined;
  const current = props.filters.durationRange;
  
  if (!numValue && !current?.[key === 'min' ? 'max' : 'min']) {
    updateFilter('durationRange', undefined);
  } else {
    updateFilter('durationRange', {
      [key]: numValue,
      [key === 'min' ? 'max' : 'min']: current?.[key === 'min' ? 'max' : 'min']
    });
  }
};

const updateToggleFilter = (key: 'hasTemplate' | 'isOverdue', checked: boolean) => {
  updateFilter(key, checked || undefined);
};

const removeFilterTag = (key: string) => {
  switch (key) {
    case 'maintenanceType':
      updateFilter('maintenanceType', []);
      break;
    case 'status':
      updateFilter('status', []);
      break;
    case 'priority':
      updateFilter('priority', []);
      break;
    case 'categoryIds':
      updateFilter('categoryIds', []);
      break;
    case 'terminalIds':
      updateFilter('terminalIds', []);
      break;
    case 'assignedWorkerIds':
      updateFilter('assignedWorkerIds', []);
      break;
    case 'dateRange':
      updateFilter('dateRange', undefined);
      break;
    case 'progressRange':
      updateFilter('progressRange', undefined);
      break;
    case 'durationRange':
      updateFilter('durationRange', undefined);
      break;
    case 'hasTemplate':
      updateFilter('hasTemplate', undefined);
      break;
    case 'isOverdue':
      updateFilter('isOverdue', undefined);
      break;
  }
};

const clearSecondaryFilters = () => {
  emit('update', {
    terminalIds: [],
    assignedWorkerIds: [],
    createdByIds: [],
    dateRange: undefined,
    progressRange: undefined,
    durationRange: undefined,
    hasTemplate: undefined,
    isOverdue: undefined
  });
};
</script>

<style scoped>
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.work-order-filters {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Filter tag animations */
.filter-tag {
  transition: all 0.2s;
}

.filter-tag:hover {
  transform: scale(1.05);
}
</style>