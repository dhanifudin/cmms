<template>
  <div 
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="handleBackdropClick"
  >
    <div 
      class="relative top-20 mx-auto p-0 border w-full max-w-md shadow-lg rounded-lg bg-white"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Export Data
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Export Format -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="format in formats"
              :key="format.id"
              @click="selectedFormat = format"
              :class="[
                'p-3 border-2 rounded-lg text-left transition-colors',
                selectedFormat?.id === format.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              ]"
            >
              <div class="font-medium">{{ format.label }}</div>
              <div class="text-xs text-gray-500 mt-1">
                .{{ format.extension }} format
              </div>
              <div v-if="format.maxRows" class="text-xs text-gray-500 mt-1">
                Max: {{ format.maxRows.toLocaleString() }} rows
              </div>
            </button>
          </div>
        </div>

        <!-- Export Scope -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Export Scope
          </label>
          <div class="space-y-2">
            <label
              v-for="scope in availableScopes"
              :key="scope.id"
              :class="[
                'flex items-start p-3 border rounded-lg cursor-pointer transition-colors',
                scope.disabled
                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                  : selectedScope?.id === scope.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <input
                v-model="selectedScope"
                :value="scope"
                :disabled="scope.disabled"
                type="radio"
                class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div class="ml-3 flex-1">
                <div class="font-medium text-gray-900">{{ scope.label }}</div>
                <div v-if="scope.description" class="text-sm text-gray-500 mt-1">
                  {{ scope.description }}
                </div>
                <div v-if="scope.disabled && scope.disabledReason" class="text-sm text-red-600 mt-1">
                  {{ scope.disabledReason }}
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Custom Range (if selected) -->
        <div v-if="selectedScope?.id === 'custom-range'" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Start Page
              </label>
              <input
                v-model.number="customRange.startPage"
                type="number"
                min="1"
                :max="totalPages"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                End Page
              </label>
              <input
                v-model.number="customRange.endPage"
                type="number"
                :min="customRange.startPage"
                :max="totalPages"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div class="text-sm text-gray-500">
            Pages {{ customRange.startPage }} to {{ customRange.endPage }} of {{ totalPages }}
          </div>
        </div>

        <!-- Options -->
        <div class="space-y-3">
          <label class="flex items-center">
            <input
              v-model="includeHeaders"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Include column headers</span>
          </label>
        </div>

        <!-- Filename -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Filename
          </label>
          <div class="flex">
            <input
              v-model="filename"
              type="text"
              class="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter filename"
            />
            <div class="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
              .{{ selectedFormat?.extension || 'csv' }}
            </div>
          </div>
        </div>

        <!-- File Size Warning -->
        <div v-if="estimatedFileSize" class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div class="flex">
            <AlertTriangle class="h-5 w-5 text-yellow-400 mt-0.5" />
            <div class="ml-3">
              <div class="text-sm text-yellow-800">
                <strong>Estimated file size:</strong> {{ estimatedFileSize }}
              </div>
              <div class="text-sm text-yellow-700 mt-1">
                Large exports may take some time to process and download.
              </div>
            </div>
          </div>
        </div>

        <!-- Row Limit Warning -->
        <div v-if="rowLimitWarning" class="bg-red-50 border border-red-200 rounded-md p-3">
          <div class="flex">
            <AlertTriangle class="h-5 w-5 text-red-400 mt-0.5" />
            <div class="ml-3">
              <div class="text-sm text-red-800">
                <strong>Row limit exceeded:</strong> {{ rowLimitWarning }}
              </div>
              <div class="text-sm text-red-700 mt-1">
                Consider using a different format or reducing the scope.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress (shown during export) -->
      <div v-if="exportState.isExporting" class="px-6 pb-4">
        <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div class="flex items-center">
            <div class="flex-1">
              <div class="text-sm font-medium text-blue-900">
                {{ exportState.currentOperation }}
              </div>
              <div class="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${exportState.progress}%` }"
                ></div>
              </div>
              <div class="text-sm text-blue-700 mt-1">
                {{ exportState.progress }}% complete
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="exportState.error" class="px-6 pb-4">
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <AlertTriangle class="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div class="ml-3">
              <div class="text-sm font-medium text-red-800">Export Failed</div>
              <div class="text-sm text-red-700 mt-1">{{ exportState.error }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Success -->
      <div v-if="exportState.lastExportedFile && !exportState.isExporting && !exportState.error" class="px-6 pb-4">
        <div class="bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex">
            <CheckCircle class="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div class="ml-3">
              <div class="text-sm font-medium text-green-800">Export Successful</div>
              <div class="text-sm text-green-700 mt-1">
                Downloaded: {{ exportState.lastExportedFile }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
        <button
          @click="$emit('close')"
          :disabled="exportState.isExporting"
          class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          @click="handleExport"
          :disabled="!canExport || exportState.isExporting"
          class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <template v-if="exportState.isExporting">
            <div class="flex items-center">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Exporting...
            </div>
          </template>
          <template v-else>
            Export Data
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, AlertTriangle, CheckCircle } from 'lucide-vue-next';
import type { ExportFormat, ExportScope, ExportState } from '@/composables/useDataExport';

interface Props {
  show: boolean;
  formats: ExportFormat[];
  exportScopes: ExportScope[];
  exportState: ExportState;
  totalPages?: number;
  defaultFilename?: string;
  estimatedRowCount?: number;
}

interface Emits {
  close: [];
  export: [options: {
    format: ExportFormat;
    scope: ExportScope;
    filename: string;
    includeHeaders: boolean;
    customRange?: { startPage: number; endPage: number };
  }];
}

const props = withDefaults(defineProps<Props>(), {
  totalPages: 1,
  defaultFilename: 'export',
  estimatedRowCount: 0
});

const emit = defineEmits<Emits>();

// Form state
const selectedFormat = ref<ExportFormat | null>(null);
const selectedScope = ref<ExportScope | null>(null);
const includeHeaders = ref(true);
const filename = ref('');
const customRange = ref({
  startPage: 1,
  endPage: 1
});

// Initialize defaults when modal opens
watch(() => props.show, (show) => {
  if (show) {
    selectedFormat.value = props.formats[0] || null;
    selectedScope.value = props.exportScopes[0] || null;
    filename.value = props.defaultFilename;
    customRange.value = {
      startPage: 1,
      endPage: props.totalPages
    };
  }
});

// Available scopes (filter out disabled ones for better UX)
const availableScopes = computed(() => props.exportScopes);

// Validation
const canExport = computed(() => {
  if (!selectedFormat.value || !selectedScope.value || !filename.value.trim()) {
    return false;
  }
  
  if (selectedScope.value.disabled) {
    return false;
  }
  
  if (selectedScope.value.id === 'custom-range') {
    return customRange.value.startPage >= 1 && 
           customRange.value.endPage >= customRange.value.startPage &&
           customRange.value.endPage <= props.totalPages;
  }
  
  return true;
});

// Estimated file size
const estimatedFileSize = computed(() => {
  if (!selectedFormat.value || !props.estimatedRowCount) return '';
  
  let estimatedBytes = 0;
  
  switch (selectedFormat.value.id) {
    case 'csv':
      // Rough estimate: ~100 bytes per row
      estimatedBytes = props.estimatedRowCount * 100;
      break;
    case 'json':
      // Rough estimate: ~200 bytes per row
      estimatedBytes = props.estimatedRowCount * 200;
      break;
    case 'excel':
      // Rough estimate: ~150 bytes per row
      estimatedBytes = props.estimatedRowCount * 150;
      break;
    default:
      return '';
  }
  
  if (estimatedBytes < 1024 * 1024) {
    return `${Math.round(estimatedBytes / 1024)} KB`;
  } else {
    return `${Math.round(estimatedBytes / (1024 * 1024))} MB`;
  }
});

// Row limit warning
const rowLimitWarning = computed(() => {
  if (!selectedFormat.value || !props.estimatedRowCount) return '';
  
  if (selectedFormat.value.maxRows && props.estimatedRowCount > selectedFormat.value.maxRows) {
    return `This format supports maximum ${selectedFormat.value.maxRows.toLocaleString()} rows, but you're trying to export ${props.estimatedRowCount.toLocaleString()} rows.`;
  }
  
  return '';
});

// Methods
const handleBackdropClick = () => {
  if (!props.exportState.isExporting) {
    emit('close');
  }
};

const handleExport = () => {
  if (!canExport.value) return;
  
  const options = {
    format: selectedFormat.value!,
    scope: selectedScope.value!,
    filename: filename.value.trim(),
    includeHeaders: includeHeaders.value,
    customRange: selectedScope.value!.id === 'custom-range' 
      ? customRange.value 
      : undefined
  };
  
  emit('export', options);
};
</script>