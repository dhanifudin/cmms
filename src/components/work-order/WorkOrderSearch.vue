<template>
  <div class="work-order-search">
    <div class="relative">
      <!-- Search Input -->
      <div class="relative">
        <Search class="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search..."
          class="pl-8 pr-10 h-8 text-sm"
          @keydown.enter="handleSubmit"
        />
        
        <!-- Clear Button -->
        <Button
          v-if="searchQuery"
          variant="ghost"
          size="sm"
          class="absolute right-0.5 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          @click="clearSearch"
        >
          <X class="h-3 w-3" />
        </Button>
      </div>
      
      <!-- Advanced Search Toggle -->
      <div class="flex items-center justify-between mt-1">
        <Button
          variant="ghost"
          size="sm"
          class="text-xs h-7 px-2"
          @click="toggleAdvanced"
        >
          <Settings class="h-3 w-3 mr-1" />
          <span class="hidden sm:inline">{{ search.useAdvanced ? 'Simple' : 'Advanced' }}</span>
        </Button>
        
        <!-- Search Stats -->
        <div v-if="searchQuery || search.useAdvanced" class="text-xs text-muted-foreground">
          {{ resultCount }}
        </div>
      </div>
    </div>
    
    <!-- Advanced Search Panel -->
    <Collapsible :open="search.useAdvanced">
      <CollapsibleContent class="mt-2">
        <div class="border rounded-lg p-2 sm:p-3 bg-muted/30 space-y-2">
          <div class="text-xs font-medium mb-2 hidden sm:block">Advanced Options</div>
          
          <!-- Search Operators -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
              <Label class="text-xs">Title Contains</Label>
              <Input
                v-model="operators.title"
                placeholder="e.g., pump maintenance"
                class="h-8 text-xs"
                @input="updateOperators"
              />
            </div>
            
            <div>
              <Label class="text-xs">Work Order Code</Label>
              <Input
                v-model="operators.code"
                placeholder="e.g., WO-2024-001"
                class="h-8 text-xs"
                @input="updateOperators"
              />
            </div>
            
            <div>
              <Label class="text-xs">Worker Name</Label>
              <Input
                v-model="operators.worker"
                placeholder="e.g., John Smith"
                class="h-8 text-xs"
                @input="updateOperators"
              />
            </div>
            
            <div>
              <Label class="text-xs">Status</Label>
              <Select v-model="operators.status" @update:model-value="updateOperators">
                <SelectTrigger class="h-8 text-xs">
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__ANY__">Any status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="submitted_for_review">Submitted for Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label class="text-xs">Priority</Label>
              <Select v-model="operators.priority" @update:model-value="updateOperators">
                <SelectTrigger class="h-8 text-xs">
                  <SelectValue placeholder="Any priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__ANY__">Any priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label class="text-xs">Category</Label>
              <Input
                v-model="operators.category"
                placeholder="e.g., pipeline"
                class="h-8 text-xs"
                @input="updateOperators"
              />
            </div>
          </div>
          
          <!-- Quick Presets -->
          <div class="pt-2 border-t">
            <Label class="text-xs block mb-1 hidden sm:block">Presets</Label>
            <div class="flex flex-wrap gap-1">
              <Button
                v-for="preset in quickPresets"
                :key="preset.id"
                variant="outline"
                class="h-7 px-2 text-xs"
                @click="applyPreset(preset)"
              >
                {{ preset.label }}
              </Button>
            </div>
          </div>
          
          <!-- Advanced Search Help -->
          <div class="pt-2 border-t hidden sm:block">
            <Collapsible>
              <CollapsibleTrigger as-child>
                <Button variant="ghost" class="h-6 px-2 text-xs">
                  Search Tips
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent class="mt-1">
                <div class="text-xs text-muted-foreground space-y-0.5">
                  <div><code>title:pump</code> - Search for "pump" in titles</div>
                  <div><code>worker:john</code> - Search for worker named "john"</div>
                  <div><code>status:overdue</code> - Find overdue work orders</div>
                  <div><code>due:2024-01-15 to 2024-01-30</code> - Date range search</div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import type { WorkOrderTableSearchOptions } from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Icons
import { Search, X, Settings } from 'lucide-vue-next';

