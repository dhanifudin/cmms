<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium text-muted-foreground">
        {{ title }}
      </CardTitle>
      <div
        class="w-10 h-10 rounded-lg flex items-center justify-center"
        :class="iconBackground"
      >
        <component
          :is="iconComponent"
          class="w-5 h-5"
          :class="iconColor"
        />
      </div>
    </CardHeader>
    <CardContent>
      <div class="flex items-baseline">
        <div class="text-2xl font-bold">{{ value }}</div>
        <Badge
          :variant="changeVariant"
          class="ml-2"
        >
          <span v-if="change > 0">+</span>{{ change }}{{ changeType === 'neutral' ? '' : '%' }}
        </Badge>
      </div>
      <p class="text-xs text-muted-foreground mt-1">{{ period }}</p>
      <p v-if="description" class="text-xs text-muted-foreground mt-2">
        {{ description }}
      </p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const changeVariant = computed(() => {
  if (props.changeType === 'neutral') return 'secondary';
  if (props.changeType === 'increase') {
    return props.icon === 'AlertTriangle' ? 'destructive' : 'default';
  }
  return props.icon === 'AlertTriangle' ? 'default' : 'destructive';
});
</script>