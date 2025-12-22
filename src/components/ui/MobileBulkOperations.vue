<template>
  <div>
    <!-- Mobile Floating Action Button -->
    <div v-if="isMobile && (typeof selectedCount === 'number' ? selectedCount > 0 : selectedCount === 'all')">
      <!-- Backdrop -->
      <div 
        v-if="showActions"
        class="fixed inset-0 bg-black bg-opacity-25 z-40"
        @click="showActions = false"
      ></div>

      <!-- Floating Action Menu -->
      <div class="fixed bottom-6 right-6 z-50">
        <!-- Main FAB -->
        <button
          @click="toggleActions"
          :class="[
            'w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 flex items-center justify-center',
            showActions ? 'rotate-45' : '',
            { 'touch-manipulation': isTouch }
          ]"
        >
          <Plus class="h-6 w-6" />
        </button>

        <!-- Action Menu -->
        <div 
          v-if="showActions"
          class="absolute bottom-16 right-0 space-y-3"
        >
          <div
            v-for="(operation, index) in visibleOperations"
            :key="operation.id"
            :style="{ 
              transform: `translateY(-${(index + 1) * 60}px)`,
              transition: `transform 0.2s ease-out ${index * 50}ms`
            }"
            class="flex items-center space-x-3"
          >
            <!-- Action Label -->
            <div class="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
              {{ operation.label }}
            </div>
            
            <!-- Action Button -->
            <button
              @click="handleOperation(operation)"
              :disabled="isOperationDisabled(operation)"
              :class="[
                'w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200',
                getActionButtonClass(operation),
                { 'touch-manipulation': isTouch }
              ]"
            >
              <component 
                v-if="operation.icon" 
                :is="getIcon(operation.icon)" 
                class="h-5 w-5" 
              />
              <MoreHorizontal v-else class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Selection Badge -->
      <div class="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
        <div class="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
          <CheckCircle class="h-4 w-4" />
          <span class="text-sm font-medium">
            {{ selectionSummary }}
          </span>
          <button
            @click="$emit('clear-selection')"
            class="ml-2 text-blue-200 hover:text-white"
            :class="{ 'touch-manipulation': isTouch }"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Tablet Slide-up Panel -->
    <div v-if="isTablet && (typeof selectedCount === 'number' ? selectedCount > 0 : selectedCount === 'all')">
      <!-- Backdrop -->
      <div 
        v-if="showActions"
        class="fixed inset-0 bg-black bg-opacity-25 z-40"
        @click="showActions = false"
      ></div>

      <!-- Bottom Panel -->
      <div 
        :class="[
          'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 transition-transform duration-300 ease-out',
          showActions ? 'translate-y-0' : 'translate-y-full'
        ]"
      >
        <div class="p-4">
          <!-- Panel Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <CheckCircle class="h-5 w-5 text-blue-600" />
              <span class="font-medium text-gray-900">{{ selectionSummary }}</span>
            </div>
            <button
              @click="showActions = false"
              class="text-gray-400 hover:text-gray-600"
              :class="{ 'touch-manipulation': isTouch }"
            >
              <ChevronDown class="h-5 w-5" />
            </button>
          </div>

          <!-- Actions Grid -->
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="operation in visibleOperations"
              :key="operation.id"
              @click="handleOperation(operation)"
              :disabled="isOperationDisabled(operation)"
              :class="[
                'flex items-center space-x-3 p-4 border border-gray-200 rounded-lg text-left transition-colors duration-200',
                getTabletActionClass(operation),
                { 'touch-manipulation': isTouch }
              ]"
            >
              <component 
                v-if="operation.icon" 
                :is="getIcon(operation.icon)" 
                class="h-5 w-5 flex-shrink-0" 
              />
              <div>
                <div class="font-medium text-sm">{{ operation.label }}</div>
                <div v-if="operation.label" class="text-xs text-gray-500 mt-1">
                  {{ operation.label }}
                </div>
              </div>
            </button>
          </div>

          <!-- Clear Selection -->
          <button
            @click="$emit('clear-selection')"
            class="w-full mt-4 px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            :class="{ 'touch-manipulation': isTouch }"
          >
            Clear Selection
          </button>
        </div>
      </div>

      <!-- Trigger Button -->
      <button
        v-if="!showActions"
        @click="showActions = true"
        class="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center z-50"
        :class="{ 'touch-manipulation': isTouch }"
      >
        <Settings class="h-6 w-6" />
      </button>
    </div>

    <!-- Desktop - Use original BulkOperationsBar -->
    <div v-if="isDesktop && (typeof selectedCount === 'number' ? selectedCount > 0 : selectedCount === 'all')">
      <BulkOperationsBar
        :selected-count="selectedCount"
        :is-all-selected="isAllSelected"
        :is-partial-selection="isPartialSelection"
        :is-all-selected-across-pages="isAllSelectedAcrossPages"
        :operations="operations"
        :is-operation-in-progress="isOperationInProgress"
        :current-operation="currentOperation"
        :allow-select-all="allowSelectAll"
        :allow-select-across-pages="allowSelectAcrossPages"
        :selection-error="selectionError"
        @select-all="$emit('select-all')"
        @select-all-across-pages="$emit('select-all-across-pages')"
        @clear-selection="$emit('clear-selection')"
        @execute-operation="$emit('execute-operation', $event)"
      />
    </div>

    <!-- Confirmation Modal -->
    <div 
      v-if="confirmationModal.show"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeConfirmationModal"
    >
      <div 
        :class="[
          'relative mx-auto p-5 border shadow-lg rounded-lg bg-white',
          isMobile ? 'top-1/2 transform -translate-y-1/2 w-11/12 max-w-sm' : 'top-20 w-96'
        ]"
        @click.stop
      >
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <AlertTriangle class="h-6 w-6 text-yellow-600" />
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">
            Confirm Operation
          </h3>
          <p class="text-sm text-gray-500 mb-6">
            {{ confirmationModal.message }}
          </p>
          <div :class="['flex', isMobile ? 'flex-col space-y-3' : 'flex-row justify-center space-x-3']">
            <button
              @click="closeConfirmationModal"
              :class="[
                'px-4 py-2 text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2',
                isMobile ? 'w-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-300' : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-300',
                { 'touch-manipulation': isTouch }
              ]"
            >
              Cancel
            </button>
            <button
              @click="confirmOperation"
              :disabled="isOperationInProgress"
              :class="[
                'px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                isMobile ? 'w-full' : '',
                confirmationModal.operation?.variant === 'destructive'
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
                { 'touch-manipulation': isTouch }
              ]"
            >
              {{ isOperationInProgress ? 'Processing...' : 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div 
      v-if="toast.show"
      :class="[
        'fixed z-50 transition-all duration-300 ease-out',
        isMobile 
          ? 'bottom-32 left-4 right-4' 
          : 'top-6 right-6 max-w-sm'
      ]"
    >
      <div 
        :class="[
          'bg-white border rounded-lg shadow-lg p-4 flex items-center space-x-3',
          toast.type === 'success' ? 'border-green-200' : 'border-red-200'
        ]"
      >
        <div 
          :class="[
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'
          ]"
        >
          <CheckCircle 
            v-if="toast.type === 'success'"
            :class="['h-5 w-5', toast.type === 'success' ? 'text-green-600' : 'text-red-600']" 
          />
          <AlertTriangle 
            v-else
            class="h-5 w-5 text-red-600" 
          />
        </div>
        <div class="flex-1">
          <p :class="['text-sm font-medium', toast.type === 'success' ? 'text-green-800' : 'text-red-800']">
            {{ toast.message }}
          </p>
        </div>
        <button
          @click="toast.show = false"
          :class="['text-gray-400 hover:text-gray-600', { 'touch-manipulation': isTouch }]"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Settings,
  MoreHorizontal,
  Trash2,
  Archive,
  Download,
  UserPlus
} from 'lucide-vue-next';

