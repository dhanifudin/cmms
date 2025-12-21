<template>
  <Badge
    :variant="getTypeVariant(type)"
    :class="getTypeClass(type)"
  >
    <component :is="getTypeIcon(type)" class="h-3 w-3 mr-1" />
    {{ getTypeLabel(type) }}
  </Badge>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Calendar, Wrench } from 'lucide-vue-next';

interface Props {
  type: 'preventive' | 'corrective';
}

defineProps<Props>();

const getTypeLabel = (type: Props['type']): string => {
  const labels = {
    preventive: 'Preventive',
    corrective: 'Corrective'
  };
  return labels[type];
};

const getTypeVariant = (_type: Props['type']): 'default' | 'secondary' | 'outline' => {
  return 'outline';
};

const getTypeClass = (type: Props['type']): string => {
  const classes = {
    preventive: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    corrective: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
  };
  return classes[type];
};

const getTypeIcon = (type: Props['type']) => {
  const icons = {
    preventive: Calendar,
    corrective: Wrench
  };
  return icons[type];
};
</script>