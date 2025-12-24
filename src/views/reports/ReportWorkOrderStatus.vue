<template>
  <ReportLayout
    :title="reportTitle"
    :subtitle="reportSubtitle"
    :breadcrumb="breadcrumb"
    :loading="loading"
    :show-filters="true"
    :show-refresh="true"
    :date-range="dateRange"
    :available-terminals="availableTerminals"
    :available-statuses="availableStatuses"
    :selected-terminals="selectedTerminals"
    :selected-statuses="selectedStatuses"
    :summary-metrics="summaryMetrics"
    :export-data="exportData"
    :export-filename="exportFilename"
    @update:date-range="handleDateRangeUpdate"
    @update:selected-terminals="selectedTerminals = $event"
    @update:selected-statuses="selectedStatuses = $event"
    @apply-filters="applyFilters"
    @reset-filters="resetFilters"
    @refresh="loadReportData"
  >
    <!-- Charts Section (only for aggregated views) -->
    <div v-if="drillLevel !== 'worker'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Status Distribution Chart -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
        <div class="h-64 flex items-center justify-center">
          <canvas ref="statusChartRef"></canvas>
        </div>
      </div>

      <!-- Completion Trend Chart -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Completion Rate by {{ getLevelLabel() }}</h3>
        <div class="h-64">
          <canvas ref="completionChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Aggregated Data Table (Region/Terminal/Worker level) -->
    <ReportDataTable
      v-if="drillLevel !== 'worker'"
      :title="tableTitle"
      :subtitle="tableSubtitle"
      :columns="aggregatedColumns"
      :data="reportRows"
      row-key="id"
      :searchable="true"
      :search-placeholder="`Search ${getLevelLabel().toLowerCase()}...`"
      :paginated="true"
      :page-size="50"
      :empty-message="`No ${getLevelLabel().toLowerCase()} data available`"
      @row-click="handleDrillDown"
    >
      <!-- Custom cell for name with drill-down indicator -->
      <template #cell-name="{ row, value }">
        <div class="flex items-center">
          <span class="font-medium text-gray-900">{{ value }}</span>
          <ChevronRight v-if="row.isClickable" class="h-4 w-4 ml-2 text-blue-500" />
        </div>
      </template>

      <!-- Custom cell for completion rate -->
      <template #cell-completionRate="{ value }">
        <div class="flex items-center">
          <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div
              class="h-2 rounded-full"
              :class="getProgressClass(value)"
              :style="{ width: `${value}%` }"
            ></div>
          </div>
          <span class="text-sm text-gray-900">{{ value }}%</span>
        </div>
      </template>

      <!-- Custom cell for overdue count -->
      <template #cell-overdue="{ value }">
        <span
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          :class="value > 3 ? 'bg-red-100 text-red-800' : value > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'"
        >
          {{ value }}
        </span>
      </template>
    </ReportDataTable>

    <!-- Individual Work Orders Table (Worker level) -->
    <ReportDataTable
      v-else
      :title="tableTitle"
      :subtitle="tableSubtitle"
      :columns="workOrderColumns"
      :data="workOrderRows"
      row-key="id"
      :searchable="true"
      search-placeholder="Search work orders..."
      :paginated="true"
      :page-size="50"
      empty-message="No work orders found"
      @row-click="handleWorkOrderClick"
    >
      <!-- Custom cell for status badge -->
      <template #cell-status="{ value }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="getStatusClass(value)"
        >
          {{ formatStatus(value) }}
        </span>
      </template>

      <!-- Custom cell for priority badge -->
      <template #cell-priority="{ value }">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="getPriorityClass(value)"
        >
          {{ value }}
        </span>
      </template>

      <!-- Custom cell for type -->
      <template #cell-type="{ value }">
        <span class="capitalize">{{ value }}</span>
      </template>

      <!-- Custom cell for days overdue -->
      <template #cell-daysOverdue="{ value }">
        <span v-if="value" class="text-red-600 font-medium">
          {{ value }} days
        </span>
        <span v-else class="text-gray-400">-</span>
      </template>
    </ReportDataTable>
  </ReportLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';
import Chart from 'chart.js/auto';
import ReportLayout from '@/components/reports/ReportLayout.vue';
import ReportDataTable from '@/components/reports/ReportDataTable.vue';
import { useReportsStore, type DrillDownLevel, type WorkOrderStatusRow, type WorkOrderDetailRow } from '@/stores/reports';

const route = useRoute();
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
const selectedStatuses = ref<string[]>([]);
const reportRows = ref<WorkOrderStatusRow[]>([]);
const workOrderRows = ref<WorkOrderDetailRow[]>([]);
const summary = ref({
  total: 0,
  byStatus: {} as Record<string, number>,
  byType: {} as Record<string, number>,
  byPriority: {} as Record<string, number>,
  completionRate: 0,
  overdueCount: 0,
  avgCompletionTime: 0
});

// Chart refs
const statusChartRef = ref<HTMLCanvasElement | null>(null);
const completionChartRef = ref<HTMLCanvasElement | null>(null);
let statusChart: Chart | null = null;
let completionChart: Chart | null = null;

