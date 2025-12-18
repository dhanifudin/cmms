<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p class="text-sm text-gray-600">Comprehensive system performance and cost analysis</p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="refreshReports"
          :disabled="loading"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshCw class="h-4 w-4 mr-2" :class="{ 'animate-spin': loading }" />
          Refresh
        </button>
        <div class="relative">
          <button
            @click="showExportModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download class="h-4 w-4 mr-2" />
            Export Reports
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <div class="flex items-center space-x-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <div class="flex items-center space-x-2">
            <input
              v-model="dateRange.start"
              type="date"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span class="text-gray-500">to</span>
            <input
              v-model="dateRange.end"
              type="date"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Quick Ranges</label>
          <select 
            @change="setQuickRange"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Custom Range</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
        
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Terminals</label>
          <multiselect
            v-model="selectedTerminals"
            :options="terminalOptions"
            multiple
            placeholder="All Terminals"
            class="text-sm"
          >
            <template v-slot:tag="{ option, remove }">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                {{ option }}
                <button @click="remove(option)" class="ml-1 text-blue-600 hover:text-blue-800">×</button>
              </span>
            </template>
          </multiselect>
        </div>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <div
        v-for="metric in keyMetrics"
        :key="metric.id"
        class="bg-white p-6 rounded-lg border border-gray-200"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">{{ metric.title }}</p>
            <p class="text-2xl font-semibold text-gray-900">{{ metric.value }}</p>
          </div>
          <div class="text-right">
            <p 
              class="text-sm font-medium"
              :class="getMetricChangeColor(metric)"
            >
              {{ metric.change }}
            </p>
            <p class="text-xs text-gray-500">{{ metric.period }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Work Orders Trend -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Work Orders Trend</h3>
        <div class="h-64">
          <canvas ref="workOrdersTrendChart"></canvas>
        </div>
      </div>

      <!-- Maintenance Types -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Maintenance Types</h3>
        <div class="h-64 flex items-center justify-center">
          <canvas ref="maintenanceTypesChart" class="max-h-full"></canvas>
        </div>
      </div>

      <!-- Terminal Performance -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Completion Rate by Terminal</h3>
        <div class="h-64">
          <canvas ref="terminalPerformanceChart"></canvas>
        </div>
      </div>

      <!-- Cost Breakdown -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Monthly Cost Breakdown</h3>
        <div class="h-64">
          <canvas ref="costBreakdownChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Data Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Terminal Performance Table -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Terminal Performance</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terminal</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="terminal in terminalPerformance" :key="terminal.terminalId">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ terminal.terminalName }}</p>
                    <p class="text-xs text-gray-500">{{ terminal.workerCount }} workers</p>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-900">{{ terminal.completionRate }}%</span>
                    <span 
                      class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800': terminal.efficiency === 'excellent',
                        'bg-blue-100 text-blue-800': terminal.efficiency === 'good',
                        'bg-yellow-100 text-yellow-800': terminal.efficiency === 'average',
                        'bg-red-100 text-red-800': terminal.efficiency === 'poor'
                      }"
                    >
                      {{ terminal.efficiency }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                  {{ terminal.avgCompletionTime }} days
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="terminal.overdueCount > 3 ? 'bg-red-100 text-red-800' : terminal.overdueCount > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'"
                  >
                    {{ terminal.overdueCount }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                  ${{ terminal.totalCost.toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Worker Performance Table -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Top Worker Performance</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="worker in workerPerformance.slice(0, 5)" :key="worker.workerId">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ worker.workerName }}</p>
                    <p class="text-xs text-gray-500">{{ worker.avgCompletionTime }} day avg</p>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span class="text-sm font-medium text-gray-900">{{ worker.completedOrders }}</span>
                  <span 
                    v-if="worker.overdueCount > 0"
                    class="ml-1 text-xs text-red-600"
                  >
                    ({{ worker.overdueCount }} overdue)
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex items-center justify-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        class="h-2 rounded-full"
                        :class="worker.qualityScore >= 90 ? 'bg-green-600' : worker.qualityScore >= 80 ? 'bg-yellow-600' : 'bg-red-600'"
                        :style="`width: ${worker.qualityScore}%`"
                      ></div>
                    </div>
                    <span class="text-sm text-gray-900">{{ worker.qualityScore }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': worker.efficiency === 'excellent',
                      'bg-blue-100 text-blue-800': worker.efficiency === 'good',
                      'bg-yellow-100 text-yellow-800': worker.efficiency === 'average',
                      'bg-red-100 text-red-800': worker.efficiency === 'poor'
                    }"
                  >
                    {{ worker.efficiency }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Overdue Work Orders -->
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Overdue Work Orders</h3>
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {{ overdueReports.length }} overdue
          </span>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Order</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Worker</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Days Overdue</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Penalty</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in overdueReports" :key="item.workOrderId">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ item.title }}</p>
                  <p class="text-xs text-gray-500">{{ item.terminalId }}</p>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.assignedWorker }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                {{ formatDate(item.dueDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {{ item.daysOverdue }} days
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-yellow-100 text-yellow-800': item.priority === 'normal',
                    'bg-orange-100 text-orange-800': item.priority === 'high',
                    'bg-red-100 text-red-800': item.priority === 'urgent'
                  }"
                >
                  {{ item.priority }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-red-600">
                ${{ item.estimatedPenalty }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <router-link 
                  :to="`/work-orders/${item.workOrderId}`"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Cost Analysis -->
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Cost Analysis Summary</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="text-center">
            <p class="text-3xl font-bold text-gray-900">${{ costAnalysis.total.toLocaleString() }}</p>
            <p class="text-sm text-gray-500">Total Cost</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-semibold text-gray-900">
              ${{ costAnalysis.breakdown.labor.amount.toLocaleString() }}
              <span class="text-sm text-gray-500">({{ costAnalysis.breakdown.labor.percentage }}%)</span>
            </p>
            <p class="text-sm text-gray-500">Labor Cost</p>
            <p 
              class="text-xs font-medium"
              :class="costAnalysis.trends.labor.changeType === 'increase' ? 'text-red-600' : 'text-green-600'"
            >
              {{ costAnalysis.trends.labor.change }} vs last period
            </p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-semibold text-gray-900">
              ${{ costAnalysis.breakdown.materials.amount.toLocaleString() }}
              <span class="text-sm text-gray-500">({{ costAnalysis.breakdown.materials.percentage }}%)</span>
            </p>
            <p class="text-sm text-gray-500">Materials Cost</p>
            <p 
              class="text-xs font-medium"
              :class="costAnalysis.trends.materials.changeType === 'increase' ? 'text-red-600' : 'text-green-600'"
            >
              {{ costAnalysis.trends.materials.change }} vs last period
            </p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-semibold text-gray-900">
              ${{ costAnalysis.breakdown.penalties.amount.toLocaleString() }}
              <span class="text-sm text-gray-500">({{ costAnalysis.breakdown.penalties.percentage }}%)</span>
            </p>
            <p class="text-sm text-gray-500">Penalties</p>
            <p 
              class="text-xs font-medium"
              :class="costAnalysis.trends.penalties.changeType === 'increase' ? 'text-red-600' : 'text-green-600'"
            >
              {{ costAnalysis.trends.penalties.change }} vs last period
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <ExportModal 
      v-if="showExportModal"
      @close="showExportModal = false"
      @export="handleExport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useReportsStore } from '@/stores/reports';
import { RefreshCw, Download } from 'lucide-vue-next';
import Chart from 'chart.js/auto';
import ExportModal from '@/components/reports/ExportModal.vue';

const reportsStore = useReportsStore();
const showExportModal = ref(false);
const selectedTerminals = ref<string[]>([]);

// Chart refs
const workOrdersTrendChart = ref<HTMLCanvasElement>();
const maintenanceTypesChart = ref<HTMLCanvasElement>();
const terminalPerformanceChart = ref<HTMLCanvasElement>();
const costBreakdownChart = ref<HTMLCanvasElement>();

// Chart instances - for cleanup if needed
const chartInstances: Chart[] = [];

// Computed
const { 
  loading, 
  keyMetrics, 
  chartData, 
  terminalPerformance, 
  workerPerformance, 
  overdueReports, 
  costAnalysis,
  dateRange
} = reportsStore;

const terminalOptions = ['Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 4', 'Terminal 5'];

// Methods
const setQuickRange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const value = target?.value;
  const now = new Date();
  const start = new Date();
  
  if (!value) return;
  
  switch (value) {
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return;
  }
  
  try {
    reportsStore.updateDateRange(
      start.toISOString().split('T')[0],
      now.toISOString().split('T')[0]
    );
  } catch (error) {
    console.error('Error updating date range:', error);
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const refreshReports = () => {
  reportsStore.refreshReports();
};

const getMetricChangeColor = (metric: any) => {
  if (metric.changeType === 'neutral') return 'text-gray-500';
  
  const isNegativeMetric = metric.id.includes('overdue') || metric.id.includes('penalties');
  
  if (metric.changeType === 'increase') {
    return isNegativeMetric ? 'text-red-600' : 'text-green-600';
  } else if (metric.changeType === 'decrease') {
    return isNegativeMetric ? 'text-green-600' : 'text-red-600';
  }
  
  return 'text-gray-500';
};

const handleExport = async (reportType: string, format: 'pdf' | 'excel' | 'csv') => {
  const result = await reportsStore.exportReport(reportType, format);
  if (result.success) {
    showExportModal.value = false;
    // Show success notification
    console.log(`Report exported: ${result.filename}`);
  }
};

// Multiselect mock component
const multiselect = {
  props: ['modelValue', 'options', 'multiple', 'placeholder'],
  emits: ['update:modelValue'],
  template: `
    <select 
      :value="modelValue" 
      @change="$emit('update:modelValue', Array.from($event.target.selectedOptions, option => option.value))"
      multiple
      class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
    </select>
  `
};

// Chart initialization
const initializeCharts = () => {
  nextTick(() => {
    // Work Orders Trend Chart
    if (workOrdersTrendChart.value && chartData?.[0]) {
      const ctx = workOrdersTrendChart.value.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'line',
          data: chartData[0].data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
        chartInstances.push(chart);
      }
    }

    // Maintenance Types Chart
    if (maintenanceTypesChart.value && chartData?.[1]) {
      const ctx = maintenanceTypesChart.value.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'doughnut',
          data: chartData[1].data,
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
        chartInstances.push(chart);
      }
    }

    // Terminal Performance Chart
    if (terminalPerformanceChart.value && chartData?.[2]) {
      const ctx = terminalPerformanceChart.value.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'bar',
          data: chartData[2].data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
        chartInstances.push(chart);
      }
    }

    // Cost Breakdown Chart
    if (costBreakdownChart.value && chartData?.[3]) {
      const ctx = costBreakdownChart.value.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'bar',
          data: chartData[3].data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                stacked: true
              },
              y: {
                stacked: true,
                beginAtZero: true
              }
            }
          }
        });
        chartInstances.push(chart);
      }
    }
  });
};

// Lifecycle
onMounted(() => {
  initializeCharts();
});

// Watch for date range changes
watch(dateRange, () => {
  // In real app, this would refetch data based on new date range
  console.log('Date range changed:', dateRange);
}, { deep: true });
</script>

<style scoped>
/* Custom styles for better chart display */
canvas {
  max-height: 100% !important;
}
</style>