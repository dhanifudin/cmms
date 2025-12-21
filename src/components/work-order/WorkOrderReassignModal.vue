<template>
  <Dialog :open="true" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Reassign Work Order</DialogTitle>
        <DialogDescription>
          Reassign "{{ workOrder.code }}" to a different worker
        </DialogDescription>
      </DialogHeader>
      
      <div class="space-y-4">
        <!-- Current Assignment -->
        <div class="p-3 bg-muted rounded-lg">
          <Label class="text-sm text-muted-foreground">Currently assigned to:</Label>
          <div v-if="workOrder.assignedTo" class="flex items-center space-x-2 mt-1">
            <Avatar class="h-6 w-6">
              <AvatarFallback class="text-xs">
                {{ getInitials(workOrder.assignedTo.name) }}
              </AvatarFallback>
            </Avatar>
            <span class="text-sm font-medium">{{ workOrder.assignedTo.name }}</span>
          </div>
          <div v-else class="text-sm text-muted-foreground">
            Unassigned
          </div>
        </div>
        
        <!-- New Assignment -->
        <div class="space-y-2">
          <Label>Assign to:</Label>
          <Select v-model="selectedWorkerId">
            <SelectTrigger>
              <SelectValue placeholder="Select a worker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="worker in availableWorkers"
                :key="worker.id"
                :value="worker.id"
              >
                {{ worker.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <!-- Reason (Optional) -->
        <div class="space-y-2">
          <Label>Reason for reassignment (optional):</Label>
          <Textarea
            v-model="reason"
            placeholder="Enter reason for reassigning this work order..."
            rows="3"
          />
        </div>
      </div>
      
      <DialogFooter class="flex space-x-2">
        <Button variant="outline" @click="handleClose">
          Cancel
        </Button>
        <Button 
          @click="handleConfirm"
          :disabled="!selectedWorkerId"
        >
          Reassign
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { WorkOrderTableRow } from '@/types';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Props & Emits
interface Props {
  workOrder: WorkOrderTableRow;
}

defineProps<Props>();

const emit = defineEmits<{
  confirm: [assigneeId: string, reason?: string];
  cancel: [];
}>();

// Local state
const selectedWorkerId = ref('');
const reason = ref('');

// Mock available workers (would come from API)
const availableWorkers = [
  { id: 'worker-1', name: 'John Smith' },
  { id: 'worker-2', name: 'Jane Doe' },
  { id: 'worker-3', name: 'Mike Johnson' },
  { id: 'worker-4', name: 'Sarah Wilson' },
  { id: 'worker-5', name: 'David Brown' }
];

// Methods
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const handleClose = () => {
  emit('cancel');
};

const handleConfirm = () => {
  if (selectedWorkerId.value) {
    emit('confirm', selectedWorkerId.value, reason.value || undefined);
  }
};
</script>