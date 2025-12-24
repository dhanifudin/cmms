<template>
  <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div class="flex flex-wrap items-end gap-4">
      <!-- Date Range -->
      <div class="flex-shrink-0">
        <label class="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
        <div class="flex items-center space-x-2">
          <div class="relative">
            <Calendar class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              :value="dateRange?.start"
              @input="updateDateStart"
              class="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
            />
          </div>
          <span class="text-gray-500 text-sm">to</span>
          <input
            type="date"
            :value="dateRange?.end"
            @input="updateDateEnd"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
          />
        </div>
      </div>

      <!-- Quick Date Presets -->
      <div class="flex-shrink-0">
        <label class="block text-xs font-medium text-gray-700 mb-1">Quick Select</label>
        <select
          v-model="quickRange"
          @change="applyQuickRange"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Custom</option>
          <option value="today">Today</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <!-- Terminal Filter -->
      <div v-if="availableTerminals.length > 0" class="flex-1 min-w-[200px]">
        <label class="block text-xs font-medium text-gray-700 mb-1">Terminals</label>
        <div class="relative">
          <button
            @click="showTerminalDropdown = !showTerminalDropdown"
            class="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <span class="truncate">
              {{ selectedTerminals.length === 0
                ? 'All Terminals'
                : `${selectedTerminals.length} selected` }}
            </span>
            <ChevronDown class="h-4 w-4 text-gray-400 flex-shrink-0" />
          </button>

          <!-- Terminal dropdown -->
          <div
            v-if="showTerminalDropdown"
            class="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            <div class="p-2 border-b border-gray-100">
              <button
                @click="toggleAllTerminals"
                class="text-xs text-blue-600 hover:text-blue-800"
              >
                {{ selectedTerminals.length === availableTerminals.length ? 'Clear all' : 'Select all' }}
              </button>
            </div>
            <label
              v-for="terminal in availableTerminals"
              :key="terminal.id"
              class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="selectedTerminals.includes(terminal.id)"
                @change="toggleTerminal(terminal.id)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">{{ terminal.name }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Status Filter -->
      <div v-if="availableStatuses.length > 0" class="flex-shrink-0">
        <label class="block text-xs font-medium text-gray-700 mb-1">Status</label>
        <div class="relative">
          <button
            @click="showStatusDropdown = !showStatusDropdown"
            class="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
          >
            <span class="truncate">
              {{ selectedStatuses.length === 0
                ? 'All Statuses'
                : `${selectedStatuses.length} selected` }}
            </span>
            <ChevronDown class="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
          </button>

          <!-- Status dropdown -->
          <div
            v-if="showStatusDropdown"
            class="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            <div class="p-2 border-b border-gray-100">
              <button
                @click="toggleAllStatuses"
                class="text-xs text-blue-600 hover:text-blue-800"
              >
                {{ selectedStatuses.length === availableStatuses.length ? 'Clear all' : 'Select all' }}
              </button>
            </div>
            <label
              v-for="status in availableStatuses"
              :key="status.id"
              class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="selectedStatuses.includes(status.id)"
                @change="toggleStatus(status.id)"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">{{ status.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center space-x-2 flex-shrink-0">
        <button
          @click="handleApply"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Filter class="h-4 w-4 mr-2" />
          Apply
        </button>
        <button
          @click="handleReset"
          class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <X class="h-4 w-4 mr-1" />
          Reset
        </button>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="mt-3 flex flex-wrap items-center gap-2">
      <span class="text-xs text-gray-500">Active filters:</span>

      <span
        v-for="terminalId in selectedTerminals"
        :key="`terminal-${terminalId}`"
        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
      >
        {{ getTerminalName(terminalId) }}
        <button
          @click="toggleTerminal(terminalId)"
          class="ml-1 text-blue-600 hover:text-blue-800"
        >
          <X class="h-3 w-3" />
        </button>
      </span>

      <span
        v-for="statusId in selectedStatuses"
        :key="`status-${statusId}`"
        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
      >
        {{ getStatusLabel(statusId) }}
        <button
          @click="toggleStatus(statusId)"
          class="ml-1 text-green-600 hover:text-green-800"
        >
          <X class="h-3 w-3" />
        </button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Calendar, ChevronDown, Filter, X } from 'lucide-vue-next';

