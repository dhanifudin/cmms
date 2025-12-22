// Enterprise-standard keyboard navigation for data tables and pagination
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

export interface KeyboardNavigationConfig {
  // Table navigation
  enableTableNavigation: boolean;
  enableRowSelection: boolean;
  enableBulkSelection: boolean;
  
  // Pagination navigation
  enablePaginationNavigation: boolean;
  
  // Custom key bindings
  customKeys: Record<string, () => void>;
  
  // Accessibility
  announceChanges: boolean;
  focusManagement: boolean;
  
  // Selectors for focus management
  tableSelector: string;
  rowSelector: string;
  cellSelector: string;
  paginationSelector: string;
}

interface KeyboardNavigationState {
  activeRowIndex: number;
  activeCellIndex: number;
  isTableFocused: boolean;
  selectedRows: Set<number>;
  lastSelectedRow: number | null;
}

const DEFAULT_CONFIG: KeyboardNavigationConfig = {
  enableTableNavigation: true,
  enableRowSelection: true,
  enableBulkSelection: true,
  enablePaginationNavigation: true,
  customKeys: {},
  announceChanges: true,
  focusManagement: true,
  tableSelector: 'table',
  rowSelector: 'tbody tr',
  cellSelector: 'td, th',
  paginationSelector: '[data-pagination]'
};

