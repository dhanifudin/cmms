<template>
  <Dialog :open="true" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Assign Workers</DialogTitle>
        <DialogDescription>
          Assign {{ selectedCount }} work order{{ selectedCount === 1 ? '' : 's' }} to a worker
        </DialogDescription>
      </DialogHeader>
      
      <div class="space-y-4">
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
      </div>
      
      <DialogFooter class="flex space-x-2">
        <Button variant="outline" @click="handleClose">Cancel</Button>
        <Button @click="handleConfirm" :disabled="!selectedWorkerId">
          Assign {{ selectedCount }} Work Order{{ selectedCount === 1 ? '' : 's' }}
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
  confirm: [workerId: string];
  cancel: [];
}>();

const selectedWorkerId = ref('');

const availableWorkers = [
  { id: 'worker-1', name: 'John Smith' },
  { id: 'worker-2', name: 'Jane Doe' },
  { id: 'worker-3', name: 'Mike Johnson' },
  { id: 'worker-4', name: 'Sarah Wilson' },
  { id: 'worker-5', name: 'David Brown' }
];

const handleClose = () => emit('cancel');
const handleConfirm = () => {
  if (selectedWorkerId.value) {
    emit('confirm', selectedWorkerId.value);
  }
};
</script>