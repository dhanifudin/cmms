<template>
  <Dialog :open="true" @update:open="handleClose">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center space-x-2">
          <span>{{ workOrder.code }}</span>
          <StatusBadge :status="workOrder.status" />
        </DialogTitle>
        <DialogDescription>
          {{ workOrder.title }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="space-y-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="font-semibold mb-3">Work Order Details</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Category:</span>
                <span>{{ workOrder.category.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Type:</span>
                <MaintenanceTypeBadge :type="workOrder.maintenanceType" />
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Priority:</span>
                <PriorityBadge :priority="workOrder.priority" />
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Terminal:</span>
                <span>{{ workOrder.terminal.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Duration:</span>
                <span>{{ workOrder.estimatedDuration }} hours</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="font-semibold mb-3">Assignment & Schedule</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Assigned To:</span>
                <span>{{ workOrder.assignedTo?.name || 'Unassigned' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Due Date:</span>
                <span>{{ formatDate(workOrder.dueDate) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Created:</span>
                <span>{{ formatDate(workOrder.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Created By:</span>
                <span>{{ workOrder.createdBy.name }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Progress -->
        <div>
          <h3 class="font-semibold mb-3">Progress</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>{{ workOrder.progress }}% Complete</span>
              <span>{{ workOrder.checklistProgress.completed }}/{{ workOrder.checklistProgress.total }} tasks</span>
            </div>
            <div class="w-full bg-secondary rounded-full h-2">
              <div
                class="h-2 rounded-full bg-primary"
                :style="{ width: `${workOrder.progress}%` }"
              />
            </div>
          </div>
        </div>
        
        <!-- Template Info -->
        <div v-if="workOrder.templateUsed">
          <h3 class="font-semibold mb-3">Template Information</h3>
          <div class="p-3 bg-muted rounded-lg">
            <div class="flex items-center space-x-2 text-sm">
              <FileText class="h-4 w-4" />
              <span class="font-medium">{{ workOrder.templateUsed.name }}</span>
              <Badge variant="outline" class="text-xs">v{{ workOrder.templateUsed.version }}</Badge>
            </div>
          </div>
        </div>
        
        <!-- Placeholder for additional content -->
        <div>
          <h3 class="font-semibold mb-3">Additional Details</h3>
          <div class="text-sm text-muted-foreground">
            <p>Checklist items, documentation, comments, and other details would be displayed here in a full implementation.</p>
          </div>
        </div>
      </div>
      
      <DialogFooter class="flex justify-between">
        <div class="flex space-x-2">
          <Button variant="outline" @click="handleClose">
            Close
          </Button>
        </div>
        <div class="flex space-x-2">
          <Button
            v-if="permissions.canEdit"
            variant="outline"
            @click="$emit('edit', workOrder)"
          >
            <Edit class="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            v-if="permissions.canChangeStatus"
            @click="showStatusMenu = !showStatusMenu"
          >
            <RotateCcw class="h-4 w-4 mr-2" />
            Change Status
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { format } from 'date-fns';
import type { WorkOrderTableRow, WorkOrderActionPermissions } from '@/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import StatusBadge from './StatusBadge.vue';
import MaintenanceTypeBadge from './MaintenanceTypeBadge.vue';
import PriorityBadge from './PriorityBadge.vue';

import { FileText, Edit, RotateCcw } from 'lucide-vue-next';

interface Props {
  workOrder: WorkOrderTableRow;
  permissions: WorkOrderActionPermissions;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
  edit: [workOrder: WorkOrderTableRow];
  'status-change': [workOrder: WorkOrderTableRow, newStatus: string];
  reassign: [workOrder: WorkOrderTableRow, newAssigneeId: string];
}>();

const showStatusMenu = ref(false);

const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'MMM d, yyyy');
};

const handleClose = () => {
  emit('close');
};
</script>