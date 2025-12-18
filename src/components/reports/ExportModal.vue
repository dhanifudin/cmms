<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="$emit('close')">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Export Reports</h3>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-4">
          <!-- Report Type Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <div class="space-y-2">
              <label v-for="option in reportTypes" :key="option.value" class="flex items-center">
                <input
                  v-model="selectedReportType"
                  type="radio"
                  :value="option.value"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-700">{{ option.label }}</span>
                  <p class="text-xs text-gray-500">{{ option.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Format Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <select 
              v-model="selectedFormat"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pdf">PDF Report</option>
              <option value="excel">Excel Spreadsheet</option>
              <option value="csv">CSV Data</option>
            </select>
          </div>

          <!-- Additional Options -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Options</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="includeCharts"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">Include charts and graphs</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="includeRawData"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">Include raw data tables</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="includeSummary"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">Include executive summary</span>
              </label>
            </div>
          </div>

          <!-- Date Range Display -->
          <div class="bg-gray-50 p-3 rounded-md">
            <p class="text-sm text-gray-600">
              <span class="font-medium">Date Range:</span> 
              {{ formatDate(dateRangeStart) }} - {{ formatDate(dateRangeEnd) }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end space-x-3 mt-6">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            @click="handleExport"
            :disabled="!selectedReportType"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download class="h-4 w-4 mr-2 inline" />
            Export Report
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { X, Download } from 'lucide-vue-next';

// Define emit function
const emit = defineEmits<{
  close: [];
  export: [reportType: string, format: 'pdf' | 'excel' | 'csv'];
}>();

// Reactive data
const selectedReportType = ref('');
const selectedFormat = ref<'pdf' | 'excel' | 'csv'>('pdf');
const includeCharts = ref(true);
const includeRawData = ref(true);
const includeSummary = ref(true);

// Mock date range - in real app this would come from props
const dateRangeStart = ref('2024-11-18');
const dateRangeEnd = ref('2024-12-18');

const reportTypes = [
  {
    value: 'comprehensive',
    label: 'Comprehensive Report',
    description: 'Complete performance analysis with all metrics and charts'
  },
  {
    value: 'work_orders',
    label: 'Work Orders Report',
    description: 'Work order completion rates, overdue items, and trends'
  },
  {
    value: 'performance',
    label: 'Performance Report', 
    description: 'Terminal and worker performance metrics'
  },
  {
    value: 'financial',
    label: 'Financial Report',
    description: 'Cost analysis, penalties, and budget breakdown'
  },
  {
    value: 'inventory',
    label: 'Inventory Report',
    description: 'Stock levels, usage patterns, and purchase recommendations'
  },
  {
    value: 'overdue',
    label: 'Overdue Items Report',
    description: 'Detailed list of overdue work orders and penalties'
  }
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const handleExport = () => {
  if (selectedReportType.value) {
    // Emit the export event with selected options
    emit('export', selectedReportType.value, selectedFormat.value);
  }
};
</script>