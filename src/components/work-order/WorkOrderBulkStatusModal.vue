<template>
  <Dialog :open="true" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Update Status</DialogTitle>
        <DialogDescription>
          Change the status of {{ selectedCount }} work order{{ selectedCount === 1 ? '' : 's' }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="space-y-4">
        <div class="space-y-2">
          <Label>New Status:</Label>
          <Select v-model="selectedStatus">
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="submitted_for_review">Submitted for Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DialogFooter class="flex space-x-2">
        <Button variant="outline" @click="handleClose">Cancel</Button>
        <Button @click="handleConfirm" :disabled="!selectedStatus">
          Update {{ selectedCount }} Work Order{{ selectedCount === 1 ? '' : 's' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  selectedCount: number;
}

defineProps<Props>();

const emit = defineEmits<{
  confirm: [status: string];
  cancel: [];
}>();

const selectedStatus = ref('');

const handleClose = () => emit('cancel');
const handleConfirm = () => {
  if (selectedStatus.value) {
    emit('confirm', selectedStatus.value);
  }
};
</script>