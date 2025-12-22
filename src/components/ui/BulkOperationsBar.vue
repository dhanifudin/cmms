<template>
  <transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 transform -translate-y-2"
    enter-to-class="opacity-100 transform translate-y-0"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 transform translate-y-0"
    leave-to-class="opacity-0 transform -translate-y-2"
  >
    <div 
      v-if="show" 
      class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
      :class="className"
    >
      <div class="flex items-center justify-between">
        <!-- Selection Info -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate="isPartialSelection"
              @change="handleSelectAllChange"
              :disabled="!allowSelectAll"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label class="ml-3 text-sm font-medium text-gray-900">
              {{ selectionSummary }}
            </label>
          </div>
          
          <!-- Select All Across Pages -->
          <div v-if="allowSelectAcrossPages && (typeof selectedCount === 'number' ? selectedCount > 0 : selectedCount === 'all') && !isAllSelectedAcrossPages">
            <button
              @click="selectAllAcrossPages"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Select all items across all pages
            </button>
          </div>
          
          <!-- All Selected Across Pages Indicator -->
          <div v-if="isAllSelectedAcrossPages" class="flex items-center">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              All items selected
            </span>
            <button
              @click="clearSelection"
              class="ml-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
        </div>
        
        <!-- Operations -->
        <div class="flex items-center space-x-3">
          <template v-for="operation in visibleOperations" :key="operation.id">
            <button
              @click="handleOperation(operation)"
              :disabled="isOperationDisabled(operation) || isOperationInProgress"
              :class="getOperationButtonClass(operation)"
              class="inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
            >
              <component 
                v-if="operation.icon" 
                :is="getIcon(operation.icon)" 
                class="h-4 w-4 mr-2" 
                :class="{ 'animate-spin': isOperationInProgress && currentOperation === operation.id }"
              />
              {{ operation.label }}
            </button>
          </template>
          
          <!-- Clear Selection -->
          <button
            v-if="typeof selectedCount === 'number' ? selectedCount > 0 : selectedCount === 'all'"
            @click="clearSelection"
            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <X class="h-4 w-4 mr-2" />
            Clear
          </button>
        </div>
      </div>
      
      <!-- Error Messages -->
      <div v-if="selectionError" class="mt-3 text-sm text-red-600">
        {{ selectionError }}
      </div>
      
      <!-- Operation Feedback -->
      <div v-if="operationFeedback" class="mt-3">
        <div 
          :class="{
            'text-green-600': operationFeedback.type === 'success',
            'text-red-600': operationFeedback.type === 'error',
            'text-blue-600': operationFeedback.type === 'info'
          }"
          class="text-sm"
        >
          {{ operationFeedback.message }}
        </div>
      </div>
    </div>
  </transition>

  <!-- Confirmation Modal -->
  <div 
    v-if="confirmationModal.show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="closeConfirmationModal"
  >
    <div 
      class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
      @click.stop
    >
      <div class="mt-3 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
          <AlertTriangle class="h-6 w-6 text-yellow-600" />
        </div>
        <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">
          Confirm Operation
        </h3>
        <div class="mt-2 px-7 py-3">
          <p class="text-sm text-gray-500">
            {{ confirmationModal.message }}
          </p>
        </div>
        <div class="flex justify-center space-x-3 mt-4">
          <button
            @click="closeConfirmationModal"
            class="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            @click="confirmOperation"
            :disabled="isOperationInProgress"
            :class="{
              'bg-red-600 hover:bg-red-700 focus:ring-red-500': confirmationModal.operation?.variant === 'destructive',
              'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500': confirmationModal.operation?.variant !== 'destructive'
            }"
            class="px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isOperationInProgress ? 'Processing...' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { X, AlertTriangle, Trash2, Archive, Download, UserPlus, MoreHorizontal } from 'lucide-vue-next';
import type { BulkOperation } from '@/composables/useBulkOperations';

interface Props {
  // Selection state
  selectedCount: number | 'all';
  isAllSelected: boolean;
  isPartialSelection: boolean;
  isAllSelectedAcrossPages: boolean;
  
  // Operations
  operations: BulkOperation[];
  isOperationInProgress: boolean;
  currentOperation: string | null;
  
  // Configuration
  allowSelectAll?: boolean;
  allowSelectAcrossPages?: boolean;
  maxOperationsVisible?: number;
  
  // Error state
  selectionError?: string | null;
  
  // UI
  className?: string;
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
  maxOperationsVisible: 3,
  selectionError: null,
  className: ''
});

const emit = defineEmits<Emits>();

// Reactive state
const confirmationModal = ref<{
  show: boolean;
  operation: BulkOperation | null;
  message: string;
}>({
  show: false,
  operation: null,
  message: ''
});

const operationFeedback = ref<{
  type: 'success' | 'error' | 'info';
  message: string;
} | null>(null);

// Computed
const show = computed(() => typeof props.selectedCount === 'number' ? props.selectedCount > 0 : props.selectedCount === 'all');

const selectionSummary = computed(() => {
  if (props.isAllSelectedAcrossPages) {
    return 'All items selected across all pages';
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
  
  if (visible.length <= props.maxOperationsVisible) {
    return visible;
  }
  
  return visible.slice(0, props.maxOperationsVisible);
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
const handleSelectAllChange = () => {
  if (props.isAllSelected) {
    emit('clear-selection');
  } else {
    emit('select-all');
  }
};

const selectAllAcrossPages = () => {
  emit('select-all-across-pages');
};

const clearSelection = () => {
  emit('clear-selection');
  operationFeedback.value = null;
};

const isOperationDisabled = (operation: BulkOperation) => {
  return operation.disabled ? operation.disabled([]) : false;
};

const getOperationButtonClass = (operation: BulkOperation) => {
  const baseClasses = [];
  const disabled = isOperationDisabled(operation) || props.isOperationInProgress;
  
  if (disabled) {
    baseClasses.push('opacity-50 cursor-not-allowed');
  }
  
  switch (operation.variant) {
    case 'destructive':
      baseClasses.push('border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500');
      break;
    case 'primary':
      baseClasses.push('border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-blue-500');
      break;
    case 'secondary':
      baseClasses.push('border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 focus:ring-gray-500');
      break;
    default:
      baseClasses.push('border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500');
  }
  
  return baseClasses.join(' ');
};

const handleOperation = async (operation: BulkOperation) => {
  if (isOperationDisabled(operation) || props.isOperationInProgress) {
    return;
  }
  
  if (operation.requiresConfirmation) {
    confirmationModal.value = {
      show: true,
      operation,
      message: operation.confirmationMessage 
        ? operation.confirmationMessage([])
        : `Are you sure you want to ${operation.label.toLowerCase()}?`
    };
  } else {
    await executeOperation(operation);
  }
};

const executeOperation = async (operation: BulkOperation) => {
  try {
    operationFeedback.value = null;
    emit('execute-operation', operation.id);
    
    // Show success feedback
    await nextTick();
    operationFeedback.value = {
      type: 'success',
      message: `${operation.label} completed successfully`
    };
    
    // Clear feedback after a delay
    setTimeout(() => {
      operationFeedback.value = null;
    }, 3000);
  } catch (error: any) {
    operationFeedback.value = {
      type: 'error',
      message: error.message || `Failed to ${operation.label.toLowerCase()}`
    };
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
/* Custom checkbox indeterminate styles */
input[type="checkbox"]:indeterminate {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M2 8h12'/%3e%3c/svg%3e");
}
</style>