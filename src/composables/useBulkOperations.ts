// Enterprise-standard bulk operations for data management
import { ref, computed, watch } from 'vue';
import type { Ref } from 'vue';

export interface BulkOperationConfig<T = any> {
  // Selection behavior
  allowSelectAll: boolean;
  allowSelectAcrossPages: boolean;
  maxSelections: number | null;
  
  // Operation definitions
  operations: BulkOperation<T>[];
  
  // Callbacks
  onSelectionChange?: (selectedItems: T[], selectedIds: Set<string>) => void;
  onOperationExecute?: (operation: string, items: T[]) => Promise<void>;
  
  // UI behavior
  persistSelection: boolean;
  showSelectionCount: boolean;
  showOperationsBar: boolean;
  
  // Validation
  validateSelection?: (items: T[]) => string | null;
}

export interface BulkOperation<T = any> {
  id: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
  
  // Visibility and availability
  visible?: (selectedItems: T[]) => boolean;
  disabled?: (selectedItems: T[]) => boolean;
  disabledReason?: (selectedItems: T[]) => string;
  
  // Confirmation
  requiresConfirmation?: boolean;
  confirmationMessage?: (selectedItems: T[]) => string;
  
  // Execution
  execute: (selectedItems: T[]) => Promise<{ success: boolean; message?: string }>;
  
  // Permissions
  requiredPermissions?: string[];
}

export interface BulkOperationState<T = any> {
  selectedIds: Set<string>;
  selectedItems: T[];
  isAllSelected: boolean;
  isAllSelectedAcrossPages: boolean;
  isPartialSelection: boolean;
  selectionCount: number;
  isOperationInProgress: boolean;
  currentOperation: string | null;
}

const DEFAULT_CONFIG: Partial<BulkOperationConfig> = {
  allowSelectAll: true,
  allowSelectAcrossPages: false,
  maxSelections: null,
  operations: [],
  persistSelection: false,
  showSelectionCount: true,
  showOperationsBar: true
};

