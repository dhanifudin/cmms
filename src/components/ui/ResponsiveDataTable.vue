<template>
  <div class="relative">
    <!-- Mobile Card Layout -->
    <div v-if="tableLayout === 'cards'" class="space-y-3">
      <!-- Selection Header -->
      <div v-if="showBulkSelection && (selectedItems.length > 0 || showSelectAll)" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate="isPartialSelection"
              @change="$emit('select-all-toggle')"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              :class="{ 'touch-manipulation': isTouch }"
            />
            <span class="text-sm font-medium text-blue-900">
              {{ selectionSummary }}
            </span>
          </div>
          <button
            v-if="selectedItems.length > 0"
            @click="$emit('clear-selection')"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            :class="{ 'touch-manipulation': isTouch }"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Cards -->
      <div class="space-y-3">
        <div
          v-for="(item, index) in items"
          :key="getItemKey(item, index)"
          :class="[
            'bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200',
            isItemSelected(item) ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300',
            { 'cursor-pointer': allowSelection, 'touch-manipulation': isTouch }
          ]"
          @click="handleItemClick(item, index)"
          :tabindex="allowSelection ? 0 : undefined"
          @keydown.enter="handleItemClick(item, index)"
          @keydown.space.prevent="handleItemClick(item, index)"
          role="article"
          :aria-selected="allowSelection ? isItemSelected(item) : undefined"
        >
          <!-- Selection Checkbox -->
          <div v-if="showBulkSelection" class="flex items-start space-x-3 mb-3">
            <input
              type="checkbox"
              :checked="isItemSelected(item)"
              @change="$emit('item-select', item)"
              @click.stop
              class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              :class="{ 'touch-manipulation': isTouch }"
            />
            <div class="flex-1">
              <slot 
                name="card-header" 
                :item="item" 
                :index="index"
                :is-selected="isItemSelected(item)"
              >
                <div class="font-medium text-gray-900">{{ getDisplayValue(item, primaryField) }}</div>
              </slot>
            </div>
          </div>

          <!-- Main Content -->
          <div :class="{ 'ml-7': showBulkSelection }">
            <slot 
              name="card-content" 
              :item="item" 
              :index="index"
              :is-selected="isItemSelected(item)"
            >
              <!-- Default card content -->
              <div class="space-y-2">
                <div v-for="field in cardFields" :key="field.key" class="flex justify-between items-center">
                  <span class="text-sm text-gray-500">{{ field.label }}</span>
                  <span class="text-sm font-medium text-gray-900">
                    <component
                      v-if="field.component"
                      :is="field.component"
                      :value="getDisplayValue(item, field.key)"
                      :item="item"
                    />
                    <span v-else>{{ getDisplayValue(item, field.key) }}</span>
                  </span>
                </div>
              </div>
            </slot>

            <!-- Actions -->
            <div v-if="cardActions.length > 0" class="mt-3 pt-3 border-t border-gray-100">
              <div class="flex items-center justify-end space-x-2">
                <button
                  v-for="action in cardActions"
                  :key="action.key"
                  @click.stop="$emit('action', action.key, item, index)"
                  :class="[
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    action.variant === 'primary' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    { 'touch-manipulation': isTouch }
                  ]"
                  :disabled="action.disabled?.(item)"
                >
                  <component v-if="action.icon" :is="action.icon" class="h-4 w-4 mr-1" />
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tablet Compact Layout -->
    <div v-else-if="tableLayout === 'compact'" class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th v-if="showBulkSelection" class="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate="isPartialSelection"
                  @change="$emit('select-all-toggle')"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  :class="{ 'touch-manipulation': isTouch }"
                />
              </th>
              <th 
                v-for="column in compactColumns"
                :key="column.key"
                :class="[
                  'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.sortable ? 'cursor-pointer hover:text-gray-700 select-none' : ''
                ]"
                @click="column.sortable ? $emit('sort', column.key) : undefined"
                :tabindex="column.sortable ? 0 : undefined"
                @keydown.enter="column.sortable ? $emit('sort', column.key) : undefined"
                @keydown.space.prevent="column.sortable ? $emit('sort', column.key) : undefined"
              >
                <div class="flex items-center space-x-1">
                  <span>{{ column.label }}</span>
                  <component v-if="column.sortable" :is="getSortIcon(column.key)" class="h-4 w-4" />
                </div>
              </th>
              <th v-if="tableActions.length > 0" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(item, index) in items"
              :key="getItemKey(item, index)"
              :class="[
                'hover:bg-gray-50 transition-colors',
                isItemSelected(item) ? 'bg-blue-50' : ''
              ]"
              @click="allowSelection ? handleItemClick(item, index) : undefined"
              :tabindex="allowSelection ? 0 : undefined"
              @keydown.enter="allowSelection ? handleItemClick(item, index) : undefined"
              @keydown.space.prevent="allowSelection ? handleItemClick(item, index) : undefined"
            >
              <td v-if="showBulkSelection" class="px-4 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  :checked="isItemSelected(item)"
                  @change="$emit('item-select', item)"
                  @click.stop
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  :class="{ 'touch-manipulation': isTouch }"
                />
              </td>
              <td 
                v-for="column in compactColumns"
                :key="column.key"
                class="px-4 py-4 whitespace-nowrap text-sm"
              >
                <slot 
                  :name="`column-${column.key}`" 
                  :item="item" 
                  :value="getDisplayValue(item, column.key)"
                  :index="index"
                >
                  <component
                    v-if="column.component"
                    :is="column.component"
                    :value="getDisplayValue(item, column.key)"
                    :item="item"
                  />
                  <span v-else :class="column.className">
                    {{ getDisplayValue(item, column.key) }}
                  </span>
                </slot>
              </td>
              <td v-if="tableActions.length > 0" class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    v-for="action in tableActions"
                    :key="action.key"
                    @click.stop="$emit('action', action.key, item, index)"
                    :class="[
                      'text-sm font-medium transition-colors',
                      action.variant === 'primary' 
                        ? 'text-blue-600 hover:text-blue-800'
                        : 'text-gray-600 hover:text-gray-800',
                      { 'touch-manipulation': isTouch }
                    ]"
                    :disabled="action.disabled?.(item)"
                  >
                    {{ action.label }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Desktop Full Layout -->
    <div v-else class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th v-if="showBulkSelection" class="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate="isPartialSelection"
                  @change="$emit('select-all-toggle')"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th 
                v-for="column in fullColumns"
                :key="column.key"
                :class="[
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.sortable ? 'cursor-pointer hover:text-gray-700 select-none' : ''
                ]"
                @click="column.sortable ? $emit('sort', column.key) : undefined"
                :tabindex="column.sortable ? 0 : undefined"
                @keydown.enter="column.sortable ? $emit('sort', column.key) : undefined"
                @keydown.space.prevent="column.sortable ? $emit('sort', column.key) : undefined"
              >
                <div class="flex items-center space-x-1">
                  <span>{{ column.label }}</span>
                  <component v-if="column.sortable" :is="getSortIcon(column.key)" class="h-4 w-4" />
                </div>
              </th>
              <th v-if="tableActions.length > 0" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(item, index) in items"
              :key="getItemKey(item, index)"
              :class="[
                'hover:bg-gray-50 transition-colors',
                isItemSelected(item) ? 'bg-blue-50' : ''
              ]"
              @click="allowSelection ? handleItemClick(item, index) : undefined"
              :tabindex="allowSelection ? 0 : undefined"
              @keydown.enter="allowSelection ? handleItemClick(item, index) : undefined"
              @keydown.space.prevent="allowSelection ? handleItemClick(item, index) : undefined"
            >
              <td v-if="showBulkSelection" class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  :checked="isItemSelected(item)"
                  @change="$emit('item-select', item)"
                  @click.stop
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </td>
              <td 
                v-for="column in fullColumns"
                :key="column.key"
                class="px-6 py-4 whitespace-nowrap text-sm"
              >
                <slot 
                  :name="`column-${column.key}`" 
                  :item="item" 
                  :value="getDisplayValue(item, column.key)"
                  :index="index"
                >
                  <component
                    v-if="column.component"
                    :is="column.component"
                    :value="getDisplayValue(item, column.key)"
                    :item="item"
                  />
                  <span v-else :class="column.className">
                    {{ getDisplayValue(item, column.key) }}
                  </span>
                </slot>
              </td>
              <td v-if="tableActions.length > 0" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-4">
                  <button
                    v-for="action in tableActions"
                    :key="action.key"
                    @click.stop="$emit('action', action.key, item, index)"
                    :class="[
                      'text-sm font-medium transition-colors',
                      action.variant === 'primary' 
                        ? 'text-blue-600 hover:text-blue-800'
                        : 'text-gray-600 hover:text-gray-800'
                    ]"
                    :disabled="action.disabled?.(item)"
                  >
                    {{ action.label }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="text-center py-12">
      <slot name="empty-state">
        <div class="text-gray-400">
          <component :is="emptyStateIcon" class="mx-auto h-12 w-12 mb-4" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">{{ emptyStateTitle }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ emptyStateMessage }}</p>
        </div>
      </slot>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg"
    >
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>{{ loadingMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowUpDown, Package } from 'lucide-vue-next';
import { useResponsive } from '@/composables/useResponsive';

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  component?: any;
  className?: string;
  mobileHidden?: boolean;
  tabletHidden?: boolean;
}

interface TableAction {
  key: string;
  label: string;
  icon?: any;
  variant?: 'primary' | 'secondary';
  disabled?: (item: any) => boolean;
}

interface CardField {
  key: string;
  label: string;
  component?: any;
}

interface Props {
  items: any[];
  columns: TableColumn[];
  selectedItems?: any[];
  primaryField?: string;
  loading?: boolean;
  loadingMessage?: string;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  emptyStateIcon?: any;
  showBulkSelection?: boolean;
  showSelectAll?: boolean;
  allowSelection?: boolean;
  isAllSelected?: boolean;
  isPartialSelection?: boolean;
  currentSort?: string;
  sortDirection?: 'asc' | 'desc';
  
  // Card layout specific
  cardFields?: CardField[];
  cardActions?: TableAction[];
  
  // Table layout specific
  tableActions?: TableAction[];
}

interface Emits {
  'item-select': [item: any];
  'select-all-toggle': [];
  'clear-selection': [];
  'sort': [column: string];
  'action': [actionKey: string, item: any, index: number];
  'item-click': [item: any, index: number];
}

const props = withDefaults(defineProps<Props>(), {
  selectedItems: () => [],
  primaryField: 'id',
  loading: false,
  loadingMessage: 'Loading...',
  emptyStateTitle: 'No items found',
  emptyStateMessage: 'Try adjusting your filters or add new items.',
  emptyStateIcon: Package,
  showBulkSelection: false,
  showSelectAll: false,
  allowSelection: false,
  isAllSelected: false,
  isPartialSelection: false,
  currentSort: '',
  sortDirection: 'asc',
  cardFields: () => [],
  cardActions: () => [],
  tableActions: () => []
});

const emit = defineEmits<Emits>();

// Responsive detection
const { getTableLayout, isTouch } = useResponsive();
const tableLayout = getTableLayout();

// Computed columns based on layout
const compactColumns = computed(() => 
  props.columns.filter(col => !col.tabletHidden)
);

const fullColumns = computed(() => 
  props.columns.filter(col => !col.mobileHidden && !col.tabletHidden)
);

// Selection helpers
const selectionSummary = computed(() => {
  const count = props.selectedItems?.length || 0;
  if (count === 0) return 'Select items';
  if (count === 1) return '1 item selected';
  return `${count} items selected`;
});

// Utility functions
const getItemKey = (item: any, index: number): string => {
  return item.id || item[props.primaryField] || `item-${index}`;
};

const isItemSelected = (item: any): boolean => {
  if (!props.selectedItems) return false;
  const itemId = item.id || item[props.primaryField];
  return props.selectedItems.some(selected => {
    const selectedId = selected.id || selected[props.primaryField];
    return selectedId === itemId;
  });
};

const getDisplayValue = (item: any, field: string): any => {
  return field.split('.').reduce((obj, key) => obj?.[key], item) ?? '';
};

const getSortIcon = (column: string) => {
  return ArrowUpDown; // Could be enhanced to show current sort direction
};

const handleItemClick = (item: any, index: number) => {
  if (props.allowSelection) {
    emit('item-select', item);
  }
  emit('item-click', item, index);
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
  
  input[type="checkbox"] {
    min-height: 20px;
    min-width: 20px;
  }
}

/* Focus styles for accessibility */
button:focus,
input:focus,
th[tabindex]:focus,
tr[tabindex]:focus,
div[tabindex]:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Custom checkbox indeterminate styles */
input[type="checkbox"]:indeterminate {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M2 8h12'/%3e%3c/svg%3e");
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>