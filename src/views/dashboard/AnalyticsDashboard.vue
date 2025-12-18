<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p class="text-sm text-gray-600">
          {{ roleBasedDescription }}
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="refreshDashboard"
          :disabled="isLoading"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RotateCcw class="w-4 h-4 mr-2" :class="isLoading ? 'animate-spin' : ''" />
          Refresh
        </button>
        <select
          v-model="selectedTimeframe"
          class="border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        v-for="kpi in currentUserKPIs"
        :key="kpi.id"
        :title="kpi.title"
        :value="kpi.value"
        :change="kpi.change"
        :change-type="kpi.changeType"
        :period="kpi.period"
        :icon="kpi.icon"
        :color="kpi.color"
        :description="kpi.description"
      />
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Work Order Trends -->
      <PerformanceChart
        title="Work Order Trends"
        type="line"
        :chart-data="workOrderTrendData"
      />

      <!-- Maintenance Type Distribution -->
      <PerformanceChart
        title="Maintenance Type Distribution"
        type="doughnut"
        :chart-data="maintenanceTypeData"
      />
    </div>

    <!-- Priority Distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PerformanceChart
        title="Priority Distribution"
        type="doughnut"
        :chart-data="priorityDistributionData"
      />
      
      <!-- Terminal Performance Summary (Admin/Supervisor only) -->
      <div v-if="!isWorker" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        
        <div class="space-y-4">
          <div v-if="currentTerminalPerformance" class="p-4 bg-blue-50 rounded-lg">
            <h4 class="font-medium text-blue-900">My Terminal Performance</h4>
            <div class="mt-2 grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-blue-600">Completion Rate</div>
                <div class="text-lg font-semibold text-blue-900">{{ currentTerminalPerformance.completionRate }}%</div>
              </div>
              <div>
                <div class="text-sm text-blue-600">Efficiency</div>
                <div class="text-lg font-semibold text-blue-900">{{ currentTerminalPerformance.efficiency }}%</div>
              </div>
            </div>
          </div>
          
          <div v-if="isSupervisor" class="space-y-3">
            <div class="p-4 bg-green-50 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-green-900">Top Performer</h4>
                  <p class="text-sm text-green-600">{{ topPerformer?.terminalName }}</p>
                </div>
                <div class="text-right">
                  <div class="text-lg font-semibold text-green-900">{{ topPerformer?.efficiency }}%</div>
                  <div class="text-sm text-green-600">Efficiency</div>
                </div>
              </div>
            </div>
            
            <div v-if="lowPerformer" class="p-4 bg-orange-50 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-orange-900">Needs Attention</h4>
                  <p class="text-sm text-orange-600">{{ lowPerformer.terminalName }}</p>
                </div>
                <div class="text-right">
                  <div class="text-lg font-semibold text-orange-900">{{ lowPerformer.efficiency }}%</div>
                  <div class="text-sm text-orange-600">Efficiency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Terminal Performance Table (Supervisor only) -->
    <div v-if="isSupervisor" class="space-y-6">
      <TerminalPerformanceTable
        title="Terminal Performance Overview"
        :terminals="terminalPerformance"
        sort-by="efficiency"
      />
    </div>

    <!-- Recent Activity (Worker view) -->
    <div v-if="isWorker" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">My Recent Activity</h3>
      
      <div class="space-y-4">
        <div 
          v-for="activity in recentWorkerActivity"
          :key="activity.id"
          class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
        >
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center"
            :class="getActivityColor(activity.type)"
          >
            <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
            <p class="text-sm text-gray-600">{{ activity.description }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ formatDate(activity.timestamp) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Summary (All roles) -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ weeklyStats.completed }}</div>
          <div class="text-sm text-gray-500">Work Orders Completed</div>
          <div class="text-xs text-green-600 mt-1">+{{ weeklyStats.completedChange }}% vs last week</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">{{ weeklyStats.average }}h</div>
          <div class="text-sm text-gray-500">Average Completion Time</div>
          <div class="text-xs text-green-600 mt-1">-{{ weeklyStats.timeImprovement }}% vs last week</div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ weeklyStats.efficiency }}%</div>
          <div class="text-sm text-gray-500">Overall Efficiency</div>
          <div class="text-xs text-green-600 mt-1">+{{ weeklyStats.efficiencyChange }}% vs last week</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';
import { RotateCcw, CheckCircle, Clock, AlertTriangle, PlayCircle } from 'lucide-vue-next';

import KPICard from '@/components/dashboard/KPICard.vue';
import PerformanceChart from '@/components/dashboard/PerformanceChart.vue';
import TerminalPerformanceTable from '@/components/dashboard/TerminalPerformanceTable.vue';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

const selectedTimeframe = ref('30d');

const isWorker = computed(() => authStore.isWorker);
const isSupervisor = computed(() => authStore.isSupervisor);
const isAdmin = computed(() => authStore.isAdmin);

const isLoading = computed(() => dashboardStore.isLoading);
const currentUserKPIs = computed(() => dashboardStore.currentUserKPIs);
const currentTerminalPerformance = computed(() => dashboardStore.currentTerminalPerformance);
const terminalPerformance = computed(() => dashboardStore.terminalPerformance);
const workOrderTrendData = computed(() => dashboardStore.workOrderTrendData);
const maintenanceTypeData = computed(() => dashboardStore.maintenanceTypeData);
const priorityDistributionData = computed(() => dashboardStore.priorityDistributionData);

const roleBasedDescription = computed(() => {
  if (isWorker.value) return 'Track your personal performance and work progress';
  if (isAdmin.value) return 'Monitor terminal operations and resource management';
  if (isSupervisor.value) return 'Oversee regional performance and team efficiency';
  return 'Comprehensive analytics and performance insights';
});

const topPerformer = computed(() => dashboardStore.getTopPerformingTerminals(1)[0]);
const lowPerformer = computed(() => {
  const lowPerformers = dashboardStore.getLowPerformingTerminals(1);
  return lowPerformers[0]?.efficiency < 85 ? lowPerformers[0] : null;
});

// Mock recent activity for worker
const recentWorkerActivity = ref([
  {
    id: '1',
    type: 'completed',
    title: 'Gas Compressor Maintenance Completed',
    description: 'Unit C2 monthly inspection completed successfully',
    timestamp: '2024-12-17T15:30:00Z'
  },
  {
    id: '2',
    type: 'started',
    title: 'Pipeline Pressure Test Started',
    description: 'Main Line A pressure testing in progress',
    timestamp: '2024-12-17T08:00:00Z'
  },
  {
    id: '3',
    type: 'assigned',
    title: 'New Work Order Assigned',
    description: 'Emergency valve test scheduled for tomorrow',
    timestamp: '2024-12-16T16:45:00Z'
  }
]);

// Mock weekly statistics
const weeklyStats = ref({
  completed: 12,
  completedChange: 8,
  average: 4.2,
  timeImprovement: 12,
  efficiency: 91,
  efficiencyChange: 5
});

const getActivityColor = (type: string) => {
  switch (type) {
    case 'completed': return 'bg-green-100 text-green-600';
    case 'started': return 'bg-blue-100 text-blue-600';
    case 'assigned': return 'bg-purple-100 text-purple-600';
    case 'overdue': return 'bg-red-100 text-red-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'completed': return CheckCircle;
    case 'started': return PlayCircle;
    case 'assigned': return Clock;
    case 'overdue': return AlertTriangle;
    default: return Clock;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const refreshDashboard = () => {
  dashboardStore.refreshDashboard();
};

onMounted(() => {
  dashboardStore.refreshDashboard();
});
</script>