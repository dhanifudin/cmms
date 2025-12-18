<template>
  <div v-if="workOrder" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center space-x-4">
          <button
            @click="$router.back()"
            class="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft class="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ workOrder.title }}</h1>
            <p class="text-sm text-gray-600">Work Order ID: {{ workOrder.id }}</p>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <span 
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          :class="statusColors[workOrder.status]"
        >
          {{ formatStatus(workOrder.status) }}
        </span>
        <span 
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          :class="priorityColors[workOrder.priority]"
        >
          {{ workOrder.priority.toUpperCase() }}
        </span>
      </div>
    </div>

    <!-- Work Order Details -->
    <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Details</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-1">Description</h3>
          <p class="text-sm text-gray-900">{{ workOrder.description }}</p>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-1">Type</h3>
          <p class="text-sm text-gray-900 capitalize">
            {{ workOrder.type }}
            <span v-if="workOrder.subType" class="text-gray-500">
              ({{ workOrder.subType }})
            </span>
          </p>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-1">Terminal</h3>
          <p class="text-sm text-gray-900">Terminal {{ workOrder.terminalId?.slice(-1) }}</p>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-1">Assigned Worker</h3>
          <p class="text-sm text-gray-900">
            {{ workOrder.assignedWorkerId ? 'Candra Wijaya' : 'Not assigned' }}
          </p>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
          <p class="text-sm text-gray-900">{{ formatDateTime(workOrder.startDate) }}</p>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
          <p class="text-sm text-gray-900" :class="isOverdue ? 'text-red-600' : ''">
            {{ formatDateTime(workOrder.dueDate) }}
            <span v-if="isOverdue" class="text-red-600 font-medium">(OVERDUE)</span>
          </p>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-1">Estimated Duration</h3>
          <p class="text-sm text-gray-900">{{ workOrder.estimatedDuration }} hours</p>
        </div>
        
        <div v-if="workOrder.completedAt">
          <h3 class="text-sm font-medium text-gray-500 mb-1">Completed At</h3>
          <p class="text-sm text-gray-900">{{ formatDateTime(workOrder.completedAt) }}</p>
        </div>
      </div>
    </div>

    <!-- Materials -->
    <div v-if="workOrder.materials.length > 0" class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Required Materials</h2>
      
      <div class="space-y-3">
        <div
          v-for="material in workOrder.materials"
          :key="material.itemId"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">
              {{ getInventoryItemName(material.itemId) }}
            </p>
            <p class="text-xs text-gray-500">Item ID: {{ material.itemId }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-gray-900">
              Planned: {{ material.plannedQuantity }}
            </p>
            <p v-if="material.actualQuantity !== undefined" class="text-sm text-gray-600">
              Used: {{ material.actualQuantity }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Checklist -->
    <div v-if="workOrder.checklist.length > 0" class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Checklist</h2>
      
      <div class="space-y-4">
        <div
          v-for="item in workOrder.checklist"
          :key="item.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900">{{ item.label }}</h4>
              <p v-if="item.required" class="text-xs text-red-600">Required</p>
            </div>
            <div class="text-right space-y-1">
              <div v-if="item.beforeValue !== undefined">
                <span class="text-xs text-gray-500">Before: </span>
                <span class="text-sm text-gray-900">{{ formatChecklistValue(item.beforeValue, item) }}</span>
              </div>
              <div v-if="item.afterValue !== undefined">
                <span class="text-xs text-gray-500">After: </span>
                <span class="text-sm text-gray-900">{{ formatChecklistValue(item.afterValue, item) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Documentation -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Before Documentation -->
      <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Before Documentation</h2>
        
        <div v-if="workOrder.beforeNotes" class="mb-4">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Notes</h3>
          <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{{ workOrder.beforeNotes }}</p>
        </div>
        
        <div v-if="workOrder.beforePhotos.length > 0">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Photos</h3>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="photo in workOrder.beforePhotos"
              :key="photo.id"
              class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
            >
              <Camera class="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div v-if="!workOrder.beforeNotes && workOrder.beforePhotos.length === 0" class="text-center py-8 text-gray-500">
          <Camera class="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <p class="text-sm">No before documentation yet</p>
        </div>
      </div>

      <!-- After Documentation -->
      <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">After Documentation</h2>
        
        <div v-if="workOrder.afterNotes" class="mb-4">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Notes</h3>
          <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{{ workOrder.afterNotes }}</p>
        </div>
        
        <div v-if="workOrder.afterPhotos.length > 0">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Photos</h3>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="photo in workOrder.afterPhotos"
              :key="photo.id"
              class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
            >
              <Camera class="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div v-if="!workOrder.afterNotes && workOrder.afterPhotos.length === 0" class="text-center py-8 text-gray-500">
          <Camera class="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <p class="text-sm">No after documentation yet</p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
      <div class="flex flex-wrap gap-3">
        <!-- Worker Actions -->
        <template v-if="isWorker && workOrder.assignedWorkerId === currentUser?.id">
          <button
            v-if="workOrder.status === 'assigned'"
            @click="startWork"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Play class="w-4 h-4 mr-2" />
            Start Work
          </button>
          
          <button
            v-if="workOrder.status === 'in_progress'"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Upload class="w-4 h-4 mr-2" />
            Submit Documentation
          </button>
        </template>

        <!-- Supervisor Actions -->
        <template v-if="isSupervisor">
          <button
            v-if="workOrder.status === 'pending_approval'"
            @click="approveWorkOrder"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <CheckCircle class="w-4 h-4 mr-2" />
            Approve
          </button>
          
          <button
            v-if="workOrder.status === 'pending_approval'"
            @click="rejectWorkOrder"
            class="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
          >
            <XCircle class="w-4 h-4 mr-2" />
            Reject
          </button>
          
          <button
            v-if="workOrder.status === 'submitted_for_review'"
            @click="completeWorkOrder"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <CheckCircle class="w-4 h-4 mr-2" />
            Complete
          </button>
        </template>

        <!-- Admin Actions -->
        <template v-if="isAdmin">
          <button
            v-if="['draft', 'rejected'].includes(workOrder.status)"
            class="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
          >
            <Edit class="w-4 h-4 mr-2" />
            Edit
          </button>
        </template>
      </div>
    </div>
  </div>
  
  <div v-else class="text-center py-12">
    <div class="inline-flex items-center">
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading work order...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWorkOrderStore } from '@/stores/workorder';
import { useInventoryStore } from '@/stores/inventory';
import { 
  ArrowLeft, 
  Camera, 
  Play, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Edit 
} from 'lucide-vue-next';
import type { WorkOrder } from '@/types';

const route = useRoute();
const authStore = useAuthStore();
const workOrderStore = useWorkOrderStore();
const inventoryStore = useInventoryStore();

const workOrder = ref<WorkOrder | null>(null);

const currentUser = computed(() => authStore.currentUser);
const isWorker = computed(() => authStore.isWorker);
const isSupervisor = computed(() => authStore.isSupervisor);
const isAdmin = computed(() => authStore.isAdmin);

const isOverdue = computed(() => {
  if (!workOrder.value) return false;
  const now = new Date();
  const dueDate = new Date(workOrder.value.dueDate);
  return dueDate < now && !['completed', 'rejected'].includes(workOrder.value.status);
});

const statusColors: Record<WorkOrder['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  submitted_for_review: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  revision_required: 'bg-red-100 text-red-800'
};

const priorityColors: Record<WorkOrder['priority'], string> = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatChecklistValue = (value: any, item: any) => {
  if (item.type === 'yes_no') {
    return value ? 'Yes' : 'No';
  }
  if (item.type === 'number' && item.unit) {
    return `${value} ${item.unit}`;
  }
  return value?.toString() || '';
};

const getInventoryItemName = (itemId: string) => {
  const item = inventoryStore.getItemById(itemId);
  return item?.name || `Item ${itemId}`;
};

const startWork = async () => {
  if (!workOrder.value) return;
  try {
    await workOrderStore.updateWorkOrderStatus(workOrder.value.id, 'in_progress');
    workOrder.value.status = 'in_progress';
  } catch (error) {
    console.error('Failed to start work:', error);
  }
};

const approveWorkOrder = async () => {
  if (!workOrder.value) return;
  try {
    await workOrderStore.updateWorkOrderStatus(workOrder.value.id, 'assigned');
    workOrder.value.status = 'assigned';
  } catch (error) {
    console.error('Failed to approve work order:', error);
  }
};

const rejectWorkOrder = async () => {
  if (!workOrder.value) return;
  try {
    await workOrderStore.updateWorkOrderStatus(workOrder.value.id, 'rejected');
    workOrder.value.status = 'rejected';
  } catch (error) {
    console.error('Failed to reject work order:', error);
  }
};

const completeWorkOrder = async () => {
  if (!workOrder.value) return;
  try {
    await workOrderStore.updateWorkOrderStatus(workOrder.value.id, 'completed');
    workOrder.value.status = 'completed';
  } catch (error) {
    console.error('Failed to complete work order:', error);
  }
};

onMounted(async () => {
  const workOrderId = route.params.id as string;
  
  // Load work orders if not already loaded
  if (workOrderStore.workOrders.length === 0) {
    await workOrderStore.fetchWorkOrders();
  }
  
  // Load inventory items
  await inventoryStore.fetchInventoryItems();
  
  // Find the work order
  workOrder.value = workOrderStore.getWorkOrderById(workOrderId) ?? null;
});
</script>