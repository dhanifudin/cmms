<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <div
      v-for="metric in metrics"
      :key="metric.id"
      class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-500 truncate">{{ metric.label }}</p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">{{ formatValue(metric.value) }}</p>
        </div>
        <div
          v-if="metric.icon"
          class="flex-shrink-0 p-2 rounded-lg"
          :class="getIconBackground(metric)"
        >
          <component
            :is="getIconComponent(metric.icon)"
            class="h-5 w-5"
            :class="getIconColor(metric)"
          />
        </div>
      </div>

      <div v-if="metric.change" class="mt-2 flex items-center text-sm">
        <component
          :is="getChangeIcon(metric.changeType)"
          class="h-4 w-4 mr-1"
          :class="getChangeColor(metric.changeType)"
        />
        <span :class="getChangeColor(metric.changeType)">
          {{ metric.change }}
        </span>
        <span v-if="metric.period" class="ml-1 text-gray-500">
          {{ metric.period }}
        </span>
      </div>

      <div v-if="metric.subtitle" class="mt-1 text-xs text-gray-500">
        {{ metric.subtitle }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ClipboardList,
  Clock,
  AlertTriangle,
  DollarSign,
  Package,
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
  FileText,
  Wrench,
  Activity
} from 'lucide-vue-next';

export interface SummaryMetric {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  period?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
}

interface Props {
  metrics: SummaryMetric[];
}

defineProps<Props>();

const iconMap: Record<string, any> = {
  'clipboard-list': ClipboardList,
  'clock': Clock,
  'alert-triangle': AlertTriangle,
  'dollar-sign': DollarSign,
  'package': Package,
  'users': Users,
  'check-circle': CheckCircle2,
  'x-circle': XCircle,
  'calendar': Calendar,
  'file-text': FileText,
  'wrench': Wrench,
  'activity': Activity,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown
};

const getIconComponent = (iconName?: string) => {
  if (!iconName) return null;
  return iconMap[iconName] || ClipboardList;
};

const getChangeIcon = (changeType?: 'increase' | 'decrease' | 'neutral') => {
  switch (changeType) {
    case 'increase':
      return TrendingUp;
    case 'decrease':
      return TrendingDown;
    default:
      return Minus;
  }
};

const getChangeColor = (changeType?: 'increase' | 'decrease' | 'neutral'): string => {
  switch (changeType) {
    case 'increase':
      return 'text-green-600';
    case 'decrease':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
};

const getIconBackground = (metric: SummaryMetric): string => {
  const colorMap: Record<string, string> = {
    'blue': 'bg-blue-50',
    'green': 'bg-green-50',
    'red': 'bg-red-50',
    'yellow': 'bg-yellow-50',
    'gray': 'bg-gray-50'
  };
  return colorMap[metric.iconColor || 'blue'] || 'bg-blue-50';
};

const getIconColor = (metric: SummaryMetric): string => {
  const colorMap: Record<string, string> = {
    'blue': 'text-blue-600',
    'green': 'text-green-600',
    'red': 'text-red-600',
    'yellow': 'text-yellow-600',
    'gray': 'text-gray-600'
  };
  return colorMap[metric.iconColor || 'blue'] || 'text-blue-600';
};

const formatValue = (value: string | number): string => {
  if (typeof value === 'number') {
    // Format large numbers with thousands separator
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return value.toLocaleString('id-ID');
    }
    return String(value);
  }
  return value;
};
</script>