// Computed
const drillLevel = computed((): DrillDownLevel => {
  if (route.params.workerId) return 'worker';
  if (route.params.terminalId) return 'terminal';
  if (route.params.regionId) return 'region';
  return 'all';
});

const reportTitle = computed(() => {
  switch (drillLevel.value) {
    case 'region':
      return `Work Orders - ${reportsStore.getRegionName(route.params.regionId as string)}`;
    case 'terminal':
      return `Work Orders - ${reportsStore.getTerminalName(route.params.terminalId as string)}`;
    case 'worker':
      return `Work Orders - ${reportsStore.getWorkerName(route.params.workerId as string)}`;
    default:
      return 'Work Order Status Report';
  }
});

const reportSubtitle = computed(() => {
  return `${dateRange.value.start} to ${dateRange.value.end} | ${summary.value.total} total work orders`;
});

const breadcrumb = computed(() => {
  return reportsStore.buildBreadcrumb(
    '/reports/work-orders/status',
    drillLevel.value,
    route.params.regionId as string | undefined,
    route.params.terminalId as string | undefined,
    route.params.workerId as string | undefined
  );
});

const tableTitle = computed(() => {
  switch (drillLevel.value) {
    case 'all':
      return 'Performance by Region';
    case 'region':
      return 'Performance by Terminal';
    case 'terminal':
      return 'Performance by Worker';
    case 'worker':
      return 'Work Orders';
    default:
      return 'Data';
  }
});

const tableSubtitle = computed(() => {
  if (drillLevel.value === 'worker') {
    return 'Click a work order to view details';
  }
  return 'Click a row to drill down';
});

const summaryMetrics = computed(() => [
  {
    id: 'total',
    label: 'Total Work Orders',
    value: summary.value.total,
    icon: 'clipboard-list',
    iconColor: 'blue' as const
  },
  {
    id: 'completion_rate',
    label: 'Completion Rate',
    value: `${summary.value.completionRate}%`,
    icon: 'check-circle',
    iconColor: 'green' as const
  },
  {
    id: 'overdue',
    label: 'Overdue',
    value: summary.value.overdueCount,
    icon: 'alert-triangle',
    iconColor: 'red' as const
  },
  {
    id: 'avg_time',
    label: 'Avg Completion Time',
    value: `${summary.value.avgCompletionTime} days`,
    icon: 'clock',
    iconColor: 'yellow' as const
  }
]);

const availableTerminals = computed(() => {
  return reportsStore.getAvailableTerminals;
});

const availableStatuses = computed(() => [
  { id: 'draft', label: 'Draft' },
  { id: 'pending_approval', label: 'Pending Approval' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'submitted_for_review', label: 'Submitted for Review' },
  { id: 'completed', label: 'Completed' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'revision_required', label: 'Revision Required' }
]);

const exportData = computed(() => {
  if (drillLevel.value === 'worker') {
    return workOrderRows.value.map(row => ({
      'WO Code': row.code,
      'Title': row.title,
      'Status': row.status,
      'Priority': row.priority,
      'Type': row.type,
      'Terminal': row.terminalName,
      'Worker': row.workerName,
      'Due Date': row.dueDate,
      'Days Overdue': row.daysOverdue || ''
    }));
  }
  return reportRows.value.map(row => ({
    'Name': row.name,
    'Total WOs': row.totalWorkOrders,
    'Completed': row.completed,
    'In Progress': row.inProgress,
    'Pending': row.pending,
    'Overdue': row.overdue,
    'Completion Rate': `${row.completionRate}%`,
    'Avg Time (days)': row.avgCompletionTime
  }));
});

const exportFilename = computed(() => {
  const levelName = drillLevel.value === 'all' ? 'all-regions' : route.params[`${drillLevel.value}Id`] || drillLevel.value;
  return `work-order-status-${levelName}`;
});

// Column definitions
const aggregatedColumns = computed(() => [
  { key: 'name', label: getLevelLabel(), sortable: true, type: 'drilldown' as const },
  { key: 'totalWorkOrders', label: 'Total WOs', sortable: true, align: 'center' as const },
  { key: 'completed', label: 'Completed', sortable: true, align: 'center' as const },
  { key: 'inProgress', label: 'In Progress', sortable: true, align: 'center' as const },
  { key: 'pending', label: 'Pending', sortable: true, align: 'center' as const },
  { key: 'overdue', label: 'Overdue', sortable: true, align: 'center' as const },
  { key: 'completionRate', label: 'Completion %', sortable: true, align: 'center' as const },
  { key: 'avgCompletionTime', label: 'Avg Time (days)', sortable: true, align: 'center' as const }
]);

const workOrderColumns = [
  { key: 'code', label: 'WO Code', sortable: true },
  { key: 'title', label: 'Title', sortable: true },
  { key: 'status', label: 'Status', sortable: true, type: 'badge' as const },
  { key: 'priority', label: 'Priority', sortable: true, type: 'badge' as const },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'dueDate', label: 'Due Date', sortable: true, type: 'date' as const },
  { key: 'daysOverdue', label: 'Days Overdue', sortable: true, align: 'center' as const }
];

