<template>
  <ReportLayout
    :title="'Overdue Work Orders Report'"
    :subtitle="reportSubtitle"
    :breadcrumb="breadcrumb"
    :loading="loading"
    :show-filters="true"
    :show-refresh="true"
    :date-range="dateRange"
    :available-terminals="availableTerminals"
    :selected-terminals="selectedTerminals"
    :summary-metrics="summaryMetrics"
    :export-data="exportData"
    export-filename="overdue-work-orders"
    @update:date-range="handleDateRangeUpdate"
    @update:selected-terminals="selectedTerminals = $event"
    @apply-filters="loadReportData"
    @reset-filters="resetFilters"
    @refresh="loadReportData"
  >
    <!-- Urgency Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-800">Low Urgency</p>
            <p class="text-2xl font-bold text-green-900">{{ urgencyCounts.low }}</p>
            <p class="text-xs text-green-600">1-2 days overdue</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <Clock class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-yellow-800">Medium Urgency</p>
            <p class="text-2xl font-bold text-yellow-900">{{ urgencyCounts.medium }}</p>
            <p class="text-xs text-yellow-600">3-5 days overdue</p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <AlertTriangle class="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-red-800">High Urgency</p>
            <p class="text-2xl font-bold text-red-900">{{ urgencyCounts.high }}</p>
            <p class="text-xs text-red-600">6+ days overdue</p>
          </div>
          <div class="p-3 bg-red-100 rounded-full">
            <AlertCircle class="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Overdue by Priority -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Overdue by Priority</h3>
        <div class="h-64 flex items-center justify-center">
          <canvas ref="priorityChartRef"></canvas>
        </div>
      </div>

      <!-- Overdue Trend -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Days Overdue Distribution</h3>
        <div class="h-64">
          <canvas ref="daysChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Overdue Work Orders Table -->
    <ReportDataTable
      title="Overdue Work Orders"
      :subtitle="`${overdueRows.length} overdue work orders | Est. Penalty: ${formatCurrency(totalPenalty)}`"
      :columns="columns"
      :data="overdueRows"
      row-key="workOrderId"
      :searchable="true"
      search-placeholder="Search overdue work orders..."
      :search-fields="['title', 'assignedWorker', 'terminalId']"
      :paginated="true"
      :page-size="50"
      empty-message="No overdue work orders found"
      @row-click="handleRowClick"
    >
      <!-- Custom cell for urgency indicator -->
      <template #cell-urgency="{ value }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="getUrgencyClass(value)"
        >
          {{ value }}
        </span>
      </template>

      <!-- Custom cell for days overdue -->
      <template #cell-daysOverdue="{ value }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="getDaysOverdueClass(value)"
        >
          {{ value }} days
        </span>
      </template>

      <!-- Custom cell for priority -->
      <template #cell-priority="{ value }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="getPriorityClass(value)"
        >
          {{ value }}
        </span>
      </template>

      <!-- Custom cell for penalty -->
      <template #cell-estimatedPenalty="{ value }">
        <span class="font-medium text-red-600">
          {{ formatCurrency(value) }}
        </span>
      </template>

      <!-- Custom cell for title with link -->
      <template #cell-title="{ row, value }">
        <div class="flex items-center">
          <span class="font-medium text-gray-900">{{ value }}</span>
          <ChevronRight class="h-4 w-4 ml-2 text-blue-500" />
        </div>
      </template>

      <!-- Custom cell for due date -->
      <template #cell-dueDate="{ value }">
        <span class="text-gray-900">{{ formatDate(value) }}</span>
      </template>
    </ReportDataTable>
  </ReportLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Clock, AlertTriangle, AlertCircle, ChevronRight } from 'lucide-vue-next';
import Chart from 'chart.js/auto';
import ReportLayout from '@/components/reports/ReportLayout.vue';
import ReportDataTable from '@/components/reports/ReportDataTable.vue';
import { useReportsStore } from '@/stores/reports';

const router = useRouter();
const reportsStore = useReportsStore();

// State
const loading = ref(false);
const getDateString = (date: Date): string => {
  const isoString = date.toISOString();
  return isoString.split('T')[0] || '';
};

const dateRange = ref({
  start: getDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  end: getDateString(new Date())
});
const selectedTerminals = ref<string[]>([]);
const overdueRows = ref<any[]>([]);
const totalPenalty = ref(0);

// Chart refs
const priorityChartRef = ref<HTMLCanvasElement | null>(null);
const daysChartRef = ref<HTMLCanvasElement | null>(null);
let priorityChart: Chart | null = null;
let daysChart: Chart | null = null;

// Breadcrumb
const breadcrumb = computed(() => [
  { label: 'Overdue Work Orders', path: '/reports/work-orders/overdue', level: 'all' as const }
]);

// Computed
const reportSubtitle = computed(() => {
  return `${dateRange.value.start} to ${dateRange.value.end} | ${overdueRows.value.length} overdue items`;
});

const urgencyCounts = computed(() => {
  return {
    low: overdueRows.value.filter(r => r.urgency === 'low').length,
    medium: overdueRows.value.filter(r => r.urgency === 'medium').length,
    high: overdueRows.value.filter(r => r.urgency === 'high').length
  };
});

