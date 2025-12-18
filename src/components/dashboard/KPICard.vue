<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <div 
          class="w-12 h-12 rounded-lg flex items-center justify-center"
          :class="iconBackground"
        >
          <component 
            :is="iconComponent" 
            class="w-6 h-6"
            :class="iconColor"
          />
        </div>
      </div>
      <div class="ml-4 flex-1">
        <p class="text-sm font-medium text-gray-500">{{ title }}</p>
        <div class="flex items-baseline">
          <p class="text-2xl font-semibold text-gray-900">{{ value }}</p>
          <p 
            class="ml-2 text-sm font-medium"
            :class="changeColorClass"
          >
            <span v-if="change > 0">+</span>{{ change }}{{ changeType === 'neutral' ? '' : '%' }}
          </p>
        </div>
        <p class="text-xs text-gray-500 mt-1">{{ period }}</p>
      </div>
    </div>
    <div v-if="description" class="mt-3 text-xs text-gray-600">
      {{ description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  ClipboardList, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  TrendingUp,
  FileText,
  Package,
  Users
} from 'lucide-vue-next';

interface Props {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  period: string;
  icon: string;
  color: string;
  description?: string;
}

const props = defineProps<Props>();

const iconComponents = {
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
  Package,
  Users
};

const iconComponent = computed(() => iconComponents[props.icon as keyof typeof iconComponents] || ClipboardList);

const colorConfig = {
  blue: {
    background: 'bg-blue-100',
    icon: 'text-blue-600',
    change: 'text-blue-600'
  },
  green: {
    background: 'bg-green-100',
    icon: 'text-green-600',
    change: 'text-green-600'
  },
  red: {
    background: 'bg-red-100',
    icon: 'text-red-600',
    change: 'text-red-600'
  },
  orange: {
    background: 'bg-orange-100',
    icon: 'text-orange-600',
    change: 'text-orange-600'
  },
  purple: {
    background: 'bg-purple-100',
    icon: 'text-purple-600',
    change: 'text-purple-600'
  }
};

const iconBackground = computed(() => colorConfig[props.color as keyof typeof colorConfig]?.background || 'bg-gray-100');
const iconColor = computed(() => colorConfig[props.color as keyof typeof colorConfig]?.icon || 'text-gray-600');

const changeColorClass = computed(() => {
  if (props.changeType === 'neutral') return 'text-gray-500';
  if (props.changeType === 'increase') {
    return props.icon === 'AlertTriangle' ? 'text-red-600' : 'text-green-600';
  }
  return props.icon === 'AlertTriangle' ? 'text-green-600' : 'text-red-600';
});
</script>