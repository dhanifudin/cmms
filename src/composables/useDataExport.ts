// Enterprise-standard data export with pagination awareness
import { ref, computed } from 'vue';
import type { Ref } from 'vue';

export interface ExportConfig<T = any> {
  // Export formats
  formats: ExportFormat[];
  
  // Export scope options
  allowCurrentPageOnly: boolean;
  allowAllPages: boolean;
  allowSelectedOnly: boolean;
  allowCustomRange: boolean;
  
  // Data transformation
  fieldMapping: Record<string, string>; // internal field -> export header
  excludeFields?: string[];
  customFields?: ExportCustomField<T>[];
  
  // File options
  defaultFilename: string;
  dateInFilename: boolean;
  
  // Formatting options
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
  booleanFormat: { true: string; false: string };
  
  // Callbacks
  onBeforeExport?: (data: T[], options: ExportOptions) => T[];
  onAfterExport?: (filename: string, format: ExportFormat) => void;
  onError?: (error: Error) => void;
}

export interface ExportFormat {
  id: string;
  label: string;
  extension: string;
  mimeType: string;
  maxRows?: number;
  supportsFormatting?: boolean;
}

export interface ExportCustomField<T = any> {
  key: string;
  label: string;
  getValue: (item: T) => any;
  format?: (value: any) => string;
}

export interface ExportScope {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  disabledReason?: string;
}

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  filename: string;
  includeHeaders: boolean;
  customRange?: {
    startPage: number;
    endPage: number;
  };
}

export interface ExportState {
  isExporting: boolean;
  progress: number;
  currentOperation: string;
  error: string | null;
  lastExportedFile: string | null;
}

// Common export formats
export const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'csv',
    label: 'CSV',
    extension: 'csv',
    mimeType: 'text/csv',
    maxRows: 1000000
  },
  {
    id: 'excel',
    label: 'Excel',
    extension: 'xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    maxRows: 100000,
    supportsFormatting: true
  },
  {
    id: 'json',
    label: 'JSON',
    extension: 'json',
    mimeType: 'application/json',
    maxRows: 500000
  },
  {
    id: 'pdf',
    label: 'PDF',
    extension: 'pdf',
    mimeType: 'application/pdf',
    maxRows: 10000,
    supportsFormatting: true
  }
];

const DEFAULT_CONFIG: Partial<ExportConfig> = {
  formats: EXPORT_FORMATS,
  allowCurrentPageOnly: true,
  allowAllPages: true,
  allowSelectedOnly: true,
  allowCustomRange: false,
  fieldMapping: {},
  excludeFields: [],
  customFields: [],
  defaultFilename: 'export',
  dateInFilename: true,
  dateFormat: 'YYYY-MM-DD',
  numberFormat: { minimumFractionDigits: 0, maximumFractionDigits: 2 },
  booleanFormat: { true: 'Yes', false: 'No' }
};

