<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <!-- Create Work Order -->
      <router-link
        v-if="hasPermission('create_work_orders')"
        to="/work-orders/create"
        class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
      >
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200">
          <Plus class="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">Create Work Order</p>
          <p class="text-xs text-gray-500">Schedule new maintenance</p>
        </div>
      </router-link>

      <!-- Add Inventory Item -->
      <router-link
        v-if="hasPermission('manage_inventory')"
        to="/inventory/create"
        class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
      >
        <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200">
          <Package class="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">Add Inventory</p>
          <p class="text-xs text-gray-500">Stock new items</p>
        </div>
      </router-link>

      <!-- Search Work Orders -->
      <router-link
        to="/work-orders"
        class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
      >
        <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200">
          <Search class="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">Search Work Orders</p>
          <p class="text-xs text-gray-500">Find existing tasks</p>
        </div>
      </router-link>

      <!-- View Analytics -->
      <router-link
        to="/analytics"
        class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
      >
        <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200">
          <BarChart class="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">View Analytics</p>
          <p class="text-xs text-gray-500">Performance insights</p>
        </div>
      </router-link>

      <!-- Start Work (Worker only) -->
      <button
        v-if="isWorker && nextWorkOrder"
        @click="startNextWork"
        class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group text-left"
      >
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200">
          <PlayCircle class="w-5 h-5 text-blue-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">Start Next Work</p>
          <p class="text-xs text-gray-500 truncate">{{ nextWorkOrder.title }}</p>
        </div>
      </button>

      <!-- Approve Work Orders (Supervisor only) -->
      <router-link
        v-if="isSupervisor && pendingCount > 0"
        to="/work-orders?filter=pending_approval"
        class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
      >
        <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-yellow-200">
          <Clock class="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">Pending Approvals</p>
          <p class="text-xs text-gray-500">{{ pendingCount }} orders waiting</p>
        </div>
      </router-link>

      <!-- Emergency Actions -->
      <button
        v-if="hasPermission('create_work_orders')"
        @click="createEmergencyOrder"
        class="flex items-center p-4 border border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors group text-left"
      >
        <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200">
          <AlertTriangle class="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">Emergency Order</p>
          <p class="text-xs text-gray-500">Urgent maintenance</p>
        </div>
      </button>

      <!-- Check Inventory (Admin only) -->
      <router-link
        v-if="isAdmin"
        to="/inventory?filter=low_stock"
        class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
      >
        <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200">
          <AlertTriangle class="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">Low Stock Items</p>
          <p class="text-xs text-gray-500">{{ lowStockCount }} items need attention</p>
        </div>
      </router-link>
    </div>

    <!-- Emergency Banner -->
    <div v-if="hasUrgentItems" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center">
        <AlertTriangle class="w-5 h-5 text-red-600 mr-2" />
        <div class="flex-1">
          <h4 class="text-sm font-medium text-red-800">Urgent Attention Required</h4>
          <p class="text-xs text-red-600 mt-1">
            {{ urgentItemsCount }} critical items need immediate action
          </p>
        </div>
        <button
          @click="viewUrgentItems"
          class="text-xs font-medium text-red-700 hover:text-red-800"
        >
          View All
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWorkOrderStore } from '@/stores/workorder';
import { useInventoryStore } from '@/stores/inventory';
import { 
  Plus, 
  Package, 
  Search, 
  BarChart, 
  PlayCircle, 
  Clock, 
  AlertTriangle 
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const workOrderStore = useWorkOrderStore();
const inventoryStore = useInventoryStore();

// Computed properties
const isWorker = computed(() => authStore.isWorker);
const isSupervisor = computed(() => authStore.isSupervisor);
const isAdmin = computed(() => authStore.isAdmin);

const nextWorkOrder = computed(() => {
  if (!isWorker.value) return null;
  return workOrderStore.myWorkOrders.find(wo => wo.status === 'assigned');
});

const pendingCount = computed(() => workOrderStore.pendingApproval.length);
const lowStockCount = computed(() => inventoryStore.lowStockItems.length);

const hasUrgentItems = computed(() => {
  const urgentWorkOrders = workOrderStore.workOrders.filter(wo => 
    wo.priority === 'urgent' && wo.status !== 'completed'
  ).length;
  
  const criticalStock = inventoryStore.lowStockItems.filter(item => 
    item.currentStock <= item.minThreshold * 0.5
  ).length;

  return urgentWorkOrders > 0 || criticalStock > 0;
});

const urgentItemsCount = computed(() => {
  const urgentWorkOrders = workOrderStore.workOrders.filter(wo => 
    wo.priority === 'urgent' && wo.status !== 'completed'
  ).length;
  
  const criticalStock = inventoryStore.lowStockItems.filter(item => 
    item.currentStock <= item.minThreshold * 0.5
  ).length;

  return urgentWorkOrders + criticalStock;
});

// Methods
const hasPermission = (permission: string) => authStore.hasPermission(permission);

const startNextWork = () => {
  if (nextWorkOrder.value) {
    router.push(`/work-orders/${nextWorkOrder.value.id}`);
  }
};

const createEmergencyOrder = () => {
  router.push('/work-orders/create?priority=urgent&type=corrective');
};

const viewUrgentItems = () => {
  if (isAdmin.value) {
    router.push('/inventory?filter=critical');
  } else {
    router.push('/work-orders?filter=urgent');
  }
};
</script>