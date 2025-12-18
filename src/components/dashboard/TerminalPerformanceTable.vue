<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      <div class="flex items-center space-x-2">
        <button
          v-for="view in views"
          :key="view"
          @click="selectedView = view"
          class="px-3 py-1 text-xs font-medium rounded-md"
          :class="selectedView === view 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
        >
          {{ view }}
        </button>
      </div>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Terminal
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Completion Rate
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              On-Time Rate
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg. Time (hrs)
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Orders
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Overdue
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Workers
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Efficiency
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr 
            v-for="terminal in sortedTerminals" 
            :key="terminal.terminalId"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div 
                  class="w-3 h-3 rounded-full mr-3"
                  :class="getEfficiencyColor(terminal.efficiency)"
                ></div>
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ terminal.terminalName }}</div>
                  <div class="text-sm text-gray-500">{{ terminal.terminalId.toUpperCase() }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-gray-900">{{ terminal.completionRate }}%</div>
                <div class="ml-2 w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full"
                    :class="getPerformanceBarColor(terminal.completionRate)"
                    :style="{ width: `${terminal.completionRate}%` }"
                  ></div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-gray-900">{{ terminal.onTimeRate }}%</div>
                <div class="ml-2 w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full"
                    :class="getPerformanceBarColor(terminal.onTimeRate)"
                    :style="{ width: `${terminal.onTimeRate}%` }"
                  ></div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ terminal.averageCompletionTime.toFixed(1) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ terminal.totalWorkOrders }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                v-if="terminal.overdueWorkOrders > 0"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
              >
                {{ terminal.overdueWorkOrders }}
              </span>
              <span v-else class="text-sm text-gray-500">0</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ terminal.workerCount }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getEfficiencyBadgeColor(terminal.efficiency)"
                >
                  {{ terminal.efficiency }}%
                </span>
                <component
                  :is="getEfficiencyIcon(terminal.efficiency)"
                  class="ml-2 w-4 h-4"
                  :class="getEfficiencyIconColor(terminal.efficiency)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="terminals.length === 0" class="text-center py-12 text-gray-500">
      <div class="mx-auto h-12 w-12 text-gray-300 mb-4">
        <BarChart3 class="w-full h-full" />
      </div>
      <p class="text-lg font-medium">No performance data available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-vue-next';

interface PerformanceMetric {
  terminalId: string;
  terminalName: string;
  completionRate: number;
  onTimeRate: number;
  averageCompletionTime: number;
  totalWorkOrders: number;
  overdueWorkOrders: number;
  workerCount: number;
  efficiency: number;
}

interface Props {
  title: string;
  terminals: PerformanceMetric[];
  sortBy?: keyof PerformanceMetric;
}

const props = withDefaults(defineProps<Props>(), {
  sortBy: 'efficiency'
});

const selectedView = ref('All');
const views = ['All', 'Top Performers', 'Need Attention'];

const sortedTerminals = computed(() => {
  let filtered = [...props.terminals];
  
  if (selectedView.value === 'Top Performers') {
    filtered = filtered.filter(t => t.efficiency >= 90);
  } else if (selectedView.value === 'Need Attention') {
    filtered = filtered.filter(t => t.efficiency < 80 || t.overdueWorkOrders > 0);
  }
  
  return filtered.sort((a, b) => {
    if (selectedView.value === 'Need Attention') {
      return a.efficiency - b.efficiency; // Ascending for worst first
    }
    return b[props.sortBy] - a[props.sortBy]; // Descending for best first
  });
});

const getEfficiencyColor = (efficiency: number) => {
  if (efficiency >= 90) return 'bg-green-500';
  if (efficiency >= 80) return 'bg-yellow-500';
  if (efficiency >= 70) return 'bg-orange-500';
  return 'bg-red-500';
};

const getPerformanceBarColor = (rate: number) => {
  if (rate >= 90) return 'bg-green-500';
  if (rate >= 80) return 'bg-yellow-500';
  if (rate >= 70) return 'bg-orange-500';
  return 'bg-red-500';
};

const getEfficiencyBadgeColor = (efficiency: number) => {
  if (efficiency >= 90) return 'bg-green-100 text-green-800';
  if (efficiency >= 80) return 'bg-yellow-100 text-yellow-800';
  if (efficiency >= 70) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getEfficiencyIcon = (efficiency: number) => {
  if (efficiency >= 85) return TrendingUp;
  if (efficiency >= 75) return Minus;
  return TrendingDown;
};

const getEfficiencyIconColor = (efficiency: number) => {
  if (efficiency >= 85) return 'text-green-500';
  if (efficiency >= 75) return 'text-yellow-500';
  return 'text-red-500';
};
</script>