export function useDataExport<T extends Record<string, any>>(
  allData: Ref<T[]>,
  currentPageData: Ref<T[]>,
  selectedData: Ref<T[]>,
  config: Partial<ExportConfig<T>> = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config } as ExportConfig<T>;
  
  // State
  const state = ref<ExportState>({
    isExporting: false,
    progress: 0,
    currentOperation: '',
    error: null,
    lastExportedFile: null
  });
  
  // Available export scopes
  const exportScopes = computed<ExportScope[]>(() => {
    const scopes: ExportScope[] = [];
    
    if (mergedConfig.allowCurrentPageOnly) {
      scopes.push({
        id: 'current-page',
        label: `Current Page (${currentPageData.value.length} items)`,
        description: 'Export only the items visible on the current page'
      });
    }
    
    if (mergedConfig.allowSelectedOnly && selectedData.value.length > 0) {
      scopes.push({
        id: 'selected',
        label: `Selected Items (${selectedData.value.length} items)`,
        description: 'Export only the selected items'
      });
    }
    
    if (mergedConfig.allowAllPages) {
      const totalItems = allData.value.length;
      scopes.push({
        id: 'all-pages',
        label: `All Pages (${totalItems} items)`,
        description: 'Export all items across all pages',
        disabled: totalItems === 0,
        disabledReason: totalItems === 0 ? 'No data available' : undefined
      });
    }
    
    if (mergedConfig.allowCustomRange) {
      scopes.push({
        id: 'custom-range',
        label: 'Custom Page Range',
        description: 'Export a specific range of pages'
      });
    }
    
    return scopes;
  });
  
  // Get data for export based on scope
  const getExportData = (scope: ExportScope, customRange?: { startPage: number; endPage: number }): T[] => {
    switch (scope.id) {
      case 'current-page':
        return currentPageData.value;
      case 'selected':
        return selectedData.value;
      case 'all-pages':
        return allData.value;
      case 'custom-range':
        if (!customRange) return [];
        // This would require pagination state to calculate the range
        // For now, return all data (implementation would depend on pagination setup)
        return allData.value;
      default:
        return [];
    }
  };
  
  // Data transformation
  const transformDataForExport = (data: T[]): Record<string, any>[] => {
    return data.map(item => {
      const transformedItem: Record<string, any> = {};
      
      // Apply field mapping and exclusions
      for (const [key, value] of Object.entries(item)) {
        if (mergedConfig.excludeFields?.includes(key)) {
          continue;
        }
        
        const exportKey = mergedConfig.fieldMapping[key] || key;
        transformedItem[exportKey] = formatValue(value);
      }
      
      // Add custom fields
      if (mergedConfig.customFields) {
        for (const customField of mergedConfig.customFields) {
          const value = customField.getValue(item);
          transformedItem[customField.label] = customField.format 
            ? customField.format(value)
            : formatValue(value);
        }
      }
      
      return transformedItem;
    });
  };
  
  // Format values based on type
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'boolean') {
      return value ? mergedConfig.booleanFormat.true : mergedConfig.booleanFormat.false;
    }
    
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', mergedConfig.numberFormat).format(value);
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString('en-US');
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };
  
  // Generate filename
  const generateFilename = (baseFilename: string, format: ExportFormat): string => {
    let filename = baseFilename;
    
    if (mergedConfig.dateInFilename) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      filename += `_${dateStr}`;
    }
    
    return `${filename}.${format.extension}`;
  };
  
  // Export formatters
  const exportAsCSV = async (data: Record<string, any>[], options: ExportOptions): Promise<Blob> => {
    state.value.currentOperation = 'Formatting CSV data...';
    
    if (data.length === 0) {
      return new Blob([''], { type: 'text/csv' });
    }
    
    const firstRow = data[0];
    if (!firstRow) {
      return new Blob([''], { type: 'text/csv' });
    }
    
    const headers = Object.keys(firstRow);
    const csvLines: string[] = [];
    
    // Add headers if requested
    if (options.includeHeaders) {
      csvLines.push(headers.map(header => `"${header}"`).join(','));
    }
    
    // Add data rows
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;
      
      const values = headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvLines.push(values.join(','));
      
      // Update progress
      if (i % 100 === 0) {
        state.value.progress = Math.round((i / data.length) * 90);
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    
    return new Blob([csvLines.join('\n')], { type: 'text/csv' });
  };
  
  const exportAsJSON = async (data: Record<string, any>[], options: ExportOptions): Promise<Blob> => {
    state.value.currentOperation = 'Formatting JSON data...';
    
    const jsonData = {
      exported_at: new Date().toISOString(),
      total_records: data.length,
      data: data
    };
    
    state.value.progress = 90;
    
    return new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  };
  
  // Excel export would require a library like xlsx
  const exportAsExcel = async (data: Record<string, any>[], options: ExportOptions): Promise<Blob> => {
    state.value.currentOperation = 'Creating Excel file...';
    
    // This would require the xlsx library
    // For now, fallback to CSV format
    console.warn('Excel export not implemented, falling back to CSV');
    return exportAsCSV(data, options);
  };
  
  // PDF export would require a library like jsPDF
  const exportAsPDF = async (data: Record<string, any>[], options: ExportOptions): Promise<Blob> => {
    state.value.currentOperation = 'Creating PDF file...';
    
    // This would require a PDF library
    // For now, create a simple text-based PDF-like content
    console.warn('PDF export not implemented, falling back to text format');
    
    const firstRow = data.length > 0 ? data[0] : null;
    const headers = firstRow ? Object.keys(firstRow) : [];
    const lines: string[] = [];
    
    lines.push('DATA EXPORT REPORT');
    lines.push('='.repeat(50));
    lines.push(`Export Date: ${new Date().toLocaleString()}`);
    lines.push(`Total Records: ${data.length}`);
    lines.push('');
    
    if (options.includeHeaders && headers.length > 0) {
      lines.push(headers.join(' | '));
      lines.push('-'.repeat(headers.join(' | ').length));
    }
    
    for (const row of data) {
      const values = headers.map(header => String(row[header] || ''));
      lines.push(values.join(' | '));
    }
    
    return new Blob([lines.join('\n')], { type: 'text/plain' });
  };
  
  // Main export function
  const exportData = async (options: ExportOptions): Promise<void> => {
    try {
      state.value.isExporting = true;
      state.value.progress = 0;
      state.value.error = null;
      state.value.currentOperation = 'Preparing export...';
      
      // Get raw data
      const scope = exportScopes.value.find(s => s.id === options.scope.id);
      if (!scope) {
        throw new Error('Invalid export scope');
      }
      
      if (scope.disabled) {
        throw new Error(scope.disabledReason || 'Export scope is not available');
      }
      
      const rawData = getExportData(scope, options.customRange);
      
      if (rawData.length === 0) {
        throw new Error('No data available for export');
      }
      
      // Check format limits
      if (options.format.maxRows && rawData.length > options.format.maxRows) {
        throw new Error(`Export format ${options.format.label} supports maximum ${options.format.maxRows} rows, but ${rawData.length} rows were requested`);
      }
      
      state.value.progress = 10;
      state.value.currentOperation = 'Processing data...';
      
      // Apply pre-export transformation if provided
      const processedData = mergedConfig.onBeforeExport 
        ? mergedConfig.onBeforeExport(rawData, options)
        : rawData;
      
      state.value.progress = 20;
      
      // Transform data for export
      const exportData = transformDataForExport(processedData);
      
      state.value.progress = 30;
      
      // Generate file based on format
      let blob: Blob;
      switch (options.format.id) {
        case 'csv':
          blob = await exportAsCSV(exportData, options);
          break;
        case 'json':
          blob = await exportAsJSON(exportData, options);
          break;
        case 'excel':
          blob = await exportAsExcel(exportData, options);
          break;
        case 'pdf':
          blob = await exportAsPDF(exportData, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format.id}`);
      }
      
      state.value.progress = 95;
      state.value.currentOperation = 'Downloading file...';
      
      // Generate filename
      const filename = generateFilename(options.filename, options.format);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      state.value.progress = 100;
      state.value.lastExportedFile = filename;
      
      // Call after export callback
      if (mergedConfig.onAfterExport) {
        mergedConfig.onAfterExport(filename, options.format);
      }
      
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Export failed';
      
      if (mergedConfig.onError) {
        mergedConfig.onError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      state.value.isExporting = false;
      state.value.currentOperation = '';
      setTimeout(() => {
        state.value.progress = 0;
      }, 2000);
    }
  };
  
  // Quick export methods
  const exportCurrentPageAsCSV = () => {
    const currentPageScope = exportScopes.value.find(s => s.id === 'current-page');
    const csvFormat = mergedConfig.formats.find(f => f.id === 'csv');
    
    if (currentPageScope && csvFormat) {
      return exportData({
        format: csvFormat,
        scope: currentPageScope,
        filename: mergedConfig.defaultFilename,
        includeHeaders: true
      });
    }
  };
  
  const exportAllAsExcel = () => {
    const allPagesScope = exportScopes.value.find(s => s.id === 'all-pages');
    const excelFormat = mergedConfig.formats.find(f => f.id === 'excel');
    
    if (allPagesScope && excelFormat) {
      return exportData({
        format: excelFormat,
        scope: allPagesScope,
        filename: mergedConfig.defaultFilename,
        includeHeaders: true
      });
    }
  };
  
  const exportSelectedAsCSV = () => {
    const selectedScope = exportScopes.value.find(s => s.id === 'selected');
    const csvFormat = mergedConfig.formats.find(f => f.id === 'csv');
    
    if (selectedScope && csvFormat) {
      return exportData({
        format: csvFormat,
        scope: selectedScope,
        filename: `${mergedConfig.defaultFilename}_selected`,
        includeHeaders: true
      });
    }
  };
  
  return {
    // State
    state,
    
    // Configuration
    exportScopes,
    formats: mergedConfig.formats,
    
    // Actions
    exportData,
    
    // Quick actions
    exportCurrentPageAsCSV,
    exportAllAsExcel,
    exportSelectedAsCSV,
    
    // Utilities
    generateFilename,
    transformDataForExport
  };
}