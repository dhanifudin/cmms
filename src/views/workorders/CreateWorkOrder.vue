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
      <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-6">Work Order Details</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Gas Pipeline Pressure Test - Main Line A"
            />
          </div>
          
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detailed description of the maintenance work required..."
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              v-model="form.type"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Type</option>
              <option value="preventive">Preventive Maintenance</option>
              <option value="corrective">Corrective Maintenance</option>
            </select>
          </div>
          
          <div v-if="form.type === 'corrective'">
            <label class="block text-sm font-medium text-gray-700 mb-2">Sub Type</label>
            <select
              v-model="form.subType"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Sub Type</option>
              <option value="planned">Planned</option>
              <option value="incidental">Incidental</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              v-model="form.priority"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Terminal</label>
            <select
              v-model="form.terminalId"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Terminal</option>
              <option value="terminal1">Terminal 1 - Jakarta</option>
              <option value="terminal2">Terminal 2 - Surabaya</option>
              <option value="terminal3">Terminal 3 - Medan</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              v-model="form.startDate"
              type="datetime-local"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              v-model="form.dueDate"
              type="datetime-local"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Estimated Duration (hours)</label>
            <input
              v-model.number="form.estimatedDuration"
              type="number"
              min="1"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div v-if="hasPermission('assign_workers')">
            <label class="block text-sm font-medium text-gray-700 mb-2">Assigned Worker</label>
            <select
              v-model="form.assignedWorkerId"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Assign Later</option>
              <option value="worker1">Candra Wijaya</option>
              <option value="worker2">Eko Pratama</option>
              <option value="worker3">Farid Rahman</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Materials Section -->
      <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900">Required Materials</h2>
          <button
            type="button"
            @click="addMaterial"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus class="w-4 h-4 mr-1" />
            Add Material
          </button>
        </div>
        
        <div v-if="form.materials.length === 0" class="text-center py-6 text-gray-500">
          <Package class="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <p>No materials added yet</p>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="(material, index) in form.materials"
            :key="index"
            class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex-1">
              <select
                v-model="material.itemId"
                required
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select Material</option>
                <option
                  v-for="item in availableItems"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.name }} ({{ item.currentStock }} {{ item.unitOfMeasure }})
                </option>
              </select>
            </div>
            <div class="w-32">
              <input
                v-model.number="material.plannedQuantity"
                type="number"
                min="1"
                required
                placeholder="Qty"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <button
              type="button"
              @click="removeMaterial(index)"
              class="p-2 text-red-600 hover:text-red-800"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-4">
        <router-link
          to="/work-orders"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </router-link>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <span v-if="isSubmitting">Creating...</span>
          <span v-else>Create Work Order</span>
        </button>
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
import { Plus, Package, Trash2 } from 'lucide-vue-next';
import type { CreateWorkOrderForm, MaterialRequirement } from '@/types';

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