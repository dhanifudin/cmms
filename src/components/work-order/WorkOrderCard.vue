<template>
  <div
    :class="[
      'work-order-card border rounded-lg p-2 sm:p-3 transition-all duration-200',
      workOrder.isOverdue && 'bg-destructive/5',
      isSelected && 'ring-2 ring-primary bg-accent/20',
      'cursor-pointer'
    ]"
    @click="handleCardClick"
  >
    <!-- Compact Header Row -->
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-start space-x-2 flex-1">
        <!-- Selection Checkbox -->
        <Checkbox
          :checked="isSelected"
          @update:checked="$emit('select')"
          @click.stop
          class="mt-0.5"
        />
        
        <!-- Work Order Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-1 mb-1">
            <Button
              variant="ghost"
              size="sm"
              class="font-mono text-xs px-1 py-0.5 h-auto"
              @click.stop="$emit('view')"
            >
              {{ workOrder.code }}
            </Button>
            <Badge
              v-if="workOrder.templateUsed"
              variant="outline"
              class="text-xs px-1 py-0"
            >
              <FileText class="h-2.5 w-2.5" />
            </Badge>
          </div>
          
          <h3 class="font-medium text-sm line-clamp-1 mb-1">
            {{ workOrder.title }}
          </h3>
          
          <p class="text-xs text-muted-foreground line-clamp-1">
            {{ workOrder.category.name }}
          </p>
        </div>
      </div>
      
      <!-- Quick Actions Menu -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="sm"
            class="h-6 w-6 p-0"
            @click.stop
          >
            <MoreVertical class="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click.stop="$emit('view')">
            <Eye class="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem
            v-if="permissions.canEdit"
            @click.stop="$emit('edit')"
          >
            <Edit class="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          
          <DropdownMenuItem
            v-if="workOrder.hasDocumentation"
            @click.stop="viewDocumentation"
          >
            <FileImage class="h-4 w-4 mr-2" />
            View Photos
          </DropdownMenuItem>
          
          <DropdownMenuItem @click.stop="addComment">
            <MessageSquare class="h-4 w-4 mr-2" />
            Add Comment
          </DropdownMenuItem>
          
          <DropdownMenuSeparator v-if="permissions.canDelete" />
          <DropdownMenuItem
            v-if="permissions.canDelete"
            class="text-destructive"
            @click.stop="handleDelete"
          >
            <Trash2 class="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    
    <!-- Compact Status Row -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center space-x-1 flex-wrap gap-y-1">
        <StatusBadge :status="workOrder.status" class="text-xs" />
        <MaintenanceTypeBadge :type="workOrder.maintenanceType" class="text-xs" />
        <PriorityBadge :priority="workOrder.priority" class="text-xs" />
      </div>
      
      <!-- Overdue Indicator -->
      <div v-if="workOrder.isOverdue" class="flex items-center text-destructive">
        <AlertCircle class="h-3 w-3 mr-1" />
        <span class="text-xs font-medium">
          {{ workOrder.daysOverdue }}d
        </span>
      </div>
    </div>
    
    <!-- Compact Due Date and Assignment -->
    <div class="flex items-center justify-between mb-2">
      <div class="min-w-0">
        <div class="text-xs font-medium">
          Due: {{ formatDate(workOrder.dueDate) }}
        </div>
        <div class="text-xs text-muted-foreground">
          {{ getTimeUntilDue(workOrder.dueDate) }}
        </div>
      </div>
      
      <div class="text-right">
        <div v-if="workOrder.assignedTo" class="flex items-center space-x-1">
          <Avatar class="h-5 w-5">
            <AvatarImage :src="getAvatarUrl(workOrder.assignedTo.id)" />
            <AvatarFallback class="text-xs">
              {{ getInitials(workOrder.assignedTo.name) }}
            </AvatarFallback>
          </Avatar>
          <span class="text-xs max-w-20 truncate">{{ workOrder.assignedTo.name }}</span>
        </div>
        <div v-else class="text-xs text-muted-foreground">
          Unassigned
        </div>
      </div>
    </div>
    
    <!-- Compact Progress Bar -->
    <div class="mb-2">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs text-muted-foreground">Progress</span>
        <span class="text-xs font-medium">
          {{ workOrder.progress }}% ({{ workOrder.checklistProgress.completed }}/{{ workOrder.checklistProgress.total }})
        </span>
      </div>
      <div class="w-full bg-secondary rounded-full h-1.5">
        <div
          class="h-1.5 rounded-full transition-all duration-300"
          :class="getProgressColor(workOrder.progress)"
          :style="{ width: `${workOrder.progress}%` }"
        />
      </div>
    </div>
    
    <!-- Compact Expandable Details -->
    <Collapsible :open="showDetails">
      <CollapsibleTrigger
        class="flex items-center justify-center w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
        @click.stop="showDetails = !showDetails"
      >
        <ChevronDown :class="['h-3 w-3 transition-transform', showDetails && 'rotate-180']" />
      </CollapsibleTrigger>
      
      <CollapsibleContent class="pt-2 space-y-1">
        <!-- Compact Info Grid -->
        <div class="text-xs space-y-1">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Terminal:</span>
            <span class="font-medium">{{ workOrder.terminal.name }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Duration:</span>
            <span class="font-medium">{{ workOrder.estimatedDuration }}h</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Created:</span>
            <span class="font-medium">{{ formatDate(workOrder.createdAt) }}</span>
          </div>
          <div v-if="workOrder.templateUsed" class="flex justify-between">
            <span class="text-muted-foreground">Template:</span>
            <span class="font-medium">{{ workOrder.templateUsed.name }}</span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
    
    <!-- Compact Action Buttons -->
    <div class="flex items-center justify-between pt-2 mt-2 border-t">
      <div class="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          class="h-7 px-2 text-xs"
          @click.stop="$emit('view')"
        >
          <Eye class="h-3 w-3 mr-1" />
          View
        </Button>
        
        <Button
          v-if="permissions.canEdit"
          variant="outline"
          size="sm"
          class="h-7 px-2 text-xs"
          @click.stop="$emit('edit')"
        >
          <Edit class="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>
      
      <!-- Compact Status Change Button -->
      <DropdownMenu v-if="permissions.canChangeStatus && availableStatusChanges.length > 0">
        <DropdownMenuTrigger as-child>
          <Button variant="default" size="sm" class="h-7 px-2 text-xs" @click.stop>
            <RotateCcw class="h-3 w-3 mr-1" />
            Update
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            v-for="status in availableStatusChanges"
            :key="status.value"
            @click.stop="$emit('status-change', status.value)"
          >
            <component :is="status.icon" class="h-3.5 w-3.5 mr-2" />
            {{ status.label }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
  
  <!-- Reassign Modal -->
  <WorkOrderReassignModal
    v-if="showReassignModal"
    :work-order="workOrder"
    @confirm="handleReassign"
    @cancel="showReassignModal = false"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { format, formatDistanceToNow, isBefore, addDays } from 'date-fns';
import type { 
  WorkOrderTableRow, 
  WorkOrderActionPermissions 
} from '@/types';

// UI Components
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Custom Components
import StatusBadge from './StatusBadge.vue';
import MaintenanceTypeBadge from './MaintenanceTypeBadge.vue';
import PriorityBadge from './PriorityBadge.vue';
import WorkOrderReassignModal from './WorkOrderReassignModal.vue';

// Icons
import {
  MoreVertical, Eye, Edit, FileImage, MessageSquare, Trash2,
  AlertCircle, FileText, ChevronDown, RotateCcw,
  Play, Pause, CheckCircle, XCircle, UserCheck
} from 'lucide-vue-next';

// Props & Emits
interface Props {
  workOrder: WorkOrderTableRow;
  isSelected: boolean;
  permissions: WorkOrderActionPermissions;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [];
  view: [];
  edit: [];
  delete: [];
  'status-change': [newStatus: string];
  reassign: [newAssigneeId: string];
}>();

// Local state
const showDetails = ref(false);
const showReassignModal = ref(false);

// Computed
const availableStatusChanges = computed(() => {
  const current = props.workOrder.status;
  const changes = [];
  
  switch (current) {
    case 'draft':
      changes.push(
        { value: 'assigned', label: 'Assign', icon: UserCheck },
        { value: 'in_progress', label: 'Start Work', icon: Play }
      );
      break;
    case 'assigned':
      changes.push(
        { value: 'in_progress', label: 'Start Work', icon: Play }
      );
      break;
    case 'in_progress':
      changes.push(
        { value: 'submitted_for_review', label: 'Submit for Review', icon: CheckCircle },
        { value: 'assigned', label: 'Pause Work', icon: Pause }
      );
      break;
    case 'submitted_for_review':
      changes.push(
        { value: 'completed', label: 'Approve', icon: CheckCircle },
        { value: 'in_progress', label: 'Request Changes', icon: XCircle }
      );
      break;
    case 'overdue':
      changes.push(
        { value: 'in_progress', label: 'Resume Work', icon: Play },
        { value: 'submitted_for_review', label: 'Submit for Review', icon: CheckCircle }
      );
      break;
  }
  
  return changes;
});

// Methods
const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'MMM d');
};

