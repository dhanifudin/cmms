<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Create Work Order</h1>
      <p class="mt-1 text-sm text-gray-600">
        Create a new maintenance work order for your terminal
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Work Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2 space-y-2">
              <Label for="title">Title</Label>
              <Input
                id="title"
                v-model="form.title"
                type="text"
                required
                placeholder="e.g. Gas Pipeline Pressure Test - Main Line A"
              />
            </div>

            <div class="md:col-span-2 space-y-2">
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="form.description"
                rows="3"
                required
                placeholder="Detailed description of the maintenance work required..."
              />
            </div>
          
          <div class="space-y-2">
            <Label for="type">Type</Label>
            <Select v-model="form.type" required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preventive">Preventive Maintenance</SelectItem>
                <SelectItem value="corrective">Corrective Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="form.type === 'corrective'" class="space-y-2">
            <Label for="subType">Sub Type</Label>
            <Select v-model="form.subType">
              <SelectTrigger id="subType">
                <SelectValue placeholder="Select Sub Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="incidental">Incidental</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="priority">Priority</Label>
            <Select v-model="form.priority" required>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="terminal">Terminal</Label>
            <Select v-model="form.terminalId" required>
              <SelectTrigger id="terminal">
                <SelectValue placeholder="Select Terminal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="terminal1">Terminal 1 - Jakarta</SelectItem>
                <SelectItem value="terminal2">Terminal 2 - Surabaya</SelectItem>
                <SelectItem value="terminal3">Terminal 3 - Medan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-2">
            <Label for="startDate">Start Date</Label>
            <Input
              id="startDate"
              v-model="form.startDate"
              type="datetime-local"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              v-model="form.dueDate"
              type="datetime-local"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="estimatedDuration">Estimated Duration (hours)</Label>
            <Input
              id="estimatedDuration"
              v-model.number="form.estimatedDuration"
              type="number"
              min="1"
              required
            />
          </div>

          <div v-if="hasPermission('assign_workers')" class="space-y-2">
            <Label for="assignedWorker">Assigned Worker</Label>
            <Select v-model="form.assignedWorkerId">
              <SelectTrigger id="assignedWorker">
                <SelectValue placeholder="Assign Later" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="worker1">Candra Wijaya</SelectItem>
                <SelectItem value="worker2">Eko Pratama</SelectItem>
                <SelectItem value="worker3">Farid Rahman</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      </Card>

      <!-- Materials Section -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Required Materials</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            @click="addMaterial"
          >
            <Plus class="w-4 h-4 mr-2" />
            Add Material
          </Button>
        </CardHeader>
        <CardContent>
          <Alert v-if="form.materials.length === 0">
            <Package class="h-4 w-4" />
            <AlertTitle>No materials added</AlertTitle>
            <AlertDescription>Click "Add Material" to include required materials for this work order.</AlertDescription>
          </Alert>

          <div v-else class="space-y-4">
            <div
              v-for="(material, index) in form.materials"
              :key="index"
              class="flex items-center space-x-4 p-4 border border-border rounded-lg"
            >
              <div class="flex-1">
                <Select v-model="material.itemId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="item in availableItems"
                      :key="item.id"
                      :value="item.id"
                    >
                      {{ item.name }} ({{ item.currentStock }} {{ item.unitOfMeasure }})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="w-32">
                <Input
                  v-model.number="material.plannedQuantity"
                  type="number"
                  min="1"
                  required
                  placeholder="Qty"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                @click="removeMaterial(index)"
                class="text-destructive hover:text-destructive"
              >
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-4">
        <Button variant="outline" as-child>
          <router-link to="/work-orders">
            Cancel
          </router-link>
        </Button>
        <Button
          type="submit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Creating...' : 'Create Work Order' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWorkOrderStore } from '@/stores/workorder';
import { useInventoryStore } from '@/stores/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Plus, Package, Trash2 } from 'lucide-vue-next';
import type { CreateWorkOrderForm } from '@/types';

const router = useRouter();
const authStore = useAuthStore();
const workOrderStore = useWorkOrderStore();
const inventoryStore = useInventoryStore();

const isSubmitting = ref(false);

const form = ref<CreateWorkOrderForm>({
  title: '',
  description: '',
  type: 'preventive',
  priority: 'normal',
  terminalId: '',
  startDate: '',
  dueDate: '',
  estimatedDuration: 4,
  materials: []
});

const availableItems = computed(() => inventoryStore.activeItems);

const hasPermission = (permission: string) => authStore.hasPermission(permission);

const addMaterial = () => {
  form.value.materials.push({
    itemId: '',
    plannedQuantity: 1
  });
};

const removeMaterial = (index: number) => {
  form.value.materials.splice(index, 1);
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  
  try {
    // Set default terminal for admin if not selected
    if (!form.value.terminalId && authStore.currentUser?.terminalId) {
      form.value.terminalId = authStore.currentUser.terminalId;
    }
    
    const workOrder = await workOrderStore.createWorkOrder(form.value);
    
    // If user has permission to approve, auto-submit for approval
    if (authStore.hasPermission('create_work_orders')) {
      await workOrderStore.updateWorkOrderStatus(workOrder.id, 'pending_approval');
    }
    
    router.push(`/work-orders/${workOrder.id}`);
  } catch (error) {
    console.error('Failed to create work order:', error);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  // Load inventory items
  await inventoryStore.fetchInventoryItems();
  
  // Set default dates
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  form.value.startDate = tomorrow.toISOString().slice(0, 16);
  form.value.dueDate = nextWeek.toISOString().slice(0, 16);
  
  // Set default terminal for terminal admin
  if (authStore.currentUser?.terminalId) {
    form.value.terminalId = authStore.currentUser.terminalId;
  }
});
</script>