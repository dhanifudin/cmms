<template>
  <tr
    :class="[
      'border-b transition-colors hover:bg-muted/50',
      workOrder.isOverdue && 'bg-destructive/5',
      isSelected && 'bg-accent/50'
    ]"
    :data-overdue="workOrder.isOverdue"
  >
    <!-- Selection Checkbox -->
    <td class="p-1">
      <Checkbox :checked="isSelected" @update:checked="$emit('select')" />
    </td>
    
    <!-- Dynamic Column Cells -->
    <td v-for="column in columns" :key="column.key" :class="['p-1 px-1', column.width]">
      <!-- Title - Only merge WO code and title -->
      <div v-if="column.key === 'title'" class="space-y-1">
        <div class="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            class="font-mono text-xs p-0 h-auto leading-none"
            @click="$emit('view')"
          >
            {{ workOrder.code.replace('WO-2024-', '') }}
          </Button>
          <FileText v-if="workOrder.templateUsed" class="h-3 w-3 text-muted-foreground" title="Template" />
        </div>
        <div class="font-medium text-xs line-clamp-1">
          {{ workOrder.title }}
        </div>
        <div class="text-xs text-muted-foreground">
          {{ workOrder.category.name }} • {{ workOrder.terminal.name }}
        </div>
      </div>
      
      <!-- Status -->
      <div v-else-if="column.key === 'status'" class="text-center space-y-1">
        <StatusBadge :status="workOrder.status" class="text-xs" />
        <div v-if="workOrder.isOverdue" class="flex items-center text-destructive justify-center">
          <AlertCircle class="h-2 w-2 mr-0.5" />
          <span class="text-xs font-medium">{{ workOrder.daysOverdue }}d</span>
        </div>
        <div v-if="workOrder.progress > 0" class="text-xs text-muted-foreground">
          {{ workOrder.progress }}%
        </div>
      </div>
      
      <!-- Priority -->
      <div v-else-if="column.key === 'priority'" class="text-center">
        <PriorityBadge :priority="workOrder.priority" class="text-xs" />
      </div>
      
      <!-- Maintenance Type -->
      <div v-else-if="column.key === 'maintenanceType'" class="text-center">
        <MaintenanceTypeBadge :type="workOrder.maintenanceType" class="text-xs" />
      </div>
      
      <!-- Assigned To -->
      <div v-else-if="column.key === 'assignedTo'" class="text-center">
        <div v-if="workOrder.assignedTo" class="flex items-center space-x-1 justify-center">
          <Avatar class="h-4 w-4">
            <AvatarImage :src="getAvatarUrl(workOrder.assignedTo.id)" />
            <AvatarFallback class="text-xs">{{ getInitials(workOrder.assignedTo.name) }}</AvatarFallback>
          </Avatar>
          <span class="text-xs truncate max-w-20">{{ workOrder.assignedTo.name }}</span>
        </div>
        <div v-else class="text-xs text-orange-500">Unassigned</div>
      </div>
      
      <!-- Due Date -->
      <div v-else-if="column.key === 'dueDate'" class="text-center">
        <div class="text-xs font-medium">
          {{ formatDate(workOrder.dueDate) }}
        </div>
        <div class="text-xs text-muted-foreground">
          {{ getTimeUntilDue(workOrder.dueDate) }}
        </div>
      </div>
      
      <!-- Unknown Column -->
      <div v-else class="text-xs text-muted-foreground">
        Unknown: {{ column.key }}
      </div>
    </td>
    
    <!-- Actions -->
    <td class="p-1">
      <div class="flex items-center justify-end space-x-0.5">
        <!-- View Button -->
        <Button
          variant="ghost"
          size="sm"
          class="h-6 w-6 p-0"
          @click="$emit('view')"
        >
          <Eye class="h-3 w-3" />
        </Button>
        
        <!-- Edit Button (Supervisor/Admin) -->
        <Button
          v-if="permissions.canEdit"
          variant="ghost"
          size="sm"
          class="h-6 w-6 p-0"
          @click="$emit('edit')"
        >
          <Edit class="h-3 w-3" />
        </Button>
        
        <!-- Quick Status Update (Supervisor/Admin) -->
        <DropdownMenu v-if="permissions.canChangeStatus">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm" class="h-6 w-6 p-0">
              <MoreHorizontal class="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <!-- Status Changes -->
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <RotateCcw class="h-4 w-4 mr-2" />
                Change Status
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  v-for="status in availableStatusChanges"
                  :key="status.value"
                  @click="$emit('status-change', status.value)"
                >
                  <component :is="status.icon" class="h-4 w-4 mr-2" />
                  {{ status.label }}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <!-- Reassign (if can reassign) -->
            <DropdownMenuItem
              v-if="permissions.canReassign"
              @click="showReassignModal = true"
            >
              <UserCheck class="h-4 w-4 mr-2" />
              Reassign Worker
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <!-- Additional Actions -->
            <DropdownMenuItem @click="$emit('view')">
              <Eye class="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            
            <DropdownMenuItem
              v-if="workOrder.hasDocumentation"
              @click="viewDocumentation"
            >
              <FileImage class="h-4 w-4 mr-2" />
              View Photos
            </DropdownMenuItem>
            
            <DropdownMenuItem @click="addComment">
              <MessageSquare class="h-4 w-4 mr-2" />
              Add Comment
            </DropdownMenuItem>
            
            <!-- Destructive Actions -->
            <DropdownMenuSeparator v-if="permissions.canDelete" />
            <DropdownMenuItem
              v-if="permissions.canDelete"
              class="text-destructive"
              @click="handleDelete"
            >
              <Trash2 class="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </td>
  </tr>
  
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Custom Components
import StatusBadge from './StatusBadge.vue';
import MaintenanceTypeBadge from './MaintenanceTypeBadge.vue';
import PriorityBadge from './PriorityBadge.vue';
import WorkOrderReassignModal from './WorkOrderReassignModal.vue';

// Icons
import {
  Eye, Edit, MoreHorizontal, AlertCircle, FileText,
  RotateCcw, UserCheck, FileImage, MessageSquare, Trash2,
  Play, Pause, CheckCircle, XCircle
} from 'lucide-vue-next';

// Props & Emits
interface Props {
  workOrder: WorkOrderTableRow;
  columns: readonly { key: string; label: string; sortable: boolean; mobile: boolean; width?: string }[];
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
        { value: 'in_progress', label: 'Start Work', icon: Play },
        { value: 'draft', label: 'Return to Draft', icon: Edit }
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
  return format(new Date(dateString), 'MMM d, yyyy');
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


const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarUrl = (userId: string): string => {
  // Generate a consistent avatar URL based on user ID
  return `https://api.dicebear.com/7.x/initials/svg?seed=${userId}`;
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
  // This would open a modal or navigate to documentation view
  console.log('View documentation for:', props.workOrder.code);
};

const addComment = () => {
  // This would open a comment modal
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

/* Hover effects for interactive elements */
tr:hover .hover-visible {
  opacity: 1;
}

.hover-visible {
  opacity: 0;
  transition: opacity 0.2s;
}

/* Overdue row styling removed to avoid visual confusion */
</style>