const getTimeUntilDue = (dueDateString: string): string => {
  const dueDate = new Date(dueDateString);
  const now = new Date();
  
  if (isBefore(dueDate, now)) {
    return `Overdue by ${formatDistanceToNow(dueDate)}`;
  } else if (isBefore(dueDate, addDays(now, 1))) {
    return 'Due today';
  } else if (isBefore(dueDate, addDays(now, 2))) {
    return 'Due tomorrow';
  } else {
    return `Due in ${formatDistanceToNow(dueDate)}`;
  }
};

const getProgressColor = (progress: number): string => {
  if (progress >= 90) return 'bg-green-500';
  if (progress >= 70) return 'bg-blue-500';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 25) return 'bg-orange-500';
  return 'bg-red-500';
};


const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarUrl = (userId: string): string => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${userId}`;
};

const handleCardClick = () => {
  // Main card click opens details view
  emit('view');
};

const handleDelete = () => {
  if (confirm(`Are you sure you want to delete work order "${props.workOrder.code}"? This action cannot be undone.`)) {
    emit('delete');
  }
};

const handleReassign = (newAssigneeId: string) => {
  emit('reassign', newAssigneeId);
  showReassignModal.value = false;
};

const viewDocumentation = () => {
  console.log('View documentation for:', props.workOrder.code);
};

const addComment = () => {
  console.log('Add comment to:', props.workOrder.code);
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.work-order-card {
  /* Touch-friendly tap target size */
  min-height: 44px;
}

/* Swipe actions could be implemented here */
.work-order-card.swipe-active {
  transform: translateX(-80px);
  transition: transform 0.2s ease;
}

/* Card hover effects */
.work-order-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.work-order-card:active {
  transform: scale(0.98);
}
</style>