import BulkOperationsBar from './BulkOperationsBar.vue';
import { useResponsive } from '@/composables/useResponsive';
import type { BulkOperation } from '@/composables/useBulkOperations';

interface Props {
  selectedCount: number | 'all';
  isAllSelected: boolean;
  isPartialSelection: boolean;
  isAllSelectedAcrossPages: boolean;
  operations: BulkOperation[];
  isOperationInProgress: boolean;
  currentOperation: string | null;
  allowSelectAll?: boolean;
  allowSelectAcrossPages?: boolean;
  selectionError?: string | null;
  maxVisibleOperations?: number;
}

interface Emits {
  'select-all': [];
  'select-all-across-pages': [];
  'clear-selection': [];
  'execute-operation': [operationId: string];
}

const props = withDefaults(defineProps<Props>(), {
  allowSelectAll: true,
  allowSelectAcrossPages: false,
  selectionError: null,
  maxVisibleOperations: 4
});

const emit = defineEmits<Emits>();

// Responsive detection
const { isMobile, isTablet, isDesktop, isTouch } = useResponsive();

// Local state
const showActions = ref(false);
const confirmationModal = ref<{
  show: boolean;
  operation: BulkOperation | null;
  message: string;
}>({
  show: false,
  operation: null,
  message: ''
});

