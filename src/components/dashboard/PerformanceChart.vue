<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      <div class="flex space-x-2">
        <button
          v-for="period in periods"
          :key="period"
          @click="selectedPeriod = period"
          class="px-3 py-1 text-xs font-medium rounded-md"
          :class="selectedPeriod === period 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
        >
          {{ period }}
        </button>
      </div>
    </div>
    
    <div class="h-64">
      <!-- Simplified chart representation -->
      <div v-if="type === 'line'" class="h-full relative">
        <!-- Chart area -->
        <div v-if="chartData.datasets.length > 0 && chartData.datasets[0] && chartData.datasets[0].data.length > 0" class="h-full border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div class="h-full flex items-end justify-between space-x-1">
            <div 
              v-for="(point, index) in chartData.datasets[0].data" 
              :key="index"
              class="flex flex-col items-center flex-1"
            >
              <!-- Data point -->
              <div class="w-full flex flex-col items-center">
                <div 
                  class="w-4 bg-blue-500 rounded-t"
                  :style="{ height: `${(point / Math.max(...chartData.datasets[0].data)) * 100}%` }"
                ></div>
              </div>
              <!-- Label -->
              <span class="text-xs text-gray-500 mt-2">{{ chartData.labels[index] }}</span>
            </div>
          </div>
        </div>
        <!-- Legend -->
        <div class="flex justify-center mt-4 space-x-6">
          <div 
            v-for="dataset in chartData.datasets" 
            :key="dataset.label"
            class="flex items-center"
          >
            <div 
              class="w-3 h-3 rounded-full mr-2"
              :style="{ backgroundColor: dataset.borderColor || '#3B82F6' }"
            ></div>
            <span class="text-sm text-gray-600">{{ dataset.label }}</span>
          </div>
        </div>
      </div>
      
      <div v-else-if="type === 'doughnut'" class="h-full flex items-center justify-center">
        <div v-if="chartData.datasets.length > 0 && chartData.datasets[0] && chartData.datasets[0].data.length > 0">
          <!-- Simplified doughnut chart -->
          <div class="relative w-40 h-40">
            <div class="w-40 h-40 rounded-full border-8 border-blue-200">
              <!-- This would be replaced with actual chart library -->
              <div class="w-full h-full flex items-center justify-center">
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ chartData.datasets[0].data.reduce((a, b) => a + b, 0) }}</div>
                  <div class="text-sm text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
          <!-- Legend -->
          <div class="ml-8 space-y-2">
            <div 
              v-for="(label, index) in chartData.labels" 
              :key="label"
              class="flex items-center"
            >
              <div 
                class="w-3 h-3 rounded-full mr-3"
                :style="{ backgroundColor: Array.isArray(chartData.datasets[0].backgroundColor) ? chartData.datasets[0].backgroundColor[index] : chartData.datasets[0].backgroundColor || '#3B82F6' }"
              ></div>
              <span class="text-sm text-gray-700">{{ label }}</span>
              <span class="ml-2 text-sm font-medium text-gray-900">{{ chartData.datasets[0].data[index] }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="h-full flex items-center justify-center text-gray-500">
        Chart visualization coming soon
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

interface Props {
  title: string;
  type: 'line' | 'bar' | 'doughnut' | 'pie';
  chartData: ChartData;
  periods?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  periods: () => ['7D', '30D', '90D', '1Y']
});

const selectedPeriod = ref(props.periods[1]); // Default to second period (30D)
</script>