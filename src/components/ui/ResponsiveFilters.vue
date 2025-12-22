<template>
  <div class="space-y-4">
    <!-- Mobile Filter Layout -->
    <div v-if="isMobile" class="space-y-3">
      <!-- Search Bar -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          :value="searchQuery"
          @input="handleSearchInput"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'touch-manipulation': isTouch }"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          :class="{ 'touch-manipulation': isTouch }"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Filter Toggle Button -->
      <div class="flex items-center justify-between">
        <button
          @click="showMobileFilters = !showMobileFilters"
          class="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          :class="{ 'touch-manipulation': isTouch }"
        >
          <Filter class="h-5 w-5" />
          <span>Filters</span>
          <span v-if="activeFilterCount > 0" class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {{ activeFilterCount }}
          </span>
          <ChevronDown :class="{ 'rotate-180': showMobileFilters }" class="h-4 w-4 transition-transform" />
        </button>
        
        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          :class="{ 'touch-manipulation': isTouch }"
        >
          Clear All
        </button>
      </div>

      <!-- Mobile Filter Drawer -->
      <div 
        v-if="showMobileFilters"
        class="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg"
      >
        <div v-for="filter in filters" :key="filter.key" class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ filter.label }}
          </label>
          
          <!-- Text Input Filter -->
          <input
            v-if="filter.type === 'text'"
            :value="getFilterValue(filter.key)"
            @input="updateFilter(filter.key, ($event.target as HTMLInputElement).value)"
            type="text"
            :placeholder="filter.placeholder"
            class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :class="{ 'touch-manipulation': isTouch }"
          />
          
          <!-- Select Filter -->
          <select
            v-else-if="filter.type === 'select'"
            :value="getFilterValue(filter.key)"
            @change="updateFilter(filter.key, ($event.target as HTMLSelectElement).value)"
            class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :class="{ 'touch-manipulation': isTouch }"
          >
            <option value="">{{ filter.placeholder || `All ${filter.label}` }}</option>
            <option v-for="option in filter.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          
          <!-- Multi-Select Filter -->
          <div v-else-if="filter.type === 'multi-select'" class="space-y-2">
            <div class="max-h-32 overflow-y-auto border border-gray-300 rounded-lg">
              <label
                v-for="option in filter.options"
                :key="option.value"
                class="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                :class="{ 'touch-manipulation': isTouch }"
              >
                <input
                  type="checkbox"
                  :checked="isOptionSelected(filter.key, option.value)"
                  @change="toggleMultiSelectOption(filter.key, option.value)"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  :class="{ 'touch-manipulation': isTouch }"
                />
                <span class="ml-3 text-sm text-gray-700">{{ option.label }}</span>
              </label>
            </div>
          </div>
          
          <!-- Date Range Filter -->
          <div v-else-if="filter.type === 'date-range'" class="space-y-2">
            <input
              :value="getFilterValue(`${filter.key}_start`)"
              @input="updateFilter(`${filter.key}_start`, ($event.target as HTMLInputElement).value)"
              type="date"
              class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'touch-manipulation': isTouch }"
            />
            <input
              :value="getFilterValue(`${filter.key}_end`)"
              @input="updateFilter(`${filter.key}_end`, ($event.target as HTMLInputElement).value)"
              type="date"
              class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'touch-manipulation': isTouch }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Tablet Filter Layout -->
    <div v-else-if="isTablet" class="space-y-4">
      <!-- Top Row: Search + Quick Actions -->
      <div class="flex items-center space-x-3">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            :value="searchQuery"
            @input="handleSearchInput"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :class="{ 'touch-manipulation': isTouch }"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            :class="{ 'touch-manipulation': isTouch }"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        
        <button
          @click="showTabletFilters = !showTabletFilters"
          class="flex items-center space-x-2 px-3 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          :class="{ 'touch-manipulation': isTouch }"
        >
          <Filter class="h-4 w-4" />
          <span class="hidden sm:inline">Filters</span>
          <span v-if="activeFilterCount > 0" class="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {{ activeFilterCount }}
          </span>
        </button>
        
        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          :class="{ 'touch-manipulation': isTouch }"
        >
          Clear
        </button>
      </div>

      <!-- Filter Row -->
      <div 
        v-if="showTabletFilters"
        class="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg"
      >
        <div v-for="filter in filters" :key="filter.key" class="space-y-1">
          <label class="block text-xs font-medium text-gray-700">
            {{ filter.label }}
          </label>
          
          <!-- Text Input -->
          <input
            v-if="filter.type === 'text'"
            :value="getFilterValue(filter.key)"
            @input="updateFilter(filter.key, ($event.target as HTMLInputElement).value)"
            type="text"
            :placeholder="filter.placeholder"
            class="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :class="{ 'touch-manipulation': isTouch }"
          />
          
          <!-- Select -->
          <select
            v-else-if="filter.type === 'select'"
            :value="getFilterValue(filter.key)"
            @change="updateFilter(filter.key, ($event.target as HTMLSelectElement).value)"
            class="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :class="{ 'touch-manipulation': isTouch }"
          >
            <option value="">{{ filter.placeholder || `All ${filter.label}` }}</option>
            <option v-for="option in filter.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Desktop Filter Layout -->
    <div v-else class="space-y-4">
      <!-- Search Bar -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          :value="searchQuery"
          @input="handleSearchInput"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Filter Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div v-for="filter in filters" :key="filter.key" class="space-y-1">
          <label class="block text-sm font-medium text-gray-700">
            {{ filter.label }}
          </label>
          
          <!-- Text Input -->
          <input
            v-if="filter.type === 'text'"
            :value="getFilterValue(filter.key)"
            @input="updateFilter(filter.key, ($event.target as HTMLInputElement).value)"
            type="text"
            :placeholder="filter.placeholder"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <!-- Select -->
          <select
            v-else-if="filter.type === 'select'"
            :value="getFilterValue(filter.key)"
            @change="updateFilter(filter.key, ($event.target as HTMLSelectElement).value)"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{{ filter.placeholder || `All ${filter.label}` }}</option>
            <option v-for="option in filter.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          
          <!-- Date Range -->
          <div v-else-if="filter.type === 'date-range'" class="space-y-2">
            <input
              :value="getFilterValue(`${filter.key}_start`)"
              @input="updateFilter(`${filter.key}_start`, ($event.target as HTMLInputElement).value)"
              type="date"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              :value="getFilterValue(`${filter.key}_end`)"
              @input="updateFilter(`${filter.key}_end`, ($event.target as HTMLInputElement).value)"
              type="date"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <!-- Clear Button -->
        <div class="flex items-end">
          <button
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            class="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>

    <!-- Results Summary -->
    <div class="flex items-center justify-between text-sm text-gray-600">
      <div>
        {{ resultsSummary }}
        <span v-if="hasActiveFilters" class="text-blue-600 ml-1">(filtered)</span>
      </div>
      <div v-if="showQuickFilters" class="flex items-center space-x-2">
        <span class="hidden sm:inline">Quick:</span>
        <button
          v-for="quickFilter in quickFilters"
          :key="quickFilter.key"
          @click="applyQuickFilter(quickFilter)"
          class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          :class="{ 'touch-manipulation': isTouch }"
        >
          {{ quickFilter.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Filter, X, ChevronDown } from 'lucide-vue-next';
import { useResponsive } from '@/composables/useResponsive';

interface FilterOption {
  label: string;
  value: string | number;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multi-select' | 'date-range';
  placeholder?: string;
  options?: FilterOption[];
}

interface QuickFilter {
  key: string;
  label: string;
  filters: Record<string, any>;
}

interface Props {
  searchQuery?: string;
  searchPlaceholder?: string;
  filters: FilterConfig[];
  filterValues: Record<string, any>;
  totalItems: number;
  filteredItems: number;
  quickFilters?: QuickFilter[];
  showQuickFilters?: boolean;
}

interface Emits {
  'update:search-query': [value: string];
  'update:filter-values': [values: Record<string, any>];
  'clear-all-filters': [];
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  searchPlaceholder: 'Search...',
  quickFilters: () => [],
  showQuickFilters: false
});