const summaryMetrics = computed(() => [
  {
    id: 'total_overdue',
    label: 'Total Overdue',
    value: overdueRows.value.length,
    icon: 'alert-triangle',
    iconColor: 'red' as const
  },
  {
    id: 'total_penalty',
    label: 'Estimated Penalty',
    value: formatCurrency(totalPenalty.value),
    icon: 'dollar-sign',
    iconColor: 'red' as const
  },
  {
    id: 'avg_days',
    label: 'Avg Days Overdue',
    value: overdueRows.value.length > 0
      ? (overdueRows.value.reduce((sum, r) => sum + r.daysOverdue, 0) / overdueRows.value.length).toFixed(1)
      : 0,
    icon: 'clock',
    iconColor: 'yellow' as const
  },
  {
    id: 'critical',
    label: 'Critical Priority',
    value: overdueRows.value.filter(r => r.priority === 'critical' || r.priority === 'urgent').length,
    icon: 'alert-triangle',
    iconColor: 'red' as const
  }
]);

const availableTerminals = computed(() => {
  return reportsStore.getAvailableTerminals;
});

const exportData = computed(() => {
  return overdueRows.value.map(row => ({
    'Work Order': row.title,
    'Worker': row.assignedWorker,
    'Terminal': row.terminalId,
    'Due Date': row.dueDate,
    'Days Overdue': row.daysOverdue,
    'Priority': row.priority,
    'Urgency': row.urgency,
    'Estimated Penalty': row.estimatedPenalty
  }));
});

// Column definitions
const columns = [
  { key: 'title', label: 'Work Order', sortable: true },
  { key: 'assignedWorker', label: 'Assigned Worker', sortable: true },
  { key: 'terminalId', label: 'Terminal', sortable: true },
  { key: 'dueDate', label: 'Due Date', sortable: true, type: 'date' as const },
  { key: 'daysOverdue', label: 'Days Overdue', sortable: true, align: 'center' as const },
  { key: 'priority', label: 'Priority', sortable: true, type: 'badge' as const },
  { key: 'urgency', label: 'Urgency', sortable: true, type: 'badge' as const },
  { key: 'estimatedPenalty', label: 'Est. Penalty', sortable: true, align: 'right' as const, type: 'currency' as const }
];

// Methods
const loadReportData = async () => {
  loading.value = true;

  try {
    const result = reportsStore.getOverdueReportData(
      { level: 'all', breadcrumb: [] },
      { dateStart: dateRange.value.start, dateEnd: dateRange.value.end }
    );

    overdueRows.value = result.rows.map(row => ({
      ...row,
      isClickable: true
    }));
    totalPenalty.value = result.summary.totalPenalty;

    await nextTick();
    updateCharts();
  } finally {
    loading.value = false;
  }
};

const updateCharts = () => {
  // Priority chart
  if (priorityChartRef.value) {
    if (priorityChart) {
      priorityChart.destroy();
    }

    const ctx = priorityChartRef.value.getContext('2d');
    if (ctx) {
      const priorityCounts = {
        low: overdueRows.value.filter(r => r.priority === 'low').length,
        normal: overdueRows.value.filter(r => r.priority === 'normal').length,
        high: overdueRows.value.filter(r => r.priority === 'high').length,
        critical: overdueRows.value.filter(r => r.priority === 'critical' || r.priority === 'urgent').length
      };

      priorityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Low', 'Normal', 'High', 'Critical'],
          datasets: [{
            data: [priorityCounts.low, priorityCounts.normal, priorityCounts.high, priorityCounts.critical],
            backgroundColor: ['#10B981', '#6B7280', '#F59E0B', '#EF4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }

  // Days overdue chart
  if (daysChartRef.value) {
    if (daysChart) {
      daysChart.destroy();
    }

    const ctx = daysChartRef.value.getContext('2d');
    if (ctx) {
      // Group by days overdue ranges
      const dayRanges = {
        '1-2 days': overdueRows.value.filter(r => r.daysOverdue <= 2).length,
        '3-5 days': overdueRows.value.filter(r => r.daysOverdue > 2 && r.daysOverdue <= 5).length,
        '6-7 days': overdueRows.value.filter(r => r.daysOverdue > 5 && r.daysOverdue <= 7).length,
        '8+ days': overdueRows.value.filter(r => r.daysOverdue > 7).length
      };

      daysChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(dayRanges),
          datasets: [{
            label: 'Work Orders',
            data: Object.values(dayRanges),
            backgroundColor: ['#10B981', '#F59E0B', '#F97316', '#EF4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  }
};

const handleRowClick = (row: any) => {
  router.push(`/work-orders/${row.workOrderId}`);
};

const handleDateRangeUpdate = (newRange: { start: string; end: string }) => {
  dateRange.value = newRange;
};

const resetFilters = () => {
  selectedTerminals.value = [];
  dateRange.value = {
    start: getDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    end: getDateString(new Date())
  };
  loadReportData();
};

const formatCurrency = (value: number): string => {
  return `Rp ${value.toLocaleString('id-ID')}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getUrgencyClass = (urgency: string): string => {
  const urgencyMap: Record<string, string> = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-red-100 text-red-800'
  };
  return urgencyMap[urgency] || 'bg-gray-100 text-gray-800';
};

const getDaysOverdueClass = (days: number): string => {
  if (days <= 2) return 'bg-green-100 text-green-800';
  if (days <= 5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getPriorityClass = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    'low': 'bg-green-100 text-green-800',
    'normal': 'bg-gray-100 text-gray-800',
    'high': 'bg-orange-100 text-orange-800',
    'critical': 'bg-red-100 text-red-800',
    'urgent': 'bg-red-100 text-red-800'
  };
  return priorityMap[priority] || 'bg-gray-100 text-gray-800';
};

// Lifecycle
onMounted(() => {
  loadReportData();
});
</script>