// Props & Emits
interface Props {
  search: WorkOrderTableSearchOptions;
  resultCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  resultCount: 0
});

const emit = defineEmits<{
  update: [search: Partial<WorkOrderTableSearchOptions>];
  clear: [];
}>();

// Local state
const searchQuery = ref(props.search.query);

const operators = ref({
  title: props.search.operators?.title || '',
  code: props.search.operators?.code || '',
  worker: props.search.operators?.worker || '',
  status: props.search.operators?.status || '',
  priority: props.search.operators?.priority || '',
  category: props.search.operators?.category || ''
});

// Quick preset searches
const quickPresets = [
  {
    id: 'my-work',
    label: 'My Work Orders',
    operators: { worker: 'currentUser' } // Would be replaced with actual user
  },
  {
    id: 'overdue',
    label: 'Overdue Items',
    operators: { status: 'overdue' }
  },
  {
    id: 'due-today',
    label: 'Due Today',
    query: 'due:today'
  },
  {
    id: 'high-priority',
    label: 'High Priority',
    operators: { priority: 'high' }
  },
  {
    id: 'unassigned',
    label: 'Unassigned',
    query: 'assigned:none'
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    operators: { status: 'in_progress' }
  }
];

// Debounced search function
const debouncedSearch = useDebounceFn((query: string) => {
  emitUpdate({ query });
}, 300);

// Computed
const hasActiveOperators = computed(() => {
  return Object.values(operators.value).some(value => value.trim() !== '');
});

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  if (props.search.useAdvanced && hasActiveOperators.value) {
    // In advanced mode with operators, don't use simple query
    return;
  }
  debouncedSearch(newQuery);
});

// Watch for search prop changes (external updates)
watch(
  () => props.search,
  (newSearch) => {
    searchQuery.value = newSearch.query;
    if (newSearch.operators) {
      operators.value = {
        title: newSearch.operators.title || '',
        code: newSearch.operators.code || '',
        worker: newSearch.operators.worker || '',
        status: newSearch.operators.status || '',
        priority: newSearch.operators.priority || '',
        category: newSearch.operators.category || ''
      };
    }
  },
  { deep: true }
);

// Methods
const emitUpdate = (updates: Partial<WorkOrderTableSearchOptions>) => {
  emit('update', updates);
};

const clearSearch = () => {
  searchQuery.value = '';
  operators.value = {
    title: '',
    code: '',
    worker: '',
    status: '',
    priority: '',
    category: ''
  };
  emit('clear');
};

const toggleAdvanced = () => {
  const newUseAdvanced = !props.search.useAdvanced;
  
  if (newUseAdvanced) {
    // Switching to advanced mode
    emitUpdate({
      useAdvanced: true,
      operators: { ...operators.value }
    });
  } else {
    // Switching to simple mode
    emitUpdate({
      useAdvanced: false,
      query: searchQuery.value,
      operators: {}
    });
  }
};

const updateOperators = () => {
  if (!props.search.useAdvanced) return;
  
  nextTick(() => {
    const cleanOperators = Object.fromEntries(
      Object.entries(operators.value).filter(([_, value]) => value.trim() !== '')
    );
    
    emitUpdate({
      operators: cleanOperators,
      query: '' // Clear simple query when using operators
    });
  });
};

const applyPreset = (preset: typeof quickPresets[0]) => {
  if (preset.operators) {
    operators.value = { ...operators.value, ...preset.operators };
    emitUpdate({
      useAdvanced: true,
      operators: { ...operators.value }
    });
  } else if (preset.query) {
    searchQuery.value = preset.query;
    emitUpdate({
      useAdvanced: false,
      query: preset.query,
      operators: {}
    });
  }
};

const handleSubmit = () => {
  // Force immediate search on Enter key
  if (props.search.useAdvanced) {
    updateOperators();
  } else {
    emitUpdate({ query: searchQuery.value });
  }
};
</script>

<style scoped>
.work-order-search {
  width: 100%;
}

/* Custom styles for advanced search */
.advanced-search-panel {
  animation: slideInTop 0.2s ease-out;
}

@keyframes slideInTop {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Preset button hover effects */
.preset-button {
  transition: all 0.2s;
}

.preset-button:hover {
  transform: scale(1.05);
}
</style>