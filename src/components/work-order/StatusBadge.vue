<template>
  <Badge
    :variant="getStatusVariant(status)"
    :class="getStatusClass(status)"
  >
    <component :is="getStatusIcon(status)" class="h-3 w-3 mr-1" />
    {{ getStatusLabel(status) }}
  </Badge>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import {
  FileText, UserCheck, Play, CheckCircle, AlertTriangle, Clock
} from 'lucide-vue-next';

interface Props {
  status: 'draft' | 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'submitted_for_review';
}

defineProps<Props>();

const getStatusLabel = (status: Props['status']): string => {
  const labels = {
    draft: 'Draft',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    overdue: 'Overdue',
    submitted_for_review: 'Under Review'
  };
  return labels[status];
};

const getStatusVariant = (status: Props['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants = {
    draft: 'outline' as const,
    assigned: 'secondary' as const,
    in_progress: 'default' as const,
    completed: 'secondary' as const,
    overdue: 'destructive' as const,
    submitted_for_review: 'default' as const
  };
  return variants[status];
};

const getStatusClass = (status: Props['status']): string => {
  const classes = {
    draft: 'text-muted-foreground border-muted-foreground',
    assigned: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    overdue: 'bg-red-100 text-red-800 border-red-200',
    submitted_for_review: 'bg-purple-100 text-purple-800 border-purple-200'
  };
  return classes[status];
};

const getStatusIcon = (status: Props['status']) => {
  const icons = {
    draft: FileText,
    assigned: UserCheck,
    in_progress: Play,
    completed: CheckCircle,
    overdue: AlertTriangle,
    submitted_for_review: Clock
  };
  return icons[status];
};
</script>