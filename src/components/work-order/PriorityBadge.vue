<template>
  <Badge
    :variant="getPriorityVariant(priority)"
    :class="getPriorityClass(priority)"
  >
    <component :is="getPriorityIcon(priority)" class="h-3 w-3 mr-1" />
    {{ getPriorityLabel(priority) }}
  </Badge>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Minus, ArrowDown } from 'lucide-vue-next';

interface Props {
  priority: 'high' | 'medium' | 'low';
}

defineProps<Props>();

const getPriorityLabel = (priority: Props['priority']): string => {
  const labels = {
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };
  return labels[priority];
};

const getPriorityVariant = (_priority: Props['priority']): 'default' | 'secondary' | 'outline' => {
  return 'outline';
};

const getPriorityClass = (priority: Props['priority']): string => {
  const classes = {
    high: 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100',
    low: 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
  };
  return classes[priority];
};

const getPriorityIcon = (priority: Props['priority']) => {
  const icons = {
    high: AlertTriangle,
    medium: Minus,
    low: ArrowDown
  };
  return icons[priority];
};
</script>