export interface DateRange {
  start: string;
  end: string;
}

interface Props {
  dateRange?: DateRange;
  availableTerminals?: { id: string; name: string }[];
  availableStatuses?: { id: string; label: string }[];
  selectedTerminals?: string[];
  selectedStatuses?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  dateRange: () => ({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    end: new Date().toISOString().split('T')[0] || ''
  }),
  availableTerminals: () => [],
  availableStatuses: () => [],
  selectedTerminals: () => [],
  selectedStatuses: () => []
});

const emit = defineEmits<{
  (e: 'update:date-range', value: DateRange): void;
  (e: 'update:selected-terminals', value: string[]): void;
  (e: 'update:selected-statuses', value: string[]): void;
  (e: 'apply'): void;
  (e: 'reset'): void;
}>();

const quickRange = ref('');
const showTerminalDropdown = ref(false);
const showStatusDropdown = ref(false);

const hasActiveFilters = computed(() => {
  return props.selectedTerminals.length > 0 || props.selectedStatuses.length > 0;
});

const updateDateStart = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:date-range', {
    start: target.value,
    end: props.dateRange?.end || new Date().toISOString().split('T')[0] || ''
  });
  quickRange.value = '';
};

const updateDateEnd = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:date-range', {
    start: props.dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    end: target.value
  });
  quickRange.value = '';
};

const applyQuickRange = () => {
  const now = new Date();
  const start = new Date();

  switch (quickRange.value) {
    case 'today':
      // start is today
      break;
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      break;
    case 'month':
      start.setDate(1);
      break;
    case 'year':
      start.setMonth(0, 1);
      break;
    default:
      return;
  }

  emit('update:date-range', {
    start: start.toISOString().split('T')[0] || '',
    end: now.toISOString().split('T')[0] || ''
  });
};

const toggleTerminal = (terminalId: string) => {
  const current = [...props.selectedTerminals];
  const index = current.indexOf(terminalId);

  if (index === -1) {
    current.push(terminalId);
  } else {
    current.splice(index, 1);
  }

  emit('update:selected-terminals', current);
};

const toggleAllTerminals = () => {
  if (props.selectedTerminals.length === props.availableTerminals.length) {
    emit('update:selected-terminals', []);
  } else {
    emit('update:selected-terminals', props.availableTerminals.map(t => t.id));
  }
};

const toggleStatus = (statusId: string) => {
  const current = [...props.selectedStatuses];
  const index = current.indexOf(statusId);

  if (index === -1) {
    current.push(statusId);
  } else {
    current.splice(index, 1);
  }

  emit('update:selected-statuses', current);
};

const toggleAllStatuses = () => {
  if (props.selectedStatuses.length === props.availableStatuses.length) {
    emit('update:selected-statuses', []);
  } else {
    emit('update:selected-statuses', props.availableStatuses.map(s => s.id));
  }
};

const getTerminalName = (id: string): string => {
  return props.availableTerminals.find(t => t.id === id)?.name || id;
};

const getStatusLabel = (id: string): string => {
  return props.availableStatuses.find(s => s.id === id)?.label || id;
};

const handleApply = () => {
  showTerminalDropdown.value = false;
  showStatusDropdown.value = false;
  emit('apply');
};

const handleReset = () => {
  quickRange.value = '';
  emit('update:date-range', {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    end: new Date().toISOString().split('T')[0] || ''
  });
  emit('update:selected-terminals', []);
  emit('update:selected-statuses', []);
  emit('reset');
};

// Close dropdowns when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('[data-dropdown]')) {
    showTerminalDropdown.value = false;
    showStatusDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