const toast = ref<{
  show: boolean;
  message: string;
  type: 'success' | 'error';
}>({
  show: false,
  message: '',
  type: 'success'
});

// Computed
const selectionSummary = computed(() => {
  if (props.isAllSelectedAcrossPages) {
    return 'All items selected';
  }
  
  const count = props.selectedCount;
  if (count === 0) return 'No items selected';
  if (count === 1) return '1 item selected';
  if (count === 'all') return 'All items selected';
  return `${count} items selected`;
});

const visibleOperations = computed(() => {
  const visible = props.operations.filter(op => 
    !op.visible || op.visible([]) // We don't have access to actual items here
  );
  
  return visible.slice(0, props.maxVisibleOperations);
});

// Icon mapping
const iconMap = {
  'trash-2': Trash2,
  'archive': Archive,
  'download': Download,
  'user-plus': UserPlus,
  'more-horizontal': MoreHorizontal
};

const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || MoreHorizontal;
};

// Methods
const toggleActions = () => {
  showActions.value = !showActions.value;
};

const isOperationDisabled = (operation: BulkOperation) => {
  return operation.disabled ? operation.disabled([]) : false;
};

const getActionButtonClass = (operation: BulkOperation) => {
  const disabled = isOperationDisabled(operation);
  
  if (disabled) {
    return 'bg-gray-300 text-gray-500 cursor-not-allowed';
  }
  
  switch (operation.variant) {
    case 'destructive':
      return 'bg-red-600 text-white hover:bg-red-700';
    case 'primary':
      return 'bg-blue-600 text-white hover:bg-blue-700';
    case 'secondary':
      return 'bg-gray-600 text-white hover:bg-gray-700';
    default:
      return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  }
};

const getTabletActionClass = (operation: BulkOperation) => {
  const disabled = isOperationDisabled(operation);
  
  if (disabled) {
    return 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200';
  }
  
  switch (operation.variant) {
    case 'destructive':
      return 'hover:bg-red-50 hover:border-red-300 text-red-700';
    case 'primary':
      return 'hover:bg-blue-50 hover:border-blue-300 text-blue-700';
    default:
      return 'hover:bg-gray-50 hover:border-gray-300 text-gray-700';
  }
};

const handleOperation = async (operation: BulkOperation) => {
  if (isOperationDisabled(operation) || props.isOperationInProgress) {
    return;
  }
  
  showActions.value = false;
  
  if (operation.requiresConfirmation) {
    confirmationModal.value = {
      show: true,
      operation,
      message: operation.confirmationMessage 
        ? operation.confirmationMessage([])
        : `Are you sure you want to ${operation.label.toLowerCase()}?`
    };
  } else {
    executeOperation(operation);
  }
};

const executeOperation = async (operation: BulkOperation) => {
  try {
    emit('execute-operation', operation.id);
    
    // Show success toast
    toast.value = {
      show: true,
      message: `${operation.label} completed successfully`,
      type: 'success'
    };
    
    // Auto-hide toast
    setTimeout(() => {
      toast.value.show = false;
    }, 3000);
    
  } catch (error: any) {
    toast.value = {
      show: true,
      message: error.message || `Failed to ${operation.label.toLowerCase()}`,
      type: 'error'
    };
    
    // Auto-hide error toast
    setTimeout(() => {
      toast.value.show = false;
    }, 5000);
  }
};

const closeConfirmationModal = () => {
  if (!props.isOperationInProgress) {
    confirmationModal.value = {
      show: false,
      operation: null,
      message: ''
    };
  }
};

const confirmOperation = async () => {
  if (confirmationModal.value.operation) {
    await executeOperation(confirmationModal.value.operation);
    closeConfirmationModal();
  }
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
}

/* Focus styles for accessibility */
button:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Animation for FAB rotation */
.rotate-45 {
  transform: rotate(45deg);
}
</style>