// Methods
const getLevelLabel = (): string => {
  switch (drillLevel.value) {
    case 'all':
      return 'Region';
    case 'region':
      return 'Terminal';
    case 'terminal':
      return 'Worker';
    default:
      return 'Item';
  }
};

const loadReportData = async () => {
  loading.value = true;

  try {
    const context = {
      level: drillLevel.value,
      regionId: route.params.regionId as string | undefined,
      terminalId: route.params.terminalId as string | undefined,
      workerId: route.params.workerId as string | undefined,
      breadcrumb: []
    };

    const filters = {
      dateStart: dateRange.value.start,
      dateEnd: dateRange.value.end,
      statuses: selectedStatuses.value
    };

    if (drillLevel.value === 'worker') {
      // Load individual work orders for worker
      workOrderRows.value = reportsStore.getWorkOrdersForWorker(
        route.params.workerId as string,
        filters
      );
      summary.value = {
        total: workOrderRows.value.length,
        byStatus: {},
        byType: {},
        byPriority: {},
        completionRate: Math.round(
          (workOrderRows.value.filter(w => w.status === 'completed').length / workOrderRows.value.length) * 100
        ) || 0,
        overdueCount: workOrderRows.value.filter(w => w.daysOverdue).length,
        avgCompletionTime: 2.5
      };
    } else {
      // Load aggregated data
      const result = reportsStore.getWorkOrderStatusReport(context, filters);
      reportRows.value = result.rows;
      summary.value = result.summary;
    }

    // Update charts
    await nextTick();
    updateCharts();
  } finally {
    loading.value = false;
  }
};

const updateCharts = () => {
  if (drillLevel.value === 'worker') return;

  // Status distribution chart
  if (statusChartRef.value) {
    if (statusChart) {
      statusChart.destroy();
    }

    const ctx = statusChartRef.value.getContext('2d');
    if (ctx) {
      statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
          datasets: [{
            data: [
              summary.value.byStatus['completed'] || 28,
              summary.value.byStatus['in_progress'] || 25,
              (summary.value.byStatus['pending_approval'] || 10) + (summary.value.byStatus['assigned'] || 15),
              summary.value.overdueCount || 5
            ],
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
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

  // Completion rate chart
  if (completionChartRef.value && reportRows.value.length > 0) {
    if (completionChart) {
      completionChart.destroy();
    }

    const ctx = completionChartRef.value.getContext('2d');
    if (ctx) {
      const labels = reportRows.value.slice(0, 10).map(r => r.name.replace(/Region \d+ - /, '').slice(0, 15));
      const data = reportRows.value.slice(0, 10).map(r => r.completionRate);

      completionChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Completion Rate (%)',
            data,
            backgroundColor: data.map(v => v >= 90 ? '#10B981' : v >= 70 ? '#3B82F6' : v >= 50 ? '#F59E0B' : '#EF4444')
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
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

const handleDrillDown = (row: WorkOrderStatusRow) => {
  if (!row.isClickable) return;

  const basePath = '/reports/work-orders/status';

  switch (drillLevel.value) {
    case 'all':
      router.push(`${basePath}/${row.id}`);
      break;
    case 'region':
      router.push(`${basePath}/${route.params.regionId}/${row.id}`);
      break;
    case 'terminal':
      router.push(`${basePath}/${route.params.regionId}/${route.params.terminalId}/${row.id}`);
      break;
  }
};

const handleWorkOrderClick = (row: WorkOrderDetailRow) => {
  router.push(`/work-orders/${row.id}`);
};

const handleDateRangeUpdate = (newRange: { start: string; end: string }) => {
  dateRange.value = newRange;
};

const applyFilters = () => {
  loadReportData();
};

const resetFilters = () => {
  selectedTerminals.value = [];
  selectedStatuses.value = [];
  dateRange.value = {
    start: getDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    end: getDateString(new Date())
  };
  loadReportData();
};

const getProgressClass = (value: number): string => {
  if (value >= 90) return 'bg-green-600';
  if (value >= 70) return 'bg-blue-600';
  if (value >= 50) return 'bg-yellow-600';
  return 'bg-red-600';
};

const getStatusClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'pending_approval': 'bg-yellow-100 text-yellow-800',
    'assigned': 'bg-blue-100 text-blue-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'submitted_for_review': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'revision_required': 'bg-orange-100 text-orange-800',
    'overdue': 'bg-red-100 text-red-800'
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

const getPriorityClass = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    'low': 'bg-green-100 text-green-800',
    'normal': 'bg-gray-100 text-gray-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800'
  };
  return priorityMap[priority] || 'bg-gray-100 text-gray-800';
};

const formatStatus = (status: string): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Lifecycle
onMounted(() => {
  loadReportData();
});

// Watch for route changes to reload data
watch(() => route.params, () => {
  loadReportData();
}, { deep: true });
</script>