export function useKeyboardNavigation(
  config: Partial<KeyboardNavigationConfig> = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // State
  const state = ref<KeyboardNavigationState>({
    activeRowIndex: 0,
    activeCellIndex: 0,
    isTableFocused: false,
    selectedRows: new Set(),
    lastSelectedRow: null
  });
  
  // Screen reader announcements
  const announcer = ref<HTMLElement>();
  
  const announce = (message: string) => {
    if (!mergedConfig.announceChanges) return;
    
    if (!announcer.value) {
      announcer.value = document.createElement('div');
      announcer.value.setAttribute('aria-live', 'polite');
      announcer.value.setAttribute('aria-atomic', 'true');
      announcer.value.className = 'sr-only';
      document.body.appendChild(announcer.value);
    }
    
    announcer.value.textContent = message;
  };
  
  // Focus management
  const focusRow = (rowIndex: number) => {
    const table = document.querySelector(mergedConfig.tableSelector);
    if (!table) return;
    
    const rows = table.querySelectorAll(mergedConfig.rowSelector);
    if (rowIndex >= 0 && rowIndex < rows.length) {
      const row = rows[rowIndex] as HTMLElement;
      row.focus();
      state.value.activeRowIndex = rowIndex;
      
      if (mergedConfig.announceChanges) {
        const rowNumber = rowIndex + 1;
        const totalRows = rows.length;
        announce(`Row ${rowNumber} of ${totalRows} focused`);
      }
    }
  };
  
  const focusCell = (rowIndex: number, cellIndex: number) => {
    const table = document.querySelector(mergedConfig.tableSelector);
    if (!table) return;
    
    const rows = table.querySelectorAll(mergedConfig.rowSelector);
    if (rowIndex >= 0 && rowIndex < rows.length) {
      const row = rows[rowIndex];
      if (!row) return;
      
      const cells = row.querySelectorAll(mergedConfig.cellSelector);
      
      if (cellIndex >= 0 && cellIndex < cells.length) {
        const cell = cells[cellIndex] as HTMLElement;
        cell.focus();
        state.value.activeRowIndex = rowIndex;
        state.value.activeCellIndex = cellIndex;
        
        if (mergedConfig.announceChanges) {
          const cellContent = cell.textContent?.trim() || '';
          announce(`Cell ${cellIndex + 1}, Row ${rowIndex + 1}: ${cellContent}`);
        }
      }
    }
  };
  
  // Row selection
  const selectRow = (rowIndex: number, multiSelect = false) => {
    if (!mergedConfig.enableRowSelection) return;
    
    if (multiSelect && mergedConfig.enableBulkSelection) {
      if (state.value.selectedRows.has(rowIndex)) {
        state.value.selectedRows.delete(rowIndex);
      } else {
        state.value.selectedRows.add(rowIndex);
      }
    } else {
      state.value.selectedRows.clear();
      state.value.selectedRows.add(rowIndex);
    }
    
    state.value.lastSelectedRow = rowIndex;
    
    if (mergedConfig.announceChanges) {
      const isSelected = state.value.selectedRows.has(rowIndex);
      const selectedCount = state.value.selectedRows.size;
      announce(
        isSelected 
          ? `Row ${rowIndex + 1} selected. ${selectedCount} rows selected.`
          : `Row ${rowIndex + 1} deselected. ${selectedCount} rows selected.`
      );
    }
  };
  
  const selectRange = (fromIndex: number, toIndex: number) => {
    if (!mergedConfig.enableBulkSelection) return;
    
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    
    for (let i = start; i <= end; i++) {
      state.value.selectedRows.add(i);
    }
    
    if (mergedConfig.announceChanges) {
      const selectedCount = state.value.selectedRows.size;
      announce(`Selected rows ${start + 1} to ${end + 1}. ${selectedCount} rows selected.`);
    }
  };
  
  const selectAll = () => {
    if (!mergedConfig.enableBulkSelection) return;
    
    const table = document.querySelector(mergedConfig.tableSelector);
    if (!table) return;
    
    const rows = table.querySelectorAll(mergedConfig.rowSelector);
    state.value.selectedRows.clear();
    
    for (let i = 0; i < rows.length; i++) {
      state.value.selectedRows.add(i);
    }
    
    if (mergedConfig.announceChanges) {
      announce(`All ${rows.length} rows selected`);
    }
  };
  
  const clearSelection = () => {
    state.value.selectedRows.clear();
    state.value.lastSelectedRow = null;
    
    if (mergedConfig.announceChanges) {
      announce('Selection cleared');
    }
  };
  
  // Navigation methods
  const moveUp = () => {
    if (state.value.activeRowIndex > 0) {
      focusRow(state.value.activeRowIndex - 1);
    }
  };
  
  const moveDown = () => {
    const table = document.querySelector(mergedConfig.tableSelector);
    if (!table) return;
    
    const rows = table.querySelectorAll(mergedConfig.rowSelector);
    if (state.value.activeRowIndex < rows.length - 1) {
      focusRow(state.value.activeRowIndex + 1);
    }
  };
  
  const moveLeft = () => {
    if (state.value.activeCellIndex > 0) {
      focusCell(state.value.activeRowIndex, state.value.activeCellIndex - 1);
    }
  };
  
  const moveRight = () => {
    const table = document.querySelector(mergedConfig.tableSelector);
    if (!table) return;
    
    const rows = table.querySelectorAll(mergedConfig.rowSelector);
    if (state.value.activeRowIndex < rows.length) {
      const row = rows[state.value.activeRowIndex];
      if (!row) return;
      
      const cells = row.querySelectorAll(mergedConfig.cellSelector);
      
      if (state.value.activeCellIndex < cells.length - 1) {
        focusCell(state.value.activeRowIndex, state.value.activeCellIndex + 1);
      }
    }
  };
  
  const goToFirstRow = () => {
    focusRow(0);
  };
  
  const goToLastRow = () => {
    const table = document.querySelector(mergedConfig.tableSelector);
    if (!table) return;
    
    const rows = table.querySelectorAll(mergedConfig.rowSelector);
    if (rows.length > 0) {
      focusRow(rows.length - 1);
    }
  };
  
  // Pagination navigation
  const goToNextPage = () => {
    if (!mergedConfig.enablePaginationNavigation) return;
    
    const pagination = document.querySelector(mergedConfig.paginationSelector);
    if (!pagination) return;
    
    const nextButton = pagination.querySelector('[data-pagination-next]') as HTMLButtonElement;
    if (nextButton && !nextButton.disabled) {
      nextButton.click();
      announce('Navigated to next page');
    }
  };
  
  const goToPreviousPage = () => {
    if (!mergedConfig.enablePaginationNavigation) return;
    
    const pagination = document.querySelector(mergedConfig.paginationSelector);
    if (!pagination) return;
    
    const prevButton = pagination.querySelector('[data-pagination-prev]') as HTMLButtonElement;
    if (prevButton && !prevButton.disabled) {
      prevButton.click();
      announce('Navigated to previous page');
    }
  };
  
  // Keyboard event handler
  const handleKeyDown = (event: KeyboardEvent) => {
    // Don't interfere with form inputs
    if ((event.target as HTMLElement)?.tagName === 'INPUT' || 
        (event.target as HTMLElement)?.tagName === 'TEXTAREA' ||
        (event.target as HTMLElement)?.isContentEditable) {
      return;
    }
    
    const { key, ctrlKey, metaKey, shiftKey } = event;
    const isModifierPressed = ctrlKey || metaKey;
    
    // Handle custom key bindings first
    const keyCombo = `${isModifierPressed ? 'ctrl+' : ''}${shiftKey ? 'shift+' : ''}${key.toLowerCase()}`;
    if (mergedConfig.customKeys[keyCombo]) {
      event.preventDefault();
      mergedConfig.customKeys[keyCombo]();
      return;
    }
    
    // Handle default navigation
    switch (key) {
      case 'ArrowUp':
        if (mergedConfig.enableTableNavigation) {
          event.preventDefault();
          if (shiftKey && mergedConfig.enableBulkSelection && state.value.lastSelectedRow !== null) {
            selectRange(state.value.lastSelectedRow, state.value.activeRowIndex - 1);
          }
          moveUp();
        }
        break;
        
      case 'ArrowDown':
        if (mergedConfig.enableTableNavigation) {
          event.preventDefault();
          if (shiftKey && mergedConfig.enableBulkSelection && state.value.lastSelectedRow !== null) {
            selectRange(state.value.lastSelectedRow, state.value.activeRowIndex + 1);
          }
          moveDown();
        }
        break;
        
      case 'ArrowLeft':
        if (mergedConfig.enableTableNavigation) {
          event.preventDefault();
          moveLeft();
        }
        break;
        
      case 'ArrowRight':
        if (mergedConfig.enableTableNavigation) {
          event.preventDefault();
          moveRight();
        }
        break;
        
      case 'Home':
        if (mergedConfig.enableTableNavigation) {
          event.preventDefault();
          goToFirstRow();
        }
        break;
        
      case 'End':
        if (mergedConfig.enableTableNavigation) {
          event.preventDefault();
          goToLastRow();
        }
        break;
        
      case ' ':
      case 'Enter':
        if (mergedConfig.enableRowSelection) {
          event.preventDefault();
          selectRow(state.value.activeRowIndex, shiftKey);
        }
        break;
        
      case 'a':
        if (isModifierPressed && mergedConfig.enableBulkSelection) {
          event.preventDefault();
          selectAll();
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        clearSelection();
        break;
        
      case 'PageDown':
        if (mergedConfig.enablePaginationNavigation) {
          event.preventDefault();
          goToNextPage();
        }
        break;
        
      case 'PageUp':
        if (mergedConfig.enablePaginationNavigation) {
          event.preventDefault();
          goToPreviousPage();
        }
        break;
    }
  };
  
  // Focus event handler
  const handleFocus = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    const table = target.closest(mergedConfig.tableSelector);
    
    if (table) {
      state.value.isTableFocused = true;
      
      // Find the focused row and cell
      const row = target.closest(mergedConfig.rowSelector);
      if (row) {
        const rows = table.querySelectorAll(mergedConfig.rowSelector);
        const rowIndex = Array.from(rows).indexOf(row as Element);
        
        const cells = row.querySelectorAll(mergedConfig.cellSelector);
        const cellIndex = Array.from(cells).indexOf(target.closest(mergedConfig.cellSelector) as Element);
        
        state.value.activeRowIndex = rowIndex;
        state.value.activeCellIndex = Math.max(0, cellIndex);
      }
    }
  };
  
  const handleBlur = (event: FocusEvent) => {
    // Check if focus is leaving the table
    const relatedTarget = event.relatedTarget as HTMLElement;
    const table = document.querySelector(mergedConfig.tableSelector);
    
    if (table && (!relatedTarget || !table.contains(relatedTarget))) {
      state.value.isTableFocused = false;
    }
  };
  
  // Lifecycle
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    
    // Make table rows focusable if focus management is enabled
    if (mergedConfig.focusManagement) {
      nextTick(() => {
        const table = document.querySelector(mergedConfig.tableSelector);
        if (table) {
          const rows = table.querySelectorAll(mergedConfig.rowSelector);
          rows.forEach((row, index) => {
            (row as HTMLElement).setAttribute('tabindex', index === 0 ? '0' : '-1');
            (row as HTMLElement).setAttribute('role', 'row');
            (row as HTMLElement).setAttribute('aria-rowindex', (index + 1).toString());
          });
          
          // Set table attributes
          (table as HTMLElement).setAttribute('role', 'table');
          (table as HTMLElement).setAttribute('aria-label', 'Data table with keyboard navigation');
        }
      });
    }
  });
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('focusin', handleFocus);
    document.removeEventListener('focusout', handleBlur);
    
    // Clean up announcer
    if (announcer.value && announcer.value.parentNode) {
      announcer.value.parentNode.removeChild(announcer.value);
    }
  });
  
  return {
    // State
    state,
    
    // Navigation
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    goToFirstRow,
    goToLastRow,
    goToNextPage,
    goToPreviousPage,
    
    // Selection
    selectRow,
    selectRange,
    selectAll,
    clearSelection,
    
    // Focus management
    focusRow,
    focusCell,
    
    // Utilities
    announce
  };
}

// Helper for getting keyboard shortcuts help text
export const getKeyboardShortcuts = () => [
  { key: '↑/↓', description: 'Navigate up/down rows' },
  { key: '←/→', description: 'Navigate left/right cells' },
  { key: 'Space/Enter', description: 'Select/deselect row' },
  { key: 'Shift + ↑/↓', description: 'Select range' },
  { key: 'Ctrl/Cmd + A', description: 'Select all' },
  { key: 'Escape', description: 'Clear selection' },
  { key: 'Home', description: 'Go to first row' },
  { key: 'End', description: 'Go to last row' },
  { key: 'Page Up/Down', description: 'Previous/next page' }
];