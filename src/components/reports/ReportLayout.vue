<template>
  <div class="report-layout min-h-screen bg-gray-50">
    <!-- Print-friendly header -->
    <header class="bg-white border-b border-gray-200 print:border-none print:bg-transparent sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <!-- Title Row -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <ReportBreadcrumb :items="breadcrumb" class="mb-2 print:hidden" />
            <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
            <p v-if="subtitle" class="text-sm text-gray-600 mt-1">{{ subtitle }}</p>
          </div>
          <div class="flex items-center space-x-3 print:hidden">
            <button
              @click="handlePrint"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Printer class="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              @click="handleExport"
              :disabled="exporting"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Download class="h-4 w-4 mr-2" :class="{ 'animate-bounce': exporting }" />
              Export CSV
            </button>
            <button
              v-if="showRefresh"
              @click="$emit('refresh')"
              :disabled="loading"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw class="h-4 w-4 mr-2" :class="{ 'animate-spin': loading }" />
              Refresh
            </button>
          </div>
        </div>

        <!-- Filters Row -->
        <ReportFilters
          v-if="showFilters"
          :date-range="dateRange"
          :available-terminals="availableTerminals"
          :available-statuses="availableStatuses"
          :selected-terminals="selectedTerminals"
          :selected-statuses="selectedStatuses"
          class="print:hidden"
          @update:date-range="$emit('update:date-range', $event)"
          @update:selected-terminals="$emit('update:selected-terminals', $event)"
          @update:selected-statuses="$emit('update:selected-statuses', $event)"
          @apply="$emit('apply-filters')"
          @reset="$emit('reset-filters')"
        />
      </div>
    </header>

    <!-- Loading overlay -->
    <div v-if="loading" class="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 print:hidden">
      <div class="text-center">
        <RefreshCw class="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
        <p class="text-gray-600">Loading report data...</p>
      </div>
    </div>

    <!-- Main content area -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:px-0 print:max-w-full">
      <!-- Summary Cards -->
      <ReportSummaryCards
        v-if="summaryMetrics && summaryMetrics.length > 0"
        :metrics="summaryMetrics"
        class="mb-6"
      />

      <!-- Report-specific content slot -->
      <slot />
    </main>

    <!-- Print header - visible only when printing -->
    <div class="hidden print:block print:fixed print:top-0 print:left-0 print:right-0 print:bg-white print:py-4 print:px-6 print:border-b">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold">{{ title }}</h1>
          <p class="text-sm text-gray-600">{{ subtitle }}</p>
        </div>
        <div class="text-right text-sm text-gray-500">
          <p>Generated: {{ formatDate(new Date()) }}</p>
          <p v-if="dateRange">Period: {{ formatDate(new Date(dateRange.start)) }} - {{ formatDate(new Date(dateRange.end)) }}</p>
        </div>
      </div>
    </div>

    <!-- Print footer -->
    <div class="hidden print:block print:fixed print:bottom-0 print:left-0 print:right-0 print:bg-white print:py-2 print:px-6 print:border-t">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>CMMS Report System</span>
        <span>Page <span class="print-page-number"></span></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Printer, Download, RefreshCw } from 'lucide-vue-next';
import ReportBreadcrumb from './ReportBreadcrumb.vue';
import ReportFilters from './ReportFilters.vue';
import ReportSummaryCards from './ReportSummaryCards.vue';

export interface BreadcrumbItem {
  label: string;
  path: string;
  level?: string;
}

export interface SummaryMetric {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
}

export interface DateRange {
  start: string;
  end: string;
}

interface Props {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  loading?: boolean;
  showFilters?: boolean;
  showRefresh?: boolean;
  dateRange?: DateRange;
  availableTerminals?: { id: string; name: string }[];
  availableStatuses?: { id: string; label: string }[];
  selectedTerminals?: string[];
  selectedStatuses?: string[];
  summaryMetrics?: SummaryMetric[];
  exportData?: any[];
  exportFilename?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  breadcrumb: () => [],
  loading: false,
  showFilters: true,
  showRefresh: true,
  availableTerminals: () => [],
  availableStatuses: () => [],
  selectedTerminals: () => [],
  selectedStatuses: () => [],
  summaryMetrics: () => [],
  exportData: () => [],
  exportFilename: 'report'
});

const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'export', data: any[]): void;
  (e: 'update:date-range', value: DateRange): void;
  (e: 'update:selected-terminals', value: string[]): void;
  (e: 'update:selected-statuses', value: string[]): void;
  (e: 'apply-filters'): void;
  (e: 'reset-filters'): void;
}>();

const exporting = ref(false);

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const handlePrint = () => {
  window.print();
};

const handleExport = async () => {
  exporting.value = true;

  try {
    // Convert data to CSV
    const data = props.exportData;
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${props.exportFilename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    emit('export', data);
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    exporting.value = false;
  }
};
</script>

<style>
/* Print styles */
@media print {
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .report-layout {
    background: white !important;
  }

  .print\:hidden {
    display: none !important;
  }

  .print\:block {
    display: block !important;
  }

  /* Page setup */
  @page {
    size: A4 landscape;
    margin: 1.5cm;
  }

  /* Ensure tables break properly */
  table {
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    display: table-header-group;
  }

  /* Chart sizing for print */
  canvas {
    max-width: 100% !important;
    height: auto !important;
  }
}
</style>