export function useBulkOperations<T extends { id: string }>(
  items: Ref<T[]>,
  config: Partial<BulkOperationConfig<T>> = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config } as BulkOperationConfig<T>;
  
  // State
  const selectedIds = ref<Set<string>>(new Set());
  const isOperationInProgress = ref(false);
  const currentOperation = ref<string | null>(null);
  const allSelectedAcrossPages = ref(false);
  
  // Computed state
  const selectedItems = computed<T[]>(() => 
    items.value.filter(item => selectedIds.value.has(item.id))
  );
  
  const selectionCount = computed(() => 
    allSelectedAcrossPages.value ? 'all' : selectedIds.value.size
  );
  
  const isAllSelected = computed(() => {
    const currentPageItems = items.value;
    return currentPageItems.length > 0 && 
           currentPageItems.every(item => selectedIds.value.has(item.id));
  });
  
  const isPartialSelection = computed(() => {
    const currentPageItems = items.value;
    const selectedOnPage = currentPageItems.filter(item => selectedIds.value.has(item.id));
    return selectedOnPage.length > 0 && selectedOnPage.length < currentPageItems.length;
  });
  
  const availableOperations = computed(() => 
    mergedConfig.operations.filter(op => 
      !op.visible || op.visible(selectedItems.value)
    )
  );
  
  const enabledOperations = computed(() => 
    availableOperations.value.filter(op => 
      !op.disabled || !op.disabled(selectedItems.value)
    )
  );
  
  // Validation
  const selectionError = computed(() => {
    if (mergedConfig.validateSelection) {
      return mergedConfig.validateSelection(selectedItems.value);
    }
    
    if (mergedConfig.maxSelections && selectedIds.value.size > mergedConfig.maxSelections) {
      return `Maximum ${mergedConfig.maxSelections} items can be selected`;
    }
    
    return null;
  });
  
  const canSelect = computed(() => !selectionError.value);
  
  // Selection actions
  const selectItem = (item: T) => {
    if (!canSelect.value && !selectedIds.value.has(item.id)) {
      return false;
    }
    
    const newSelectedIds = new Set(selectedIds.value);
    newSelectedIds.add(item.id);
    selectedIds.value = newSelectedIds;
    allSelectedAcrossPages.value = false;
    
    return true;
  };
  
  const deselectItem = (item: T) => {
    const newSelectedIds = new Set(selectedIds.value);
    newSelectedIds.delete(item.id);
    selectedIds.value = newSelectedIds;
    allSelectedAcrossPages.value = false;
  };
  
  const toggleItem = (item: T) => {
    if (selectedIds.value.has(item.id)) {
      deselectItem(item);
    } else {
      selectItem(item);
    }
  };
  
  const selectAll = () => {
    if (!mergedConfig.allowSelectAll) return false;
    
    const newSelectedIds = new Set(selectedIds.value);
    for (const item of items.value) {
      newSelectedIds.add(item.id);
    }
    
    if (mergedConfig.maxSelections && newSelectedIds.size > mergedConfig.maxSelections) {
      return false;
    }
    
    selectedIds.value = newSelectedIds;
    allSelectedAcrossPages.value = false;
    
    return true;
  };
  
  const selectAllAcrossPages = () => {
    if (!mergedConfig.allowSelectAcrossPages) return false;
    
    allSelectedAcrossPages.value = true;
    selectedIds.value = new Set(); // Clear specific selections when selecting all
    
    return true;
  };
  
  const deselectAll = () => {
    selectedIds.value = new Set();
    allSelectedAcrossPages.value = false;
  };
  
  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      // If all current page items are selected, deselect them
      const newSelectedIds = new Set(selectedIds.value);
      for (const item of items.value) {
        newSelectedIds.delete(item.id);
      }
      selectedIds.value = newSelectedIds;
      allSelectedAcrossPages.value = false;
    } else {
      // Select all current page items
      selectAll();
    }
  };
  
  const selectItems = (itemsToSelect: T[]) => {
    const newSelectedIds = new Set(selectedIds.value);
    for (const item of itemsToSelect) {
      newSelectedIds.add(item.id);
    }
    
    if (mergedConfig.maxSelections && newSelectedIds.size > mergedConfig.maxSelections) {
      return false;
    }
    
    selectedIds.value = newSelectedIds;
    allSelectedAcrossPages.value = false;
    
    return true;
  };
  
  const deselectItems = (itemsToDeselect: T[]) => {
    const newSelectedIds = new Set(selectedIds.value);
    for (const item of itemsToDeselect) {
      newSelectedIds.delete(item.id);
    }
    selectedIds.value = newSelectedIds;
    allSelectedAcrossPages.value = false;
  };
  
  // Operation execution
  const executeOperation = async (operationId: string) => {
    const operation = mergedConfig.operations.find(op => op.id === operationId);
    if (!operation) {
      throw new Error(`Operation ${operationId} not found`);
    }
    
    if (operation.disabled && operation.disabled(selectedItems.value)) {
      const reason = operation.disabledReason 
        ? operation.disabledReason(selectedItems.value)
        : 'Operation is not available';
      throw new Error(reason);
    }
    
    isOperationInProgress.value = true;
    currentOperation.value = operationId;
    
    try {
      // Get items to operate on
      let itemsToProcess: T[];
      if (allSelectedAcrossPages.value) {
        // For "select all across pages", we need the caller to provide all items
        // This would typically come from a store method that fetches all items
        if (mergedConfig.onOperationExecute) {
          await mergedConfig.onOperationExecute(operationId, []);
          return { success: true };
        }
        itemsToProcess = [];
      } else {
        itemsToProcess = selectedItems.value;
      }
      
      const result = await operation.execute(itemsToProcess);
      
      if (result.success && !mergedConfig.persistSelection) {
        // Clear selection after successful operation
        deselectAll();
      }
      
      return result;
    } finally {
      isOperationInProgress.value = false;
      currentOperation.value = null;
    }
  };
  
  // Utility methods
  const isItemSelected = (item: T) => 
    allSelectedAcrossPages.value || selectedIds.value.has(item.id);
  
  const getSelectionSummary = () => {
    if (allSelectedAcrossPages.value) {
      return 'All items selected across all pages';
    }
    
    const count = selectedIds.value.size;
    if (count === 0) return 'No items selected';
    if (count === 1) return '1 item selected';
    return `${count} items selected`;
  };
  
  // Watch for selection changes
  watch(
    [selectedIds, allSelectedAcrossPages],
    () => {
      if (mergedConfig.onSelectionChange) {
        mergedConfig.onSelectionChange(selectedItems.value, selectedIds.value);
      }
    },
    { deep: true }
  );
  
  // State object
  const state = computed<BulkOperationState<T>>(() => ({
    selectedIds: selectedIds.value,
    selectedItems: selectedItems.value,
    isAllSelected: isAllSelected.value,
    isAllSelectedAcrossPages: allSelectedAcrossPages.value,
    isPartialSelection: isPartialSelection.value,
    selectionCount: selectedIds.value.size,
    isOperationInProgress: isOperationInProgress.value,
    currentOperation: currentOperation.value
  }));
  
  return {
    // State
    state,
    selectedIds,
    selectedItems,
    selectionCount,
    isAllSelected,
    isPartialSelection,
    allSelectedAcrossPages,
    isOperationInProgress,
    currentOperation,
    
    // Computed
    availableOperations,
    enabledOperations,
    selectionError,
    canSelect,
    
    // Selection actions
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    selectAllAcrossPages,
    deselectAll,
    toggleSelectAll,
    selectItems,
    deselectItems,
    
    // Operations
    executeOperation,
    
    // Utilities
    isItemSelected,
    getSelectionSummary
  };
}

// Helper for creating common bulk operations
export const createBulkOperations = {
  delete: <T>(onDelete: (items: T[]) => Promise<{ success: boolean; message?: string }>): BulkOperation<T> => ({
    id: 'delete',
    label: 'Delete Selected',
    icon: 'trash-2',
    variant: 'destructive',
    requiresConfirmation: true,
    confirmationMessage: (items: T[]) => 
      `Are you sure you want to delete ${items.length} item${items.length !== 1 ? 's' : ''}? This action cannot be undone.`,
    execute: onDelete
  }),
  
  archive: <T>(onArchive: (items: T[]) => Promise<{ success: boolean; message?: string }>): BulkOperation<T> => ({
    id: 'archive',
    label: 'Archive Selected',
    icon: 'archive',
    variant: 'secondary',
    requiresConfirmation: true,
    confirmationMessage: (items: T[]) => 
      `Are you sure you want to archive ${items.length} item${items.length !== 1 ? 's' : ''}?`,
    execute: onArchive
  }),
  
  export: <T>(onExport: (items: T[]) => Promise<{ success: boolean; message?: string }>): BulkOperation<T> => ({
    id: 'export',
    label: 'Export Selected',
    icon: 'download',
    variant: 'default',
    execute: onExport
  }),
  
  assign: <T>(onAssign: (items: T[]) => Promise<{ success: boolean; message?: string }>): BulkOperation<T> => ({
    id: 'assign',
    label: 'Assign Selected',
    icon: 'user-plus',
    variant: 'primary',
    execute: onAssign
  })
};