const emit = defineEmits<Emits>();

// Responsive detection
const { isMobile, isTablet, isDesktop, isTouch } = useResponsive();

// Local state
const showMobileFilters = ref(false);
const showTabletFilters = ref(false);

// Computed
const activeFilterCount = computed(() => {
  let count = 0;
  
  // Count search query
  if (props.searchQuery) count++;
  
  // Count active filters
  for (const [key, value] of Object.entries(props.filterValues)) {
    if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
      count++;
    }
  }
  
  return count;
});

const hasActiveFilters = computed(() => activeFilterCount.value > 0);

const resultsSummary = computed(() => {
  if (props.filteredItems === props.totalItems) {
    return `Showing ${props.totalItems} items`;
  }
  return `Showing ${props.filteredItems} of ${props.totalItems} items`;
});

// Methods
const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:search-query', target.value);
};

const clearSearch = () => {
  emit('update:search-query', '');
};

const getFilterValue = (key: string) => {
  return props.filterValues[key] || '';
};

const updateFilter = (key: string, value: any) => {
  const newValues = { ...props.filterValues };
  
  if (value === '' || value === null || value === undefined) {
    delete newValues[key];
  } else {
    newValues[key] = value;
  }
  
  emit('update:filter-values', newValues);
};

const isOptionSelected = (filterKey: string, optionValue: string | number) => {
  const value = props.filterValues[filterKey];
  if (Array.isArray(value)) {
    return value.includes(optionValue);
  }
  return false;
};

const toggleMultiSelectOption = (filterKey: string, optionValue: string | number) => {
  const currentValue = props.filterValues[filterKey] || [];
  const newValue = Array.isArray(currentValue) ? [...currentValue] : [];
  
  const index = newValue.indexOf(optionValue);
  if (index > -1) {
    newValue.splice(index, 1);
  } else {
    newValue.push(optionValue);
  }
  
  updateFilter(filterKey, newValue.length > 0 ? newValue : null);
};

const clearAllFilters = () => {
  emit('clear-all-filters');
  showMobileFilters.value = false;
  showTabletFilters.value = false;
};

const applyQuickFilter = (quickFilter: QuickFilter) => {
  emit('update:filter-values', { ...props.filterValues, ...quickFilter.filters });
};
</script>

<style scoped>
.touch-manipulation {
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Ensure touch targets are at least 44px */
@media (hover: none) and (pointer: coarse) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
  
  input,
  select {
    min-height: 44px;
  }
  
  input[type="checkbox"] {
    min-height: 20px;
    min-width: 20px;
  }
}

/* Focus styles for accessibility */
button:focus,
input:focus,
select:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Smooth transitions */
.rotate-180 {
  transform: rotate(180deg);
}

/* Loading animation for async operations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>