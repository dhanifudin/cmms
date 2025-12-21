<template>
  <Dialog :open="true" @update:open="handleClose">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {{ mode === 'edit' ? 'Edit Work Order' : 'Create New Work Order' }}
        </DialogTitle>
        <DialogDescription>
          {{ mode === 'edit' ? `Edit details for ${workOrder?.code}` : 'Fill in the details for the new work order' }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Title *</Label>
            <Input
              v-model="form.title"
              placeholder="Work order title"
              required
            />
          </div>
          
          <div>
            <Label>Work Order Code</Label>
            <Input
              v-model="form.code"
              placeholder="Auto-generated if empty"
              :disabled="mode === 'edit'"
            />
          </div>
        </div>
        
        <div>
          <Label>Description</Label>
          <Textarea
            v-model="form.description"
            placeholder="Detailed description of the work to be performed..."
            rows="3"
          />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Maintenance Type *</Label>
            <Select v-model="form.maintenanceType">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preventive">Preventive</SelectItem>
                <SelectItem value="corrective">Corrective</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Priority *</Label>
            <Select v-model="form.priority">
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Estimated Duration (hours)</Label>
            <Input
              v-model="form.estimatedDuration"
              type="number"
              min="0.5"
              step="0.5"
              placeholder="Hours"
            />
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Terminal *</Label>
            <Select v-model="form.terminalId">
              <SelectTrigger>
                <SelectValue placeholder="Select terminal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="terminal in mockTerminals"
                  :key="terminal.id"
                  :value="terminal.id"
                >
                  {{ terminal.name }} - {{ terminal.region }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Category *</Label>
            <Select v-model="form.categoryId">
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="category in mockCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Assign To</Label>
            <Select v-model="form.assignedWorkerId">
              <SelectTrigger>
                <SelectValue placeholder="Select worker (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__UNASSIGNED__">Unassigned</SelectItem>
                <SelectItem
                  v-for="worker in mockWorkers"
                  :key="worker.id"
                  :value="worker.id"
                >
                  {{ worker.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Due Date *</Label>
            <Input
              v-model="form.dueDate"
              type="date"
              required
            />
          </div>
        </div>
      </div>
      
      <DialogFooter class="flex space-x-2">
        <Button variant="outline" @click="handleClose">
          Cancel
        </Button>
        <Button
          @click="handleSave"
          :disabled="!isFormValid"
        >
          {{ mode === 'edit' ? 'Update' : 'Create' }} Work Order
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import type { WorkOrderTableRow } from '@/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  workOrder?: WorkOrderTableRow | null;
  mode: 'create' | 'edit';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [data: any];
  cancel: [];
}>();

// Form data
const form = reactive({
  title: '',
  code: '',
  description: '',
  maintenanceType: '',
  priority: '',
  estimatedDuration: 4,
  terminalId: '',
  categoryId: '',
  assignedWorkerId: '',
  dueDate: ''
});

// Mock data (would come from API)
const mockTerminals = [
  { id: 'terminal-1', name: 'Terminal 1', region: 'Region 1' },
  { id: 'terminal-2', name: 'Terminal 2', region: 'Region 1' },
  { id: 'terminal-3', name: 'Terminal 3', region: 'Region 2' }
];

const mockCategories = [
  { id: 'cat-1', name: 'Pipeline Maintenance' },
  { id: 'cat-2', name: 'Compressor Systems' },
  { id: 'cat-3', name: 'Safety Equipment' }
];

const mockWorkers = [
  { id: 'worker-1', name: 'John Smith' },
  { id: 'worker-2', name: 'Jane Doe' },
  { id: 'worker-3', name: 'Mike Johnson' }
];

// Computed
const isFormValid = computed(() => {
  return !!(
    form.title &&
    form.maintenanceType &&
    form.priority &&
    form.terminalId &&
    form.categoryId &&
    form.dueDate
  );
});

// Methods
const handleClose = () => {
  emit('cancel');
};

const handleSave = () => {
  if (isFormValid.value) {
    emit('save', { ...form });
  }
};

// Initialize form
onMounted(() => {
  if (props.workOrder && props.mode === 'edit') {
    form.title = props.workOrder.title;
    form.code = props.workOrder.code;
    form.description = props.workOrder.category.name; // Placeholder
    form.maintenanceType = props.workOrder.maintenanceType;
    form.priority = props.workOrder.priority;
    form.estimatedDuration = props.workOrder.estimatedDuration;
    form.terminalId = props.workOrder.terminal.id;
    form.categoryId = props.workOrder.category.id;
    form.assignedWorkerId = props.workOrder.assignedTo?.id || '';
    form.dueDate = props.workOrder.dueDate;
  } else {
    // Set default due date to 7 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 7);
    form.dueDate = defaultDueDate.toISOString().split('T')[0] || '';
  }
});
</script>